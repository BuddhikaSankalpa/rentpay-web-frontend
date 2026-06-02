import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from "../../utils/api";
import AddStudentModal from '../../components/AddStudentModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeLeases, setActiveLeases] = useState({});
  const [loading, setLoading] = useState(true);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false); 
  const [selectedUser, setSelectedUser] = useState(null);

  const [assignData, setAssignData] = useState({ roomId: '', joinedDate: new Date().toISOString().split('T')[0], keyMoney: '' });
  const [changeData, setChangeData] = useState({ newRoomId: '', joinedDate: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    try {
      const [usersRes, roomsRes] = await Promise.all([
        api.get('/users/all'),
        api.get('/properties')
      ]);

      const fetchedUsers = usersRes.data.users;
      setUsers(fetchedUsers);

      const availableRooms = roomsRes.data.filter(room => {
        const totalBeds = Number(room.capacity || 1);
        const occupiedBeds = Number(room.occupant_count || 0);
        const freeBeds = totalBeds - occupiedBeds;
        return room.is_available === true && freeBeds > 0;
      });

      setRooms(availableRooms);
      await fetchActiveLeases(fetchedUsers);
    } catch (error) {
      toast.error('Error fetching data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveLeases = async (userList) => {
    const students = userList.filter(u => !u.is_admin);
    const leaseResults = await Promise.allSettled(students.map(u => api.get(`/leases/active/${u.id}`)));
    const leasesMap = {};
    students.forEach((u, i) => {
      const result = leaseResults[i];
      if (result.status === 'fulfilled') {
        leasesMap[u.id] = result.value.data.lease; 
      } else {
        leasesMap[u.id] = null;
      }
    });
    setActiveLeases(leasesMap);
  };

  useEffect(() => { fetchData(); }, []);

  const openAssignModal = (user) => {
    setSelectedUser(user);
    setAssignData({ roomId: '', joinedDate: new Date().toISOString().split('T')[0], keyMoney: '' });
    setShowAssignModal(true);
  };

  const handleAssignRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leases', { userId: selectedUser.id, roomId: assignData.roomId, joinedDate: assignData.joinedDate, keyMoney: assignData.keyMoney });
      toast.success(`${selectedUser.first_name} assigned successfully!`);
      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign room');
    }
  };

  const openChangeModal = (user) => {
    setSelectedUser(user);
    setChangeData({ newRoomId: '', joinedDate: new Date().toISOString().split('T')[0] });
    setShowChangeModal(true);
  };

  const handleChangeRoom = async (e) => {
    e.preventDefault();
    const currentLease = activeLeases[selectedUser.id];
    if (!currentLease) { toast.error('No active lease found.'); return; }
    if (parseInt(changeData.newRoomId) === currentLease.rooms?.id) { toast.error('Please select a different room.'); return; }

    try {
      await api.put(`/leases/${currentLease.id}/end`);
      await api.post('/leases', { userId: selectedUser.id, roomId: changeData.newRoomId, joinedDate: changeData.joinedDate, keyMoney: 0 });
      toast.success('Room changed successfully!');
      setShowChangeModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change room');
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Delete ${email}? This action is irreversible.`)) return;
    try {
      await api.delete(`/users/${email}`);
      toast.success('User deleted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  const handleToggleBlock = async (email, currentStatus) => {
    const action = currentStatus ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} ${email}?`)) return;
    try {
      await api.patch(`/users/${email}/block`);
      toast.success(`User ${action}ed successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Error trying to ${action}`);
    }
  };

  const getAvailableRoomsForChange = (userId) => {
    const currentLease = activeLeases[userId];
    if (!currentLease) return rooms;
    return rooms.filter(r => r.id !== currentLease.rooms?.id);
  };

  return (
    <div className="w-full bg-[#09090e] text-gray-200">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-100 uppercase tracking-widest">User Management</h2>
          <p className="text-sm text-[#8a8a9d] mt-1 border-l-2 border-[#5b3e96] pl-3">Control student access and room assignments.</p>
        </div>
        <button 
          onClick={() => setShowRegisterModal(true)} 
          className="bg-[#3e277a] hover:bg-[#5233a3] border border-[#5b3e96] text-[#e0e0e0] px-4 py-2 rounded-lg font-medium transition-colors tracking-wide text-sm"
        >
          + Register Student
        </button>
      </div>

      <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#8a8a9d] italic">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#171721] border-b border-[#2a2a3d] text-[#8a8a9d] text-[10px] uppercase tracking-widest">
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Contact Info</th>
                  <th className="p-4 font-bold">Current Room</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!users || users.length === 0) ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[#6d6d88] italic">No users found.</td></tr>
                ) : (
                  users.map((user) => {
                    const activeLease = activeLeases[user.id];
                    const hasRoom = !user.is_admin && activeLease != null;

                    return (
                      <tr key={user.email} className={`border-b border-[#1b1b26] transition-colors ${user.is_blocked ? 'bg-[#3b1c1c]/40' : 'hover:bg-[#161622]'}`}>
                        <td className="p-4">
                          <div className="font-medium text-gray-200">{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-[#8a8a9d]">{user.is_admin ? 'Administrator' : 'Student'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 text-sm">{user.email}</div>
                          <div className="text-xs text-[#6d6d88] mt-1">{user.phone_number || 'No Phone'}</div>
                        </td>
                        <td className="p-4">
                          {user.is_admin ? (
                            <span className="text-xs text-[#6d6d88] italic">N/A</span>
                          ) : hasRoom ? (
                            <div>
                              <span className="inline-flex items-center gap-1 bg-[#24173d] text-[#c4b5fd] border border-[#4a3473] text-[10px] font-bold tracking-wider px-2 py-1 rounded-full uppercase">
                                🏠 {activeLease.rooms?.room_number}
                              </span>
                              <div className="text-xs text-[#6d6d88] mt-2">{activeLease.rooms?.room_type}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#fca5a5] italic opacity-80">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${!user.is_blocked ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'}`}>
                            {!user.is_blocked ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2 flex-wrap items-center">
                          {!user.is_admin && !hasRoom && (
                            <button onClick={() => openAssignModal(user)} className="text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded transition-colors text-[#c4b5fd] bg-[#3e277a] hover:bg-[#5233a3] border border-[#4a3473]">Assign</button>
                          )}
                          {!user.is_admin && hasRoom && (
                            <button onClick={() => openChangeModal(user)} className="text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded transition-colors text-gray-200 bg-[#475569] hover:bg-[#64748b] border border-[#334155]">Change</button>
                          )}
                          <button onClick={() => handleToggleBlock(user.email, user.is_blocked)} disabled={user.is_admin} className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded transition-colors ${user.is_admin ? 'bg-[#1b1b26] text-[#4a4a5e] cursor-not-allowed border border-[#2a2a3d]' : user.is_blocked ? 'text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 hover:bg-[#10b981]/20' : 'text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 hover:bg-[#f59e0b]/20'}`}>
                            {user.is_blocked ? 'Unblock' : 'Block'}
                          </button>
                          <button onClick={() => handleDeleteUser(user.email)} disabled={user.is_admin} className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded transition-colors ${user.is_admin ? 'bg-[#1b1b26] text-[#4a4a5e] cursor-not-allowed border border-[#2a2a3d]' : 'text-[#ef4444] hover:text-[#fca5a5] bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444]/30'}`}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ASSIGN ROOM MODAL */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[#2a2a3d] flex justify-between items-center bg-[#171721]">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-100 uppercase tracking-widest">Assign Room</h3>
                <p className="text-xs text-[#8a8a9d] mt-1 italic">{selectedUser.first_name} {selectedUser.last_name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-[#6d6d88] hover:text-gray-300 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAssignRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Select Room</label>
                <select required value={assignData.roomId} onChange={(e) => setAssignData({ ...assignData, roomId: e.target.value })} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-[#7c3aed] text-sm">
                  <option value="" disabled>-- Select available room --</option>
                  {rooms.map(room => {
                    const free = Number(room.capacity || 1) - Number(room.occupant_count || 0);
                    return <option key={room.id} value={room.id}>Room {room.room_number} - {room.room_type} ({free} free) Rs.{room.monthly_rent}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Joined Date</label>
                <input type="date" required value={assignData.joinedDate} onChange={(e) => setAssignData({ ...assignData, joinedDate: e.target.value })} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-[#7c3aed] text-sm [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Key Money (Rs.)</label>
                <input type="number" required value={assignData.keyMoney} onChange={(e) => setAssignData({ ...assignData, keyMoney: e.target.value })} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-[#7c3aed] text-sm" placeholder="e.g. 30000" />
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-[#2a2a3d]">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#1a1a26] hover:bg-[#252536] text-[#8a8a9d] rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#5b3e96] hover:bg-[#4a2f82] text-white rounded transition-colors">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE ROOM MODAL */}
      {showChangeModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[#2a2a3d] flex justify-between items-center bg-[#171721]">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-100 uppercase tracking-widest">Change Room</h3>
                <p className="text-xs text-[#8a8a9d] mt-1 italic">{selectedUser.first_name} {selectedUser.last_name}</p>
              </div>
              <button onClick={() => setShowChangeModal(false)} className="text-[#6d6d88] hover:text-gray-300 text-2xl">&times;</button>
            </div>
            {activeLeases[selectedUser.id] && (
              <div className="mx-6 mt-6 p-3 bg-[#3b1c1c] border border-[#7c2d12] rounded flex items-start gap-3">
                <span className="text-[#fb923c]">⚠️</span>
                <div className="text-xs text-[#fdba74]">
                  <span className="font-bold">Current:</span> Room {activeLeases[selectedUser.id].rooms?.room_number} <br />
                  <span className="opacity-80">This lease ends immediately upon changing.</span>
                </div>
              </div>
            )}
            <form onSubmit={handleChangeRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">New Room</label>
                <select required value={changeData.newRoomId} onChange={(e) => setChangeData({ ...changeData, newRoomId: e.target.value })} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-[#7c3aed] text-sm">
                  <option value="" disabled>-- Select new room --</option>
                  {getAvailableRoomsForChange(selectedUser.id).map(room => {
                    const free = Number(room.capacity || 1) - Number(room.occupant_count || 0);
                    return <option key={room.id} value={room.id}>Room {room.room_number} - {room.room_type} ({free} free)</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Joined Date</label>
                <input type="date" required value={changeData.joinedDate} onChange={(e) => setChangeData({ ...changeData, joinedDate: e.target.value })} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-[#7c3aed] text-sm [color-scheme:dark]" />
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-[#2a2a3d]">
                <button type="button" onClick={() => setShowChangeModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#1a1a26] hover:bg-[#252536] text-[#8a8a9d] rounded transition-colors">Cancel</button>
                <button type="submit" disabled={getAvailableRoomsForChange(selectedUser.id).length === 0} className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#5b3e96] hover:bg-[#4a2f82] disabled:bg-[#2a2a3d] disabled:text-[#6d6d88] text-white rounded transition-colors">Confirm Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER STUDENT (Reuses your component, ensure it has dark mode styles or handles standard classes) */}
      <AddStudentModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSuccess={fetchData} />
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import api from "../../utils/api";
// import AddStudentModal from '../../components/AddStudentModal';

// export default function UserManagement() {
//   const [users, setUsers] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [activeLeases, setActiveLeases] = useState({}); // { userId: leaseObject | null }
//   const [loading, setLoading] = useState(true);

//   // Modal States
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showChangeModal, setShowChangeModal] = useState(false);
//   const [showRegisterModal, setShowRegisterModal] = useState(false); // අලුතින් ළමයි දාන Modal එකේ State එක
//   const [selectedUser, setSelectedUser] = useState(null);

//   // Assign Room Form
//   const [assignData, setAssignData] = useState({
//     roomId: '',
//     joinedDate: new Date().toISOString().split('T')[0],
//     keyMoney: ''
//   });

//   // Change Room Form
//   const [changeData, setChangeData] = useState({
//     newRoomId: '',
//     joinedDate: new Date().toISOString().split('T')[0]
//   });

//   // ─────────────────────────────────────
//   // DATA FETCHING
//   // ─────────────────────────────────────

//   const fetchData = async () => {
//     try {
//       const [usersRes, roomsRes] = await Promise.all([
//         api.get('/users/all'),
//         api.get('/properties')
//       ]);

//       const fetchedUsers = usersRes.data.users;
//       setUsers(fetchedUsers);

//       // ඇඳන් ගාණයි (capacity) දැනට ඉන්න ගාණයි (occupant_count) සසඳලා ඉඩ තියෙන කාමර විතරක් ගන්නවා
//       const availableRooms = roomsRes.data.filter(room => {
//         const totalBeds = Number(room.capacity || 1);
//         const occupiedBeds = Number(room.occupant_count || 0);
//         const freeBeds = totalBeds - occupiedBeds;
        
//         return room.is_available === true && freeBeds > 0;
//       });

//       setRooms(availableRooms);

//       // Students ලාගේ active leases parallel ව ගන්නවා
//       await fetchActiveLeases(fetchedUsers);

//     } catch (error) {
//       toast.error('Error fetching data');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchActiveLeases = async (userList) => {
//     const students = userList.filter(u => !u.is_admin);

//     const leaseResults = await Promise.allSettled(
//       students.map(u => api.get(`/leases/active/${u.id}`))
//     );

//     const leasesMap = {};
//     students.forEach((u, i) => {
//       const result = leaseResults[i];
//       if (result.status === 'fulfilled') {
//         leasesMap[u.id] = result.value.data.lease; 
//       } else {
//         leasesMap[u.id] = null;
//       }
//     });

//     setActiveLeases(leasesMap);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ─────────────────────────────────────
//   // ASSIGN ROOM (New Assignment)
//   // ─────────────────────────────────────

//   const openAssignModal = (user) => {
//     setSelectedUser(user);
//     setAssignData({
//       roomId: '',
//       joinedDate: new Date().toISOString().split('T')[0],
//       keyMoney: ''
//     });
//     setShowAssignModal(true);
//   };

//   const handleAssignRoom = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/leases', {
//         userId: selectedUser.id,
//         roomId: assignData.roomId,
//         joinedDate: assignData.joinedDate,
//         keyMoney: assignData.keyMoney
//       });

//       toast.success(`${selectedUser.first_name} successfully assigned to room!`);
//       setShowAssignModal(false);
//       fetchData();

//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Failed to assign room';
//       toast.error(errorMsg);
//     }
//   };

//   // ─────────────────────────────────────
//   // CHANGE ROOM (End current + Assign new)
//   // ─────────────────────────────────────

//   const openChangeModal = (user) => {
//     setSelectedUser(user);
//     setChangeData({
//       newRoomId: '',
//       joinedDate: new Date().toISOString().split('T')[0]
//     });
//     setShowChangeModal(true);
//   };

//   const handleChangeRoom = async (e) => {
//     e.preventDefault();

//     const currentLease = activeLeases[selectedUser.id];
//     if (!currentLease) {
//       toast.error('No active lease found for this user.');
//       return;
//     }

//     if (parseInt(changeData.newRoomId) === currentLease.rooms?.id) {
//       toast.error('Please select a different room from the current one.');
//       return;
//     }

//     try {
//       await api.put(`/leases/${currentLease.id}/end`);

//       await api.post('/leases', {
//         userId: selectedUser.id,
//         roomId: changeData.newRoomId,
//         joinedDate: changeData.joinedDate,
//         keyMoney: 0 
//       });

//       toast.success(`${selectedUser.first_name}'s room changed successfully!`);
//       setShowChangeModal(false);
//       fetchData();

//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Failed to change room';
//       toast.error(errorMsg);
//     }
//   };

//   // ─────────────────────────────────────
//   // DELETE & BLOCK
//   // ─────────────────────────────────────

//   const handleDeleteUser = async (email) => {
//     if (!window.confirm(`Are you sure you want to completely delete ${email}?`)) return;
//     try {
//       await api.delete(`/users/${email}`);
//       toast.success('User deleted successfully!');
//       fetchData();
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Error deleting user';
//       toast.error(errorMsg);
//     }
//   };

//   const handleToggleBlock = async (email, currentStatus) => {
//     const action = currentStatus ? 'unblock' : 'block';
//     if (!window.confirm(`Are you sure you want to ${action} ${email}?`)) return;
//     try {
//       await api.patch(`/users/${email}/block`);
//       toast.success(`User ${action}ed successfully`);
//       fetchData();
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || `Error trying to ${action} user`;
//       toast.error(errorMsg);
//     }
//   };

//   // ─────────────────────────────────────
//   // HELPERS
//   // ─────────────────────────────────────

//   const getAvailableRoomsForChange = (userId) => {
//     const currentLease = activeLeases[userId];
//     if (!currentLease) return rooms;
//     return rooms.filter(r => r.id !== currentLease.rooms?.id);
//   };

//   // ─────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
//           <p className="text-sm text-gray-500 mt-1">Manage students, block access, or assign them to rooms</p>
//         </div>
//         {/* මෙතන බොත්තමට onClick එක දැම්මා */}
//         <button 
//           onClick={() => setShowRegisterModal(true)} 
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//         >
//           + Register New Student
//         </button>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         {loading ? (
//           <div className="p-8 text-center text-gray-500">Loading users...</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[900px]">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
//                   <th className="p-4 font-semibold">Name</th>
//                   <th className="p-4 font-semibold">Contact Info</th>
//                   <th className="p-4 font-semibold">Current Room</th>
//                   <th className="p-4 font-semibold">Status</th>
//                   <th className="p-4 font-semibold">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(!users || users.length === 0) ? (
//                   <tr>
//                     <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
//                   </tr>
//                 ) : (
//                   users.map((user) => {
//                     const activeLease = activeLeases[user.id];
//                     const hasRoom = !user.is_admin && activeLease != null;

//                     return (
//                       <tr
//                         key={user.email}
//                         className={`border-b border-gray-50 ${user.is_blocked ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}
//                       >
//                         {/* Name */}
//                         <td className="p-4">
//                           <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
//                           <div className="text-xs text-gray-500">{user.is_admin ? 'Administrator' : 'Student'}</div>
//                         </td>

//                         {/* Contact */}
//                         <td className="p-4">
//                           <div className="text-gray-900">{user.email}</div>
//                           <div className="text-xs text-gray-500">{user.phone_number || 'No Phone'}</div>
//                         </td>

//                         {/* Current Room */}
//                         <td className="p-4">
//                           {user.is_admin ? (
//                             <span className="text-xs text-gray-400 italic">N/A</span>
//                           ) : hasRoom ? (
//                             <div>
//                               <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
//                                 🏠 Room {activeLease.rooms?.room_number}
//                               </span>
//                               <div className="text-xs text-gray-400 mt-1">{activeLease.rooms?.room_type}</div>
//                             </div>
//                           ) : (
//                             <span className="text-xs text-gray-400 italic">Not assigned</span>
//                           )}
//                         </td>

//                         {/* Status */}
//                         <td className="p-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${!user.is_blocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                             {!user.is_blocked ? 'Active' : 'Blocked'}
//                           </span>
//                         </td>

//                         {/* Actions */}
//                         <td className="p-4 flex gap-2 flex-wrap items-center">

//                           {/* Assign Room */}
//                           {!user.is_admin && !hasRoom && (
//                             <button
//                               onClick={() => openAssignModal(user)}
//                               className="text-sm font-medium px-3 py-1 rounded transition-colors shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
//                             >
//                               Assign Room
//                             </button>
//                           )}

//                           {/* Change Room */}
//                           {!user.is_admin && hasRoom && (
//                             <button
//                               onClick={() => openChangeModal(user)}
//                               className="text-sm font-medium px-3 py-1 rounded transition-colors shadow-sm text-white bg-violet-600 hover:bg-violet-700"
//                             >
//                               Change Room
//                             </button>
//                           )}

//                           {/* Admin කෙනෙකුට placeholder */}
//                           {user.is_admin && (
//                             <button
//                               disabled
//                               className="text-sm font-medium px-3 py-1 rounded bg-gray-200 text-gray-400 cursor-not-allowed"
//                             >
//                               Assign Room
//                             </button>
//                           )}

//                           {/* Block / Unblock */}
//                           <button
//                             onClick={() => handleToggleBlock(user.email, user.is_blocked)}
//                             disabled={user.is_admin}
//                             className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
//                               user.is_admin
//                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                 : user.is_blocked
//                                   ? 'text-green-600 bg-green-50 hover:bg-green-100'
//                                   : 'text-orange-600 bg-orange-50 hover:bg-orange-100'
//                             }`}
//                           >
//                             {user.is_blocked ? 'Unblock' : 'Block'}
//                           </button>

//                           {/* Delete */}
//                           <button
//                             onClick={() => handleDeleteUser(user.email)}
//                             disabled={user.is_admin}
//                             className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
//                               user.is_admin
//                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                 : 'text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100'
//                             }`}
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════
//           ASSIGN ROOM MODAL (First time)
//       ═══════════════════════════════════════ */}
//       {showAssignModal && selectedUser && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900">Assign to Room</h3>
//                 <p className="text-xs text-gray-500 mt-1">Student: {selectedUser.first_name} {selectedUser.last_name}</p>
//               </div>
//               <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
//             </div>

//             <form onSubmit={handleAssignRoom} className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
//                 <select
//                   required
//                   value={assignData.roomId}
//                   onChange={(e) => setAssignData({ ...assignData, roomId: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="" disabled>-- Select an available room --</option>
//                   {rooms.map(room => {
//                     const free = Number(room.capacity || 1) - Number(room.occupant_count || 0);
//                     return (
//                       <option key={room.id} value={room.id}>
//                         Room {room.room_number} - {room.room_type} ({free} beds free) (Rent: Rs.{room.monthly_rent})
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
//                 <input
//                   type="date"
//                   required
//                   value={assignData.joinedDate}
//                   onChange={(e) => setAssignData({ ...assignData, joinedDate: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Key Money Received (Rs.30000)</label>
//                 <input
//                   type="number"
//                   required
//                   value={assignData.keyMoney}
//                   onChange={(e) => setAssignData({ ...assignData, keyMoney: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
//                   placeholder="e.g. 30000"
//                 />
//               </div>

//               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
//                 <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancel</button>
//                 <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Complete Assignment</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ═══════════════════════════════════════
//           CHANGE ROOM MODAL (Transfer)
//       ═══════════════════════════════════════ */}
//       {showChangeModal && selectedUser && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900">Change Room</h3>
//                 <p className="text-xs text-gray-500 mt-1">Student: {selectedUser.first_name} {selectedUser.last_name}</p>
//               </div>
//               <button onClick={() => setShowChangeModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
//             </div>

//             {/* Current Room Info Banner */}
//             {activeLeases[selectedUser.id] && (
//               <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
//                 <span className="text-amber-500 mt-0.5">⚠️</span>
//                 <div className="text-sm text-amber-800">
//                   <span className="font-medium">Current room:</span>{' '}
//                   Room {activeLeases[selectedUser.id].rooms?.room_number} ({activeLeases[selectedUser.id].rooms?.room_type})
//                   <br />
//                   <span className="text-xs text-amber-600">This lease will be ended and a new one created.</span>
//                 </div>
//               </div>
//             )}

//             <form onSubmit={handleChangeRoom} className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Select New Room</label>
//                 <select
//                   required
//                   value={changeData.newRoomId}
//                   onChange={(e) => setChangeData({ ...changeData, newRoomId: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-violet-500"
//                 >
//                   <option value="" disabled>-- Select a new room --</option>
//                   {getAvailableRoomsForChange(selectedUser.id).map(room => {
//                     const free = Number(room.capacity || 1) - Number(room.occupant_count || 0);
//                     return (
//                       <option key={room.id} value={room.id}>
//                         Room {room.room_number} - {room.room_type} ({free} beds free) (Rent: Rs.{room.monthly_rent})
//                       </option>
//                     );
//                   })}
//                 </select>
//                 {getAvailableRoomsForChange(selectedUser.id).length === 0 && (
//                   <p className="text-xs text-red-500 mt-1">No other available rooms found.</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">New Joined Date</label>
//                 <input
//                   type="date"
//                   required
//                   value={changeData.joinedDate}
//                   onChange={(e) => setChangeData({ ...changeData, joinedDate: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-violet-500"
//                 />
//               </div>

//               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
//                 <button type="button" onClick={() => setShowChangeModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancel</button>
//                 <button
//                   type="submit"
//                   disabled={getAvailableRoomsForChange(selectedUser.id).length === 0}
//                   className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
//                 >
//                   Confirm Change
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ═══════════════════════════════════════
//           REGISTER NEW STUDENT MODAL (අලුතින් දැම්ම කොටස)
//       ═══════════════════════════════════════ */}
//       <AddStudentModal 
//         isOpen={showRegisterModal} 
//         onClose={() => setShowRegisterModal(false)} 
//         onSuccess={fetchData} 
//       />

//     </div>
//   );
// }