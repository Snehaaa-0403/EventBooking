import mongoose from "mongoose";

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connection setup for : ${conn.connection.host}`);
    }
    catch(error){
        console.log("Error in connecting to MongoDB db",error.message);
    }
};

export default connectDB;

