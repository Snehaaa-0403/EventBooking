  
import React, { useState, useEffect } from "react";
import { Link,Navigate, useNavigate } from "react-router-dom";
import api from "../lib/axios.js";
import useAuthStore from "../store/useAuthStore.js";

const BrowseEvents = () => {
    const navigate=useNavigate();
    const { token } = useAuthStore(); 
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        name: "",
        category: "",
        city: ""
    });

    // Function to fetch events based on current filters
    const fetchEvents = async () => {
        setIsLoading(true);
        setError("");
        try {
            console.log("Filters are:",filters);
            const response = await api.get("/events/show", { params: filters });
            console.log("Response is:",response);
            if (response.data.success) {
                if(response.data.data.length===0){
                    alert("Currently there are no events matching this criteria");
                    setEvents([]);
                }
                else{
                    console.log(response.data.data);
                    const fetchedData = response.data.data;
                    setEvents(fetchedData);
                }
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            setError("Failed to load events. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    //Fetch categories name
    const fetchCategories = async() => {
        try{
            const response = await api.get("/events/show-categories");
            if(response.data.success){
                setCategories(response.data.data);
            }
            console.log("Categories after fetching from backend is",categories);
        }
        catch(error){
            console.error("Error fetching categories of events:", error);
            setError("Failed to load categories of events. Please try again later.");
        }
    }

    //Fetch cities name
    const fetchCities = async() => {
        try{
            const response = await api.get("/events/showCities");
            if(response.data.success){
                setCities(response.data.data);
            }
        }
        catch(error){
            console.error("Error fetching cities of events:", error);
            setError("Failed to load cities of events. Please try again later.");
        }
    }

    // Fetch on initial load
    useEffect(() => {
        fetchEvents();
        fetchCities();
        fetchCategories();
    }, []);

    useEffect(() => {
        if(filters.city!=="" || filters.category!==""){
            fetchEvents();
        }
    },[filters.category,filters.city]);

    
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };


    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents();
    };

    // Handle resetting filters
    const clearFilters = async() => { 
        setFilters({ name: "", category: "", city: "" });
        fetchEvents();
    };

    
    const handleBookClick = (e) => {
        if (!token) {
            e.preventDefault(); 
            alert("You need to Sign Up first");
            navigate("/signUp");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12">
            {/* Header */}
            <div className="bg-emerald-600 py-12 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Explore Events</h1>
                    <p className="mt-3 text-emerald-100 max-w-2xl mx-auto text-lg">
                        Discover the best shows, plays, and comedy gigs happening near you.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
                
                {/* Filter Bar */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 space-y-4">
    
                    {/* Top Search Bar */}
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400 text-lg">🔍</span>
                        <input 
                            type="text" 
                            name="name" 
                            value={filters.name} 
                            onChange={handleFilterChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') fetchEvents();
                            }}
                            placeholder="Search for events, plays, comedy shows... (Press Enter)" 
                            className="w-full pl-12 pr-32 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-gray-700 text-lg" 
                        />
                        <button 
                            onClick={fetchEvents} 
                            className="absolute right-2 px-5 py-1.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            Search
                        </button>
                    </div>

                    {/* Dropdowns (For Category and City) */}  
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        
                        {/* Category Dropdown */}
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Filter by Category</label>
                            <div className="relative">
                                <select   
                                    name="category" 
                                    value={filters.category} 
                                    onChange={(e) => {
                                        handleFilterChange(e);
                                       // setTimeout(fetchEvents, 0); 
                                    }} 
                                    // appearance-none hides the default browser arrow
                                    className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors cursor-pointer text-gray-700 pr-10"
                                >
                                    <option value="">All Categories</option>
                                    {(Array.isArray(categories) ? categories : []).map((cat, index) => (
                                        <option key={index} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {/* Custom downward arrow */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 text-xs">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* City Dropdown */}
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Filter by City</label>
                            <div className="relative">
                                <select 
                                    name="city" 
                                    value={filters.city} 
                                    onChange={(e) => {
                                        handleFilterChange(e);
                                        //setTimeout(fetchEvents, 0); 
                                    }} 
                                    className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors cursor-pointer text-gray-700 pr-10"
                                >
                                    <option value="">All Cities</option>
                                    {/* Dynamically map fetched cities */}
                                    {(Array.isArray(cities) ? cities : []).map((city, index) => (
                                        <option key={index} value={city}>{city}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 text-xs">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Clear Button */}
                        <div className="flex items-end">
                            <button 
                                type="button" 
                                onClick={clearFilters}
                                className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors border border-gray-200"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div> 
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 mb-8 text-center">
                        {error}
                    </div>
                )}

                {/* Event Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-12 w-12 bg-emerald-200 rounded-full mb-4"></div>
                            <p className="text-emerald-600 font-medium">Finding events...</p>
                        </div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-3 text-5xl">🎟️</div>
                        <h3 className="text-xl font-bold text-gray-900">No events found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or searching in a different city.</p>
                        <button 
                            onClick={clearFilters}
                            className="mt-6 px-6 py-2 border border-emerald-600 text-emerald-600 font-medium rounded-md hover:bg-emerald-50 transition-colors"
                        >
                            View All Events
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => {
                            const formattedDate = event.date 
                                ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
                                : "Date TBA";

                            return (
                                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    
                                    <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100 flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                            {event.category || "General"}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500">
                                            {event.city || "Location TBA"}
                                        </span>
                                    </div>

                                    <div className="p-5 flex-grow flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                            {event.name || "Unnamed Event"}
                                        </h3>
                                        
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                                            {event.info || "No description available for this event."}
                                        </p>
                                        
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <span className="mr-2">📅</span>
                                                {formattedDate}
                                            </div>
                                            {(event.eventStartTime || event.eventEndTime) && (
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <span className="mr-2">⏰</span>
                                                    {event.eventStartTime || "??"} - {event.eventEndTime || "??"}
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-gray-700">
                                                <span className="mr-2">📍</span>
                                                <span className="truncate">{event.place || "Venue TBA"}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500">Starting at</span>
                                                <span className="text-lg font-bold text-emerald-600">
                                                    ₹{event.priceOfNormalSeat || 0}
                                                </span>
                                            </div>
                                            
                                            <Link 
                                                to={`/event/book-ticket/${event._id}`} 
                                                onClick={handleBookClick}
                                                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                                            >
                                                Book Tickets
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseEvents;

