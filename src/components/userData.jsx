import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiLogOut, FiUser, FiCreditCard } from 'react-icons/fi';
import api from '../utils/api'; 
import { useNavigate } from 'react-router-dom';

export default function UserData() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(null); 
  const [loading, setLoading] = useState(true); 
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); 

  // ── 1. User data — API eken fetch karanawa ──────
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        console.log("🛠️ UserData -> 1. LocalStorage Email:", userEmail);
        
        if (!userEmail) {
          console.warn("⚠️ UserData -> No email found in localStorage!");
          setLoading(false);
          return;
        }

        const res = await api.get(`/users/${userEmail}`);
        console.log("🛠️ UserData -> 2. API Full Response:", res.data);
        
        // 🔴 ගොඩක් වෙලාවට මෙතන තමයි අවුල යන්නේ! Profile එකේ වැඩ කළාට සමහරවිට object එක එන විදිහ වෙනස්.
        // ඒ නිසා res.data.user තියෙනවද, නැත්නම් නිකන්ම res.data ද කියලා දෙකම check කරනවා.
        const user = res.data?.user || res.data?.data || res.data; 
        console.log("🛠️ UserData -> 3. Extracted User Object:", user);

        if (user && Object.keys(user).length > 0) {
          setCurrentUser(user);
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          console.warn("⚠️ UserData -> Extracted user object is empty!");
        }
      } catch (err) {
        console.error("❌ UserData -> Error fetching user data:", err);
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ── 2. Outside click handler ───────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // ── 3. Bank details fetch ──────────────────────────────────────────
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data) {
          setBankDetails({
            bankName: response.data.bank_name,
            accountName: response.data.account_name,
            accountNumber: response.data.account_number,
            branch: response.data.branch
          });
        }
      } catch (error) {
        console.error("Failed to load bank details");
      }
    };
    fetchBankDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-2">
        <div className="w-11 h-11 rounded-full bg-white/10 animate-pulse border border-white/5"></div>
        <div className="flex flex-col gap-2">
          <div className="w-24 h-3 bg-white/10 rounded animate-pulse"></div>
          <div className="w-16 h-2 bg-white/10 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // 🔴 currentUser null නම් error එන එක නවත්තන්න හිස් object එකක් දෙනවා
  const safeUser = currentUser || {};

  const firstName = safeUser.first_name || safeUser.firstName || 'Student';
  const lastName  = safeUser.last_name  || safeUser.lastName  || '';
  const studentId = safeUser.student_id || safeUser.studentId || 'N/A';
  const email     = safeUser.email || 'No Email';
  const faculty   = safeUser.faculty || 'N/A';
  const image     = safeUser.image 
    || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=6B21A8&color=fff`;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    navigate('/login'); 
  };

  const handleProfileNavigate = () => {
    setIsDropdownOpen(false);
    setTimeout(() => navigate('/profile'), 50);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsDropdownOpen(prev => !prev)}
        className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/10"
      >
        <img 
          src={image} 
          alt="User Avatar" 
          className="w-11 h-11 rounded-full object-cover border border-purple-500/50 shadow-md"
        />
        <div className="flex flex-col text-left">
          <span className="text-[15px] font-medium text-gray-200">
            {firstName} {lastName}
          </span>
          <span className="text-[12px] text-purple-400">
            {studentId !== 'N/A' ? `Student ID: ${studentId}` : email}
          </span>
        </div>
        <FiChevronDown className={`text-gray-400 text-lg ml-1 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </div>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#161121] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          
          <div className="p-5 border-b border-white/5 bg-white/[0.02]">
            <p className="text-white font-medium">{firstName} {lastName}</p>
            <p className="text-xs text-gray-400">{email}</p>
            <p className="text-xs text-gray-400 mt-1">Faculty: {faculty}</p>
          </div>

          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <FiCreditCard className="text-purple-400" />
              <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Rent Payment Info</h4>
            </div>
            
            {bankDetails ? (
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Bank:</span>
                  <span className="text-xs text-gray-300 font-medium">{bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Account Name:</span>
                  <span className="text-xs text-gray-300 font-medium">{bankDetails.accountName}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                  <span className="text-xs text-gray-500">Account No:</span>
                  <span className="text-sm text-purple-300 font-mono font-bold tracking-wider">{bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Branch:</span>
                  <span className="text-xs text-gray-300">{bankDetails.branch}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Loading payment details...</p>
            )}
          </div>

          <div className="p-2">
            <button 
              type="button"
              onClick={handleProfileNavigate}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <FiUser className="text-lg text-gray-400" /> My Profile
            </button>
            
            <button 
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <FiLogOut className="text-lg" /> Logout
            </button>
          </div>

        </div>
      )}
    </div>
  );
}