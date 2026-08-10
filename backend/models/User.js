import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    role:{
        type:String,
        enum:{
            values:[
                "User",
                "Organizer"
            ]
        }
    },
    organizationName:{
        type:String,
        default:null
    }
})

const User = mongoose.model("User",userSchema);
export default User;
