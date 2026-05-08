import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Facilities ලිස්ට් එක (ඔයාට ඕන නම් තව දේවල් මෙතනට එකතු කරන්න පුළුවන්)
  const availableFacilities = ['WiFi', 'A/C', 'Attached Bathroom', 'Balcony', 'Study Desk', 'Hot Water'];

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'Single',
    capacity: 1,
    floor: '1st Floor',
    wing: 'Main Wing',
    monthlyRent: '',
    facilities: '', // Facilities ටික යන්නේ මේකට
    image: '',      // Image එක යන්නේ මේකට
    isAvailable: true
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

  useEffect(() => {
    fetchRooms();
  }, []);

  const openModal = (room = null) => {
    if (room) {
      setIsEditing(true);
      setEditId(room.id);
      setFormData({
        roomNumber: room.room_number,
        roomType: room.room_type,
        capacity: room.capacity,
        floor: room.floor,
        wing: room.wing,
        monthlyRent: room.monthly_rent,
        facilities: room.facilities || '',
        image: room.image || '', // Image එක ගන්නවා
        isAvailable: room.is_available
      });
    } else {
      setIsEditing(false);
      setEditId(null);
      setFormData({
        roomNumber: '', roomType: 'Single', capacity: 1, floor: '1st Floor', 
        wing: 'Main Wing', monthlyRent: '', facilities: '', image: '', isAvailable: true
      });
    }
    setShowModal(true);
  };

  // Facilities Tick කරද්දී State එක Update කරන Function එක
  const handleFacilityChange = (facility) => {
    // දැනට තියෙන facilities ටික array එකක් කරගන්නවා
    let currentFacilities = formData.facilities 
      ? formData.facilities.split(',').map(f => f.trim()) 
      : [];
    
    // Tick එක අයින් කළා නම් array එකෙන් අයින් කරනවා, දැම්මා නම් එකතු කරනවා
    if (currentFacilities.includes(facility)) {
      currentFacilities = currentFacilities.filter(item => item !== facility);
    } else {
      currentFacilities.push(facility);
    }

    // ආයේ කොමා (,) දාලා string එකක් කරලා save කරනවා
    setFormData({ ...formData, facilities: currentFacilities.join(', ') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Edit කරනවා නම් PUT request එක යවනවා
        await api.put(`/properties/${editId}`, formData);
        toast.success('Room updated successfully!');
      } else {
        // අලුතින් Add කරනවා නම් POST request එක යවනවා
        await api.post('/properties', formData);
        toast.success('Room added successfully!');
      }

      setShowModal(false);
      fetchRooms(); // අලුත් Data ටික ගන්නවා
    } catch (error) {
      // Backend එකෙන් එවන error message එක පෙන්නන්න පුළුවන්
      const errorMsg = error.response?.data?.message || 'Operation failed';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      // DELETE request එක යවනවා
      await api.delete(`/properties/${id}`);
      
      toast.success('Room deleted successfully!');
      fetchRooms(); // අලුත් Data ටික ගන්නවා
    } catch (error) {
      // Error එකක් ආවොත් ඒක පෙන්නනවා
      const errorMsg = error.response?.data?.message || 'Error deleting room';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all boarding rooms and facilities</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Add New Room
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading rooms...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Room No</th>
                <th className="p-4 font-semibold">Type & Wing</th>
                <th className="p-4 font-semibold">Rent (Rs.)</th>
                <th className="p-4 font-semibold">Beds (Free/Total)</th>
                <th className="p-4 font-semibold">Total Payment (Rs.)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                // ඇඳන් ගාණ හදාගන්නවා
                const totalBeds = Number(room.capacity || 1);
                const occupiedBeds = Number(room.occupant_count || 0);
                const freeBeds = totalBeds - occupiedBeds;
                
                // කාමරේ පිරිලද කියලා බලනවා
                const isFull = freeBeds <= 0;

                return (
                  <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{room.room_number}</td>
                    <td className="p-4">
                      <div>{room.room_type}</div>
                      <div className="text-xs text-gray-500">{room.wing} - {room.floor}</div>
                    </td>
                    <td className="p-4">{Number(room.monthly_rent).toLocaleString()}</td>
                    
                    {/* 👇 අලුතින් දාපු ඇඳන් පෙන්වන තීරුව */}
                    <td className="p-4">
                      <div className={`font-bold ${freeBeds > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {freeBeds > 0 ? `${freeBeds} Free` : 'Full'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Out of {totalBeds} beds
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-green-700">
                        {Number(room.total_payment || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {occupiedBeds} student{occupiedBeds === 1 ? '' : 's'} × {Number(room.monthly_rent).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      {/* කාමරේ පිරිලා නම් කෙලින්ම Full කියලා පෙන්නනවා */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${isFull ? 'bg-red-100 text-red-700' : room.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {isFull ? 'Full' : room.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-3">
                      <button onClick={() => openModal(room)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(room.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                );
              })}
              
            </tbody>
          </table>
        )}
      </div>

      {/* ═══════════════════════════════════════
          MODAL (ADD / EDIT ROOM)
      ═══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Room' : 'Add New Room'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input type="text" required value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select value={formData.roomType} onChange={(e) => setFormData({...formData, roomType: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500">
                    <option>Single</option>
                    <option>Shared (2)</option>
                    <option>Shared (4)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <select value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500">
                    <option>Ground Floor</option>
                    <option>1st Floor</option>
                    <option>2nd Floor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wing</label>
                  <select value={formData.wing} onChange={(e) => setFormData({...formData, wing: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500">
                    <option>Main Wing</option>
                    <option>East Wing</option>
                    <option>West Wing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent (Rs.)</label>
                  <input type="number" required value={formData.monthlyRent} onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" required value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* ─ අලුතින් දැම්ම Image URL එක ─ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Image Link (URL)</label>
                <input 
                  type="text" 
                  value={formData.image} 
                  onChange={(e) => setFormData({...formData, image: e.target.value})} 
                  className="w-full border rounded-lg p-2 outline-none focus:border-blue-500" 
                  placeholder="https://example.com/image.jpg (Leave empty for default)" 
                />
              </div>

              {/* ─ අලුතින් දැම්ම Facilities Checkboxes ටික ─ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {availableFacilities.map(fac => {
                    const isChecked = formData.facilities ? formData.facilities.split(',').map(f => f.trim()).includes(fac) : false;
                    return (
                      <label key={fac} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleFacilityChange(fac)} 
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                        />
                        {fac}
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                  <select value={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.value === 'true'})} className="w-full border rounded-lg p-2 outline-none focus:border-blue-500">
                    <option value="true">Available</option>
                    <option value="false">Occupied</option>
                  </select>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  {isEditing ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}