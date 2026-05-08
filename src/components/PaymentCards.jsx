import React, { useState, useEffect } from 'react';
import { MdCreditCard, MdCalendarMonth, MdCheckCircle, MdWarning } from 'react-icons/md';
import api from '../utils/api'; 
import toast from 'react-hot-toast';

export default function PaymentCards() {
  const [processedData, setProcessedData] = useState({
    totalDue: "0", 
    totalFine: "0", // අලුතින් එකතු කළ State එක
    dueDate: "-", 
    daysRemaining: null, 
    lastPaymentAmount: "0", 
    lastPaymentDate: "-", 
    status: "NO DUES", 
    hasPending: false, 
    hasLastPayment: false
  });
  
  const [loading, setLoading] = useState(true);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateDaysRemaining = (dueDateValue) => {
    if (!dueDateValue) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0); 
    const dueDate = new Date(dueDateValue); dueDate.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  };

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const response = await api.get('/payments/my-payments');
        const paymentsArray = response.data;

        if (paymentsArray && paymentsArray.length > 0) {
          const dueBills = paymentsArray.filter(p => p.status === 'pending' || p.status === 'overdue');
          
          let totalDueSum = 0; 
          let totalFineSum = 0; // අලුත් විචල්‍යය
          let nextDueDate = null; 
          let currentStatus = "NO DUES"; 
          let daysRem = null;

          if (dueBills.length > 0) {
            // මුළු මුදල (Amount + Fine)
            totalDueSum = dueBills.reduce((sum, bill) => sum + Number(bill.amount) + Number(bill.fine_amount || 0), 0);
            
            // Fine එක පමණක් වෙන් කර ගැනීම
            totalFineSum = dueBills.reduce((sum, bill) => sum + Number(bill.fine_amount || 0), 0);

            const sortedDueBills = dueBills.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
            nextDueDate = sortedDueBills[0].due_date;
            daysRem = calculateDaysRemaining(nextDueDate);
            
            // Status Logic
            if (daysRem < -5) {
                currentStatus = "CRITICAL";
            } else if (daysRem < 0) {
                currentStatus = "OVERDUE";
            } else {
                currentStatus = "PENDING";
            }
          } else {
            // No due bills: next month 1st is the due date
            const today = new Date();
            nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            daysRem = calculateDaysRemaining(nextDueDate);
          }

          // Last payment logic
          const paidBills = paymentsArray.filter(p => p.status === 'paid' && p.paid_date);
          let lastPayAmount = "0"; let lastPayDate = "-"; let hasLast = false;
          if (paidBills.length > 0) {
            const latestPaid = paidBills.sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date))[0];
            lastPayAmount = (Number(latestPaid.amount) + Number(latestPaid.fine_amount || 0)).toLocaleString();
            lastPayDate = formatDate(latestPaid.paid_date);
            hasLast = true;
          }

          setProcessedData({
            totalDue: totalDueSum.toLocaleString(),
            totalFine: totalFineSum.toLocaleString(), // State එක Update කිරීම
            dueDate: formatDate(nextDueDate),
            daysRemaining: daysRem,
            lastPaymentAmount: lastPayAmount,
            lastPaymentDate: lastPayDate,
            status: currentStatus,
            hasPending: dueBills.length > 0,
            hasLastPayment: hasLast
          });
        } else {
          // No payments at all
          const today = new Date();
          const nextMonthFirst = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          setProcessedData(prev => ({
            ...prev,
            dueDate: formatDate(nextMonthFirst),
            daysRemaining: calculateDaysRemaining(nextMonthFirst)
          }));
        }
      } catch (error) {
        console.error("Error fetching payment summary:", error);
        toast.error("Failed to load summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-8">Loading summary...</div>;

  return (
    <div className="w-full">
      
      {/* 🔴 CRITICAL WARNING BANNER (Shows after grace period) */}
      {processedData.status === 'CRITICAL' && (
        <div className="w-full bg-red-600/10 border-2 border-red-500 rounded-xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-lg">
          <div className="p-3 bg-red-500 rounded-full text-white shrink-0 animate-pulse">
            <MdWarning className="text-3xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-500 uppercase tracking-wide mb-1">Final Warning: Action Required</h3>
            <p className="text-gray-700 leading-relaxed">
              Your payment is past the grace period and a late fee has been applied. 
              Your total due is <span className="font-bold text-red-600 text-lg">Rs. {processedData.totalDue}</span>
              
              {/* Fine එක 0ට වඩා වැඩියි නම් විතරක් මේ කෑල්ල පෙන්නනවා */}
              {processedData.totalFine !== "0" && (
                  <span className="text-sm text-red-500 font-bold ml-1 bg-red-100 px-2 py-0.5 rounded-full">
                      (Includes Rs. {processedData.totalFine} Late Fee)
                  </span>
              )}. 
              <br className="hidden md:block" />
              Please settle this amount immediately to avoid further actions from the administration.
            </p>
          </div>
        </div>
      )}

      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* 1. Total Due Card */}
        <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-gray-400 uppercase">Total Due</span>
            <h2 className="text-3xl font-serif text-white">Rs. {processedData.totalDue}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${processedData.status === 'CRITICAL' ? 'bg-red-600 animate-pulse' : processedData.status === 'OVERDUE' ? 'bg-orange-500 animate-pulse' : processedData.status === 'PENDING' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
              <span className={`text-[13px] font-medium uppercase tracking-wider ${processedData.status === 'CRITICAL' ? 'text-red-500 font-bold' : processedData.status === 'OVERDUE' ? 'text-orange-500' : processedData.status === 'PENDING' ? 'text-orange-500' : 'text-green-500'}`}>
                  {processedData.status === 'CRITICAL' ? 'OVERDUE' : processedData.status}
              </span>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-full border border-white/10 flex items-center justify-center h-fit">
            <MdCreditCard className="text-2xl text-purple-400" />
          </div>
        </div>

        {/* 2. Due Date Card */}
        <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-gray-400 uppercase">
                {processedData.status === 'NO DUES' ? 'Next Bill Date' : 'Due Date'}
            </span>
            <h2 className="text-3xl font-serif text-white">{processedData.dueDate}</h2>
            <div className="flex items-center gap-2 mt-2">
              {processedData.daysRemaining !== null && (
                <>
                  <span className={`w-2 h-2 rounded-full ${processedData.daysRemaining < 0 ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                  <span className={`text-[13px] font-medium ${processedData.daysRemaining < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                      {processedData.daysRemaining < 0 ? `${Math.abs(processedData.daysRemaining)} days overdue` : processedData.daysRemaining === 0 ? "Today" : `${processedData.daysRemaining} days remaining`}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-full border border-white/10 flex items-center justify-center h-fit">
            <MdCalendarMonth className="text-2xl text-purple-400" />
          </div>
        </div>

        {/* 3. Last Payment Card */}
        <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-gray-400 uppercase">Last Payment</span>
            <h2 className="text-3xl font-serif text-white">Rs. {processedData.lastPaymentAmount}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${processedData.hasLastPayment ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              <span className={`text-[13px] font-medium ${processedData.hasLastPayment ? 'text-green-500' : 'text-gray-500'}`}>
                {processedData.hasLastPayment ? `Paid on ${processedData.lastPaymentDate}` : 'No payment history'}
              </span>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-full border border-white/10 flex items-center justify-center h-fit">
            <MdCheckCircle className="text-2xl text-green-400" />
          </div>
        </div>

      </div>
    </div>
  );
}