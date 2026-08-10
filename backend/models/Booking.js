import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        eventID : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Event",
            required : [true,"Event ID is required"]
        }     
        ,
        userID : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : [true,"Event ID is required to book the seat"]
        },
        seatIDs : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Seat",
                required : [true,"Seat ID is required to book the seat"]
            }
        ]
    },
    {
        timestamps:true
    }
)

const Booking = mongoose.model("Booking",bookingSchema);

export default Booking;