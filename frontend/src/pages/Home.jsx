import React from 'react';
import {Link} from "react-router-dom";
import EventImg from "../assets/images/EventImage.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between font-sans">

      {/*  Hero Section */}
      <main className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-12 my-auto">
        
        {/* Left Side: Content & Actions */}
        <div className="space-y-6">
          <span className="inline-block px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            Real-Time Ticket Booking
          </span>
          
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">
            Event Booking App
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
            Discover incredible live events, reserve seats in real time, or host and manage your own venue seamlessly.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link 
            to="/organizer/hostEvent"
            className="px-6 py-3 rounded-full font-semibold text-sm transition duration-300 shadow-md transform hover:-translate-y-0.5 hover:shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800">
              Host an Event
            </Link>
            
            <Link 
            to="/events"
            className="px-6 py-3 rounded-full font-semibold text-sm transition duration-300 shadow-md transform hover:-translate-y-0.5 hover:shadow-lg bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 active:bg-gray-200">
              Browse Events 
            </Link>
          </div>
        </div>

        {/* Right Side: Feature Image */}
        <div className="flex justify-center items-center w-full relative">
          
          {/* Subtle background glow to make the image pop */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[2rem] blur-xl opacity-30 pointer-events-none"></div>
          
          <img 
            src={EventImg} 
            alt="Live Music Event" 
            loading="lazy"
            className="relative w-full max-w-md h-96 object-cover rounded-[2rem] shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500"
          />
          
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Event Booking App. All rights reserved.
      </footer>
    </div>
  );
}