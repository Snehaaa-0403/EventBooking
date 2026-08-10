import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


const middleware = async(req,res,next) => {
    try{
        const authHeader = req.headers.authorization; 
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            console.log("Token is not provided or improperly formatted");
            return res.status(401).json({success:false,message:"Access denied.No valid token provided"});
        }
        
        const token = authHeader.split(" ")[1];
        //verify and decrypt the token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        //extracting userId from decoded variable
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if(!user){
            console.log("Invalid token");
            return res.status(401).json({success:false,message:"Invalid token"});
        }
        req.user=user;
        next();

    }
    catch(error){
        if(error.name=="JsonWebTokenError" || error.name=="TokenExpiredError"){  
            console.log("Token is invalid or has expired.");
            return res.status(401).json({success:false,message:"Token is invalid or has expired."});
        }
        else{
            console.log("Error is",error);
            return res.status(500).json({success:false,message:"Internal Server Error"});
        }
    }
}

export default middleware;

