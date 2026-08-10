import React, { useState } from "react";
import api from "../lib/axios.js"; 
import { Link } from "react-router-dom";


const EventHost = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Movie',
        info: '',
        date: '',
        eventStartTime: '',
        eventEndTime: '',
        place: '',
        city: '',
        totalRows: '',
        seatsPerRows: '', 
        vipRows: '',      
        priceOfNormalSeat: '',
        priceOfVIPSeat: ''
    });

    const categories = ["Movie", "StandUp Comedy", "Singing", "Dance", "Plays"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formatArray = (str) => str.split(",").map(num => parseInt(num.trim(), 10)).filter(num => !isNaN(num));
            
            const payload = {
                ...formData,
                totalRows: Number(formData.totalRows),
                priceOfNormalSeat: Number(formData.priceOfNormalSeat),
                priceOfVIPSeat: formData.priceOfVIPSeat ? Number(formData.priceOfVIPSeat) : 0,
                seatsPerRows: formatArray(formData.seatsPerRows),
                vipRows: formData.vipRows ? formatArray(formData.vipRows) : [],
                // Combine date and time strings into valid Date objects
                eventStartTime: new Date(`${formData.date}T${formData.eventStartTime}`),
                eventEndTime: new Date(`${formData.date}T${formData.eventEndTime}`)
            };

            const response = await api.post("/organizer/add-event", payload);

            const message = response.data.message || "Event successfully hosted";
            alert(message);
            setFormData({
                name: '',
                category: 'Movie',
                info: '',
                date: '',
                eventStartTime: '',
                eventEndTime: '',
                place: '',
                city: '',
                totalRows: '',
                seatsPerRows: '', 
                vipRows: '',      
                priceOfNormalSeat: '',
                priceOfVIPSeat: ''
            })
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error in registering event";
            console.error("Error is", errorMessage);
            alert(errorMessage);
        }
    };

    // Shared Tailwind class for inputs to keep JSX clean
    const inputStyle = "mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 outline-none";

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                
                <div className="bg-emerald-600 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Host an Event</h2>
                        <p className="text-emerald-100 mt-1">Provide your event details to open registrations.</p>
                    </div>
                    <Link 
                        to="/organizer/dashboard" 
                        className="inline-block px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-md border border-emerald-500 transition-colors shadow-sm text-center whitespace-nowrap"
                    >
                        Visit your dashboard
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    
                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-700">Event Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Category</label>
                            <select name="category" required value={formData.category} onChange={handleChange} className={inputStyle}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-700">Brief Information</label>
                            <textarea name="info" rows="3" required value={formData.info} onChange={handleChange} className={inputStyle}></textarea>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Scheduling & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-700">Date</label>
                            <input type="date" name="date" required value={formData.date} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Start Time</label>
                            <input type="time" name="eventStartTime" required value={formData.eventStartTime} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">End Time</label>
                            <input type="time" name="eventEndTime" required value={formData.eventEndTime} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-700">Venue / Place</label>
                            <input type="text" name="place" required value={formData.place} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">City</label>
                            <input type="text" name="city" required value={formData.city} onChange={handleChange} className={inputStyle} />
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Seating Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-700">Total Rows</label>
                            <input type="number" min="1" name="totalRows" required value={formData.totalRows} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Seats Per Row (e.g., 20, 15, 10)</label>
                            <input type="text" name="seatsPerRows" required value={formData.seatsPerRows} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">VIP Rows (e.g., 1, 2)</label>
                            <input type="text" name="vipRows" value={formData.vipRows} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div className="hidden md:block"></div> {/* Formatting spacer */}
                        <div>
                            <label className="block text-sm text-gray-700">Normal Seat Price (₹)</label>
                            <input type="number" min="0" name="priceOfNormalSeat" required value={formData.priceOfNormalSeat} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">VIP Seat Price (₹)</label>
                            <input type="number" min="0" name="priceOfVIPSeat" value={formData.priceOfVIPSeat} onChange={handleChange} className={inputStyle} />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium transition-colors">
                            Publish Event Listing
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventHost;