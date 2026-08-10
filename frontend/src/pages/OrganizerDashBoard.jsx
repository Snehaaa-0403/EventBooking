import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios.js";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const OrganizerDashboard = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const COLORS = {
        vipBooked: "#047857",    // Dark Emerald
        normalBooked: "#10b981", // Emerald
        vipVacant: "#9ca3af",    // Dark Gray
        normalVacant: "#e5e7eb", // Light Gray
    };

    // 1. Fetch all events hosted by this organizer on component mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get("/organizer/showEvents");
                
                if (res.data.success) {
                    const fetchedEvents = res.data.data;
                    setEvents(fetchedEvents);
                    
                    if (fetchedEvents.length > 0) {
                        setSelectedEventId(fetchedEvents[0]._id);
                    }
                }
            } catch (err) {
                setError("Failed to load your events. Please try again.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // 2. Fetch seats and profit data whenever the selected event changes
    useEffect(() => {
        if (!selectedEventId) return;

        const fetchEventStats = async () => {
            try {
                const seatsRes = await api.get(`/organizer/countSeats/${selectedEventId}`);
                const profitRes = await api.get(`/organizer/profit/${selectedEventId}`);

                if (seatsRes.data.success && profitRes.data.success) {
                    setDashboardData({
                        seats: [
                            { name: "VIP Booked", value: seatsRes.data["VIP Booked Seats"], color: COLORS.vipBooked },
                            { name: "Normal Booked", value: seatsRes.data["Normal Booked Seats"], color: COLORS.normalBooked },
                            { name: "VIP Vacant", value: seatsRes.data["VIP Vacant Seats"], color: COLORS.vipVacant },
                            { name: "Normal Vacant", value: seatsRes.data["Normal Vacant Seats"], color: COLORS.normalVacant },
                        ],
                        profit: {
                            total: profitRes.data.totalProfit,
                            vip: profitRes.data.VIPSeatsProfit,
                            normal: profitRes.data.normalSeatsProfit
                        }
                    });
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };

        fetchEventStats();
    }, [selectedEventId]);

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <p className="text-emerald-600 font-semibold text-lg">Loading your dashboard...</p>
            </div>
        );
    }

    // Empty State (No Events)
    if (events.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Yet</h2>
                    <p className="text-gray-600 mb-6">You haven't hosted any events. Start by creating your first event!</p>
                    <Link 
                        to="/organizer/hostEvent" 
                        className="w-full inline-block py-2.5 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                    >
                        Host an Event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organizer Dashboard</h1>
                        <p className="text-gray-500 mt-1">Select an event below to track your sales and seat occupancy.</p>
                    </div>
                    <Link 
                        to="/organizer/hostEvent" 
                        className="hidden md:inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors"
                    >
                        + Host New Event
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                {/* Dashboard Layout: Sidebar List (Left) + Metrics (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Left Column: Event List */}
                    <div className="lg:col-span-1 flex flex-col space-y-3 max-h-[300px] lg:max-h-[600px] overflow-y-auto pr-2">
                    {events.map((event) => {
                        const isSelected = selectedEventId === event._id;
                        
                        // Format the date nicely (e.g., "Aug 12, 2026") if it exists
                        const formattedDate = event.date 
                            ? new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                            : "No Date";

                        return (
                            <div
                                key={event._id}
                                onClick={() => setSelectedEventId(event._id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                    isSelected 
                                        ? "bg-emerald-50 border-emerald-500 shadow-sm" 
                                        : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                                }`}
                            >
                                <h3 className={`font-bold truncate ${isSelected ? "text-emerald-800" : "text-gray-900"}`}>
                                    {event.name || "Unnamed Event"}
                                </h3>
                                
                                {/* Event Details row */}
                                <div className="flex items-center text-sm mt-1.5 flex-wrap gap-2">
                                    
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${isSelected ? "bg-emerald-200 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                                        {event.category || "Event"}
                                    </span>
                                    
                                  
                                    <div className={`flex items-center space-x-1.5 text-xs font-medium ${isSelected ? "text-emerald-700" : "text-gray-500"}`}>
                                        <span className="truncate max-w-[100px]">{event.city || "No City"}</span>
                                        <span>•</span>
                                        <span className="whitespace-nowrap">{formattedDate}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Column: Dashboard Metrics */}
                <div className="lg:col-span-3">
                    {dashboardData ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Financial Stats (Takes 1 column on md screens) */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-emerald-600">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Profit</h3>
                                    <p className="text-4xl font-black text-gray-900 mt-2">
                                        ₹{dashboardData.profit.total.toLocaleString()}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">VIP Revenue</h3>
                                        <p className="text-xl font-bold text-emerald-600 mt-1">
                                            ₹{dashboardData.profit.vip.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Revenue</h3>
                                        <p className="text-xl font-bold text-gray-800 mt-1">
                                            ₹{dashboardData.profit.normal.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pie Chart (Takes 2 columns on md screens) */}
                            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Seat Occupancy Overview</h3>
                                
                                <div className="flex-grow w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dashboardData.seats.filter(seat => seat.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {dashboardData.seats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value) => [`${value} Seats`, "Count"]}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                        ) : (
                            <div className="h-full min-h-[400px] bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                                <p className="text-gray-500">Loading metrics...</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;

