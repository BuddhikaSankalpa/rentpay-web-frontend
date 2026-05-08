import React, { useState, useEffect } from 'react';
import { MdChevronRight, MdBed, MdClose, MdCreditCard, MdReceipt, MdAccessTime } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../utils/api'; 

export default function RentOverview() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('select'); 
  
  const [pendingPayment, setPendingPayment] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null); // කාමරේ විස්තර වෙනම තියාගන්න State එකක්
  const [loading, setLoading] = useState(true);

  const [slipData, setSlipData] = useState({
    referenceNumber: '',
    receiptUrl: ''
  });

  const fetchMyData = async () => {
    try {
      // Backend එකට Token එකත් එක්කම රික්වෙස්ට් එක යනවා
      const response = await api.get('/payments/my-payments');
      
      if (response.data && response.data.length > 0) {
        // 1. Pending බිලක් තියෙනවද බලනවා
        const duePayment = response.data.find(p => 
          p.status === 'pending' || 
          p.status === 'overdue' || 
          p.status === 'pending_verification'
        );
        setPendingPayment(duePayment || null);

        // 2. ළමයාගේ කාමරේ විස්තරේ පලවෙනි Payment රෙකෝඩ් එකෙන් ගන්නවා
        // (? දාලා තියෙන්නේ rooms නැති වුණොත් ක්‍රෑෂ් වෙන්නේ නැති වෙන්න)
        if (response.data[0]?.rooms) {
          setRoomInfo(response.data[0].rooms);
        }
      } else {
        // කිසිම බිලක් නැති අලුත් ළමයෙක් නම්
        setPendingPayment(null);
        // (කාමරේ විස්තර වෙනම API එකකින් ගන්න වෙනවා නම් පස්සේ හදමු, දැනට null තියමු)
        setRoomInfo(null);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      // Backend එකෙන් Error ආවොත් (උදා: බිල් හොයාගන්න බැරුව)
      setPendingPayment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleSlipSubmit = async (e) => {
    e.preventDefault();
    if (!pendingPayment) return;

    try {
      await api.put(`/payments/${pendingPayment.id}/submit`, {
        paymentMethod: 'Bank Transfer',
        referenceNumber: slipData.referenceNumber,
        receiptUrl: slipData.receiptUrl
      });

      toast.success('Payment slip submitted successfully! Waiting for admin approval.');
      setShowPaymentModal(false);
      setPaymentMode('select');
      setSlipData({ referenceNumber: '', receiptUrl: '' });
      fetchMyData(); 
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit payment';
      toast.error(errorMsg);
    }
  };

  const handleOnlinePayment = () => {
    toast.success('Redirecting to secure Payment Gateway...');
    setShowPaymentModal(false);
    setPaymentMode('select');
  };

  if (loading) {
    return <div className="text-gray-400 p-8 text-center mt-8">Loading rent details...</div>;
  }

  const totalDueAmount = pendingPayment ? Number(pendingPayment.amount) + Number(pendingPayment.fine_amount) : 0;
  const percentage = pendingPayment ? 0 : 100;
  const strokeDasharray = `${percentage} ${100 - percentage}`;
  const isVerifying = pendingPayment?.status === 'pending_verification';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-8 relative">
      
      {/* 1. Rent Overview Card */}
      <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col shadow-xl">
        <h3 className="text-[14px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-8">Rent Overview</h3>
        
        {pendingPayment ? (
          <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 flex-1">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#2D243D" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke={isVerifying ? "#3B82F6" : "#7B1FA2"} strokeWidth="3" 
                    strokeDasharray={strokeDasharray} strokeDashoffset="0" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isVerifying ? (
                    <>
                      <MdAccessTime className="text-3xl text-blue-400 mb-1 animate-pulse" />
                      <span className="text-xs font-medium text-blue-400">Verifying</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-serif text-white">{percentage}%</span>
                      <span className="text-xs font-medium text-orange-500">Pending</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6 w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium">Billing Month</span>
                  <span className="text-xl font-serif text-white">{pendingPayment.month}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium">Rent Amount</span>
                  <span className="text-2xl font-serif text-white">Rs. {pendingPayment.amount}</span>
                </div>
                {pendingPayment.fine_amount > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">Late Fine</span>
                    <span className="text-xl font-serif text-red-400">+ Rs. {pendingPayment.fine_amount}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium">Total to Pay</span>
                  <span className="text-2xl font-serif text-red-500">Rs. {totalDueAmount}</span>
                </div>
              </div>
            </div>

            {isVerifying ? (
              <div className="mt-10 w-full h-14 bg-blue-900/30 border border-blue-500/30 rounded-xl flex items-center justify-center gap-2 cursor-wait">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-blue-300">
                  Pending Admin Approval
                </span>
              </div>
            ) : (
              <button 
                onClick={() => setShowPaymentModal(true)} 
                className="mt-10 w-full h-14 bg-gradient-to-r from-[#4A235A] to-[#7B1FA2] hover:from-[#5B2C6F] hover:to-[#8E24AA] rounded-xl flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-purple-900/20 cursor-pointer"
              >
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-white">Pay Now</span>
                <MdChevronRight className="text-2xl text-white group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <span className="text-5xl mb-4">🎉</span>
            <h4 className="text-xl text-white font-medium mb-2">No Pending Dues!</h4>
            <p className="text-gray-400 text-sm">You have paid all your rent for now.</p>
          </div>
        )}
      </div>

      {/* 2. Room Details Card (බිල ගෙව්වත් මේක දැන් පේනවා!) */}
      <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-[14px] font-bold tracking-[0.2em] text-gray-400 uppercase">Room Details</h3>
          <div className="bg-white/5 p-2 rounded-full border border-white/10">
            <MdBed className="text-2xl text-purple-400" />
          </div>
        </div>

        {roomInfo ? (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-6 flex-1">
              {/* Room Number - මෙතන roomInfo.room_number කියලා හැදුවා */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium mb-1">Room Number</span>
                <span className="text-3xl font-serif text-[#A58ED4]">{roomInfo.room_number}</span>
              </div>
              
              {/* Room Type */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium mb-1">Room Type</span>
                <span className="text-xl font-serif text-white">{roomInfo.room_type || 'Standard Room'}</span>
              </div>
              
              {/* Monthly Rent - ඉලක්කම ලස්සනට පේන්න toLocaleString() එකතු කළා */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium mb-1">Monthly Rent</span>
                <span className="text-xl font-serif text-white">
                  Rs. {roomInfo.monthly_rent ? Number(roomInfo.monthly_rent).toLocaleString() : '0'}
                </span>
              </div>
            </div>

            {/* අර ඔයා යවපු ලස්සන පින්තූරේ විදිහටම Image එක දාන තැන */}
            <div className="w-full md:w-56 h-72 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
               <img 
                 src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzKDOhOKsrp9aPcrtjdZbFkFtltZZfB_Nsq3oSmJVlSz7DFD7dNxsUl15UkYZv0maX96pv&s=10" 
                 alt="Room Interior" 
                 className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
               />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            Room details will appear once assigned.
          </div>
        )}
      </div>

      {/* PAYMENT MODAL එක (කලින් තිබ්බ එකමයි) */}
      {showPaymentModal && pendingPayment && !isVerifying && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E182D] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-serif text-white">
                {paymentMode === 'select' ? 'Choose Payment Method' : paymentMode === 'slip' ? 'Upload Bank Slip' : 'Online Payment'}
              </h3>
              <button onClick={() => { setShowPaymentModal(false); setPaymentMode('select'); }} className="text-gray-400 hover:text-white transition-colors">
                <MdClose className="text-2xl" />
              </button>
            </div>
            
            <div className="p-6">
              {paymentMode === 'select' && (
                <div className="space-y-4">
                  <p className="text-gray-400 mb-6 text-sm">
                    How would you like to pay your pending amount of <span className="text-white font-bold">Rs. {totalDueAmount}</span>?
                  </p>
                  
                  <button onClick={() => setPaymentMode('online')} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-purple-500 hover:bg-purple-900/20 rounded-xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center"><MdCreditCard className="text-2xl" /></div>
                      <div className="text-left">
                        <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">Pay Online</h4>
                        <p className="text-xs text-gray-500">Credit/Debit Card, WebXPay</p>
                      </div>
                    </div>
                    <MdChevronRight className="text-purple-400 text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button onClick={() => setPaymentMode('slip')} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-blue-500 hover:bg-blue-900/20 rounded-xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center"><MdReceipt className="text-2xl" /></div>
                      <div className="text-left">
                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Upload Bank Slip</h4>
                        <p className="text-xs text-gray-500">Bank Transfer / Cash Deposit</p>
                      </div>
                    </div>
                    <MdChevronRight className="text-blue-400 text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              )}

              {paymentMode === 'slip' && (
                <form onSubmit={handleSlipSubmit} className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6 text-sm text-blue-200">
                    Deposit <strong>Rs. {totalDueAmount}</strong> to A/C: <strong>1234-5678-9012 (BOC)</strong>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Reference Number</label>
                    <input type="text" required value={slipData.referenceNumber} onChange={(e) => setSlipData({...slipData, referenceNumber: e.target.value})} className="w-full bg-[#161121] border border-white/10 text-white rounded-lg p-3 outline-none focus:border-purple-500" placeholder="e.g. TRN-987654321" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Receipt URL</label>
                    <input type="text" required value={slipData.receiptUrl} onChange={(e) => setSlipData({...slipData, receiptUrl: e.target.value})} className="w-full bg-[#161121] border border-white/10 text-white rounded-lg p-3 outline-none focus:border-purple-500" placeholder="Image link" />
                  </div>
                  <div className="mt-6 flex gap-3 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => setPaymentMode('select')} className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors">Back</button>
                    <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 transition-colors">Submit Slip</button>
                  </div>
                </form>
              )}

              {paymentMode === 'online' && (
                <div className="text-center py-6">
                  <MdCreditCard className="text-purple-400 text-5xl mx-auto mb-4" />
                  <h4 className="text-lg font-serif text-white mb-2">Online Payment</h4>
                  <p className="text-gray-400 mb-8 text-sm">Securely pay <strong>Rs. {totalDueAmount}</strong>.</p>
                  <div className="mt-6 flex gap-3 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => setPaymentMode('select')} className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10">Back</button>
                    <button onClick={handleOnlinePayment} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg">Proceed to Pay</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}