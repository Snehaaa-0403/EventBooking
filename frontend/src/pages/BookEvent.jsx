import React, { useState, useEffect, useMemo,useRef } from "react";
import { useParams,Link } from "react-router-dom";
import api from "../lib/axios.js";
import seatIcon from "../assets/images/seat.png";
import {io} from "socket.io-client";


const socket = io("http://localhost:5000");

const BookEvent = () => {
    const { eventID } = useParams();

    const [event, setEvent] = useState(null);
    const [seats, setSeats] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Track seats that get booked LIVE while the another user is trying to book the same seats
    const [recentlyBooked, setRecentlyBooked] = useState([]);

    const selectedSeatsRef = useRef(selectedSeats);   
    const isBookingRef = useRef(false);

    useEffect(() => {
        selectedSeatsRef.current = selectedSeats;
    }, [selectedSeats]);

    // Fetching event details
    const fetchEvent = async () => {
        try {
            const result = await api.get(`/events/details/${eventID}`);
            if (result.data.success) {
                setEvent(result.data.data);
            } 
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error in fetching event details";
            setError(errorMessage);   
            console.log("Error in fetching event details is", error); 
        }
    }
 
    // Fetching seats details for the event
    const fetchEventSeatsDetails = async () => {
        try {
            const result = await api.get(`/events/seats/${eventID}`);
            if (result.data.success) {
                setSeats(result.data.data);
            } 
            console.log("Seat details are:",result.data.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error in fetching seat details"; 
            setError(errorMessage); 
            console.log("Error in fetching seat details is", error);   
        }
    }

    // Load data on mount
    useEffect(() => {
        Promise.all([fetchEvent(), fetchEventSeatsDetails()]).finally(() => {
            setLoading(false);
        });
    }, [eventID]);


    useEffect(() => {
        socket.emit("joinEvent", eventID);

        socket.on("seatsBooked", (data) => {
            const { bookedSeatsIDs } = data;
            console.log("Recently Booked seats are:",bookedSeatsIDs);
            // Add to recently booked to trigger the green flash animation
            setRecentlyBooked(bookedSeatsIDs);
            
            // Updating the status of seats 
            setSeats((prevSeats) => 
                prevSeats.map((seat) => {
                    if (bookedSeatsIDs.includes(seat._id)) {
                        return { ...seat, status: "Booked" };
                    }
                    return seat;
                })
            );
            console.log(`Seats details after ${bookedSeatsIDs} are booked are: ${seats}`);
            const stolenSeats = bookedSeatsIDs.filter(seatID => 
                selectedSeatsRef.current.includes(seatID)
            );
            if (stolenSeats.length > 0 && !isBookingRef.current) {
                alert("Alert: A seat you selected was just booked by someone else! It has been removed from your cart.");
            }                                                                 
            //Remove from the user's cart if they were trying to buy them
            setSelectedSeats((prevSelectedSeats) => 
                prevSelectedSeats.filter(seatID => !bookedSeatsIDs.includes(seatID))  
            );

            setSelectedSeats([]); 
            // Remove the green flash after 3 seconds so they turn standard grey
            setTimeout(() => {
                setRecentlyBooked([]);
            }, 3000);
        });

        return () => {
            socket.off("seatsBooked");
        };
    }, [eventID]);


    // Handle seat selection logic
    const handleSeatClick = (actualSeatID) => {
        console.log("Entered inside Seat clicking function");
        console.log("Seat ID is :",actualSeatID);
        console.log("Previously selected seats are:",selectedSeats);
        if (selectedSeats.includes(actualSeatID)) {
            setSelectedSeats(selectedSeats.filter(id => id !== actualSeatID));
        } else {
            setSelectedSeats([...selectedSeats, actualSeatID]); 
        }
    }

    // Dictionary to fetch seats info given rowNo and colNo
    const seatLookUp = useMemo(() => {
        const lookUp = {};
        for (const seat of seats) {
            lookUp[`${seat.rowNo}-${seat.colNo}`] = seat;
        }
        return lookUp;
    }, [seats]);


    // Total price calculation based on the selected seats by user
    const totalPrice = useMemo(() => {
        let total = 0;
        
        selectedSeats.forEach((selectedId) => {
            // Find the actual seat object from your database state
            const seatData = seats.find(s => s._id === selectedId);
            
            if (seatData) {
                // Check if this seat's row is listed in the VIP rows array
                const isVIP = event.vipRows?.includes(seatData.rowNo);
                
                // Add the appropriate price
                if (isVIP && event.priceOfVIPSeat) {
                    total += event.priceOfVIPSeat;
                } else {
                    total += event.priceOfNormalSeat;
                }
            }
        });
        
        return total;
    }, [selectedSeats, seats, event]);


    // Calculating duration of the event
    const getDuration = (start, end) => {
        if (!start || !end) return "";
        const diffMs = new Date(end) - new Date(start);
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.round((diffMs % 3600000) / 60000);
        return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    };

    const handleSeatsBooking = async() => {
        isBookingRef.current=true;
        try {
            const result = await api.post("/events/book-seat",{
                eventID:eventID,
                seatIDs:selectedSeats
            });
            if (result.data.success) {
                alert("Seats booked successfully");
                //Updating the status of seats array
                setSeats((prevSeats) => 
                    prevSeats.map((seat) => {
                        if (selectedSeats.includes(seat._id)) {
                            return { ...seat, status: "Booked" };
                        }
                        return seat;
                    })
                );
                setSelectedSeats([]);
            } 
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error in booking seats for the event"; 
            setError(errorMessage); 
            console.log("Error in fetching seat details is", error);
            alert(errorMessage)   
        }
        finally{
            isBookingRef.current=false;
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center flex-col space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-emerald-700 font-medium animate-pulse">Setting up the venue...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
                    <span className="text-5xl block mb-4">🎟️</span>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                    <p className="text-gray-500">{error || "This event may have been cancelled or moved."}</p>
                </div>
            </div>
        );
    }

   
    const formattedDate = new Date(event.date).toLocaleDateString("en-US", { weekday: "long", day: "numeric", year: "numeric", month: "long" });
    const formattedStartTime = new Date(event.eventStartTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const formattedEndTime = new Date(event.eventEndTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const duration = getDuration(event.eventStartTime, event.eventEndTime);

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-32">
            
            {/* Top Banner */}
            <div className="h-48 md:h-64 bg-emerald-900 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-emerald-800 opacity-50 bg-cover bg-center"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Event Details */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 lg:p-8 lg:sticky lg:top-8">
                            
                            <div className="flex justify-between items-center mb-4">
                                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-md">
                                    {event.category}
                                </span>
                                <Link 
                                    to="/user/dashboard" 
                                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-gray-200 hover:text-gray-900 transition-colors border border-gray-200"
                                >
                                    My Dashboard ↗
                                </Link>
                            </div>
                            
                            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-6">
                                {event.name}
                            </h1>

                            <div className="space-y-5">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-gray-50 p-2 rounded-lg text-xl">📅</div>
                                    <div>
                                        <p className="font-bold text-gray-900">{formattedDate}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{formattedStartTime} - {formattedEndTime} • {duration}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-gray-50 p-2 rounded-lg text-xl">📍</div>
                                    <div>
                                        <p className="font-bold text-gray-900">{event.place}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{event.city}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 my-4"></div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About the Event</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                        {event.info}
                                    </p>
                                </div>

                                {/* Pricing Legend UI */}
                                <div className="bg-gray-50 p-4 rounded-xl mt-6 border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ticket Pricing</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3.5 h-3.5 rounded-sm bg-white border-2 border-emerald-400"></div>
                                                <span className="text-sm font-medium text-gray-700">Normal Seat</span>
                                            </div>
                                            <span className="font-bold text-gray-900">₹{event.priceOfNormalSeat}</span>
                                        </div>
                                        {event.priceOfVIPSeat && (
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-3.5 h-3.5 rounded-sm bg-yellow-100 border-2 border-yellow-400"></div>
                                                    <span className="text-sm font-medium text-gray-700">VIP Seat</span>
                                                </div>
                                                <span className="font-bold text-gray-900">₹{event.priceOfVIPSeat}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3.5 h-3.5 rounded-sm bg-gray-200 border-2 border-gray-300"></div>
                                                <span className="text-sm font-medium text-gray-500">Booked / Unavailable</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Seat Layout Grid */}
                    <div className="lg:col-span-7 flex flex-col space-y-6">
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 lg:p-10 flex-grow flex flex-col items-center overflow-hidden">
                            
                            <h2 className="text-2xl font-bold text-gray-900 w-full text-left mb-8">Select Your Seats</h2>

                            // Stage graphics
                            <div className="w-full max-w-md h-12 mb-12 relative mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-50 to-transparent rounded-t-[100%] border-t-4 border-emerald-400 flex items-end justify-center pb-2">
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em]">Screen / Stage</span>
                                </div>
                            </div>

                            {/* Displaying Seats */}
                            <div className="w-full overflow-x-auto pb-6 flex justify-center">
                                <div className="flex flex-col items-center space-y-3 min-w-max px-4">
                                    {event.seatsPerRows && event.seatsPerRows.map((seatCount, rowIdx) => {
                                        const rowNo = rowIdx + 1;
                                        const isVIP = event.vipRows?.includes(rowNo);

                                        return (  
                                            <div key={`row-${rowNo}`} className="flex items-center space-x-4">
                                                <span className="w-6 text-center font-bold text-gray-400 text-xs">R{rowNo}</span>

                                                <div className="flex space-x-2">
                                                    {Array.from({ length: seatCount }).map((_, colIdx) => {
                                                        const colNo = colIdx + 1;
                                                        const seat = seatLookUp[`${rowNo}-${colNo}`]; 
                                                        const actualSeatID = seat ? seat._id : `temp-${rowNo}-${colNo}`;
                                    
                                                        const isBooked = seat ? (seat.status === "booked" || seat.status === "Booked") : false ; 
                                                        if(isBooked){
                                                            console.log("Booked seat is:",actualSeatID);
                                                        }
                                                        const isSelected = selectedSeats.includes(actualSeatID);
                                                        console.log("Selected seats after selecting the current seats are:",selectedSeats);
                                                        if(isSelected){
                                                            console.log("Selected seats is:",actualSeatID);
                                                        }
                                                        const isRecentlyBooked = recentlyBooked.includes(actualSeatID);      
                                                        if(isRecentlyBooked){
                                                            console.log("Recently booked seat is:",actualSeatID);
                                                        }
                                                        
                                                        // DEFAULT : White for Normal Vacant
                                                        let seatStyles = "bg-white border-emerald-400 hover:bg-emerald-50"; 
                                                        if (isRecentlyBooked) {  
                                                            // Flashing Red for seats booked while watching
                                                            seatStyles = "bg-red-500 border-red-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] cursor-not-allowed transform scale-110"; 
                                                        } else if (isBooked) {
                                                            // Standard Grey for already booked seats
                                                            seatStyles = "bg-indigo-200 border-indigo-400 opacity-60 cursor-not-allowed"; 
                                                        } else if (isSelected) {
                                                            // Dark Green for currently selected in cart
                                                            seatStyles = "bg-emerald-600 border-emerald-700 shadow-md transform scale-110"; 
                                                        } else if (isVIP) {
                                                            // Yellow for VIP Vacant
                                                            seatStyles = "bg-yellow-50 border-yellow-400 hover:bg-yellow-100"; 
                                                        }

                                                        const isDisabled = isBooked || isRecentlyBooked ;

                                                        return (
                                                            <button
                                                                key={actualSeatID}
                                                                disabled={isDisabled}
                                                                onClick={() => handleSeatClick(actualSeatID)}
                                                                title={isDisabled ? "Unavailable" : `Row ${rowNo}, Seat ${colNo}`}
                                                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-t-lg rounded-b-sm border-2 transition-all duration-200 flex items-center justify-center p-1 ${seatStyles}`}
                                                            >       
                                                                <img 
                                                                    src={seatIcon} 
                                                                    alt="Seat"
                                                                    className={`w-full h-full object-contain ${(isSelected || recentlyBooked) ? 'brightness-0 invert' : ''}`}
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <span className="w-6 text-center font-bold text-gray-400 text-xs">R{rowNo}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* STICKY BOTTOM CHECKOUT BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-50 p-4 md:p-5">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-6">
                    
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Selected</p>
                            <p className="text-lg font-black text-gray-900">
                                {selectedSeats.length > 0 ? `${selectedSeats.length} Tickets` : "--"}
                            </p>
                        </div>
                        <div className="h-10 w-px bg-gray-200"></div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Subtotal</p>
                            <p className="text-2xl font-black text-emerald-600">
                                ₹{totalPrice > 0 ? totalPrice.toLocaleString() : "0"}
                            </p>
                        </div>
                    </div>

                    <button 
                        disabled={selectedSeats.length === 0}
                        className={`w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-lg transition-all duration-200 ${
                            selectedSeats.length > 0 
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transform hover:-translate-y-0.5 active:translate-y-0" 
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={handleSeatsBooking} 
                    >
                        Confirm and Book Seats
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default BookEvent;
