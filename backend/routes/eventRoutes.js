import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import redisClient from "../config/redisClient.js";
import Seat from "../models/Seat.js";
import middleware from "../middleware/auth.middleware.js";


const router = express.Router();

//show events based on the filter given
router.get("/show", async (req, res) => {
    try {
        console.log("Entered /events/show routes");
        const { category, city, name } = req.query;
        console.log("Query parameters are:",req.query);

        // A dynamic filter object
        const filter = {};
        
        if (category) filter.category = category;
        if (city) filter.city = city;
        if (name) {
            filter.name = {$regex:new RegExp(`^${name.trim()}`,'i')};
        }

        const events = await Event.find(filter);

        if (events.length === 0) {
            console.log("Currently there are no events matching this criteria");
            return res.status(200).json({ data:[],success:true,message: "Currently there are no events matching this criteria" });
        }
        console.log("Displayed all movies based on given criteria");
        return res.status(200).json({data:events,success:true,message:"Displayed all movies based on given criteria"});
        
    } catch (error) {
        console.log("Error in fetching events from DB", error);
        return res.status(500).json({ success:false, message: "Internal Server Error" });   
    }
});

//show all the cities where events are being organized
router.get("/showCities",async(req,res)=>{
    try{
        const cities = await Event.distinct("city");
        if(cities.length==0){
            return res.status(200).json({success:false,message:"Currently there are no event hosted at this moment",data:[]});
        }
        const uniqueCitiesSet=new Set();   
        for(const city of cities){
            // Format the city to title case like "Himachal Pradesh"
            const formatted = city.trim()
                              .split(" ")
                              .map(word => word.charAt(0).toUpperCase()+word.slice(1).toLowerCase())
                              .join(" ");
            console.log("Formatted cities are:",formatted);
            uniqueCitiesSet.add(formatted);
        }   
        const citiesArray = Array.from(uniqueCitiesSet);
        return res.status(200).json({success:true,data:citiesArray});
    }
    catch(error){
        console.log("Error in fetching events from DB", error);
        return res.status(500).json({ success:false, message: "Error in fetching event cities" }); 
    }
})

//show all the categories of the event
router.get("/show-categories",(req,res)=>{
    try{
        const categories = Event.schema.path('category').enumValues;
        console.log("Categories are:",categories);
        return res.status(200).json({ success: true, data: categories });
    }
    catch(error){
        console.log("Error in fetching events from DB", error);
        return res.status(500).json({ success:false, message: "Error in fetching event cities" }); 
    }
})


//get initial seats status of the event
router.get("/seats/:eventID",async(req,res)=>{  
    const eventID = req.params.eventID;
    try{
        const seats = await Seat.find({eventID});
        console.log(seats);
        if(seats.length==0){   
            return res.status(404).json({success:true,data:true,message:`No seats arranged for the event with ID ${eventID}`});
        }
        return res.status(200).json({success:true,data:seats});
    }
    catch(error){
        console.log("Error in fetching the seat layout", error);
        return res.status(500).json({ success:false,message: "Internal Server Error" });  
    }
})


// Return event details based on the eventID
router.get("/details/:eventID",async(req,res)=>{
    const {eventID} = req.params;
    try{
        const event = await Event.findById(eventID);
        if(!event){
            console.log(`No event found with the ID: ${eventID}`);
            return res.status(404).json({success:false,message: `No event found with the ID: ${eventID}`});
        }
        return res.status(200).json({success:true,data:event}); 
    }
    catch(error){
        console.log("Error in fetching the seat layout", error);
        return res.status(500).json({ success:false,message: "Internal Server Error" }); 
    }
})



//User books a seat for the event
router.post("/book-seat",middleware,async(req,res)=>{
    const userID = req.user._id;
    const {eventID,seatIDs} = req.body;
    console.log(`Event id is:${eventID} and userID is: ${userID} and seatsIDs are : ${seatIDs}`);
    if(!eventID || !userID){
        return res.status(400).json({success:false,message:"Event ID and user ID is reuired to book an event"});
    }
    if(!seatIDs || !Array.isArray(seatIDs) || seatIDs.length === 0){
        return res.status(400).json({success:false,message:"Seat ID is reuired to book an event"});
    }
    const acquiredLocks = [];

    try{
        //acquire lock while booking the seat
        for(const seatID of seatIDs){
            const lock_key = `lock:${eventID}:${seatID}`;
            const lock_val = await redisClient.set(
                                    lock_key,
                                    "locked",
                                    {NX:true,EX:30} 
                                )
            console.log(`Lock value is:${lock_val}`);
            if(!lock_val){
                for(const locks of acquiredLocks){
                    await redisClient.del(lock);
                }
                return res.status(409).json({ success:false,message: `Seat ${seatID} is currently being booked by someone else.You can chose other set of seats` });
            }
            acquiredLocks.push(lock_key);
            console.log(`Acquired locks are : ${acquiredLocks}`);
        }
        
        //checking user has not by mistake booked an already booked seat
        const validSeats = [];
        for(const seatID of seatIDs){
            const seat = await Seat.findOne({_id:seatID});
            if(!seat){
                console.log(`Seat with this id ${seatID} is not found`);
            }
            console.log(`Seat details with id :${seatID} are : ${seat}`); 
            if(seat.status=="Booked"){
                console.log(`Booked seat is : ${seatID}`);
                for(const locks of acquiredLocks){
                    await redisClient.del(lock);
                }
                return res.status(409).json({success:false,message:`Seat with id ${seatID} has been already booked.You can chose other set of seats`});
            }
            validSeats.push(seatID);
        }
        console.log("All seats are valis.Valid seat IDs are",seatIDs);
        
        //create Booking of seats if all seats are valid and vacant
        const eventBooking = await Booking.create({
            eventID : eventID,
            userID : userID,
            seatIDs : validSeats
        }); 
        
        if(eventBooking){console.log(`Booking successfully saved in Booking collection`);}
        else{console.log(`Error in creating booking`);}
        
        //updating the status of seats if all are valid booked by user to be Booked
        for(const seatID of seatIDs){
            const seat = await Seat.findOneAndUpdate(
                    {_id:seatID},
                    {$set:{status:"Booked"}},
                    {returnDocument: "after"}
                ); 
            if (!seat) {
                console.warn(`Warning: Seat with ID ${seatID} not found in DB`);
            }
            console.log(seat);
        }
        console.log("All seats booked successfully");
        //Releasing all locks 
        for (const lock of acquiredLocks) {
            await redisClient.del(lock);
        }

        //broadcasting the booked seats
        const io = req.app.get("io");
        if(io){
            io.to(eventID).emit("seatsBooked",{
                bookedSeatsIDs:seatIDs
            });
            console.log("Event emitted successfully");
        }

        return res.status(200).json({success:true,message:"Seats booked successfully"});

    }
    catch(error){
        console.log("Error in booking seat",error);
        for (const lock of acquiredLocks) {
            await redisClient.del(lock);
        }
        return res.status(500).json({success:false,message:"Internal Server Error"}); 
    }
})

export default router;