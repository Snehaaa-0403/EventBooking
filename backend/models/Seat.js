import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    eventID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event",
        required : [true,"Event ID is required"]
    }     
    ,
    status:{
        type:String,
        enum:{
            values:[
                "Vacant",
                "Booked"
            ],
            message: '{VALUE} is not a valid status'
        },
        default:"Vacant"
    },
    rowNo:{
        type:Number,
        required:[true,"Row no of seat is required for booking"]
    },
    colNo:{
        type:Number,
        required:[true,"Column no of seat is required for booking"]
    },
    seatType:{
        type:String,
        enum:{
            values:[
                "Normal",
                "VIPSeat"
            ]
        },
        default:"Normal"   
    }
})

const Seat = mongoose.model("Seat",seatSchema);

export default Seat;

