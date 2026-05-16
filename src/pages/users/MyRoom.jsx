import React, { useState, useEffect, useContext } from 'react';
import {
  MdBed, MdMeetingRoom, MdOutlineWbIncandescent, MdWifi,
  MdBathroom, MdDesk, MdLocalLaundryService, MdPerson,
  MdCalendarToday, MdKey, MdStairs, MdApartment,
  MdOutlineKingBed, MdAttachMoney, MdErrorOutline
} from 'react-icons/md';
import api from "../../utils/api";

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-LK', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatRent(amount) {
  if (!amount) return '—';
  return Number(amount).toLocaleString('en-LK');
}

const AMENITY_ICONS = {
  'wi-fi': <MdWifi className="text-2xl" />,
  'wifi': <MdWifi className="text-2xl" />,
  'bathroom': <MdBathroom className="text-2xl" />,
  'desk': <MdDesk className="text-2xl" />,
  'laundry': <MdLocalLaundryService className="text-2xl" />,
  'washing': <MdLocalLaundryService className="text-2xl" />,
};

function getAmenityIcon(name) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(AMENITY_ICONS)) {
    if (lower.includes(key)) return AMENITY_ICONS[key];
  }
  return <MdOutlineWbIncandescent className="text-2xl" />;
}

function parseAmenities(facilitiesStr) {
  if (!facilitiesStr) return [];
  return facilitiesStr.split(',').map(f => f.trim()).filter(Boolean);
}

function initials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

function Skeleton({ className = '' }) {
  return (
    <div className={`bg-white/[0.04] animate-pulse rounded-xl ${className}`} />
  );
}

function NoRoom() {
  return (
    <div className="w-full mt-16 flex flex-col items-center justify-center gap-4 text-center">
      <div className="p-6 bg-white/[0.02] rounded-full border border-white/[0.06]">
        <MdErrorOutline className="text-5xl text-gray-600" />
      </div>
      <h2 className="text-2xl font-serif text-white tracking-wide">No Room Assigned Yet</h2>
      <p className="text-gray-500 max-w-sm text-sm">
        You haven't been assigned to a room at Nevermore yet. Please contact the administration.
      </p>
    </div>
  );
}

