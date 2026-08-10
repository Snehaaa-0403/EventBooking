
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios.js"; 

const UserDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                const response = await api.get("/user/show-events"); 
                
                if (response.data.success) {
                    const fetchedBookings = response.data.data;
                    console.log("Fetched bookings are:",fetchedBookings); 
                    // Sort bookings chronologically 
                    const sortedBookings = fetchedBookings.sort((a, b) => {
                        return new Date(a.event.eventStartTime) - new Date(b.event.eventStartTime);
                    });

                    setBookings(sortedBookings);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.response?.data?.message || "Failed to load your bookings.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserBookings();
    }, []);


    const formatDisplayDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric", year: "numeric"
        });
    };


    const formatDisplayTime = (timeString) => {
        return new Date(timeString).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit"
        });
    };

    // Generating Google Maps Link
    const getGoogleMapsLink = (place, city) => {
        const query = encodeURIComponent(`${place}, ${city}`);
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    };

    // Generating Google Calendar Link
    const getGoogleCalendarLink = (event) => {
        // Google Calendar requires dates in YYYYMMDDTHHmmssZ format
        const formatDateForGCal = (date) => {
            return new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const startTime = formatDateForGCal(event.eventStartTime);
        const endTime = formatDateForGCal(event.eventEndTime);
        const title = encodeURIComponent(event.name);
        const location = encodeURIComponent(`${event.place}, ${event.city}`);
        const details = encodeURIComponent(`Tickets booked for ${event.name}!`);

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center flex-col space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-emerald-700 font-medium animate-pulse">Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
                    <span className="text-5xl block mb-4">⚠️</span>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-emerald-900 py-16 px-4 sm:px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-800 opacity-50"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">My Tickets & Events</h1>
                    <p className="mt-2 text-emerald-100 text-lg">Manage your upcoming shows and bookings.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <span className="text-6xl block mb-4">🎫</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming events</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't booked any seats yet.</p>
                        <Link to="/events" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">
                            Explore Events
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row transition-shadow hover:shadow-md">
                                
                                {/* Left Side: Date Calendar Block */}
                                <div className="bg-emerald-50 sm:w-48 flex flex-col justify-center items-center p-6 border-b sm:border-b-0 sm:border-r border-emerald-100">
                                    <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-1">
                                        {new Date(booking.event.eventStartTime).toLocaleDateString('en-US', { month: 'short' })}
                                    </p>
                                    <p className="text-4xl font-black text-emerald-900 mb-1">
                                        {new Date(booking.event.eventStartTime).getDate()}
                                    </p>
                                    <p className="text-gray-500 text-sm font-medium">
                                        {formatDisplayTime(booking.event.eventStartTime)}
                                    </p>
                                </div>

                                {/* Center: Event Details & Seats */}
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{booking.event.name}</h3>
                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                {booking.event.category}
                                            </span>
                                        </div>
                                        
                                        {/* Seats Display */}
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Seats Booked</p>
                                            <div className="flex flex-wrap gap-2">
                                                {booking.seats.map((seat) => (
                                                    <span key={seat._id} className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200">
                                                        Row {seat.rowNo}, Seat {seat.colNo}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Actions: Google Maps & Calendar */}
                                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-50 mt-4">
                                        <a 
                                            href={getGoogleMapsLink(booking.event.place, booking.event.city)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                                        >
                                            <span>📍</span>
                                            <span>{booking.event.place}, {booking.event.city}</span>
                                        </a>

                                        <span className="hidden sm:inline text-gray-300">|</span>

                                        <a 
                                            href={getGoogleCalendarLink(booking.event)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            <span>🗓️</span>
                                            <span>Add to Calendar</span>
                                        </a>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;

