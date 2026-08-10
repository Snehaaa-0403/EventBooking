import { connect } from "mongoose";
import {createClient} from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
    url:process.env.REDIS_URL
})

redisClient.on("connect",()=>{
    console.log("Connected to redis successfully");
})

redisClient.on("error",(err)=>{
    console.log("Error in connecting to Redis",err);
})

await redisClient.connect();
export default redisClient;