export default function MyRoom() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const res = await api.get('/leases/my-room');
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setData(null);
        } else {
          setError(err.response?.data?.message || 'Failed to load room details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, []);

  if (loading) {
    return (
      <div className="w-full mt-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-52" />
          <Skeleton className="h-52" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Skeleton className="xl:col-span-2 h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-8 p-6 bg-red-900/10 border border-red-500/20 rounded-2xl text-red-400 text-center font-serif">
        {error}
      </div>
    );
  }

  if (!data) return <NoRoom />;

  const { lease, room, roommates } = data;

  const occupiedBeds = 1 + roommates.length;
  const totalRent = occupiedBeds * Number(room.monthly_rent || 0);
  const totalBeds = room.capacity || 4;
  const emptyBeds = Math.max(0, totalBeds - occupiedBeds);

  const amenities = parseAmenities(room.facilities);

  const roomImage = room.image && room.image !== '/default-room.jpg'
    ? room.image
    : 'https://images.unsplash.com/photo-1522771731478-44710c80d905?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="w-full mt-8 flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Room Card */}
        <div className="lg:col-span-2 bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-2 z-10 w-full">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
                Active
              </span>
              <span className="text-xs font-medium tracking-widest uppercase text-gray-500">{room.room_type}</span>
            </div>
            <h1 className="text-5xl font-serif text-white mb-2 tracking-wide">
              {room.room_number}
            </h1>
            <p className="text-gray-400 text-sm">{room.wing} • {room.floor}</p>

            <div className="flex flex-wrap gap-5 mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                <MdCalendarToday className="text-[#A58ED4]" />
                <span>Joined: <span className="text-gray-300 capitalize">{formatDate(lease.joined_date)}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                <MdKey className="text-[#A58ED4]" />
                <span>Key Money: <span className="text-gray-300">Rs. {formatRent(lease.key_money)}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                <MdOutlineKingBed className="text-[#A58ED4]" />
                <span>Capacity: <span className="text-gray-300">{occupiedBeds}/{totalBeds} beds</span></span>
              </div>
            </div>
          </div>

          <div className="z-10 mt-6 md:mt-0 w-full md:w-auto flex flex-col items-start md:items-end bg-white/[0.02] p-6 rounded-2xl border border-white/[0.06] shrink-0">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">Total Monthly Rent</span>
            <span className="text-3xl font-serif text-[#A58ED4]">Rs. {formatRent(totalRent)}</span>
            <span className="text-xs text-gray-500 mt-2">
              {occupiedBeds} {occupiedBeds === 1 ? 'student' : 'students'} × Rs. {formatRent(room.monthly_rent)}
            </span>
          </div>
        </div>

        {/* Room Image Card */}
        <div className="bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden relative min-h-[200px]">
          <img
            src={roomImage}
            alt="Room View"
            className="w-full h-full object-cover opacity-40 hover:opacity-60 transition-opacity duration-500 absolute inset-0 grayscale-[30%] sepia-[20%] hue-rotate-240"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1522771731478-44710c80d905?q=80&w=800&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0815] via-[#0a0815]/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 text-white">
              <MdMeetingRoom className="text-xl text-[#A58ED4]" />
              <span className="font-serif text-lg tracking-wide">Your Space</span>
            </div>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-400 tracking-wider uppercase">
                <MdStairs className="text-gray-500" /> {room.floor}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 tracking-wider uppercase">
                <MdApartment className="text-gray-500" /> {room.wing}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Roommates */}
        <div className="xl:col-span-2 bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-500/10 rounded-lg text-[#A58ED4] border border-purple-500/20">
              <MdPerson className="text-2xl" />
            </div>
            <h3 className="text-xl font-serif text-white tracking-wide">Your Roommates</h3>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-gray-500 bg-white/[0.02] px-3 py-1.5 rounded-full border border-white/[0.06]">
              {occupiedBeds} / {totalBeds} occupied
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
              <div className="w-12 h-12 bg-[#A58ED4]/20 border border-[#A58ED4]/30 rounded-full flex items-center justify-center text-[#A58ED4] text-lg font-serif tracking-widest shadow-lg shrink-0">
                {initials(currentUser.firstName, currentUser.lastName) || 'Y'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-serif text-lg truncate">
                  {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'You'}
                </span>
                <span className="text-xs text-gray-400 truncate">{currentUser.university || 'Nevermore Academy'}</span>
              </div>
              <div className="absolute top-0 right-0 px-3 py-1 bg-[#A58ED4]/10 text-[#A58ED4] border-b border-l border-[#A58ED4]/20 text-[9px] uppercase tracking-widest font-bold rounded-bl-lg">
                Your Bed
              </div>
            </div>

            {roommates.map((rm, idx) => (
              <div key={rm.id} className="p-5 rounded-xl flex items-center gap-4 border bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-serif tracking-widest bg-black/40 border border-white/10 text-gray-400 shrink-0">
                  {initials(rm.users?.first_name, rm.users?.last_name) || '?'}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-serif text-lg text-white truncate">
                    {rm.users?.first_name} {rm.users?.last_name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {rm.users?.university || '—'} • {rm.users?.phone_number || '—'}
                  </span>
                </div>
                <div className="text-[10px] tracking-widest font-bold text-gray-500 bg-black/50 px-2 py-1 rounded border border-white/5 shrink-0 uppercase">
                  Bed {String(idx + 2).padStart(2, '0')}
                </div>
              </div>
            ))}

            {Array.from({ length: emptyBeds }).map((_, idx) => (
              <div key={`empty-${idx}`} className="p-5 rounded-xl flex items-center gap-4 border bg-transparent border-white/5 border-dashed opacity-50">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-black/30 border border-white/5 text-gray-600 shrink-0">
                  <MdBed />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-serif text-lg text-gray-600">Empty Bed</span>
                </div>
                <div className="text-[10px] tracking-widest font-bold text-gray-600 bg-black/50 px-2 py-1 rounded border border-white/5 shrink-0 uppercase">
                  Bed {String(occupiedBeds + idx + 1).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gray-500/10 rounded-lg text-gray-400 border border-gray-500/20">
              <MdOutlineWbIncandescent className="text-2xl" />
            </div>
            <h3 className="text-xl font-serif text-white tracking-wide">Room Amenities</h3>
          </div>

          {amenities.length > 0 ? (
            <div className="flex flex-col gap-3">
              {amenities.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-white/10 transition-colors">
                  <div className="text-[#A58ED4] shrink-0">
                    {getAmenityIcon(item)}
                  </div>
                  <span className="text-gray-300 text-sm tracking-wide capitalize">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-sm text-center py-8 font-serif italic">
              No amenities listed for this room.
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col gap-4">
            <div className="flex justify-between text-xs tracking-widest uppercase">
              <span className="text-gray-600 font-bold">Type</span>
              <span className="text-gray-400">{room.room_type}</span>
            </div>
            <div className="flex justify-between text-xs tracking-widest uppercase">
              <span className="text-gray-600 font-bold">Floor</span>
              <span className="text-gray-400">{room.floor}</span>
            </div>
            <div className="flex justify-between text-xs tracking-widest uppercase">
              <span className="text-gray-600 font-bold">Wing</span>
              <span className="text-gray-400">{room.wing}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
// import React, { useState, useEffect, useContext } from 'react';
// import {
//   MdBed, MdMeetingRoom, MdOutlineWbIncandescent, MdWifi,
//   MdBathroom, MdDesk, MdLocalLaundryService, MdPerson,
//   MdCalendarToday, MdKey, MdStairs, MdApartment,
//   MdOutlineKingBed, MdAttachMoney, MdErrorOutline
// } from 'react-icons/md';
// import api from "../../utils/api";

// // ─── Helpers ───────────────────────────────────────────────────────────────

// function formatDate(dateStr) {
//   if (!dateStr) return '—';
//   return new Date(dateStr).toLocaleDateString('en-LK', {
//     year: 'numeric', month: 'long', day: 'numeric'
//   });
// }

// function formatRent(amount) {
//   if (!amount) return '—';
//   return Number(amount).toLocaleString('en-LK');
// }

// // Amenity list — facilities string parse කරලා icons match කරනවා
// const AMENITY_ICONS = {
//   'wi-fi': <MdWifi className="text-2xl" />,
//   'wifi': <MdWifi className="text-2xl" />,
//   'bathroom': <MdBathroom className="text-2xl" />,
//   'desk': <MdDesk className="text-2xl" />,
//   'laundry': <MdLocalLaundryService className="text-2xl" />,
//   'washing': <MdLocalLaundryService className="text-2xl" />,
// };

// function getAmenityIcon(name) {
//   const lower = name.toLowerCase();
//   for (const key of Object.keys(AMENITY_ICONS)) {
//     if (lower.includes(key)) return AMENITY_ICONS[key];
//   }
//   return <MdOutlineWbIncandescent className="text-2xl" />;
// }

// function parseAmenities(facilitiesStr) {
//   if (!facilitiesStr) return [];
//   return facilitiesStr.split(',').map(f => f.trim()).filter(Boolean);
// }

// // Avatar initials
// function initials(firstName, lastName) {
//   return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
// }

// // ─── Skeleton Loader ───────────────────────────────────────────────────────

// function Skeleton({ className = '' }) {
//   return (
//     <div className={`bg-white/10 animate-pulse rounded-xl ${className}`} />
//   );
// }

// // ─── No Room State ─────────────────────────────────────────────────────────

// function NoRoom() {
//   return (
//     <div className="w-full mt-16 flex flex-col items-center justify-center gap-4 text-center">
//       <div className="p-6 bg-white/5 rounded-full border border-white/10">
//         <MdErrorOutline className="text-5xl text-gray-500" />
//       </div>
//       <h2 className="text-2xl font-serif text-white">No Room Assigned Yet</h2>
//       <p className="text-gray-400 max-w-sm">
//         You haven't been assigned to a room yet. Please contact the administration for assistance.
//       </p>
//     </div>
//   );
// }

// // ─── Main Component ────────────────────────────────────────────────────────

// export default function MyRoom() {
//   const [data, setData] = useState(null);       // { lease, room, roommates }
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Auth context — logged in user ගේ basic info ගන්නවා
//   // ඔයාගේ project ගේ auth context / localStorage pattern එකට match කරගන්ඩ
//   const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

//   useEffect(() => {
//     const fetchRoomDetails = async () => {
//       try {
//         const res = await api.get('/leases/my-room');
//         setData(res.data);
//       } catch (err) {
//         if (err.response?.status === 404) {
//           setData(null); // Room නැත්නම් NoRoom show කරනවා
//         } else {
//           setError(err.response?.data?.message || 'Failed to load room details');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRoomDetails();
//   }, []);

//   // ─── Loading ──────────────────────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="w-full mt-8 flex flex-col gap-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <Skeleton className="lg:col-span-2 h-52" />
//           <Skeleton className="h-52" />
//         </div>
//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//           <Skeleton className="xl:col-span-2 h-72" />
//           <Skeleton className="h-72" />
//         </div>
//       </div>
//     );
//   }

//   // ─── Error ────────────────────────────────────────────────────────────────

//   if (error) {
//     return (
//       <div className="w-full mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
//         {error}
//       </div>
//     );
//   }

//   // ─── No Room ──────────────────────────────────────────────────────────────

//   if (!data) return <NoRoom />;

//   const { lease, room, roommates } = data;

//   // Roommate count info
//   const occupiedBeds = 1 + roommates.length;
//   const totalRent = occupiedBeds * Number(room.monthly_rent || 0); // You + others
//   const totalBeds = room.capacity || 4;
//   const emptyBeds = Math.max(0, totalBeds - occupiedBeds);

//   const amenities = parseAmenities(room.facilities);

//   // Room image — DB ල image url ද, නැත්නම් Unsplash fallback
//   const roomImage = room.image && room.image !== '/default-room.jpg'
//     ? room.image
//     : 'https://images.unsplash.com/photo-1522771731478-44710c80d905?q=80&w=800&auto=format&fit=crop';

//   return (
//     <div className="w-full mt-8 flex flex-col gap-8">

//       {/* ══════════════════════════════════
//           Section 1: Room Identity
//       ══════════════════════════════════ */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//         {/* Main Room Card */}
//         <div className="lg:col-span-2 bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center shadow-xl relative overflow-hidden">
//           <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

//           <div className="flex flex-col gap-2 z-10 w-full">
//             <div className="flex items-center gap-3 mb-2 flex-wrap">
//               <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded-full border border-green-500/20">
//                 Active
//               </span>
//               <span className="text-sm font-medium text-gray-400">{room.room_type}</span>
//             </div>
//             <h1 className="text-5xl font-serif text-white mb-2">
//               {room.room_number}
//             </h1>
//             <p className="text-gray-400">{room.wing} • {room.floor}</p>

//             {/* Lease meta */}
//             <div className="flex flex-wrap gap-4 mt-4">
//               <div className="flex items-center gap-2 text-xs text-gray-500">
//                 <MdCalendarToday className="text-purple-400" />
//                 <span>Joined: <span className="text-gray-300">{formatDate(lease.joined_date)}</span></span>
//               </div>
//               <div className="flex items-center gap-2 text-xs text-gray-500">
//                 <MdKey className="text-purple-400" />
//                 <span>Key Money: <span className="text-gray-300">Rs. {formatRent(lease.key_money)}</span></span>
//               </div>
//               <div className="flex items-center gap-2 text-xs text-gray-500">
//                 <MdOutlineKingBed className="text-purple-400" />
//                 <span>Capacity: <span className="text-gray-300">{occupiedBeds}/{totalBeds} beds</span></span>
//               </div>
//             </div>
//           </div>

//           {/* Rent box */}
//           <div className="z-10 mt-6 md:mt-0 w-full md:w-auto flex flex-col items-start md:items-end bg-white/5 p-6 rounded-2xl border border-white/10 shrink-0">
//             <span className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Total Monthly Rent</span>
//             <span className="text-3xl font-serif text-[#A58ED4]">Rs. {formatRent(totalRent)}</span>
//             <span className="text-xs text-gray-500 mt-1">
//               {occupiedBeds} {occupiedBeds === 1 ? 'student' : 'students'} × Rs. {formatRent(room.monthly_rent)}
//             </span>
//           </div>
//         </div>

//         {/* Room Image Card */}
//         <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl relative min-h-[200px]">
//           <img
//             src={roomImage}
//             alt="Room View"
//             className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity duration-500 absolute inset-0"
//             onError={(e) => {
//               e.target.src = 'https://images.unsplash.com/photo-1522771731478-44710c80d905?q=80&w=800&auto=format&fit=crop';
//             }}
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-[#161121] to-transparent" />
//           <div className="absolute bottom-6 left-6 right-6">
//             <div className="flex items-center gap-2 text-white">
//               <MdMeetingRoom className="text-xl" />
//               <span className="font-medium">Your Cozy Space</span>
//             </div>
//             <div className="flex gap-3 mt-2">
//               <span className="flex items-center gap-1 text-xs text-gray-400">
//                 <MdStairs className="text-purple-400" /> {room.floor}
//               </span>
//               <span className="flex items-center gap-1 text-xs text-gray-400">
//                 <MdApartment className="text-purple-400" /> {room.wing}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ══════════════════════════════════
//           Section 2: Roommates + Amenities
//       ══════════════════════════════════ */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

//         {/* Roommates */}
//         <div className="xl:col-span-2 bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
//           <div className="flex items-center gap-3 mb-8">
//             <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
//               <MdPerson className="text-2xl" />
//             </div>
//             <h3 className="text-lg font-serif text-white">Your Roommates</h3>
//             <span className="ml-auto text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
//               {occupiedBeds} / {totalBeds} occupied
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//             {/* You */}
//             <div className="bg-gradient-to-br from-purple-900/40 to-[#161121] border border-purple-500/30 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
//               <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0">
//                 {initials(currentUser.firstName, currentUser.lastName) || 'Y'}
//               </div>
//               <div className="flex flex-col min-w-0">
//                 <span className="text-white font-medium text-base truncate">
//                   {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'You'}
//                 </span>
//                 <span className="text-xs text-purple-300 truncate">{currentUser.university || 'You'}</span>
//               </div>
//               <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold rounded-bl-lg">
//                 Your Bed
//               </div>
//             </div>

//             {/* Other roommates */}
//             {roommates.map((rm, idx) => (
//               <div
//                 key={rm.id}
//                 className="p-5 rounded-xl flex items-center gap-4 border bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
//               >
//                 <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-gray-700 text-gray-300 shrink-0">
//                   {initials(rm.users?.first_name, rm.users?.last_name) || '?'}
//                 </div>
//                 <div className="flex flex-col flex-1 min-w-0">
//                   <span className="font-medium text-base text-white truncate">
//                     {rm.users?.first_name} {rm.users?.last_name}
//                   </span>
//                   <span className="text-xs text-gray-400 truncate">
//                     {rm.users?.university || '—'} • {rm.users?.phone_number || '—'}
//                   </span>
//                 </div>
//                 <div className="text-xs font-bold text-gray-500 bg-black/30 px-2 py-1 rounded shrink-0">
//                   Bed {String(idx + 2).padStart(2, '0')}
//                 </div>
//               </div>
//             ))}

//             {/* Empty beds */}
//             {Array.from({ length: emptyBeds }).map((_, idx) => (
//               <div
//                 key={`empty-${idx}`}
//                 className="p-5 rounded-xl flex items-center gap-4 border bg-white/[0.02] border-white/5 border-dashed"
//               >
//                 <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gray-800 text-gray-600 shrink-0">
//                   <MdBed />
//                 </div>
//                 <div className="flex flex-col flex-1">
//                   <span className="font-medium text-base text-gray-500">Empty Bed</span>
//                 </div>
//                 <div className="text-xs font-bold text-gray-600 bg-black/30 px-2 py-1 rounded shrink-0">
//                   Bed {String(occupiedBeds + idx + 1).padStart(2, '0')}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Amenities */}
//         <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
//           <div className="flex items-center gap-3 mb-8">
//             <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
//               <MdOutlineWbIncandescent className="text-2xl" />
//             </div>
//             <h3 className="text-lg font-serif text-white">Room Amenities</h3>
//           </div>

//           {amenities.length > 0 ? (
//             <div className="flex flex-col gap-4">
//               {amenities.map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
//                 >
//                   <div className="text-[#A58ED4] shrink-0">
//                     {getAmenityIcon(item)}
//                   </div>
//                   <span className="text-gray-300 font-medium">{item}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-gray-600 text-sm text-center py-8 italic">
//               No amenities listed for this room.
//             </div>
//           )}

//           {/* Room extra info */}
//           <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3">

//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Type</span>
//               <span className="text-gray-300">{room.room_type}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Floor</span>
//               <span className="text-gray-300">{room.floor}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Wing</span>
//               <span className="text-gray-300">{room.wing}</span>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }