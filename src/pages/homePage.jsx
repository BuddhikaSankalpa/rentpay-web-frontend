import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api'; // ← path eka oyage structure ekata adjust karanna

import { FaShopify } from "react-icons/fa";
import { MdHistory, MdMeetingRoom, MdCampaign, MdPerson, MdSupportAgent, MdLogout } from "react-icons/md";

import MyRoom from './users/MyRoom';
import Notices from './users/Notices';
import Profile from './users/Profile';
import Support from './users/Support';
import PaymentHistory from './users/PaymentHistory';
import Dashboard from './users/Dashboard';

const NOTICES_LAST_VISIT_KEY = 'notices_last_visited';

export default function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Unread notices thiyenawada balanna state eka
    const [hasUnreadNotices, setHasUnreadNotices] = useState(false);

    // ─── Unread check function ────────────────────────────────────────
    // Backend eken notices gannawa, last-visit ekata passe ewa thiyenawada check karanawa
    useEffect(() => {
        const checkUnread = async () => {
            try {
                const res = await api.get('/notices');
                const stored = localStorage.getItem(NOTICES_LAST_VISIT_KEY);
                const lastVisit = stored ? new Date(stored) : null;

                const hasNew = (res.data || []).some(n =>
                    !lastVisit || new Date(n.created_at) > lastVisit
                );
                setHasUnreadNotices(hasNew);
            } catch (err) {
                // Silent fail — sidebar eke disturb karanna oni nä
                setHasUnreadNotices(false);
            }
        };

        checkUnread();
    }, [location.pathname]);
    // ↑ location.pathname change wena hema welawakma re-check wenawa.
    //   User /notices page eken yana weleta, Notices.jsx eka localStorage update kara,
    //   ithin me check eken 'no unread' kiyala result eka enawa → dot eka ahapahas wenawa.

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    return (
        <div className="w-full h-screen bg-gray-50 flex font-sans text-gray-800 overflow-hidden">

            {/* Sidebar */}
            <div className="h-full w-[250px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

                <div className="w-full flex flex-col items-center justify-center py-8 border-b border-gray-100">
                    <h1 className="text-xl font-bold tracking-widest text-gray-800 uppercase">
                        BODIM PAY
                    </h1>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
                    <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/">
                        <FaShopify className="text-xl" />
                        <span>Dashboard</span>
                    </Link>

                    <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/payment-history">
                        <MdHistory className="text-xl" />
                        <span>Payment History</span>
                    </Link>

                    <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/my-room">
                        <MdMeetingRoom className="text-xl" />
                        <span>My Room</span>
                    </Link>

                    {/* ─── Notices link with red dot indicator ─── */}
                    <Link
                        className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors relative"
                        to="/notices"
                    >
                        <div className="relative">
                            <MdCampaign className="text-xl" />
                            {hasUnreadNotices && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <span>Notices</span>
                        {hasUnreadNotices && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                NEW
                            </span>
                        )}
                    </Link>

                    <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/profile">
                        <MdPerson className="text-xl" />
                        <span>Profile</span>
                    </Link>

                    <Link className="w-full py-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium flex items-center gap-3 transition-colors" to="/support">
                        <MdSupportAgent className="text-xl" />
                        <span>Support</span>
                    </Link>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 px-4 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 font-medium flex items-center gap-3 transition-colors text-left"
                    >
                        <MdLogout className="text-xl" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 h-full overflow-y-auto p-8">
                <Routes>
                    <Route path='/' element={<Dashboard />} />
                    <Route path='/my-room' element={<MyRoom />} />
                    <Route path='/notices' element={<Notices />} />
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/support' element={<Support />} />
                    <Route path='/payment-history' element={<PaymentHistory />} />
                </Routes>
            </div>

        </div>
    );
}