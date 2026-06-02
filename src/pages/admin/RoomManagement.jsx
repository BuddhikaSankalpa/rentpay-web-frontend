import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const availableFacilities = ['WiFi', 'A/C', 'Attached Bathroom', 'Balcony', 'Study Desk', 'Hot Water'];

  const [formData, setFormData] = useState({
    roomNumber: '', roomType: 'Single', capacity: 1, floor: '1st Floor', 
    wing: 'Main Wing', monthlyRent: '', facilities: '', image: '', isAvailable: true
  });

  const fetchRooms = async () => {
    try {
      const response = await api.get('/properties');
      setRooms(response.data);
    } catch (error) {
      toast.error('Error fetching rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const openModal = (room = null) => {
    if (room) {
      setIsEditing(true); setEditId(room.id);
      setFormData({
        roomNumber: room.room_number, roomType: room.room_type, capacity: room.capacity,
        floor: room.floor, wing: room.wing, monthlyRent: room.monthly_rent,
        facilities: room.facilities || '', image: room.image || '', isAvailable: room.is_available
      });
    } else {
      setIsEditing(false); setEditId(null);
      setFormData({
        roomNumber: '', roomType: 'Single', capacity: 1, floor: '1st Floor', 
        wing: 'Main Wing', monthlyRent: '', facilities: '', image: '', isAvailable: true
      });
    }
    setShowModal(true);
  };

  const handleFacilityChange = (facility) => {
    let currentFacilities = formData.facilities ? formData.facilities.split(',').map(f => f.trim()) : [];
    if (currentFacilities.includes(facility)) { currentFacilities = currentFacilities.filter(item => item !== facility); } 
    else { currentFacilities.push(facility); }
    setFormData({ ...formData, facilities: currentFacilities.join(', ') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/properties/${editId}`, formData);
        toast.success('Room updated successfully!');
      } else {
        await api.post('/properties', formData);
        toast.success('Room added successfully!');
      }
      setShowModal(false);
      fetchRooms(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Erase this room from existence?')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Room deleted successfully!');
      fetchRooms(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting room');
    }
  };

  return (
    <div className="w-full bg-[#09090e] text-gray-200">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-100 uppercase tracking-widest">Room Registry</h2>
          <p className="text-sm text-[#8a8a9d] mt-1 border-l-2 border-[#5b3e96] pl-3">Manage quarters and capacities.</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#3e277a] hover:bg-[#5233a3] border border-[#5b3e96] text-white px-4 py-2 rounded font-medium tracking-wide text-sm transition-colors uppercase">
          + Add Chamber
        </button>
      </div>

      <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#8a8a9d] italic">Summoning rooms...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#171721] border-b border-[#2a2a3d] text-[#8a8a9d] text-[10px] uppercase tracking-widest">
                <th className="p-4 font-bold">Room No</th>
                <th className="p-4 font-bold">Details</th>
                <th className="p-4 font-bold">Rent (Rs.)</th>
                <th className="p-4 font-bold">Occupancy</th>
                <th className="p-4 font-bold">Revenue (Rs.)</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const totalBeds = Number(room.capacity || 1);
                const occupiedBeds = Number(room.occupant_count || 0);
                const freeBeds = totalBeds - occupiedBeds;
                const isFull = freeBeds <= 0;

                return (
                  <tr key={room.id} className="border-b border-[#1b1b26] hover:bg-[#161622] transition-colors">
                    <td className="p-4 font-serif font-bold text-lg text-[#c4b5fd]">{room.room_number}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-200">{room.room_type}</div>
                      <div className="text-xs text-[#6d6d88] mt-1">{room.wing} • {room.floor}</div>
                    </td>
                    <td className="p-4 text-sm">{Number(room.monthly_rent).toLocaleString()}</td>
                    
                    <td className="p-4">
                      <div className={`text-xs font-bold uppercase tracking-wider ${freeBeds > 0 ? 'text-[#8b5cf6]' : 'text-[#ef4444]'}`}>
                        {freeBeds > 0 ? `${freeBeds} Free` : 'Occupied'}
                      </div>
                      <div className="text-[10px] text-[#6d6d88] uppercase mt-1">Capacity: {totalBeds}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm font-bold text-[#10b981]">
                        {Number(room.total_payment || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#6d6d88] mt-1 uppercase">
                        {occupiedBeds} Inhabitant{occupiedBeds === 1 ? '' : 's'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${isFull ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30' : room.is_available ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' : 'bg-[#475569]/10 text-[#94a3b8] border-[#475569]/30'}`}>
                        {isFull ? 'Full' : room.is_available ? 'Available' : 'Restricted'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-3">
                      <button onClick={() => openModal(room)} className="text-[#a78bfa] hover:text-[#c4b5fd] text-[11px] font-bold uppercase tracking-wider">Edit</button>
                      <button onClick={() => handleDelete(room.id)} className="text-[#ef4444] hover:text-[#fca5a5] text-[11px] font-bold uppercase tracking-wider">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl w-full max-w-lg my-8 relative">
            <div className="p-6 border-b border-[#2a2a3d] flex justify-between items-center bg-[#171721] sticky top-0 z-10 rounded-t-xl">
              <h3 className="text-lg font-serif font-bold text-gray-100 uppercase tracking-widest">{isEditing ? 'Modify Chamber' : 'New Chamber'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#6d6d88] hover:text-gray-300 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Room Number</label>
                  <input type="text" required value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Room Type</label>
                  <select value={formData.roomType} onChange={(e) => setFormData({...formData, roomType: e.target.value})} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm">
                    <option>Single</option><option>Shared (2)</option><option>Shared (4)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Floor</label>
                  <select value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm">
                    <option>Ground Floor</option><option>1st Floor</option><option>2nd Floor</option><option>Attic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Wing</label>
                  <select value={formData.wing} onChange={(e) => setFormData({...formData, wing: e.target.value})} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm">
                    <option>Main Wing</option><option>East Wing</option><option>West Wing</option><option>Raven Wing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Rent (Rs.)</label>
                  <input type="number" required value={formData.monthlyRent} onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Capacity</label>
                  <input type="number" required value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Image Link URL</label>
                <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-3">Amenities</label>
                <div className="flex flex-wrap gap-3 bg-[#0d0d14] p-4 rounded border border-[#2a2a3d]">
                  {availableFacilities.map(fac => {
                    const isChecked = formData.facilities ? formData.facilities.split(',').map(f => f.trim()).includes(fac) : false;
                    return (
                      <label key={fac} className="flex items-center gap-2 text-xs text-[#a0a0b5] cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" checked={isChecked} onChange={() => handleFacilityChange(fac)} className="rounded bg-[#1b1b26] border-[#4a4a5e] text-[#7c3aed] focus:ring-[#7c3aed] w-3.5 h-3.5" />
                        {fac}
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {isEditing && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Status</label>
                  <select value={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.value === 'true'})} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm">
                    <option value="true">Available</option>
                    <option value="false">Restricted</option>
                  </select>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-[#2a2a3d] bg-[#12121a]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#1a1a26] hover:bg-[#252536] text-[#8a8a9d] rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#5b3e96] hover:bg-[#4a2f82] text-white rounded transition-colors">{isEditing ? 'Commit Changes' : 'Create Chamber'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import api from '../../utils/api';

// export default function RoomManagement() {
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
  
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);

//   // Facilities ලිස්ට් එක (ඔයාට ඕන නම් තව දේවල් මෙතනට එකතු කරන්න පුළුවන්)
//   const availableFacilities = ['WiFi', 'A/C', 'Attached Bathroom', 'Balcony', 'Study Desk', 'Hot Water'];

//   const [formData, setFormData] = useState({
//     roomNumber: '',
//     roomType: 'Single',
//     capacity: 1,
//     floor: '1st Floor',
//     wing: 'Main Wing',
//     monthlyRent: '',
//     facilities: '', // Facilities ටික යන්නේ මේකට
//     image: '',      // Image එක යන්නේ මේකට
//     isAvailable: true
//   });

//   const fetchRooms = async () => {
//     try {
//       const response = await api.get('/properties');
//       setRooms(response.data);
      
//     } catch (error) {
//       toast.error('Error fetching rooms');
//     } finally {
//       setLoading(false);
//     }
// };

//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   const openModal = (room = null) => {
//     if (room) {
//       setIsEditing(true);
//       setEditId(room.id);
//       setFormData({
//         roomNumber: room.room_number,
//         roomType: room.room_type,
//         capacity: room.capacity,
//         floor: room.floor,
//         wing: room.wing,
//         monthlyRent: room.monthly_rent,
//         facilities: room.facilities || '',
//         image: room.image || '', // Image එක ගන්නවා
//         isAvailable: room.is_available
//       });
//     } else {
//       setIsEditing(false);
//       setEditId(null);
//       setFormData({
//         roomNumber: '', roomType: 'Single', capacity: 1, floor: '1st Floor', 
//         wing: 'Main Wing', monthlyRent: '', facilities: '', image: '', isAvailable: true
//       });
//     }
//     setShowModal(true);
//   };

//   // Facilities Tick කරද්දී State එක Update කරන Function එක
//   const handleFacilityChange = (facility) => {
//     // දැනට තියෙන facilities ටික array එකක් කරගන්නවා
//     let currentFacilities = formData.facilities 
//       ? formData.facilities.split(',').map(f => f.trim()) 
//       : [];
    
//     // Tick එක අයින් කළා නම් array එකෙන් අයින් කරනවා, දැම්මා නම් එකතු කරනවා
//     if (currentFacilities.includes(facility)) {
//       currentFacilities = currentFacilities.filter(item => item !== facility);
//     } else {
//       currentFacilities.push(facility);
//     }

//     // ආයේ කොමා (,) දාලා string එකක් කරලා save කරනවා
//     setFormData({ ...formData, facilities: currentFacilities.join(', ') });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (isEditing) {
//         // Edit කරනවා නම් PUT request එක යවනවා
//         await api.put(`/properties/${editId}`, formData);
//         toast.success('Room updated successfully!');
//       } else {
//         // අලුතින් Add කරනවා නම් POST request එක යවනවා
//         await api.post('/properties', formData);
//         toast.success('Room added successfully!');
//       }

//       setShowModal(false);
//       fetchRooms(); // අලුත් Data ටික ගන්නවා
//     } catch (error) {
//       // Backend එකෙන් එවන error message එක පෙන්නන්න පුළුවන්
//       const errorMsg = error.response?.data?.message || 'Operation failed';
//       toast.error(errorMsg);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this room?')) return;
//     try {
//       // DELETE request එක යවනවා
//       await api.delete(`/properties/${id}`);
      
//       toast.success('Room deleted successfully!');
//       fetchRooms(); // අලුත් Data ටික ගන්නවා
//     } catch (error) {
//       // Error එකක් ආවොත් ඒක පෙන්නනවා
//       const errorMsg = error.response?.data?.message || 'Error deleting room';
//       toast.error(errorMsg);
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
//           <p className="text-sm text-gray-500 mt-1">Manage all boarding rooms and facilities</p>
//         </div>
//         <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
//           + Add New Room
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         {loading ? (
//           <div className="p-8 text-center text-gray-500">Loading rooms...</div>
//         ) : (
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
//                 <th className="p-4 font-semibold">Room No</th>
//                 <th className="p-4 font-semibold">Type & Wing</th>
//                 <th className="p-4 font-semibold">Rent (Rs.)</th>
//                 <th className="p-4 font-semibold">Beds (Free/Total)</th>
//                 <th className="p-4 font-semibold">Total Payment (Rs.)</th>
//                 <th className="p-4 font-semibold">Status</th>
//                 <th className="p-4 font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rooms.map((room) => {
//                 // ඇඳන් ගාණ හදාගන්නවා
//                 const totalBeds = Number(room.capacity || 1);
//                 const occupiedBeds = Number(room.occupant_count || 0);
//                 const freeBeds = totalBeds - occupiedBeds;
                
//                 // කාමරේ පිරිලද කියලා බලනවා
//                 const isFull = freeBeds <= 0;

//                 return (
//                   <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50/50">
//                     <td className="p-4 font-medium text-gray-900">{room.room_number}</td>
//                     <td className="p-4">
//                       <div>{room.room_type}</div>
//                       <div className="text-xs text-gray-500">{room.wing} - {room.floor}</div>
//                     </td>
//                     <td className="p-4">{Number(room.monthly_rent).toLocaleString()}</td>
                    
//                     {/* 👇 අලුතින් දාපු ඇඳන් පෙන්වන තීරුව */}
//                     <td className="p-4">
//                       <div className={`font-bold ${freeBeds > 0 ? 'text-blue-600' : 'text-red-500'}`}>
//                         {freeBeds > 0 ? `${freeBeds} Free` : 'Full'}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Out of {totalBeds} beds
//                       </div>
//                     </td>

//                     <td className="p-4">
//                       <div className="font-semibold text-green-700">
//                         {Number(room.total_payment || 0).toLocaleString()}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {occupiedBeds} student{occupiedBeds === 1 ? '' : 's'} × {Number(room.monthly_rent).toLocaleString()}
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       {/* කාමරේ පිරිලා නම් කෙලින්ම Full කියලා පෙන්නනවා */}
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${isFull ? 'bg-red-100 text-red-700' : room.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
//                         {isFull ? 'Full' : room.is_available ? 'Available' : 'Unavailable'}
//                       </span>
//                     </td>
//                     <td className="p-4 flex gap-3">
//                       <button onClick={() => openModal(room)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
//                       <button onClick={() => handleDelete(room.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
//                     </td>
//                   </tr>
//                 );
//               })}
              
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════
//           MODAL (ADD / EDIT ROOM)
//       ═══════════════════════════════════════ */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-lg my-8">
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
//               <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Room' : 'Add New Room'}</h3>
//               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
//             </div>
            
//             <form onSubmit={handleSubmit} className="p-6 space-y-5">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
//                   <input type="text" required value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
//                   <select value={formData.roomType} onChange={(e) => setFormData({...formData, roomType: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500">
//                     <option>Single</option>
//                     <option>Shared (2)</option>
//                     <option>Shared (4)</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
//                   <select value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500">
//                     <option>Ground Floor</option>
//                     <option>1st Floor</option>
//                     <option>2nd Floor</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Wing</label>
//                   <select value={formData.wing} onChange={(e) => setFormData({...formData, wing: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500">
//                     <option>Main Wing</option>
//                     <option>East Wing</option>
//                     <option>West Wing</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Rent (Rs.)</label>
//                   <input type="number" required value={formData.monthlyRent} onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
//                   <input type="number" required value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" />
//                 </div>
//               </div>

//               {/* ─ අලුතින් දැම්ම Image URL එක ─ */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Room Image Link (URL)</label>
//                 <input 
//                   type="text" 
//                   value={formData.image} 
//                   onChange={(e) => setFormData({...formData, image: e.target.value})} 
//                   className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" 
//                   placeholder="https://example.com/image.jpg (Leave empty for default)" 
//                 />
//               </div>

//               {/* ─ අලුතින් දැම්ම Facilities Checkboxes ටික ─ */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
//                 <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
//                   {availableFacilities.map(fac => {
//                     const isChecked = formData.facilities ? formData.facilities.split(',').map(f => f.trim()).includes(fac) : false;
//                     return (
//                       <label key={fac} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
//                         <input 
//                           type="checkbox" 
//                           checked={isChecked} 
//                           onChange={() => handleFacilityChange(fac)} 
//                           className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
//                         />
//                         {fac}
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
              
//               {isEditing && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
//                   <select value={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.value === 'true'})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500">
//                     <option value="true">Available</option>
//                     <option value="false">Occupied</option>
//                   </select>
//                 </div>
//               )}

//               <div className="mt-6 flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
//                 <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
//                 <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
//                   {isEditing ? 'Update Room' : 'Save Room'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }