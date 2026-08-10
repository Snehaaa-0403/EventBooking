import React from "react";
import useAuthStore from "../store/useAuthStore.js";
import { Navigate } from "react-router-dom";


const UserRoute = ({children}) => {
    const {token} = useAuthStore();
    if(!token){
        alert("You need to signUp first to access this dashboard");
        return <Navigate to="/signUp" replace/>
    }
    return children;
}

export default UserRoute; 

