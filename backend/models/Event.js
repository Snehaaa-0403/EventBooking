import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    organizerID : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
    ,
    name: {
      type: String,
      required: [true, "Name of the event is required"]
    },

    date: {
      type: Date,
      required: [true, "Date is required"]
    },

    eventStartTime : {
        type : Date,
        required: [true, "Date is required"]
    },

    eventEndTime : {
        type : Date,
        required: [true, "Date is required"]
    },

    place: {
      type: String,
      required: [true, "Place is required"]
    },

    city: {
      type: String,
      required: [true, "City is required"]
    },

    category: {
      type: String,
      required: true,
      enum: {
        values: [
          "Movie",
          "StandUp Comedy",
          "Singing",
          "Dance",
          "Plays"
        ],
        message: '{VALUE} is not a valid category'
      }
    },

    info: {
      type: String,
      required: [true, "Small info is required"]
    },

    totalRows: {
      type: Number,
      required: [true, "Total rows are required"],
      min: [1, "Total rows must be at least 1"],
    },

    seatsPerRows:{
      type:[Number],
      required:true
    },

    vipRows: {
      type: [Number]
    },

    priceOfVIPSeat: {
      type: Number
    },

    priceOfNormalSeat: {
      type: Number,
      required: [true, "Normal seat price is required"],
      min: [0, "Price cannot be negative"],
    }

  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
