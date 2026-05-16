import React, { useState, useEffect } from 'react';
import { 
  MdPerson, MdEmail, MdPhone, MdLocationOn, 
  MdSchool, MdBadge, MdSecurity, MdEdit, 
  MdVpnKey, MdFamilyRestroom, MdClose, MdSave
} from 'react-icons/md';
import api from '../../utils/api'; 
import toast from 'react-hot-toast';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          toast.error("User email not found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await api.get(`/users/${userEmail}`); 
        setUserData(res.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleOpenEditModal = () => {
    setEditFormData(userData);
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const userEmail = localStorage.getItem("userEmail");
      const formattedData = {
        firstName: editFormData.first_name,
        lastName: editFormData.last_name,
        phoneNumber: editFormData.phone_number,
        nicNumber: editFormData.nic_number,
        permanentAddress: editFormData.permanent_address,
        guardianName: editFormData.guardian_name,
        guardianPhone: editFormData.guardian_phone
      };

      await api.put(`/users/${userEmail}`, formattedData);
      
      setUserData(editFormData);
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully!");
      
    } catch (error) {
      console.error("Update Error:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-[#A58ED4] rounded-full animate-spin"></div>
        <div className="text-gray-500 font-serif italic">Unearthing your profile...</div>
      </div>
    );
  }

  if (!userData) {
    return <div className="text-gray-600 font-serif italic text-center py-10">Profile data lost to the shadows!</div>;
  }

  return (
    <div className="w-full mt-8 flex flex-col gap-8 pb-10 relative">
      
      {/* 1. Header & Cover Section */}
      <div className="w-full bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="h-48 w-full bg-[#070510] relative overflow-hidden flex items-center justify-center">
           {/* Dark atmospheric gradient & noise */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-[#070510]/80 to-[#0a0815]"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        </div>
        
        <div className="px-8 pb-8 relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-20 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-36 h-36 rounded-full border-[6px] border-[#0a0815] bg-[#161121] flex items-center justify-center text-5xl font-serif text-white shadow-2xl z-10 relative uppercase">
              {userData.first_name?.charAt(0)}{userData.last_name?.charAt(0)}
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0 z-10">
              <h1 className="text-4xl font-serif text-white tracking-wide">{userData.first_name} {userData.last_name}</h1>
              <p className="text-[#A58ED4] text-sm font-bold tracking-[0.2em] mt-2 uppercase">{userData.student_id}</p>
              <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Nevermore Student</p>
            </div>
          </div>

          <button 
            onClick={handleOpenEditModal}
            className="px-6 py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-gray-300 rounded-xl font-bold tracking-widest uppercase transition-colors flex items-center gap-2 text-[10px] z-10"
          >
            <MdEdit className="text-lg" /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Personal & Emergency Info */}
        <div className="xl:col-span-1 flex flex-col gap-8">
          <div className="bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-6 flex items-center gap-2">
              <MdPerson className="text-[#A58ED4] text-lg" /> Personal Details
            </h3>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <MdEmail className="text-gray-600 text-xl mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Email</span>
                  <span className="text-gray-300 text-sm font-medium">{userData.email || '-'}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MdPhone className="text-gray-600 text-xl mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Phone</span>
                  <span className="text-gray-300 text-sm font-medium">{userData.phone_number || '-'}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MdBadge className="text-gray-600 text-xl mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">NIC Number</span>
                  <span className="text-gray-300 text-sm font-medium">{userData.nic_number || '-'}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MdLocationOn className="text-gray-600 text-xl mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Permanent Address</span>
                  <span className="text-gray-300 text-sm font-medium leading-relaxed">{userData.permanent_address || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0f14]/60 backdrop-blur-md border border-red-900/30 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-red-400 uppercase mb-6 flex items-center gap-2 relative z-10">
              <MdFamilyRestroom className="text-red-500 text-lg" /> Emergency Contact
            </h3>
            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <MdPerson className="text-red-900/50 text-xl mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-red-500/60 uppercase font-bold tracking-widest mb-1">Guardian Name</span>
                  <span className="text-red-200 text-sm font-medium">{userData.guardian_name || '-'}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MdPhone className="text-red-900/50 text-xl mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-red-500/60 uppercase font-bold tracking-widest mb-1">Guardian Phone</span>
                  <span className="text-red-200 text-sm font-bold">{userData.guardian_phone || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Academic */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          <div className="bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-8">
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-8 flex items-center gap-2">
              <MdSchool className="text-gray-400 text-xl" /> Academic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest block mb-2">University</span>
                <span className="text-xl text-white font-serif tracking-wide">{userData.university || '-'}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Faculty</span>
                <span className="text-xl text-white font-serif tracking-wide">{userData.faculty || '-'}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 md:col-span-2">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Student ID Number</span>
                <span className="text-3xl text-[#A58ED4] font-serif tracking-widest">{userData.student_id || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0815] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06] sticky top-0 bg-[#0a0815] z-10">
              <h2 className="text-2xl font-serif text-white tracking-wide flex items-center gap-3">
                <MdEdit className="text-[#A58ED4]" /> Edit Profile
              </h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">First Name</label>
                  <input 
                    type="text" name="first_name" value={editFormData.first_name || ''} onChange={handleInputChange} required
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3.5 text-gray-200 font-medium focus:outline-none focus:border-[#A58ED4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Last Name</label>
                  <input 
                    type="text" name="last_name" value={editFormData.last_name || ''} onChange={handleInputChange} required
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3.5 text-gray-200 font-medium focus:outline-none focus:border-[#A58ED4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="text" name="phone_number" value={editFormData.phone_number || ''} onChange={handleInputChange}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3.5 text-gray-200 font-medium focus:outline-none focus:border-[#A58ED4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">NIC Number</label>
                  <input 
                    type="text" name="nic_number" value={editFormData.nic_number || ''} onChange={handleInputChange}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3.5 text-gray-200 font-medium focus:outline-none focus:border-[#A58ED4] transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Permanent Address</label>
                  <textarea 
                    name="permanent_address" value={editFormData.permanent_address || ''} onChange={handleInputChange} rows="2"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3.5 text-gray-200 font-medium focus:outline-none focus:border-[#A58ED4] transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-2">Guardian Name</label>
                  <input 
                    type="text" name="guardian_name" value={editFormData.guardian_name || ''} onChange={handleInputChange}
                    className="w-full bg-red-900/5 border border-red-500/20 rounded-xl px-4 py-3.5 text-gray-200 font-medium focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-2">Guardian Phone</label>
                  <input 
                    type="text" name="guardian_phone" value={editFormData.guardian_phone || ''} onChange={handleInputChange}
                    className="w-full bg-red-900/5 border border-red-500/20 rounded-xl px-4 py-3.5 text-gray-200 font-medium focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-white/[0.06]">
                <button 
                  type="button" onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isUpdating}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : <><MdSave className="text-lg" /> Save Changes</>}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { 
//   MdPerson, MdEmail, MdPhone, MdLocationOn, 
//   MdSchool, MdBadge, MdSecurity, MdEdit, 
//   MdVpnKey, MdFamilyRestroom, MdClose, MdSave
// } from 'react-icons/md';
// import api from '../../utils/api'; 
// import toast from 'react-hot-toast';

// export default function Profile() {
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Edit Modal එක පාලනය කරන State
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editFormData, setEditFormData] = useState({});
//   const [isUpdating, setIsUpdating] = useState(false);

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         const userEmail = localStorage.getItem("userEmail");
//         if (!userEmail) {
//           toast.error("User email not found. Please login again.");
//           setLoading(false);
//           return;
//         }

//         const res = await api.get(`/users/${userEmail}`); 
//         setUserData(res.data.user);
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//         toast.error("Failed to load profile details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfileData();
//   }, []);

//   // Modal එක Open කරද්දී දැනට තියෙන Data ටික Form එකට දානවා
//   const handleOpenEditModal = () => {
//     setEditFormData(userData);
//     setIsEditModalOpen(true);
//   };

//   // Form එකේ Type කරද්දී State එක අප්ඩේට් කරන Function එක
//   const handleInputChange = (e) => {
//     setEditFormData({
//       ...editFormData,
//       [e.target.name]: e.target.value
//     });
//   };

//   // අලුත් Data ටික Backend එකට යවන Function එක
//   // අලුත් Data ටික Backend එකට යවන Function එක
//   const handleUpdateProfile = async (e) => {
//     e.preventDefault();
//     setIsUpdating(true);

//     try {
//       const userEmail = localStorage.getItem("userEmail");
      
//       // Backend එක බලාපොරොත්තු වෙන විදිහට නම් ටික හදාගන්නවා (CamelCase)
//       const formattedData = {
//         firstName: editFormData.first_name,
//         lastName: editFormData.last_name,
//         phoneNumber: editFormData.phone_number,
//         nicNumber: editFormData.nic_number,
//         permanentAddress: editFormData.permanent_address,
//         guardianName: editFormData.guardian_name,
//         guardianPhone: editFormData.guardian_phone
//       };

//       // Backend එකේ Update (PUT) API එකට යවනවා
//       await api.put(`/users/${userEmail}`, formattedData);
      
//       // සාර්ථක වුණාම UI එකත් අප්ඩේට් කරනවා
//       setUserData(editFormData);
//       setIsEditModalOpen(false);
//       toast.success("Profile updated successfully! 🎉");
      
//     } catch (error) {
//       console.error("Update Error:", error);
//       toast.error(error?.response?.data?.message || "Failed to update profile.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
//         <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
//         <div className="text-gray-400 font-medium">Loading your profile...</div>
//       </div>
//     );
//   }

//   if (!userData) {
//     return <div className="text-gray-400 text-center py-10">Profile data not found!</div>;
//   }

//   return (
//     <div className="w-full mt-8 flex flex-col gap-8 pb-10 relative">
      
//       {/* 1. Header & Cover Section */}
//       <div className="w-full bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
//         <div className="h-40 w-full bg-gradient-to-r from-purple-900 to-[#161121] relative overflow-hidden">
//           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
//         </div>
        
//         <div className="px-8 pb-8 relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-16 gap-6">
//           <div className="flex flex-col md:flex-row items-center gap-6">
//             <div className="w-32 h-32 rounded-full border-4 border-[#161121] bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-serif text-white shadow-2xl z-10 relative uppercase">
//               {userData.first_name?.charAt(0)}{userData.last_name?.charAt(0)}
//             </div>
//             <div className="text-center md:text-left mt-4 md:mt-0 z-10">
//               <h1 className="text-3xl font-serif text-white">{userData.first_name} {userData.last_name}</h1>
//               <p className="text-purple-400 font-medium tracking-wide">{userData.student_id}</p>
//               <p className="text-gray-500 text-sm mt-1">Student Account</p>
//             </div>
//           </div>

//           {/* Edit Profile Button */}
//           <button 
//             onClick={handleOpenEditModal}
//             className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm z-10"
//           >
//             <MdEdit /> Edit Profile
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
//         {/* Left Column: Personal & Emergency Info */}
//         <div className="xl:col-span-1 flex flex-col gap-8">
//           {/* Personal Details Card */}
//           <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
//             <h3 className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase mb-6 flex items-center gap-2">
//               <MdPerson className="text-purple-400 text-lg" /> Personal Details
//             </h3>
//             <div className="flex flex-col gap-5">
//               <div className="flex items-start gap-4">
//                 <MdEmail className="text-gray-500 text-xl mt-0.5" />
//                 <div className="flex flex-col">
//                   <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</span>
//                   <span className="text-gray-200">{userData.email || '-'}</span>
//                 </div>
//               </div>
//               <div className="flex items-start gap-4">
//                 <MdPhone className="text-gray-500 text-xl mt-0.5" />
//                 <div className="flex flex-col">
//                   <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Phone</span>
//                   <span className="text-gray-200">{userData.phone_number || '-'}</span>
//                 </div>
//               </div>
//               <div className="flex items-start gap-4">
//                 <MdBadge className="text-gray-500 text-xl mt-0.5" />
//                 <div className="flex flex-col">
//                   <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">NIC Number</span>
//                   <span className="text-gray-200">{userData.nic_number || '-'}</span>
//                 </div>
//               </div>
//               <div className="flex items-start gap-4">
//                 <MdLocationOn className="text-gray-500 text-xl mt-0.5" />
//                 <div className="flex flex-col">
//                   <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Permanent Address</span>
//                   <span className="text-gray-200 leading-relaxed">{userData.permanent_address || '-'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Emergency Contact Card */}
//           <div className="bg-red-900/10 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full"></div>
//             <h3 className="text-sm font-bold tracking-[0.2em] text-red-400 uppercase mb-6 flex items-center gap-2 relative z-10">
//               <MdFamilyRestroom className="text-red-400 text-lg" /> Emergency Contact
//             </h3>
//             <div className="flex flex-col gap-5 relative z-10">
//               <div className="flex items-start gap-4">
//                 <MdPerson className="text-red-900/50 text-xl mt-0.5" />
//                 <div className="flex flex-col">
//                   <span className="text-xs text-red-900/50 uppercase font-bold tracking-wider">Guardian Name</span>
//                   <span className="text-red-200">{userData.guardian_name || '-'}</span>
//                 </div>
//               </div>
//               <div className="flex items-start gap-4">
//                 <MdPhone className="text-red-900/50 text-xl mt-0.5" />
//                 <div className="flex flex-col">
//                   <span className="text-xs text-red-900/50 uppercase font-bold tracking-wider">Guardian Phone</span>
//                   <span className="text-red-200 font-medium">{userData.guardian_phone || '-'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column: Academic & Security */}
//         <div className="xl:col-span-2 flex flex-col gap-8">
//           {/* Academic Details Card */}
//           <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
//             <h3 className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase mb-8 flex items-center gap-2">
//               <MdSchool className="text-blue-400 text-xl" /> Academic Details
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <div className="bg-white/5 border border-white/5 rounded-xl p-5">
//                 <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">University</span>
//                 <span className="text-lg text-white font-serif">{userData.university || '-'}</span>
//               </div>
//               <div className="bg-white/5 border border-white/5 rounded-xl p-5">
//                 <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Faculty</span>
//                 <span className="text-lg text-white font-serif">{userData.faculty || '-'}</span>
//               </div>
//               <div className="bg-white/5 border border-white/5 rounded-xl p-5 md:col-span-2">
//                 <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Student ID Number</span>
//                 <span className="text-2xl text-blue-300 font-serif tracking-wide">{userData.student_id || '-'}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- EDIT PROFILE MODAL --- */}
//       {isEditModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//           <div className="bg-[#1e182e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#1e182e] z-10">
//               <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                 <MdEdit className="text-purple-400" /> Edit Profile
//               </h2>
//               <button 
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
//               >
//                 <MdClose className="text-xl" />
//               </button>
//             </div>

//             {/* Modal Form */}
//             <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">First Name</label>
//                   <input 
//                     type="text" name="first_name" value={editFormData.first_name || ''} onChange={handleInputChange} required
//                     className="w-full bg-[#161121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
//                   <input 
//                     type="text" name="last_name" value={editFormData.last_name || ''} onChange={handleInputChange} required
//                     className="w-full bg-[#161121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
//                   <input 
//                     type="text" name="phone_number" value={editFormData.phone_number || ''} onChange={handleInputChange}
//                     className="w-full bg-[#161121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">NIC Number</label>
//                   <input 
//                     type="text" name="nic_number" value={editFormData.nic_number || ''} onChange={handleInputChange}
//                     className="w-full bg-[#161121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Permanent Address</label>
//                   <textarea 
//                     name="permanent_address" value={editFormData.permanent_address || ''} onChange={handleInputChange} rows="2"
//                     className="w-full bg-[#161121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
//                   />
//                 </div>
//               </div>

//               <div className="border-t border-white/5 pt-6 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Guardian Name</label>
//                   <input 
//                     type="text" name="guardian_name" value={editFormData.guardian_name || ''} onChange={handleInputChange}
//                     className="w-full bg-[#161121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Guardian Phone</label>
//                   <input 
//                     type="text" name="guardian_phone" value={editFormData.guardian_phone || ''} onChange={handleInputChange}
//                     className="w-full bg-[#161121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
//                   />
//                 </div>
//               </div>

//               {/* Modal Footer */}
//               <div className="flex items-center justify-end gap-4 mt-8 pt-4 border-t border-white/5">
//                 <button 
//                   type="button" onClick={() => setIsEditModalOpen(false)}
//                   className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" disabled={isUpdating}
//                   className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                   {isUpdating ? 'Saving...' : <><MdSave className="text-lg" /> Save Changes</>}
//                 </button>
//               </div>
//             </form>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }