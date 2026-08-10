import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from '../store/useAuthStore'; // Adjust path if needed

const NavBar = () => {
    const navigate = useNavigate();
    const { isUserAuthenticated, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout(); 
        navigate("/"); 
    };

    return (
        <header className="w-full font-sans">
            <div className="bg-gray-900 px-8 md:px-16 py-2 flex items-center justify-center md:justify-end text-xs sm:text-sm">
                <p className="text-gray-300">
                    Host an Event?
                    <Link 
                        to="/organizer/signUp"
                        className="ml-2 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center"
                    >
                        <span className="ml-1 text-lg leading-none">Partner with us</span>
                    </Link>
                </p>
            </div>

            <nav className="flex items-center justify-between px-8 md:px-16 py-4 bg-white border-b border-gray-100 shadow-sm">
                {/* Logo Section */}
                <div className="text-xl font-extrabold text-emerald-600 tracking-tight flex items-center gap-2 cursor-pointer">
                    <span className="bg-emerald-600 text-white px-2 py-1 rounded-md text-sm font-black">EB</span>
                    Event Booking
                </div>
                
                <div className="flex items-center gap-x-6 text-sm font-medium">
                    <a href="#browse" className="text-gray-600 hover:text-emerald-600 transition">
                        Browse Events
                    </a>
                    
                    <div className="flex items-center gap-x-4 ml-2 md:border-l md:border-gray-200 md:pl-6">
                        {isUserAuthenticated ? (
                            <>
                                <Link to="/user/dashboard" className="text-gray-600 hover:text-emerald-600 transition">
                                    My Dashboard
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-red-50 hover:text-red-600 transition shadow-sm"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-emerald-600 transition">
                                    Log In
                                </Link>
                                <Link 
                                    to="/signUp"
                                    className="px-5 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-emerald-600 transition shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default NavBar;

