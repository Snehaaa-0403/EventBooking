import express from "express";
import redisClient from "../config/redisClient.js";
import Event from "../models/Event.js";
import Seats from "../models/Seat.js";
import middleware from "../middleware/auth.middleware.js";

const router = express.Router();


//Adding an event
router.post("/add-event",middleware,async(req,res)=>{
    const organizerID = req.user._id; 
        
    const {name,date,eventStartTime,eventEndTime,place,city,
        category,info,seatsPerRows,totalRows,vipRows,priceOfVIPSeat,priceOfNormalSeat} = req.body;
    
    const lock_key = `lock:${city}:${place}:${date}:${eventStartTime}:${eventEndTime}`;    
    // lock to prevent concurrent slot booking when data from frontend is coming faulty(ex:due to network lag 2-3 is clicked on Add Event button)
    // check if same time slot is not booked by another person
    // insert the document
    try{  
        const lock_value = await redisClient.set(
                             lock_key,
                             "locked",
                             {NX:true,EX:30}
                            )
        if(!lock_value){
            return res.status(409).json({success:false,message:"Another event is scheduled at this time and place.Try different place or time slot"});
        }
        console.log("Lock key has been set successfully");
        const existing = await Event.findOne({
                        city,
                        place,
                        date,
                        eventStartTime : {$lte : eventEndTime},
                        eventEndTime : {$gte : eventStartTime}
                        })
        
        if(existing){
            return res.status(409).json({success:false,message : "Event already existed"});
        }

        const event = await Event.create({ 
                            organizerID,
                            name,
                            date,
                            eventStartTime,
                            eventEndTime,
                            place,
                            city,
                            category,
                            info,
                            totalRows,
                            seatsPerRows,
                            vipRows,
                            priceOfVIPSeat,
                            priceOfNormalSeat    
                        })
        console.log("Event successfully created");

        const seatArray = [];
        //Booking seats for this event and marking them to be vacant
        for(let r=1;r<=totalRows;r++){
            const rowSeats = seatsPerRows[r-1];
            let seatType = "Normal"
            for(const vipRow of vipRows){
                if(r==vipRow){
                    seatType="VIPSeat";
                    console.log(`VIP Row according to backend check is ${r}`);
                }
            }
            console.log(`Seats per row is: ${rowSeats}`);
            for(let c=1;c<=rowSeats;c++){
                console.log(`Row is : ${r} and col is : ${c}`);
                seatArray.push({
                        status:"Vacant",
                        seatType:seatType, 
                        rowNo:r,
                        colNo:c,
                        eventID:event._id
                    })
            }
        }
        
        const seats = await Seats.insertMany(seatArray);

        console.log("Seats successfully registered",seats);

        return res.status(201).json({ 
            success:true,
            message: "Event successfully inserted in MongoDB database", 
            data: event,
            Seats : seats,
            totalSeatsGenerated: seatArray.length
        });
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({success:false,message:"Internal Server Error"});      
    }
    finally{
        if (redisClient.isOpen) {
            await redisClient.del(lock_key);
        }
    }
})


//Deleting an event
router.delete("/delete",middleware,async(req,res)=>{
    const {eventID} = req.query;
    try{
        const result = await Event.deleteOne({_id:eventID});
        if(result.deletedCount>0){
            return res.status(200).json({success:true,message:"Event with id ${eventID} is deleted"});
        }
        else{
            return res.status(409).json({success:false,message:"Event not found"});
        }
    }
    catch(error){
        console.log(`Error in deleting the event with ID ${req.query}`);
        return res.status(500).json({success:false,message:"Internal Server Error"});
    }
})



// count number of seats booked to show it to organizer
router.get("/countSeats/:eventID",middleware,async(req,res)=>{
    const {eventID} = req.params;
    console.log(eventID);
    try{
        const event = await Event.findById(eventID);
        if(!event){
            return res.status(400).json({success:false,message:"Event not found"});
        }
        const cntNormalBookedSeats = await Seats.countDocuments({$and: [{eventID:eventID},{status:"Booked"},{seatType:"Normal"}] });
        const cntVIPBookedSeats = await Seats.countDocuments({$and: [{eventID:eventID},{status:"Booked"},{seatType:"VIPSeat"}] });
        const cntNormalVacantSeats = await Seats.countDocuments({$and: [{eventID:eventID},{status:"Vacant"},{seatType:"Normal"}] });
        const cntVIPVacantSeats = await Seats.countDocuments({$and: [{eventID:eventID},{status:"Vacant"},{seatType:"VIPSeat"}] });
        return res.status(200).json({success:true,"Normal Booked Seats":cntNormalBookedSeats,"VIP Booked Seats":cntVIPBookedSeats,"Normal Vacant Seats":cntNormalVacantSeats,"VIP Vacant Seats":cntVIPVacantSeats});
    }
    catch(error){
        console.log(`Error in counting seats for the event with id : ${eventID}`);
        return res.status(500).json({success:false,message:"Internal Server Error"});
    }
})


//profit generated for an event
router.get("/profit/:eventID",middleware,async(req,res)=>{ 
    const {eventID} = req.params;
    try{
        const event = await Event.findOne({_id:eventID})
        console.log(`Event is : ${event}`); 
        if(!event){
            return res.status(400).json({success:false,message:"Event not found"});
        }
        const {priceOfVIPSeat,priceOfNormalSeat} = event;
        const cntNormalSeats = await Seats.countDocuments({
                                $and:[
                                    {eventID:eventID},
                                    {seatType:"Normal"},
                                    {status:"Booked"}
                                ]
                                })
        
        const cntVIPSeats = await Seats.countDocuments({
                                $and:[
                                    {eventID:eventID},
                                    {seatType:"VIPSeat"},
                                    {status:"Booked"}
                                ]
                                })            
                                
        const totalProfit = ((cntVIPSeats*priceOfVIPSeat)+(cntNormalSeats*priceOfNormalSeat));
        const normalSeatsProfit = (cntNormalSeats*priceOfNormalSeat);
        const VIPSeatsProfit = (cntVIPSeats*priceOfVIPSeat);
        return res.status(200).json({
                                    success:true,
                                    totalProfit:totalProfit,
                                    normalSeatsProfit:normalSeatsProfit,
                                    VIPSeatsProfit:VIPSeatsProfit
                                });
    }
    catch(error){
        console.log(`Error in counting seats for the event with id : ${eventID}`);
        return res.status(500).json({success:false,message:"Internal Server Error"});
    }
})


//show all events hosted by a particular organizer
router.get("/showEvents",middleware,async(req,res)=>{ 
    console.log("Inside showEvents route of organizer"); 
    console.log("Organizer is",req.user);
    const organizerID = req.user._id; 
    console.log(organizerID);
    try{
        const events = await Event.find({organizerID:organizerID}); 
        console.log(events);
        if(events.length==0){
            return res.status(200).json({success:true,data:[],message:`No events found for this organizer with id : ${organizerID}`});
        }
        else{
            return res.status(200).json({data:events,success:true}); 
        }
    }
    catch(error){
        console.log(`Error in fetching event details for the organizer with id : ${organizerID}`);
        return res.status(500).json({success:false,message:"Internal Server Error"});
    }
})


export default router;


