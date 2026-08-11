import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import redisClient from "../config/redisClient.js";
import jwt from "jsonwebtoken";
import sendEmail from "../config/transporter.js";
import middleware from "../middleware/auth.middleware.js";
import Booking from "../models/Booking.js";

const router = express.Router();

//Registering a user or organizer
//Takes details of user name,email,phone,organizationName and returns the user created and token also
router.post("/register",async(req,res)=>{
    const {name,email,phone,organizationName,otp} = req.body;
    if(!email){
        return res.status(400).json({message:"Email is required to register the user",sucess:false});
    }
    try{
        let user = await User.findOne({email:email});
        if (user) {
            return res.status(409).json({message:"Another user already exists with this email.Try signing up with another email.",sucess:false});            
        }

        //verifying otp
        const redisKey=`otp:${email}`; 
        const generatedOTP = await redisClient.get(redisKey);
        if (!generatedOTP) {
            console.log("OTP has expired or was never requested");
            return res.status(400).json({ message: "OTP has expired or was never requested",sucess:false});
        }
        if(generatedOTP!=otp){
            console.log("Invalid OTP");
            return res.status(401).json({ message: "Invalid OTP" , success:false});
        }
        await redisClient.del(redisKey);

        //creating user        
        user = await User.create({
                name: name,
                phone: phone,
                email: email,
                role: organizationName ? "Organizer" : "User",
                organizationName: organizationName
        });
        console.log("User registered in the db");
        
        const expiryDate = (user.role=="Organizer")?"2d":"30d";
        const token = jwt.sign(
            { userId: user._id, role: user.role },  
            process.env.JWT_SECRET, 
            { expiresIn: expiryDate }
        );
        
        // Sending the token and user data to the frontend
        return res.status(200).json({ 
            success:true,
            message: "Signup successful",
            token: token,
            user: user
        });
    }
    catch(error){
        console.log("Error in registering user",error);
        return res.status(500).json({sucess:false, message:"Internal Server Error"}); 
    }
})



//request-otp
router.post("/request-otp",async(req,res)=>{
    try{
        const{email} = req.body;
        //generating a 4digit random OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const redisKey=`otp:${email}`;
        await redisClient.set(redisKey,otp,{EX:300});
        console.log(`Redis key set for the otp : ${otp}`); 
        const result = await sendEmail(email, otp);
        if(result){
            console.log("OTP mail sent successfully");
            return res.status(200).json({sucess:true,message:"OTP sent successfully"});
        }
        else{
            return res.status(500).json({success:false,message:"Error in sending mail through sendGrid"});
        }
    }
    catch(error){
        console.log("Error in sending email OTP",error);
        return res.status(500).json({sucess:false,message:"Error in sending email OTP"}); 
    }
})


// logginging a user who has already signed up
//Takes email and then verifies user through email OTP
router.post("/login",async(req,res)=>{
    console.log("Entered login route");
    const {email,otp} = req.body;
    if(!email){
        console.log("Email is required for login process");
        return res.status(400).json({message:"Email is required for login process",success:false});
    }
    try{
        const user = await User.findOne({email:email})
        if(!user){
            console.log("User is visiting first time.He must sign up first");
            return res.status(409).json({message:"User is visiting first time.He must sign up first",success:false});
        } 
        //verify otp and then send success message
        const redisKey=`otp:${email}`; 
        const generatedOTP = await redisClient.get(redisKey);
        if (!generatedOTP) {
            console.log("OTP has expired or was never requested");
            return res.status(400).json({ message: "OTP has expired or was never requested" , success:false});
        }
        if(generatedOTP!=otp){
            return res.status(401).json({ message: "Invalid OTP" , success:false});
        }
        await redisClient.del(redisKey);
        console.log("User is verified");
        const expiryDate = (user.role=="Organizer")?"2d":"30d";
        const token = jwt.sign(
            { userId: user._id, role: user.role },  
            process.env.JWT_SECRET, 
            { expiresIn: expiryDate }
        );
        
        // Sending the token and user data to the frontend
        return res.status(200).json({ 
            success:true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role 
            }
        });

    }
    catch(error){
        console.log("Error in logging user",error);
        return res.status(500).json({message:"Internal Server Error",success:false}); 
    }
})


//edit profile of a user
//Provide userID and email or phone to edit a profile
router.patch("/edit-profile",middleware,async(req,res)=>{ 
    // will come from token sent by frontend and then be middleware attached to request
    const userID = req.user._id;
    const data = req.body;
    const{email,phone} = data;
    if(!email && !phone){
        return res.status(400).json({message:"Please provide atleast one field email or phone to update the profile",success:false});
    }

    try{
        const updatedField={};
        if(email){
            updatedField.email=email;
        }
        if(phone){
            updatedField.phone=phone;
        }
        const user = await User.findOneAndUpdate(
                        {_id:userID},
                        {$set:updatedField},
                        {new:"true"}
                    )
        if(!user){
            return res.status(409).json({message:"User not found",success:false});
        }
        return res.status(200).json({data:user,success:true,message:"Profile updated successfully"});
    }
    catch(error){
        console.log("Error in updating user profile",error);
        return res.status(500).json({message:"Internal Server Error",success:false}); 
    }
})


// check profile is complete or not to complete the seat booking system based on the userID given
router.get("/check-profile",middleware,async(req,res)=>{ 
    const userID = req.user._id;
    if (!userID) {
        return res.status(400).json({ message: "userID query parameter is required",success:false });
    }
    try{
        const user = await User.findById(userID);
        if(!user){
            return res.status(404).json({message:"User not found",success:false});
        }
        const{name,phone,email} = user;
        if (!name || !email || !phone) {
            return res.status(200).json({ 
                isComplete: false, 
                message: "Profile is not completed" ,
                success:false
            });
        }

        return res.status(200).json({ 
            success:true,
            isComplete: true, 
            data:user,
            message:"Profile is completed" 
        });
    }
    catch(error){
        console.log("Error in fetching user details",error);
        return res.status(500).json({success:false,message:"Internal Server Error"}); 
    }
})


// show all events booked by a particular user
router.get("/show-events",middleware,async(req,res)=>{
    const userID = req.user._id;
    try{
        const bookings = await Booking.find({userID})
                                .populate({
                                    path:"eventID",
                                    select:"name date eventStartTime eventEndTime place city"
                                })
                                .populate({
                                    path:"seatIDs",
                                    select:"rowNo colNo seatType"
                                });
        if (!bookings || bookings.length === 0) {
            return res.status(200).json({ success: true, message: "No bookings found", data: [] });
        }

        const formattedBookings = bookings.map(booking => ({
            _id: booking._id,
            event: booking.eventID,   
            seats: booking.seatIDs    
        }));

        return res.status(200).json({ 
            success: true, 
            message: "Events successfully fetched", 
            data: formattedBookings 
        }); 
    }
    catch(error){
        console.log("Error in fetching events of user",error);
        return res.status(500).json({success:false,message:"Internal Server Error"}); 
    }
})



export default router;

