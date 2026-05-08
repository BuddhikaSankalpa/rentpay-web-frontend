import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { FaShopify, FaUsers, FaMoneyBillWave, FaBullhorn, FaWrench, FaChartBar, FaCog } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import api from '../utils/api'; 

import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import RoomManagement from './admin/RoomManagement';
import Payments from './admin/Payments'; 
import Announcements from './admin/AdminNotices'; 
import Maintenance from './admin/Maintenance';
import Reports from './admin/Reports';
import Settings from './admin/Settings';

export default function AdminPage() {
  const location = useLocation();
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  
  // ─── Maintenance පෙන්ඩිං ගාන තියාගන්න State එක ───
  const [pendingMaintenanceCount, setPendingMaintenanceCount] = useState(0);

  // ─── Real-time Pending Payments Counter ──────────────────────
  const checkPendingPayments = async () => {
    try {
      const res = await api.get('/payments/all'); 
      const allPayments = Array.isArray(res.data) ? res.data : (res.data?.payments || []);

      const pendingOnes = allPayments.filter(p => p.status === 'pending_verification');
      setPendingApprovalCount(pendingOnes.length);
    } catch (err) {
      console.error("Error fetching pending count:", err);
      setPendingApprovalCount(0);
    }
  };

  // ─── Real-time Active Maintenance Counter ────────────────────
  const checkPendingMaintenance = async () => {
    try {
      const res = await api.get('/maintenance'); 
      const allTickets = Array.isArray(res.data) ? res.data : [];

      // 'closed' නැති (Pending, In Progress, Done) ඔක්කොම ටික ගනිනවා
      const activeTickets = allTickets.filter(t => t.status !== 'closed');
      setPendingMaintenanceCount(activeTickets.length);
    } catch (err) {
      console.error("Error fetching maintenance count:", err);
      setPendingMaintenanceCount(0);
    }
  };

  useEffect(() => {
    checkPendingPayments();
    checkPendingMaintenance(); // Component එක load වෙද්දිම කෝල් කරනවා
    
    // විනාඩියකට වතාවක් ඉබේම Refresh වෙන්න
    const interval = setInterval(() => {
      checkPendingPayments();
      checkPendingMaintenance();
    }, 60000); 
    
    return () => clearInterval(interval);
  }, [location.pathname]); 

  return (
    <div className="w-full h-screen bg-gray-50 flex font-sans text-gray-800 overflow-hidden">
      
      {/* Simple White Sidebar */}
      <div className="h-full w-[250px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

        {/* Sidebar Header */}
        <div className="w-full flex flex-col items-center justify-center py-8 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-widest text-gray-800 uppercase">
            Admin Panel
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
          
          <Link 
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${location.pathname === '/admin' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            to="/admin"
          >
            <FaShopify className="text-xl" />
            <span>Dashboard</span>
          </Link>

          <Link 
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${location.pathname === '/admin/user-management' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            to="/admin/user-management"
          >
            <AiFillProduct className="text-xl" />
            <span>User Management</span>
          </Link>

          <Link 
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${location.pathname === '/admin/room-management' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            to="/admin/room-management"
          >
            <FaUsers className="text-xl" />
            <span>Room Management</span>
          </Link>

          {/* ─── Payments Link ─── */}
          <Link 
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors relative ${location.pathname === '/admin/payments' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            to="/admin/payments"
          >
            <div className="relative">
              <FaMoneyBillWave className="text-xl" />
              {pendingApprovalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </div>
            <span>Payments</span>
            {pendingApprovalCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {pendingApprovalCount} TO APPROVE
              </span>
            )}
          </Link>

          <Link 
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${location.pathname === '/admin/announcements' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            to="/admin/announcements"
          >
            <FaBullhorn className="text-xl" />
            <span>Announcements</span>
          </Link>

          {/* ─── Maintenance Link with REAL Pending Count ─── */}
          <Link 
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors relative ${location.pathname === '/admin/maintenance' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            to="/admin/maintenance"
          >
            <div className="relative">
              <FaWrench className="text-xl" />
              {/* Close කරපු නැති (Active) ඒව තියෙනවා නම් රතු බෝලෙ පෙන්වනවා */}
              {pendingMaintenanceCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </div>
            <span>Maintenance</span>
            {pendingMaintenanceCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {pendingMaintenanceCount} ACTIVE
              </span>
            )}
          </Link>

          <Link 
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${location.pathname === '/admin/reports' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            to="/admin/reports"
          >
            <FaChartBar className="text-xl" />
            <span>Reports & Analytics</span>
          </Link>

          <Link 
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-colors ${location.pathname === '/admin/settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            to="/admin/settings"
          >
            <FaCog className="text-xl" />
            <span>Settings</span>
          </Link>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-8">
        <Routes>
          <Route path='/' element={<AdminDashboard />} />
          <Route path='/user-management' element={<UserManagement />} />
          <Route path='/room-management' element={<RoomManagement />} />
          <Route path='/payments' element={<Payments />} />
          <Route path='/announcements' element={<Announcements />} />
          <Route path='/maintenance' element={<Maintenance />} />
          <Route path='/reports' element={<Reports />} />
          <Route path='/settings' element={<Settings />} />
        </Routes>
      </div>

    </div>
  );
}