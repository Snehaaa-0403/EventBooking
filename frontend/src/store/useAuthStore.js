import {create} from "zustand";
import {persist} from "zustand/middleware";
import api from "../lib/axios.js";

const useAuthStore = create(
    persist(
        (set)=>({
            role:null,
            user:null,
            token:null,
            isUserAuthenticated:false,
            isLoading:false,
            error:null,
                             
            registerUser : async(formData) => {
                set({isLoading:true,error:null});
                const payload = {
                        ...formData,
                        otp:parseInt(formData.otp,10)
                        }
                try{
                    const response = await api.post("/user/register",payload);
                    const {token,user} = response.data;
                    set({
                        role:user.role,
                        user:user,
                        token:token,
                        isUserAuthenticated:true,
                        isLoading:false
                    });
                    return { success: true ,message:"User registered successfully"};
                }
                catch(error){
                    const errorMessage = error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.";
                    console.error("Error is", errorMessage);
                    set({ isLoading: false, error: errorMessage });
                    return { success: false, message: errorMessage };
                }
            },

            login : async(formData) => {
                set({isLoading:true,error:null});
                try{
                   const payload = {
                    ...formData,
                    otp : parseInt(formData.otp,10)
                   };
                   const response = await api.post("/user/login",payload);
                   const {token,user} = response.data;
                   set({
                        role:user.role,
                        user:user,
                        token:token,
                        isUserAuthenticated:true,
                        isLoading:false
                    });
                    return { success: true ,message:"User logged in successfully"}; 
                }
                catch(error){
                    const errorMessage = error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.";
                    console.error("Error is", errorMessage);
                    set({ isLoading: false, error: errorMessage });
                    return { success: false, message: errorMessage };
                }
            },

            sendOTP : async(email) => {
                try{
                    const response = await api.post("/user/request-otp",{email});
                    return { success: true , message:"OTP sent successfully"};
                }
                catch(error){
                    const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error in sending OTP. Please try again.";
                    console.error("Error is", errorMessage);
                    set({ error: errorMessage });
                    return { success: false, message: errorMessage };
                }
            },

            logout : () =>{
                set({
                    token: null,
                    isUserAuthenticated: false,
                    error: null
                });
            }
        }),
        {
            name : "auth-storage" 
        }
    )
);

export default useAuthStore;