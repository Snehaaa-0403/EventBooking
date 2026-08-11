import React,{useState} from "react";
import useAuthStore from "../store/useAuthStore.js" 
import { Link,useNavigate } from "react-router-dom";

const AuthLogin = () => {
    const login = useAuthStore((state)=>state.login);
    const sendOTP = useAuthStore((state)=>state.sendOTP);
    const role = useAuthStore((state)=>state.role);
    const navigate = useNavigate();
    const [formData,setFormData] = useState({
        email:'',
        otp:''
    });

    const handleSendOtp = async(e) =>{
       e.preventDefault();
       const result = await sendOTP(formData.email);
       if(result.success){
            console.log("OTP sent successfully");
            alert(result.message); 
        }
        else{
            console.log("Error in sending OTP");
            alert(result.message); 
        }
    }

    const handleOnChange = (e) => {
        setFormData({...formData,[e.target.name]: e.target.value});
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        const payload = {
            email : formData.email,
            otp:formData.otp,
            role:role
        }
        const result = await login(payload);
        if(result.success){
            console.log("User logged in successfully");
            alert(result.message);
            setFormData({
                email:'',
                otp:''
            })
            if(role=="Organizer"){
                navigate("/organizer/hostEvent");
            }
            else{
                navigate("/events");
            }
        }
        else{
            console.log("Error in logging user");
            alert(result.message);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            
            {/* Page Header */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-3xl font-extrabold text-emerald-600 tracking-tight mb-4">
                    <span className="bg-emerald-600 text-white px-2 py-1 rounded-md text-xl font-black mr-2">EB</span>
                    Event Booking
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Log in to your account using a <span className="font-semibold text-emerald-600">secure OTP</span>.
                </p>
            </div>

            {/* Form Container */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-200">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        
                        {/* Email Address */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleOnChange}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="jane@example.com"
                            />
                        </div>

                        {/* Send OTP Button */}
                        <div>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                className="w-full py-2 border border-emerald-600 text-emerald-600 font-medium rounded-md hover:bg-emerald-50 transition-colors"
                            >
                                Send Email OTP
                            </button>
                        </div>

                        {/* Enter OTP Field */}
                        <div className="pt-2">
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                Enter 4-Digit OTP
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                maxLength="4"
                                required
                                value={formData.otp}
                                onChange={handleOnChange}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-center tracking-widest text-lg focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="••••"
                            />
                        </div>

                        {/* Final Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                            >
                                Login
                            </button>
                        </div>
                    </form>

                    {/* Sign Up Redirect Section */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    New to Event Booking?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link 
                                to="/signup" 
                                className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                            >
                                Create an account <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthLogin;

