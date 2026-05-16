import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Wednesday gothic "all clear" illustration
const WednesdayAllClear = () => (
  <svg viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" className="w-44 h-auto mx-auto">
    {/* Background moon */}
    <circle cx="110" cy="70" r="48" fill="#1a1030" stroke="#3b2a5a" strokeWidth="1" />
    <circle cx="110" cy="70" r="44" fill="none" stroke="#5b3a8a" strokeWidth="0.5" strokeDasharray="3 4" />
    {/* Moon glow */}
    <circle cx="110" cy="70" r="38" fill="#0f0820" />
    <circle cx="110" cy="70" r="34" fill="none" stroke="#7c3aed" strokeWidth="0.3" opacity="0.6" />
    {/* Check mark inside moon */}
    <circle cx="110" cy="70" r="18" fill="#1e1040" stroke="#7c3aed" strokeWidth="1.2" />
    <path d="M100 70 L107 78 L122 62" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    {/* Stars scattered */}
    {[[55,30],[165,25],[40,80],[180,65],[60,115],[170,105],[85,18],[140,18]].map(([x,y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="1.2" fill="#a78bfa" opacity={0.5 + (i % 3) * 0.2} />
      </g>
    ))}

    {/* Wednesday silhouette — simplified gothic figure */}
    {/* Body */}
    <rect x="97" y="140" width="26" height="48" rx="3" fill="#0d0a1a" stroke="#2a1f40" strokeWidth="0.8" />
    {/* Dress details — two vertical lines */}
    <line x1="107" y1="145" x2="107" y2="185" stroke="#1e1535" strokeWidth="0.8" />
    <line x1="113" y1="145" x2="113" y2="185" stroke="#1e1535" strokeWidth="0.8" />
    {/* Collar */}
    <path d="M97 143 Q110 150 123 143" fill="none" stroke="#3b2a5a" strokeWidth="1" />
    {/* White collar detail */}
    <path d="M104 140 L110 148 L116 140" fill="#e8e0f0" stroke="#c4b5d4" strokeWidth="0.5" />

    {/* Head */}
    <ellipse cx="110" cy="128" rx="12" ry="14" fill="#d4c5e8" stroke="#2a1f40" strokeWidth="0.8" />
    {/* Hair left */}
    <path d="M98 122 Q96 112 100 108 Q104 104 106 118" fill="#0d0a1a" />
    {/* Hair right */}
    <path d="M122 122 Q124 112 120 108 Q116 104 114 118" fill="#0d0a1a" />
    {/* Braids */}
    <path d="M100 122 Q97 135 98 150" stroke="#0d0a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M120 122 Q123 135 122 150" stroke="#0d0a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Braid ties */}
    <rect x="95" y="148" width="6" height="3" rx="1" fill="#3b2a5a" />
    <rect x="119" y="148" width="6" height="3" rx="1" fill="#3b2a5a" />
    {/* Eyes — small, serious */}
    <ellipse cx="106" cy="128" rx="2" ry="2.5" fill="#1a0f2e" />
    <ellipse cx="114" cy="128" rx="2" ry="2.5" fill="#1a0f2e" />
    <circle cx="106" cy="127" r="0.6" fill="#7c3aed" opacity="0.8" />
    <circle cx="114" cy="127" r="0.6" fill="#7c3aed" opacity="0.8" />
    {/* Neutral mouth */}
    <line x1="107" y1="135" x2="113" y2="135" stroke="#8b7aa0" strokeWidth="0.8" strokeLinecap="round" />

    {/* Arms */}
    <path d="M97 148 Q88 155 86 165" stroke="#0d0a1a" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M123 148 Q132 155 134 165" stroke="#0d0a1a" strokeWidth="5" strokeLinecap="round" fill="none" />
    {/* Hands */}
    <circle cx="85" cy="167" r="4" fill="#d4c5e8" />
    <circle cx="135" cy="167" r="4" fill="#d4c5e8" />

    {/* Legs */}
    <rect x="101" y="186" width="8" height="20" rx="2" fill="#0d0a1a" />
    <rect x="111" y="186" width="8" height="20" rx="2" fill="#0d0a1a" />
    {/* Shoes */}
    <ellipse cx="105" cy="207" rx="6" ry="3" fill="#050308" />
    <ellipse cx="115" cy="207" rx="6" ry="3" fill="#050308" />

    {/* Ground shadow */}
    <ellipse cx="110" cy="212" rx="28" ry="5" fill="#0a0718" opacity="0.6" />

    {/* Small spider top-right of moon */}
    <circle cx="148" cy="46" r="3" fill="#1a0f2e" stroke="#5b3a8a" strokeWidth="0.6" />
    <line x1="145" y1="44" x2="141" y2="41" stroke="#5b3a8a" strokeWidth="0.5" />
    <line x1="151" y1="44" x2="155" y2="41" stroke="#5b3a8a" strokeWidth="0.5" />
    <line x1="144" y1="46" x2="140" y2="46" stroke="#5b3a8a" strokeWidth="0.5" />
    <line x1="152" y1="46" x2="156" y2="46" stroke="#5b3a8a" strokeWidth="0.5" />
    <line x1="145" y1="49" x2="142" y2="52" stroke="#5b3a8a" strokeWidth="0.5" />
    <line x1="151" y1="49" x2="154" y2="52" stroke="#5b3a8a" strokeWidth="0.5" />
    {/* Spider web line */}
    <line x1="148" y1="43" x2="148" y2="32" stroke="#3b2a5a" strokeWidth="0.5" strokeDasharray="1 1" />
  </svg>
);

export default function RentOverview() {
  const [showModal, setShowModal]    = useState(false);
  const [payMode, setPayMode]        = useState('select');
  const [pendingPayment, setPending] = useState(null);
  const [roomInfo, setRoomInfo]      = useState(null);
  const [loading, setLoading]        = useState(true);
  const [slip, setSlip]              = useState({ referenceNumber: '', receiptUrl: '' });

  const fetchData = async () => {
    try {
      const { data } = await api.get('/payments/my-payments');
      if (data?.length) {
        const due = data.find(p => ['pending','overdue','pending_verification'].includes(p.status));
        setPending(due || null);
        if (data[0]?.rooms) setRoomInfo(data[0].rooms);
      } else {
        setPending(null);
        setRoomInfo(null);
      }
    } catch { setPending(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSlipSubmit = async (e) => {
    e.preventDefault();
    if (!pendingPayment) return;
    try {
      await api.put(`/payments/${pendingPayment.id}/submit`, {
        paymentMethod: 'Bank Transfer',
        referenceNumber: slip.referenceNumber,
        receiptUrl: slip.receiptUrl,
      });
      toast.success('Slip submitted! Waiting for admin approval.');
      setShowModal(false); setPayMode('select'); setSlip({ referenceNumber: '', receiptUrl: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit slip');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {[0,1].map(i => <div key={i} className="h-64 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  const total      = pendingPayment ? +pendingPayment.amount + +(pendingPayment.fine_amount || 0) : 0;
  const isVerifying = pendingPayment?.status === 'pending_verification';
  const pct        = pendingPayment ? 0 : 100;
  const dash       = `${pct} ${100 - pct}`;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* ── 1. Rent Overview ── */}
        <div className="relative bg-[#0e0b1a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-8 flex flex-col overflow-hidden hover:border-purple-500/20 transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

          <h3 className="relative z-10 text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase mb-8">
            Rent Overview
          </h3>

          {pendingPayment ? (
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 flex-1">
              {/* Donut ring */}
              <div className="relative w-44 h-44 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#1e1530" strokeWidth="3.2" />
                  <circle cx="18" cy="18" r="15.9" fill="transparent"
                    stroke={isVerifying ? '#3B82F6' : '#7C3AED'}
                    strokeWidth="3.2" strokeDasharray={dash} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  {isVerifying ? (
                    <>
                      <svg className="w-7 h-7 text-blue-400 animate-pulse mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-blue-400 font-medium">Verifying</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>{pct}%</span>
                      <span className="text-[10px] text-orange-400 font-semibold tracking-widest uppercase mt-0.5">Pending</span>
                    </>
                  )}
                </div>
              </div>

              {/* Payment details */}
              <div className="flex flex-col gap-4 w-full">
                <div>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Billing Month</span>
                  <p className="text-lg font-semibold text-white mt-0.5">{pendingPayment.month}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Rent Amount</span>
                  <p className="text-2xl font-bold text-white mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                    Rs. {Number(pendingPayment.amount).toLocaleString()}
                  </p>
                </div>
                {+pendingPayment.fine_amount > 0 && (
                  <div>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Late Fine</span>
                    <p className="text-xl font-bold text-red-400 mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                      + Rs. {Number(pendingPayment.fine_amount).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Total to Pay</span>
                  <p className="text-2xl font-bold text-red-400 mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                    Rs. {total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── NO DUES STATE — Wednesday gothic illustration ── */
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-4">
              {/* Subtle purple radial glow behind illustration */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full bg-purple-700/10 blur-3xl" />
              </div>

              <WednesdayAllClear />

              <div className="mt-4 relative z-10">
                <h1
                  className="text-lg font-bold text-purple-300 mb-1 tracking-wide"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  No Pending Dues
                </h1>
                <p className="text-xs text-gray-600 italic max-w-[200px] mx-auto leading-relaxed">
                  "Even I appreciate a clean ledger."
                </p>
                <p className="text-[10px] text-gray-700 mt-0.5">— Wednesday Addams</p>
              </div>
            </div>
          )}

          {/* CTA Button */}
          {pendingPayment && (
            <div className="relative z-10 mt-8">
              {isVerifying ? (
                <div className="w-full rounded-xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-center gap-2 py-4">
                  <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span className="text-sm font-bold tracking-widest uppercase text-blue-400">Pending Admin Approval</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white font-bold tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-purple-950/40"
                >
                  Pay Now
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── 2. Room Details (UPDATED) ── */}
        <div className="relative bg-[#0e0b1a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-8 flex flex-col overflow-hidden hover:border-indigo-500/20 transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase">Room Details</h3>
            <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>

          {roomInfo ? (
            <div className="relative z-10 flex flex-col xl:flex-row gap-6 flex-1 h-full">
              {/* Left Side: Details Container */}
              <div className="flex flex-col justify-between flex-1 gap-6">
                
                {/* Top: Room Number & Type together */}
                <div className="flex items-end gap-6 pb-5 border-b border-white/[0.05]">
                  <div>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest block mb-2">Room Number</span>
                    <p className="text-5xl font-bold leading-none" style={{ color: '#A58ED4', fontFamily: "'Cinzel', serif" }}>
                      {roomInfo.room_number}
                    </p>
                  </div>
                  <div className="pb-1">
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest block mb-1">Room Type</span>
                    <p className="text-lg font-semibold text-white">{roomInfo.room_type || 'Standard Room'}</p>
                  </div>
                </div>

                {/* Middle: Grid layout for Floor and Wing to fill space */}
                <div className="grid grid-cols-2 gap-4">
                  {roomInfo.floor && (
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        Floor
                      </span>
                      <p className="text-base text-gray-200 mt-2 font-medium">{roomInfo.floor}</p>
                    </div>
                  )}
                  {roomInfo.wing && (
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        Wing
                      </span>
                      <p className="text-base text-gray-200 mt-2 font-medium">{roomInfo.wing}</p>
                    </div>
                  )}
                </div>

                {/* Bottom: Rent Highlight */}
                <div className="mt-auto bg-gradient-to-r from-indigo-900/20 to-purple-900/10 border border-indigo-500/20 rounded-xl p-5 flex justify-between items-center group hover:border-indigo-500/40 transition-colors">
                  <div>
                    <span className="text-[10px] text-indigo-300/80 font-bold uppercase tracking-widest">Monthly Rent</span>
                    <p className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left" style={{ fontFamily: "'Cinzel', serif" }}>
                      Rs. {roomInfo.monthly_rent ? Number(roomInfo.monthly_rent).toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-indigo-300 font-bold text-sm">Rs</span>
                  </div>
                </div>

              </div>

              {/* Right Side: Enhanced Room Image */}
              <div className="w-full xl:w-[260px] h-[300px] xl:h-auto rounded-2xl overflow-hidden border border-white/10 shrink-0 relative group">
                <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-overlay"></div>
                <img
                  src="/right.png"
                  alt="Room"
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b1a] via-transparent to-transparent opacity-80 z-10 pointer-events-none"></div>
                
                {/* Aesthetic corner accents */}
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-white/30 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-white/30 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

            </div>
          ) : (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-gray-500 text-sm border border-dashed border-white/10 rounded-2xl p-8">
              Room details will appear once assigned.
            </div>
          )}
        </div>
      </div>

      {/* ── PAYMENT MODAL ── */}
      {showModal && pendingPayment && !isVerifying && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setPayMode('select'); } }}
        >
          <div className="w-full max-w-md bg-[#12101e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                {payMode === 'select' ? 'Choose Payment Method' : payMode === 'slip' ? 'Upload Bank Slip' : 'Online Payment'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setPayMode('select'); }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {payMode === 'select' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-5">
                    Choose how you'd like to pay <span className="text-white font-semibold">Rs. {total.toLocaleString()}</span>
                  </p>
                  <button onClick={() => setPayMode('online')}
                    className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.07] hover:border-purple-500/40 hover:bg-purple-900/10 rounded-xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Pay Online</p>
                        <p className="text-xs text-gray-500 mt-0.5">Credit / Debit Card, WebXPay</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button onClick={() => setPayMode('slip')}
                    className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/40 hover:bg-blue-900/10 rounded-xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">Upload Bank Slip</p>
                        <p className="text-xs text-gray-500 mt-0.5">Bank Transfer / Cash Deposit</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {payMode === 'slip' && (
                <form onSubmit={handleSlipSubmit} className="space-y-4">
                  <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 mb-2">
                    Deposit <strong>Rs. {total.toLocaleString()}</strong> to A/C:{' '}
                    <strong>1234-5678-9012 (BOC)</strong>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Reference Number</label>
                    <input type="text" required value={slip.referenceNumber}
                      onChange={e => setSlip(s => ({ ...s, referenceNumber: e.target.value }))}
                      className="w-full bg-[#0e0b1a] border border-white/10 focus:border-purple-500/50 text-white rounded-xl p-3 text-sm outline-none transition-colors placeholder-gray-600"
                      placeholder="e.g. TRN-987654321" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Receipt URL</label>
                    <input type="text" required value={slip.receiptUrl}
                      onChange={e => setSlip(s => ({ ...s, receiptUrl: e.target.value }))}
                      className="w-full bg-[#0e0b1a] border border-white/10 focus:border-purple-500/50 text-white rounded-xl p-3 text-sm outline-none transition-colors placeholder-gray-600"
                      placeholder="Image link or URL" />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-white/[0.07]">
                    <button type="button" onClick={() => setPayMode('select')} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">Back</button>
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 text-white text-sm font-bold tracking-wider transition-all">Submit Slip</button>
                  </div>
                </form>
              )}

              {payMode === 'online' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Secure Payment</h4>
                  <p className="text-sm text-gray-400 mb-6">You'll be redirected to pay <strong className="text-white">Rs. {total.toLocaleString()}</strong></p>
                  <div className="flex gap-3 pt-4 border-t border-white/[0.07]">
                    <button onClick={() => setPayMode('select')} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">Back</button>
                    <button onClick={() => { toast.success('Redirecting to payment gateway...'); setShowModal(false); setPayMode('select'); }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 text-white text-sm font-bold tracking-wider transition-all">
                      Proceed to Pay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// import React, { useState, useEffect } from 'react';
// import api from '../utils/api';
// import toast from 'react-hot-toast';

// // Wednesday gothic "all clear" illustration
// const WednesdayAllClear = () => (
//   <svg viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" className="w-44 h-auto mx-auto">
//     {/* Background moon */}
//     <circle cx="110" cy="70" r="48" fill="#1a1030" stroke="#3b2a5a" strokeWidth="1" />
//     <circle cx="110" cy="70" r="44" fill="none" stroke="#5b3a8a" strokeWidth="0.5" strokeDasharray="3 4" />
//     {/* Moon glow */}
//     <circle cx="110" cy="70" r="38" fill="#0f0820" />
//     <circle cx="110" cy="70" r="34" fill="none" stroke="#7c3aed" strokeWidth="0.3" opacity="0.6" />
//     {/* Check mark inside moon */}
//     <circle cx="110" cy="70" r="18" fill="#1e1040" stroke="#7c3aed" strokeWidth="1.2" />
//     <path d="M100 70 L107 78 L122 62" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

//     {/* Stars scattered */}
//     {[[55,30],[165,25],[40,80],[180,65],[60,115],[170,105],[85,18],[140,18]].map(([x,y], i) => (
//       <g key={i}>
//         <circle cx={x} cy={y} r="1.2" fill="#a78bfa" opacity={0.5 + (i % 3) * 0.2} />
//       </g>
//     ))}

//     {/* Wednesday silhouette — simplified gothic figure */}
//     {/* Body */}
//     <rect x="97" y="140" width="26" height="48" rx="3" fill="#0d0a1a" stroke="#2a1f40" strokeWidth="0.8" />
//     {/* Dress details — two vertical lines */}
//     <line x1="107" y1="145" x2="107" y2="185" stroke="#1e1535" strokeWidth="0.8" />
//     <line x1="113" y1="145" x2="113" y2="185" stroke="#1e1535" strokeWidth="0.8" />
//     {/* Collar */}
//     <path d="M97 143 Q110 150 123 143" fill="none" stroke="#3b2a5a" strokeWidth="1" />
//     {/* White collar detail */}
//     <path d="M104 140 L110 148 L116 140" fill="#e8e0f0" stroke="#c4b5d4" strokeWidth="0.5" />

//     {/* Head */}
//     <ellipse cx="110" cy="128" rx="12" ry="14" fill="#d4c5e8" stroke="#2a1f40" strokeWidth="0.8" />
//     {/* Hair left */}
//     <path d="M98 122 Q96 112 100 108 Q104 104 106 118" fill="#0d0a1a" />
//     {/* Hair right */}
//     <path d="M122 122 Q124 112 120 108 Q116 104 114 118" fill="#0d0a1a" />
//     {/* Braids */}
//     <path d="M100 122 Q97 135 98 150" stroke="#0d0a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
//     <path d="M120 122 Q123 135 122 150" stroke="#0d0a1a" strokeWidth="4" strokeLinecap="round" fill="none" />
//     {/* Braid ties */}
//     <rect x="95" y="148" width="6" height="3" rx="1" fill="#3b2a5a" />
//     <rect x="119" y="148" width="6" height="3" rx="1" fill="#3b2a5a" />
//     {/* Eyes — small, serious */}
//     <ellipse cx="106" cy="128" rx="2" ry="2.5" fill="#1a0f2e" />
//     <ellipse cx="114" cy="128" rx="2" ry="2.5" fill="#1a0f2e" />
//     <circle cx="106" cy="127" r="0.6" fill="#7c3aed" opacity="0.8" />
//     <circle cx="114" cy="127" r="0.6" fill="#7c3aed" opacity="0.8" />
//     {/* Neutral mouth */}
//     <line x1="107" y1="135" x2="113" y2="135" stroke="#8b7aa0" strokeWidth="0.8" strokeLinecap="round" />

//     {/* Arms */}
//     <path d="M97 148 Q88 155 86 165" stroke="#0d0a1a" strokeWidth="5" strokeLinecap="round" fill="none" />
//     <path d="M123 148 Q132 155 134 165" stroke="#0d0a1a" strokeWidth="5" strokeLinecap="round" fill="none" />
//     {/* Hands */}
//     <circle cx="85" cy="167" r="4" fill="#d4c5e8" />
//     <circle cx="135" cy="167" r="4" fill="#d4c5e8" />

//     {/* Legs */}
//     <rect x="101" y="186" width="8" height="20" rx="2" fill="#0d0a1a" />
//     <rect x="111" y="186" width="8" height="20" rx="2" fill="#0d0a1a" />
//     {/* Shoes */}
//     <ellipse cx="105" cy="207" rx="6" ry="3" fill="#050308" />
//     <ellipse cx="115" cy="207" rx="6" ry="3" fill="#050308" />

//     {/* Ground shadow */}
//     <ellipse cx="110" cy="212" rx="28" ry="5" fill="#0a0718" opacity="0.6" />

//     {/* Small spider top-right of moon */}
//     <circle cx="148" cy="46" r="3" fill="#1a0f2e" stroke="#5b3a8a" strokeWidth="0.6" />
//     <line x1="145" y1="44" x2="141" y2="41" stroke="#5b3a8a" strokeWidth="0.5" />
//     <line x1="151" y1="44" x2="155" y2="41" stroke="#5b3a8a" strokeWidth="0.5" />
//     <line x1="144" y1="46" x2="140" y2="46" stroke="#5b3a8a" strokeWidth="0.5" />
//     <line x1="152" y1="46" x2="156" y2="46" stroke="#5b3a8a" strokeWidth="0.5" />
//     <line x1="145" y1="49" x2="142" y2="52" stroke="#5b3a8a" strokeWidth="0.5" />
//     <line x1="151" y1="49" x2="154" y2="52" stroke="#5b3a8a" strokeWidth="0.5" />
//     {/* Spider web line */}
//     <line x1="148" y1="43" x2="148" y2="32" stroke="#3b2a5a" strokeWidth="0.5" strokeDasharray="1 1" />
//   </svg>
// );

// export default function RentOverview() {
//   const [showModal, setShowModal]    = useState(false);
//   const [payMode, setPayMode]        = useState('select');
//   const [pendingPayment, setPending] = useState(null);
//   const [roomInfo, setRoomInfo]      = useState(null);
//   const [loading, setLoading]        = useState(true);
//   const [slip, setSlip]              = useState({ referenceNumber: '', receiptUrl: '' });

//   const fetchData = async () => {
//     try {
//       const { data } = await api.get('/payments/my-payments');
//       if (data?.length) {
//         const due = data.find(p => ['pending','overdue','pending_verification'].includes(p.status));
//         setPending(due || null);
//         if (data[0]?.rooms) setRoomInfo(data[0].rooms);
//       } else {
//         setPending(null);
//         setRoomInfo(null);
//       }
//     } catch { setPending(null); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetchData(); }, []);

//   const handleSlipSubmit = async (e) => {
//     e.preventDefault();
//     if (!pendingPayment) return;
//     try {
//       await api.put(`/payments/${pendingPayment.id}/submit`, {
//         paymentMethod: 'Bank Transfer',
//         referenceNumber: slip.referenceNumber,
//         receiptUrl: slip.receiptUrl,
//       });
//       toast.success('Slip submitted! Waiting for admin approval.');
//       setShowModal(false); setPayMode('select'); setSlip({ referenceNumber: '', receiptUrl: '' });
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to submit slip');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
//         {[0,1].map(i => <div key={i} className="h-64 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />)}
//       </div>
//     );
//   }

//   const total      = pendingPayment ? +pendingPayment.amount + +(pendingPayment.fine_amount || 0) : 0;
//   const isVerifying = pendingPayment?.status === 'pending_verification';
//   const pct        = pendingPayment ? 0 : 100;
//   const dash       = `${pct} ${100 - pct}`;

//   return (
//     <>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

//         {/* ── 1. Rent Overview ── */}
//         <div className="relative bg-[#0e0b1a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-8 flex flex-col overflow-hidden hover:border-purple-500/20 transition-colors duration-300">
//           <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

//           <h3 className="relative z-10 text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase mb-8">
//             Rent Overview
//           </h3>

//           {pendingPayment ? (
//             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 flex-1">
//               {/* Donut ring */}
//               <div className="relative w-44 h-44 shrink-0">
//                 <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
//                   <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#1e1530" strokeWidth="3.2" />
//                   <circle cx="18" cy="18" r="15.9" fill="transparent"
//                     stroke={isVerifying ? '#3B82F6' : '#7C3AED'}
//                     strokeWidth="3.2" strokeDasharray={dash} strokeLinecap="round"
//                     style={{ transition: 'stroke-dasharray 1s ease' }}
//                   />
//                 </svg>
//                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
//                   {isVerifying ? (
//                     <>
//                       <svg className="w-7 h-7 text-blue-400 animate-pulse mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       <span className="text-xs text-blue-400 font-medium">Verifying</span>
//                     </>
//                   ) : (
//                     <>
//                       <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>{pct}%</span>
//                       <span className="text-[10px] text-orange-400 font-semibold tracking-widest uppercase mt-0.5">Pending</span>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Payment details */}
//               <div className="flex flex-col gap-4 w-full">
//                 <div>
//                   <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Billing Month</span>
//                   <p className="text-lg font-semibold text-white mt-0.5">{pendingPayment.month}</p>
//                 </div>
//                 <div>
//                   <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Rent Amount</span>
//                   <p className="text-2xl font-bold text-white mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
//                     Rs. {Number(pendingPayment.amount).toLocaleString()}
//                   </p>
//                 </div>
//                 {+pendingPayment.fine_amount > 0 && (
//                   <div>
//                     <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Late Fine</span>
//                     <p className="text-xl font-bold text-red-400 mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
//                       + Rs. {Number(pendingPayment.fine_amount).toLocaleString()}
//                     </p>
//                   </div>
//                 )}
//                 <div>
//                   <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Total to Pay</span>
//                   <p className="text-2xl font-bold text-red-400 mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
//                     Rs. {total.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             /* ── NO DUES STATE — Wednesday gothic illustration ── */
//             <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-4">
//               {/* Subtle purple radial glow behind illustration */}
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <div className="w-48 h-48 rounded-full bg-purple-700/10 blur-3xl" />
//               </div>

//               <WednesdayAllClear />

//               <div className="mt-4 relative z-10">
//                 <h1
//                   className="text-lg font-bold text-purple-300 mb-1 tracking-wide"
//                   style={{ fontFamily: "'Cinzel', serif" }}
//                 >
//                   No Pending Dues
//                 </h1>
//                 <p className="text-xs text-gray-600 italic max-w-[200px] mx-auto leading-relaxed">
//                   "Even I appreciate a clean ledger."
//                 </p>
//                 <p className="text-[10px] text-gray-700 mt-0.5">— Wednesday Addams</p>
//               </div>
//             </div>
//           )}

//           {/* CTA Button */}
//           {pendingPayment && (
//             <div className="relative z-10 mt-8">
//               {isVerifying ? (
//                 <div className="w-full rounded-xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-center gap-2 py-4">
//                   <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                   </svg>
//                   <span className="text-sm font-bold tracking-widest uppercase text-blue-400">Pending Admin Approval</span>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setShowModal(true)}
//                   className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white font-bold tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-purple-950/40"
//                 >
//                   Pay Now
//                   <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* ── 2. Room Details ── */}
//         <div className="relative bg-[#0e0b1a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-8 flex flex-col overflow-hidden hover:border-indigo-500/20 transition-colors duration-300">
//           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent pointer-events-none" />

//           <div className="relative z-10 flex justify-between items-center mb-8">
//             <h3 className="text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase">Room Details</h3>
//             <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
//               <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//               </svg>
//             </div>
//           </div>

//           {roomInfo ? (
//             <div className="relative z-10 flex flex-col md:flex-row gap-8 flex-1">
//               <div className="flex flex-col gap-5 flex-1">
//                 <div>
//                   <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Room Number</span>
//                   <p className="text-4xl font-bold mt-1" style={{ color: '#A58ED4', fontFamily: "'Cinzel', serif" }}>
//                     {roomInfo.room_number}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Room Type</span>
//                   <p className="text-lg font-semibold text-white mt-1">{roomInfo.room_type || 'Standard Room'}</p>
//                 </div>
//                 {roomInfo.floor && (
//                   <div>
//                     <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Floor</span>
//                     <p className="text-base text-white mt-1">{roomInfo.floor}</p>
//                   </div>
//                 )}
//                 {roomInfo.wing && (
//                   <div>
//                     <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Wing</span>
//                     <p className="text-base text-white mt-1">{roomInfo.wing}</p>
//                   </div>
//                 )}
//                 <div>
//                   <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Monthly Rent</span>
//                   <p className="text-xl font-bold text-white mt-1" style={{ fontFamily: "'Cinzel', serif" }}>
//                     Rs. {roomInfo.monthly_rent ? Number(roomInfo.monthly_rent).toLocaleString() : '0'}
//                   </p>
//                 </div>
//               </div>

//               {/* Room image */}
//               <div className="w-full md:w-52 h-64 rounded-xl overflow-hidden border border-white/5 shrink-0">
//                 <img
//                   src="/right.png"
//                   alt="Room"
//                   className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-500"
//                 />
//               </div>
//             </div>
//           ) : (
//             <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-gray-600 text-sm">
//               Room details will appear once assigned.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── PAYMENT MODAL ── */}
//       {showModal && pendingPayment && !isVerifying && (
//         <div
//           className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//           onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setPayMode('select'); } }}
//         >
//           <div className="w-full max-w-md bg-[#12101e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
//             <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
//               <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
//                 {payMode === 'select' ? 'Choose Payment Method' : payMode === 'slip' ? 'Upload Bank Slip' : 'Online Payment'}
//               </h3>
//               <button
//                 onClick={() => { setShowModal(false); setPayMode('select'); }}
//                 className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
//               >
//                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="p-6">
//               {payMode === 'select' && (
//                 <div className="space-y-3">
//                   <p className="text-sm text-gray-400 mb-5">
//                     Choose how you'd like to pay <span className="text-white font-semibold">Rs. {total.toLocaleString()}</span>
//                   </p>
//                   <button onClick={() => setPayMode('online')}
//                     className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.07] hover:border-purple-500/40 hover:bg-purple-900/10 rounded-xl transition-all group">
//                     <div className="flex items-center gap-4">
//                       <div className="w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
//                         <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                         </svg>
//                       </div>
//                       <div className="text-left">
//                         <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Pay Online</p>
//                         <p className="text-xs text-gray-500 mt-0.5">Credit / Debit Card, WebXPay</p>
//                       </div>
//                     </div>
//                     <svg className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </button>

//                   <button onClick={() => setPayMode('slip')}
//                     className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/40 hover:bg-blue-900/10 rounded-xl transition-all group">
//                     <div className="flex items-center gap-4">
//                       <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
//                         <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                       </div>
//                       <div className="text-left">
//                         <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">Upload Bank Slip</p>
//                         <p className="text-xs text-gray-500 mt-0.5">Bank Transfer / Cash Deposit</p>
//                       </div>
//                     </div>
//                     <svg className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </button>
//                 </div>
//               )}

//               {payMode === 'slip' && (
//                 <form onSubmit={handleSlipSubmit} className="space-y-4">
//                   <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 mb-2">
//                     Deposit <strong>Rs. {total.toLocaleString()}</strong> to A/C:{' '}
//                     <strong>1234-5678-9012 (BOC)</strong>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Reference Number</label>
//                     <input type="text" required value={slip.referenceNumber}
//                       onChange={e => setSlip(s => ({ ...s, referenceNumber: e.target.value }))}
//                       className="w-full bg-[#0e0b1a] border border-white/10 focus:border-purple-500/50 text-white rounded-xl p-3 text-sm outline-none transition-colors placeholder-gray-600"
//                       placeholder="e.g. TRN-987654321" />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Receipt URL</label>
//                     <input type="text" required value={slip.receiptUrl}
//                       onChange={e => setSlip(s => ({ ...s, receiptUrl: e.target.value }))}
//                       className="w-full bg-[#0e0b1a] border border-white/10 focus:border-purple-500/50 text-white rounded-xl p-3 text-sm outline-none transition-colors placeholder-gray-600"
//                       placeholder="Image link or URL" />
//                   </div>
//                   <div className="flex gap-3 pt-4 border-t border-white/[0.07]">
//                     <button type="button" onClick={() => setPayMode('select')} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">Back</button>
//                     <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 text-white text-sm font-bold tracking-wider transition-all">Submit Slip</button>
//                   </div>
//                 </form>
//               )}

//               {payMode === 'online' && (
//                 <div className="text-center py-4">
//                   <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
//                     <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                     </svg>
//                   </div>
//                   <h4 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Secure Payment</h4>
//                   <p className="text-sm text-gray-400 mb-6">You'll be redirected to pay <strong className="text-white">Rs. {total.toLocaleString()}</strong></p>
//                   <div className="flex gap-3 pt-4 border-t border-white/[0.07]">
//                     <button onClick={() => setPayMode('select')} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">Back</button>
//                     <button onClick={() => { toast.success('Redirecting to payment gateway...'); setShowModal(false); setPayMode('select'); }}
//                       className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 text-white text-sm font-bold tracking-wider transition-all">
//                       Proceed to Pay
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { MdChevronRight, MdBed, MdClose, MdCreditCard, MdReceipt, MdAccessTime } from 'react-icons/md';
// import toast from 'react-hot-toast';
// import api from '../utils/api'; 

// export default function RentOverview() {
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paymentMode, setPaymentMode] = useState('select'); 
  
//   const [pendingPayment, setPendingPayment] = useState(null);
//   const [roomInfo, setRoomInfo] = useState(null); // කාමරේ විස්තර වෙනම තියාගන්න State එකක්
//   const [loading, setLoading] = useState(true);

//   const [slipData, setSlipData] = useState({
//     referenceNumber: '',
//     receiptUrl: ''
//   });

//   const fetchMyData = async () => {
//     try {
//       // Backend එකට Token එකත් එක්කම රික්වෙස්ට් එක යනවා
//       const response = await api.get('/payments/my-payments');
      
//       if (response.data && response.data.length > 0) {
//         // 1. Pending බිලක් තියෙනවද බලනවා
//         const duePayment = response.data.find(p => 
//           p.status === 'pending' || 
//           p.status === 'overdue' || 
//           p.status === 'pending_verification'
//         );
//         setPendingPayment(duePayment || null);

//         // 2. ළමයාගේ කාමරේ විස්තරේ පලවෙනි Payment රෙකෝඩ් එකෙන් ගන්නවා
//         // (? දාලා තියෙන්නේ rooms නැති වුණොත් ක්‍රෑෂ් වෙන්නේ නැති වෙන්න)
//         if (response.data[0]?.rooms) {
//           setRoomInfo(response.data[0].rooms);
//         }
//       } else {
//         // කිසිම බිලක් නැති අලුත් ළමයෙක් නම්
//         setPendingPayment(null);
//         // (කාමරේ විස්තර වෙනම API එකකින් ගන්න වෙනවා නම් පස්සේ හදමු, දැනට null තියමු)
//         setRoomInfo(null);
//       }
//     } catch (error) {
//       console.error("Error fetching payment data:", error);
//       // Backend එකෙන් Error ආවොත් (උදා: බිල් හොයාගන්න බැරුව)
//       setPendingPayment(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMyData();
//   }, []);

//   const handleSlipSubmit = async (e) => {
//     e.preventDefault();
//     if (!pendingPayment) return;

//     try {
//       await api.put(`/payments/${pendingPayment.id}/submit`, {
//         paymentMethod: 'Bank Transfer',
//         referenceNumber: slipData.referenceNumber,
//         receiptUrl: slipData.receiptUrl
//       });

//       toast.success('Payment slip submitted successfully! Waiting for admin approval.');
//       setShowPaymentModal(false);
//       setPaymentMode('select');
//       setSlipData({ referenceNumber: '', receiptUrl: '' });
//       fetchMyData(); 
      
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Failed to submit payment';
//       toast.error(errorMsg);
//     }
//   };

//   const handleOnlinePayment = () => {
//     toast.success('Redirecting to secure Payment Gateway...');
//     setShowPaymentModal(false);
//     setPaymentMode('select');
//   };

//   if (loading) {
//     return <div className="text-gray-400 p-8 text-center mt-8">Loading rent details...</div>;
//   }

//   const totalDueAmount = pendingPayment ? Number(pendingPayment.amount) + Number(pendingPayment.fine_amount) : 0;
//   const percentage = pendingPayment ? 0 : 100;
//   const strokeDasharray = `${percentage} ${100 - percentage}`;
//   const isVerifying = pendingPayment?.status === 'pending_verification';

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-8 relative">
      
//       {/* 1. Rent Overview Card */}
//       <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col shadow-xl">
//         <h3 className="text-[14px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-8">Rent Overview</h3>
        
//         {pendingPayment ? (
//           <>
//             <div className="flex flex-col md:flex-row items-center justify-between gap-8 flex-1">
//               <div className="relative w-48 h-48 flex items-center justify-center">
//                 <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
//                   <circle cx="18" cy="18" r="16" fill="transparent" stroke="#2D243D" strokeWidth="3" />
//                   <circle cx="18" cy="18" r="16" fill="transparent" stroke={isVerifying ? "#3B82F6" : "#7B1FA2"} strokeWidth="3" 
//                     strokeDasharray={strokeDasharray} strokeDashoffset="0" strokeLinecap="round" />
//                 </svg>
//                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                   {isVerifying ? (
//                     <>
//                       <MdAccessTime className="text-3xl text-blue-400 mb-1 animate-pulse" />
//                       <span className="text-xs font-medium text-blue-400">Verifying</span>
//                     </>
//                   ) : (
//                     <>
//                       <span className="text-4xl font-serif text-white">{percentage}%</span>
//                       <span className="text-xs font-medium text-orange-500">Pending</span>
//                     </>
//                   )}
//                 </div>
//               </div>

//               <div className="flex flex-col gap-6 w-full md:w-auto">
//                 <div className="flex flex-col">
//                   <span className="text-xs text-gray-400 font-medium">Billing Month</span>
//                   <span className="text-xl font-serif text-white">{pendingPayment.month}</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-xs text-gray-400 font-medium">Rent Amount</span>
//                   <span className="text-2xl font-serif text-white">Rs. {pendingPayment.amount}</span>
//                 </div>
//                 {pendingPayment.fine_amount > 0 && (
//                   <div className="flex flex-col">
//                     <span className="text-xs text-gray-400 font-medium">Late Fine</span>
//                     <span className="text-xl font-serif text-red-400">+ Rs. {pendingPayment.fine_amount}</span>
//                   </div>
//                 )}
//                 <div className="flex flex-col">
//                   <span className="text-xs text-gray-400 font-medium">Total to Pay</span>
//                   <span className="text-2xl font-serif text-red-500">Rs. {totalDueAmount}</span>
//                 </div>
//               </div>
//             </div>

//             {isVerifying ? (
//               <div className="mt-10 w-full h-14 bg-blue-900/30 border border-blue-500/30 rounded-xl flex items-center justify-center gap-2 cursor-wait">
//                 <span className="text-sm font-bold tracking-[0.2em] uppercase text-blue-300">
//                   Pending Admin Approval
//                 </span>
//               </div>
//             ) : (
//               <button 
//                 onClick={() => setShowPaymentModal(true)} 
//                 className="mt-10 w-full h-14 bg-gradient-to-r from-[#4A235A] to-[#7B1FA2] hover:from-[#5B2C6F] hover:to-[#8E24AA] rounded-xl flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-purple-900/20 cursor-pointer"
//               >
//                 <span className="text-sm font-bold tracking-[0.2em] uppercase text-white">Pay Now</span>
//                 <MdChevronRight className="text-2xl text-white group-hover:translate-x-1 transition-transform" />
//               </button>
//             )}
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
//             <span className="text-5xl mb-4">🎉</span>
//             <h4 className="text-xl text-white font-medium mb-2">No Pending Dues!</h4>
//             <p className="text-gray-400 text-sm">You have paid all your rent for now.</p>
//           </div>
//         )}
//       </div>

//       {/* 2. Room Details Card (බිල ගෙව්වත් මේක දැන් පේනවා!) */}
//       <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col shadow-xl">
//         <div className="flex justify-between items-center mb-8">
//           <h3 className="text-[14px] font-bold tracking-[0.2em] text-gray-400 uppercase">Room Details</h3>
//           <div className="bg-white/5 p-2 rounded-full border border-white/10">
//             <MdBed className="text-2xl text-purple-400" />
//           </div>
//         </div>

//         {roomInfo ? (
//           <div className="flex flex-col md:flex-row gap-8">
//             <div className="flex flex-col gap-6 flex-1">
//               {/* Room Number - මෙතන roomInfo.room_number කියලා හැදුවා */}
//               <div className="flex flex-col">
//                 <span className="text-xs text-gray-400 font-medium mb-1">Room Number</span>
//                 <span className="text-3xl font-serif text-[#A58ED4]">{roomInfo.room_number}</span>
//               </div>
              
//               {/* Room Type */}
//               <div className="flex flex-col">
//                 <span className="text-xs text-gray-400 font-medium mb-1">Room Type</span>
//                 <span className="text-xl font-serif text-white">{roomInfo.room_type || 'Standard Room'}</span>
//               </div>
              
//               {/* Monthly Rent - ඉලක්කම ලස්සනට පේන්න toLocaleString() එකතු කළා */}
//               <div className="flex flex-col">
//                 <span className="text-xs text-gray-400 font-medium mb-1">Monthly Rent</span>
//                 <span className="text-xl font-serif text-white">
//                   Rs. {roomInfo.monthly_rent ? Number(roomInfo.monthly_rent).toLocaleString() : '0'}
//                 </span>
//               </div>
//             </div>

//             {/* අර ඔයා යවපු ලස්සන පින්තූරේ විදිහටම Image එක දාන තැන */}
//             <div className="w-full md:w-56 h-72 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
//                <img 
//                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzKDOhOKsrp9aPcrtjdZbFkFtltZZfB_Nsq3oSmJVlSz7DFD7dNxsUl15UkYZv0maX96pv&s=10" 
//                  alt="Room Interior" 
//                  className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
//                />
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             Room details will appear once assigned.
//           </div>
//         )}
//       </div>

//       {/* PAYMENT MODAL එක (කලින් තිබ්බ එකමයි) */}
//       {showPaymentModal && pendingPayment && !isVerifying && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-[#1E182D] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//             <div className="p-6 border-b border-white/10 flex justify-between items-center">
//               <h3 className="text-xl font-serif text-white">
//                 {paymentMode === 'select' ? 'Choose Payment Method' : paymentMode === 'slip' ? 'Upload Bank Slip' : 'Online Payment'}
//               </h3>
//               <button onClick={() => { setShowPaymentModal(false); setPaymentMode('select'); }} className="text-gray-400 hover:text-white transition-colors">
//                 <MdClose className="text-2xl" />
//               </button>
//             </div>
            
//             <div className="p-6">
//               {paymentMode === 'select' && (
//                 <div className="space-y-4">
//                   <p className="text-gray-400 mb-6 text-sm">
//                     How would you like to pay your pending amount of <span className="text-white font-bold">Rs. {totalDueAmount}</span>?
//                   </p>
                  
//                   <button onClick={() => setPaymentMode('online')} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-purple-500 hover:bg-purple-900/20 rounded-xl transition-all group">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center"><MdCreditCard className="text-2xl" /></div>
//                       <div className="text-left">
//                         <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">Pay Online</h4>
//                         <p className="text-xs text-gray-500">Credit/Debit Card, WebXPay</p>
//                       </div>
//                     </div>
//                     <MdChevronRight className="text-purple-400 text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </button>

//                   <button onClick={() => setPaymentMode('slip')} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-blue-500 hover:bg-blue-900/20 rounded-xl transition-all group">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center"><MdReceipt className="text-2xl" /></div>
//                       <div className="text-left">
//                         <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Upload Bank Slip</h4>
//                         <p className="text-xs text-gray-500">Bank Transfer / Cash Deposit</p>
//                       </div>
//                     </div>
//                     <MdChevronRight className="text-blue-400 text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </button>
//                 </div>
//               )}

//               {paymentMode === 'slip' && (
//                 <form onSubmit={handleSlipSubmit} className="space-y-4">
//                   <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6 text-sm text-blue-200">
//                     Deposit <strong>Rs. {totalDueAmount}</strong> to A/C: <strong>1234-5678-9012 (BOC)</strong>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">Reference Number</label>
//                     <input type="text" required value={slipData.referenceNumber} onChange={(e) => setSlipData({...slipData, referenceNumber: e.target.value})} className="w-full bg-[#161121] border border-white/10 text-white rounded-lg p-3 outline-none focus:border-purple-500" placeholder="e.g. TRN-987654321" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-400 mb-1">Receipt URL</label>
//                     <input type="text" required value={slipData.receiptUrl} onChange={(e) => setSlipData({...slipData, receiptUrl: e.target.value})} className="w-full bg-[#161121] border border-white/10 text-white rounded-lg p-3 outline-none focus:border-purple-500" placeholder="Image link" />
//                   </div>
//                   <div className="mt-6 flex gap-3 pt-4 border-t border-white/10">
//                     <button type="button" onClick={() => setPaymentMode('select')} className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors">Back</button>
//                     <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 transition-colors">Submit Slip</button>
//                   </div>
//                 </form>
//               )}

//               {paymentMode === 'online' && (
//                 <div className="text-center py-6">
//                   <MdCreditCard className="text-purple-400 text-5xl mx-auto mb-4" />
//                   <h4 className="text-lg font-serif text-white mb-2">Online Payment</h4>
//                   <p className="text-gray-400 mb-8 text-sm">Securely pay <strong>Rs. {totalDueAmount}</strong>.</p>
//                   <div className="mt-6 flex gap-3 pt-4 border-t border-white/10">
//                     <button type="button" onClick={() => setPaymentMode('select')} className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10">Back</button>
//                     <button onClick={handleOnlinePayment} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg">Proceed to Pay</button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }