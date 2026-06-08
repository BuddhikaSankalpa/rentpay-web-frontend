import React from 'react';
import UserData from './userData';

export default function DashboardHeader() {
  return (
    <div className="relative w-full h-[320px] md:h-[380px] overflow-hidden rounded-2xl shadow-2xl">

      {/* Background: bg.png */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.png')" }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Purple glow */}
      <div className="absolute bottom-0 left-0 w-2/3 h-1/2 bg-purple-900/20 blur-3xl pointer-events-none" />

      {/* ── Top bar: Right side aligned UserData ── */}
      <div className="relative z-10 flex items-center justify-end px-6 md:px-14 pt-6">
        {/* Existing UserData component — full user info + dropdown */}
        <UserData />
      </div>

      {/* ── Main Title Block ── */}
      <div className="relative z-10 flex flex-col justify-end h-[calc(100%-70px)] px-8 md:px-14 pb-10 pointer-events-none">
        <h1
          className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl mb-1 leading-none"
          style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', 'Playfair Display', serif", letterSpacing: '0.12em' }}
        >
          NEVERMORE
        </h1>
        <p className="text-xs md:text-sm tracking-[0.55em] text-gray-400 uppercase font-light mb-5">
          B O A R D I N G
        </p>
        <h2
          className="text-xl md:text-2xl font-medium mb-3"
          style={{ color: '#A58ED4', fontFamily: "'Cinzel', serif" }}
        >
          Rent Payment Portal
        </h2>
        <div>
          <p className="text-sm md:text-base text-gray-400 italic font-light">
            "Discipline. Dedication. Due payments."
          </p>
          <p className="text-xs text-gray-600 mt-1">— Wednesday Addams</p>
        </div>
      </div>
      
    </div>
  );
}
// import React from 'react';
// import UserData from './UserData'; // අලුත් component එක Import කරනවා

// export default function DashboardHeader() {
//   return (
//     // Main Container
//     <div className="relative w-full h-[350px] md:h-[400px] bg-[#0B0612] overflow-visible rounded-xl shadow-2xl">
      
//       {/* Background Image & Overlays */}
//       <div 
//         className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 rounded-xl"
//         style={{ backgroundImage: "url('/path-to-your-castle-bg.jpg')" }} // <-- Image path එක
//       ></div>
//       <div className="absolute inset-0 bg-gradient-to-r from-[#0B0612] via-[#0B0612]/80 to-transparent rounded-xl"></div>
//       <div className="absolute inset-0 bg-gradient-to-t from-[#0B0612] via-transparent to-transparent rounded-xl"></div>

//       {/* 🔴 Top Bar - User Profile Component එක මෙතනට දැම්මා 🔴 */}
//       <div className="relative z-50 w-full flex justify-end p-6 md:px-10">
//         <UserData /> 
//       </div>

//       {/* Main Title Content (Left Aligned) */}
//       <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 pb-20 pointer-events-none">
//         <h1 
//           className="text-5xl md:text-7xl font-serif text-gray-100 mb-1 drop-shadow-lg"
//           style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }} 
//         >
//           NEVERMORE
//         </h1>
//         <h2 className="text-sm md:text-lg tracking-[0.6em] text-gray-300 font-light uppercase mb-6 drop-shadow-md">
//           Boarding
//         </h2>
//         <h3 className="text-2xl md:text-3xl font-serif text-[#A58ED4] mb-4">
//           Rent Payment Portal
//         </h3>
//         <div className="flex flex-col gap-1">
//           <p className="text-[16px] md:text-lg text-[#7C6C9E] font-medium italic">
//             "Discipline. Dedication. Due payments."
//           </p>
//           <p className="text-[14px] md:text-sm text-[#7C6C9E]">
//             - Wednesday Addams
//           </p>
//         </div>
//       </div>

//     </div>
//   );
// }