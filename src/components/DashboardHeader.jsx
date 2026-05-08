import React from 'react';
import UserData from './UserData'; // අලුත් component එක Import කරනවා

export default function DashboardHeader() {
  return (
    // Main Container
    <div className="relative w-full h-[350px] md:h-[400px] bg-[#0B0612] overflow-visible rounded-xl shadow-2xl">
      
      {/* Background Image & Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 rounded-xl"
        style={{ backgroundImage: "url('/path-to-your-castle-bg.jpg')" }} // <-- Image path එක
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0612] via-[#0B0612]/80 to-transparent rounded-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0612] via-transparent to-transparent rounded-xl"></div>

      {/* 🔴 Top Bar - User Profile Component එක මෙතනට දැම්මා 🔴 */}
      <div className="relative z-50 w-full flex justify-end p-6 md:px-10">
        <UserData /> 
      </div>

      {/* Main Title Content (Left Aligned) */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 pb-20 pointer-events-none">
        <h1 
          className="text-5xl md:text-7xl font-serif text-gray-100 mb-1 drop-shadow-lg"
          style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }} 
        >
          NEVERMORE
        </h1>
        <h2 className="text-sm md:text-lg tracking-[0.6em] text-gray-300 font-light uppercase mb-6 drop-shadow-md">
          Boarding
        </h2>
        <h3 className="text-2xl md:text-3xl font-serif text-[#A58ED4] mb-4">
          Rent Payment Portal
        </h3>
        <div className="flex flex-col gap-1">
          <p className="text-[16px] md:text-lg text-[#7C6C9E] font-medium italic">
            "Discipline. Dedication. Due payments."
          </p>
          <p className="text-[14px] md:text-sm text-[#7C6C9E]">
            - Wednesday Addams
          </p>
        </div>
      </div>

    </div>
  );
}