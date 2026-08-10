import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import morgan from "morgan";
import {createServer} from "http";
import { Server } from "socket.io";
import redisClient from "./config/redisClient.js";
import userRoutes from "./routes/userRoutes.js";
import organizerRoutes from "./routes/organizerRoute.js";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();

const app=express();
const httpServer = createServer(app);

const io = new Server(httpServer,{
    cors:{
        origin:"https://eventbooking-rz78.onrender.com",
        methods:["GET","POST"]
    }
})

app.set("io",io);

io.on("connection",(socket)=>{
    console.log(`A user connected successfully with socket id:${socket.id}`);
    socket.on("joinEvent", (eventID) => {
        socket.join(eventID);
        console.log(`User ${socket.id} joined event room: ${eventID}`);
    });
    socket.on("disconnect",()=>{
        console.log(`User disconnected with id: ${socket.id}`);
    })
})


await connectDB();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/user",userRoutes);
app.use("/api/organizer",organizerRoutes);
app.use("/api/events",eventRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);

})

