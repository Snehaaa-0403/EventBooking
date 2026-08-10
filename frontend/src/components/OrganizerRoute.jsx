import React from "react";
import useAuthStore from "../store/useAuthStore.js";
import { Navigate } from "react-router-dom";


const OrganizerRoute = ({children}) => {
    const {token,role} = useAuthStore();
    if(!token){
        alert("You need to signUp first to access this page");
        return <Navigate to="/organizer/signUp" replace/>
    }
    if(role!=="Organizer" && role!=="organizer"){
        alert("Access denied.This page is for event organizers only.")
        return <Navigate to="/organizer/signUp" replace/>
    }
    return children;
}

export default OrganizerRoute;

