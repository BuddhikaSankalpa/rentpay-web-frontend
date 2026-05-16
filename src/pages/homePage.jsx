import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

import MyRoom       from './users/MyRoom';
import Notices      from './users/Notices';
import Profile      from './users/Profile';
import Support      from './users/Support';
import PaymentHistory from './users/PaymentHistory';
import Dashboard    from './users/Dashboard';

const NOTICES_KEY = 'notices_last_visited';

const NavItem = ({ to, icon, label, badge }) => {
  const location = useLocation();
  const active = location.pathname === to || (to === '/' && location.pathname === '/');

  return (
    <Link
      to={to}
      className={`
        relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
        ${active
          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] border border-transparent'}
      `}
    >
      <span className={`shrink-0 ${active ? 'text-purple-400' : ''}`}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge}
    </Link>
  );
};

const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconHistory = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconRoom = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconNotice = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);
const IconProfile = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconSupport = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/notices');
        const last = localStorage.getItem(NOTICES_KEY);
        const lastVisit = last ? new Date(last) : null;
        setHasUnread((data || []).some(n => !lastVisit || new Date(n.created_at) > lastVisit));
      } catch {
        setHasUnread(false);
      }
    })();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const NewBadge = () => (
    hasUnread ? (
      <span className="ml-auto text-[9px] font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full uppercase">
        New
      </span>
    ) : null
  );

  const Sidebar = () => (
    <aside
      className={`
        h-full w-[230px] bg-[#0a0815]/95 backdrop-blur-md border-r border-white/[0.06]
        flex flex-col shrink-0 relative overflow-hidden
      `}
    >
      {/* --- UPDATED: Bottom decorative image section --- */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[400px] bg-cover bg-top bg-no-repeat pointer-events-none z-0"
        style={{ backgroundImage: "url('/botom.png')" }}
      />
      {/* Soft gradient to smoothly blend the top edge of the image into the background */}
      <div className="absolute bottom-[400px] left-0 right-0 h-32 translate-y-full bg-gradient-to-t from-transparent to-[#0a0815] pointer-events-none z-0" />
      {/* ------------------------------------------------ */}

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center py-2 border-b border-white/[0.06] px-6">
        <img
          src="/logo.png"
          alt="Nevermore Boarding"
          className="h-36 w-auto object-contain mb-2"
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
        <NavItem to="/"                icon={<IconDashboard />}  label="Dashboard" />
        <NavItem to="/payment-history" icon={<IconHistory />}    label="Payment History" />
        <NavItem to="/my-room"         icon={<IconRoom />}       label="My Room" />
        <NavItem
          to="/notices"
          icon={
            <div className="relative">
              <IconNotice />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
              )}
            </div>
          }
          label="Notices"
          badge={<NewBadge />}
        />
        <NavItem to="/profile" icon={<IconProfile />} label="Profile" />
        <NavItem to="/support" icon={<IconSupport />} label="Support" />

        {/* --- UPDATED: Logout moved here to match UI --- */}
        <div className="mt-2 pt-2 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500/70 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/20 transition-all duration-200 text-left"
          >
            <IconLogout />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );

  return (
    <div className="w-full h-screen bg-[#070510] flex font-sans overflow-hidden" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute left-0 top-0 h-full w-[230px]" onClick={e => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 h-full overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0a0815]/80 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
          <div className="w-9" />
        </div>

        {/* Page routes */}
        <div className="p-6 md:p-8">
          <Routes>
            <Route path="/"                element={<Dashboard />} />
            <Route path="/my-room"         element={<MyRoom />} />
            <Route path="/notices"         element={<Notices />} />
            <Route path="/profile"         element={<Profile />} />
            <Route path="/support"         element={<Support />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import api from '../utils/api'; // ← path eka oyage structure ekata adjust karanna

// import { FaShopify } from "react-icons/fa";
// import { MdHistory, MdMeetingRoom, MdCampaign, MdPerson, MdSupportAgent, MdLogout } from "react-icons/md";

// import MyRoom from './users/MyRoom';
// import Notices from './users/Notices';
// import Profile from './users/Profile';
// import Support from './users/Support';
// import PaymentHistory from './users/PaymentHistory';
// import Dashboard from './users/Dashboard';

// const NOTICES_LAST_VISIT_KEY = 'notices_last_visited';

// export default function HomePage() {
//     const navigate = useNavigate();
//     const location = useLocation();

//     // Unread notices thiyenawada balanna state eka
//     const [hasUnreadNotices, setHasUnreadNotices] = useState(false);

//     // ─── Unread check function ────────────────────────────────────────
//     // Backend eken notices gannawa, last-visit ekata passe ewa thiyenawada check karanawa
//     useEffect(() => {
//         const checkUnread = async () => {
//             try {
//                 const res = await api.get('/notices');
//                 const stored = localStorage.getItem(NOTICES_LAST_VISIT_KEY);
//                 const lastVisit = stored ? new Date(stored) : null;

//                 const hasNew = (res.data || []).some(n =>
//                     !lastVisit || new Date(n.created_at) > lastVisit
//                 );
//                 setHasUnreadNotices(hasNew);
//             } catch (err) {
//                 // Silent fail — sidebar eke disturb karanna oni nä
//                 setHasUnreadNotices(false);
//             }
//         };

//         checkUnread();
//     }, [location.pathname]);
//     // ↑ location.pathname change wena hema welawakma re-check wenawa.
//     //   User /notices page eken yana weleta, Notices.jsx eka localStorage update kara,
//     //   ithin me check eken 'no unread' kiyala result eka enawa → dot eka ahapahas wenawa.

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('userRole');
//         toast.success('Logged out successfully!');
//         navigate('/login');
//     };

//     return (
//         <div className="w-full h-screen bg-gray-50 flex font-sans text-gray-800 overflow-hidden">

//             {/* Sidebar */}
//             <div className="h-full w-[250px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

//                 <div className="w-full flex flex-col items-center justify-center py-8 border-b border-gray-100">
//                     <h1 className="text-xl font-bold tracking-widest text-gray-800 uppercase">
//                         BODIM PAY
//                     </h1>
//                 </div>

//                 {/* Navigation Links */}
//                 <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
//                     <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/">
//                         <FaShopify className="text-xl" />
//                         <span>Dashboard</span>
//                     </Link>

//                     <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/payment-history">
//                         <MdHistory className="text-xl" />
//                         <span>Payment History</span>
//                     </Link>

//                     <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/my-room">
//                         <MdMeetingRoom className="text-xl" />
//                         <span>My Room</span>
//                     </Link>

//                     {/* ─── Notices link with red dot indicator ─── */}
//                     <Link
//                         className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors relative"
//                         to="/notices"
//                     >
//                         <div className="relative">
//                             <MdCampaign className="text-xl" />
//                             {hasUnreadNotices && (
//                                 <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
//                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
//                                 </span>
//                             )}
//                         </div>
//                         <span>Notices</span>
//                         {hasUnreadNotices && (
//                             <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//                                 NEW
//                             </span>
//                         )}
//                     </Link>

//                     <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/profile">
//                         <MdPerson className="text-xl" />
//                         <span>Profile</span>
//                     </Link>

//                     <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/support">
//                         <MdSupportAgent className="text-xl" />
//                         <span>Support</span>
//                     </Link>
//                 </div>

//                 {/* Logout */}
//                 <div className="p-4 border-t border-gray-100">
//                     <button
//                         onClick={handleLogout}
//                         className="w-full py-3 px-4 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 font-medium flex items-center gap-3 transition-colors text-left"
//                     >
//                         <MdLogout className="text-xl" />
//                         <span>Logout</span>
//                     </button>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="flex-1 h-full overflow-y-auto p-8">
//                 <Routes>
//                     <Route path='/' element={<Dashboard />} />
//                     <Route path='/my-room' element={<MyRoom />} />
//                     <Route path='/notices' element={<Notices />} />
//                     <Route path='/profile' element={<Profile />} />
//                     <Route path='/support' element={<Support />} />
//                     <Route path='/payment-history' element={<PaymentHistory />} />
//                 </Routes>
//             </div>

//         </div>
//     );
// }