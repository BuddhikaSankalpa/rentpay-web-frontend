import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CardIcon = ({ children, color = 'purple' }) => {
  const colors = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    blue:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green:  'bg-green-500/10 border-green-500/20 text-green-400',
    red:    'bg-red-500/10 border-red-500/20 text-red-400',
  };
  return (
    <div className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 ${colors[color]}`}>
      {children}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    'NO DUES':  { dot: 'bg-green-500',              text: 'text-green-400',  label: 'NO DUES'  },
    'PENDING':  { dot: 'bg-orange-400',             text: 'text-orange-400', label: 'PENDING'  },
    'OVERDUE':  { dot: 'bg-orange-500 animate-pulse', text: 'text-orange-500', label: 'OVERDUE'  },
    'CRITICAL': { dot: 'bg-red-500 animate-pulse',  text: 'text-red-500',    label: 'OVERDUE'  },
  };
  const s = map[status] || map['NO DUES'];
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      <span className={`text-[11px] font-semibold tracking-widest uppercase ${s.text}`}>{s.label}</span>
    </div>
  );
};

export default function PaymentCards() {
  const [data, setData] = useState({
    totalDue: '0', totalFine: '0', dueDate: '—',
    daysRemaining: null, lastPaymentAmount: '0',
    lastPaymentDate: '—', status: 'NO DUES',
    hasPending: false, hasLastPayment: false,
  });
  const [loading, setLoading] = useState(true);

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const daysLeft = (d) => {
    if (!d) return null;
    const t = new Date(); t.setHours(0,0,0,0);
    const u = new Date(d); u.setHours(0,0,0,0);
    return Math.ceil((u - t) / 86400000);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: arr } = await api.get('/payments/my-payments');
        if (arr?.length) {
          const due = arr.filter(p => p.status === 'pending' || p.status === 'overdue');
          let totalDue = 0, totalFine = 0, nextDate = null, status = 'NO DUES', days = null;

          if (due.length) {
            totalDue  = due.reduce((s, b) => s + +b.amount + +(b.fine_amount || 0), 0);
            totalFine = due.reduce((s, b) => s + +(b.fine_amount || 0), 0);
            nextDate  = due.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0].due_date;
            days      = daysLeft(nextDate);
            status    = days < -5 ? 'CRITICAL' : days < 0 ? 'OVERDUE' : 'PENDING';
          } else {
            const t = new Date();
            nextDate = new Date(t.getFullYear(), t.getMonth() + 1, 1);
            days = daysLeft(nextDate);
          }

          const paid = arr
            .filter(p => p.status === 'paid' && p.paid_date)
            .sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date));
          const last = paid[0];

          setData({
            totalDue:          totalDue.toLocaleString(),
            totalFine:         totalFine.toLocaleString(),
            dueDate:           fmt(nextDate),
            daysRemaining:     days,
            lastPaymentAmount: last ? (+last.amount + +(last.fine_amount||0)).toLocaleString() : '0',
            lastPaymentDate:   last ? fmt(last.paid_date) : '—',
            status,
            hasPending:        due.length > 0,
            hasLastPayment:    !!last,
          });
        } else {
          const t = new Date();
          const nx = new Date(t.getFullYear(), t.getMonth() + 1, 1);
          setData(prev => ({ ...prev, dueDate: fmt(nx), daysRemaining: daysLeft(nx) }));
        }
      } catch {
        toast.error('Failed to load summary.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 mb-2">
        {[0,1,2].map(i => (
          <div key={i} className="h-32 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const { status, daysRemaining } = data;

  return (
    <div className="w-full mt-5">

      {/* ── CRITICAL BANNER ── */}
      {status === 'CRITICAL' && (
        <div className="w-full mb-5 rounded-2xl border border-red-500/40 bg-red-950/30 backdrop-blur-sm p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="shrink-0 w-11 h-11 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-1">Final Warning: Action Required</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your payment is past the grace period. Total due:{' '}
              <span className="text-white font-semibold">Rs. {data.totalDue}</span>
              {data.totalFine !== '0' && (
                <span className="ml-2 text-xs bg-red-900/50 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                  incl. Rs. {data.totalFine} late fee
                </span>
              )}.
            </p>
          </div>
        </div>
      )}

      {/* ── 3 CARDS — NO top border/line, only card borders ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        {/* 1 · Total Due */}
        <div className="relative bg-[#0e0b1a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 flex justify-between items-start overflow-hidden group hover:border-purple-500/25 transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Total Due</span>
            <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
              Rs. {data.totalDue}
            </h2>
            <StatusBadge status={status} />
          </div>
          <CardIcon color={status === 'CRITICAL' ? 'red' : status === 'NO DUES' ? 'green' : 'purple'}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </CardIcon>
        </div>

        {/* 2 · Due / Next Bill Date */}
        <div className="relative bg-[#0e0b1a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 flex justify-between items-start overflow-hidden hover:border-blue-500/25 transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
              {status === 'NO DUES' ? 'Next Bill Date' : 'Due Date'}
            </span>
            <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
              {data.dueDate}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {daysRemaining !== null && (
                <>
                  <span className={`w-2 h-2 rounded-full ${daysRemaining < 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`} />
                  <span className={`text-[11px] font-medium ${daysRemaining < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {daysRemaining < 0
                      ? `${Math.abs(daysRemaining)} days overdue`
                      : daysRemaining === 0 ? 'Due Today'
                      : `${daysRemaining} days remaining`}
                  </span>
                </>
              )}
            </div>
          </div>
          <CardIcon color="blue">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </CardIcon>
        </div>

        {/* 3 · Last Payment */}
        <div className="relative bg-[#0e0b1a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 flex justify-between items-start overflow-hidden hover:border-green-500/25 transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Last Payment</span>
            <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
              Rs. {data.lastPaymentAmount}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${data.hasLastPayment ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className={`text-[11px] font-medium ${data.hasLastPayment ? 'text-green-400' : 'text-gray-500'}`}>
                {data.hasLastPayment ? `Paid on ${data.lastPaymentDate}` : 'No payment history'}
              </span>
            </div>
          </div>
          <CardIcon color="green">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardIcon>
        </div>

      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { MdCreditCard, MdCalendarMonth, MdCheckCircle, MdWarning } from 'react-icons/md';
// import api from '../utils/api'; 
// import toast from 'react-hot-toast';

// export default function PaymentCards() {
//   const [processedData, setProcessedData] = useState({
//     totalDue: "0", 
//     totalFine: "0", // අලුතින් එකතු කළ State එක
//     dueDate: "-", 
//     daysRemaining: null, 
//     lastPaymentAmount: "0", 
//     lastPaymentDate: "-", 
//     status: "NO DUES", 
//     hasPending: false, 
//     hasLastPayment: false
//   });
  
//   const [loading, setLoading] = useState(true);

//   const formatDate = (dateValue) => {
//     if (!dateValue) return "-";
//     return new Date(dateValue).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//   };

//   const calculateDaysRemaining = (dueDateValue) => {
//     if (!dueDateValue) return null;
//     const today = new Date(); today.setHours(0, 0, 0, 0); 
//     const dueDate = new Date(dueDateValue); dueDate.setHours(0, 0, 0, 0);
//     return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
//   };

//   useEffect(() => {
//     const fetchAndProcessData = async () => {
//       try {
//         const response = await api.get('/payments/my-payments');
//         const paymentsArray = response.data;

//         if (paymentsArray && paymentsArray.length > 0) {
//           const dueBills = paymentsArray.filter(p => p.status === 'pending' || p.status === 'overdue');
          
//           let totalDueSum = 0; 
//           let totalFineSum = 0; // අලුත් විචල්‍යය
//           let nextDueDate = null; 
//           let currentStatus = "NO DUES"; 
//           let daysRem = null;

//           if (dueBills.length > 0) {
//             // මුළු මුදල (Amount + Fine)
//             totalDueSum = dueBills.reduce((sum, bill) => sum + Number(bill.amount) + Number(bill.fine_amount || 0), 0);
            
//             // Fine එක පමණක් වෙන් කර ගැනීම
//             totalFineSum = dueBills.reduce((sum, bill) => sum + Number(bill.fine_amount || 0), 0);

//             const sortedDueBills = dueBills.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
//             nextDueDate = sortedDueBills[0].due_date;
//             daysRem = calculateDaysRemaining(nextDueDate);
            
//             // Status Logic
//             if (daysRem < -5) {
//                 currentStatus = "CRITICAL";
//             } else if (daysRem < 0) {
//                 currentStatus = "OVERDUE";
//             } else {
//                 currentStatus = "PENDING";
//             }
//           } else {
//             // No due bills: next month 1st is the due date
//             const today = new Date();
//             nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
//             daysRem = calculateDaysRemaining(nextDueDate);
//           }

//           // Last payment logic
//           const paidBills = paymentsArray.filter(p => p.status === 'paid' && p.paid_date);
//           let lastPayAmount = "0"; let lastPayDate = "-"; let hasLast = false;
//           if (paidBills.length > 0) {
//             const latestPaid = paidBills.sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date))[0];
//             lastPayAmount = (Number(latestPaid.amount) + Number(latestPaid.fine_amount || 0)).toLocaleString();
//             lastPayDate = formatDate(latestPaid.paid_date);
//             hasLast = true;
//           }

//           setProcessedData({
//             totalDue: totalDueSum.toLocaleString(),
//             totalFine: totalFineSum.toLocaleString(), // State එක Update කිරීම
//             dueDate: formatDate(nextDueDate),
//             daysRemaining: daysRem,
//             lastPaymentAmount: lastPayAmount,
//             lastPaymentDate: lastPayDate,
//             status: currentStatus,
//             hasPending: dueBills.length > 0,
//             hasLastPayment: hasLast
//           });
//         } else {
//           // No payments at all
//           const today = new Date();
//           const nextMonthFirst = new Date(today.getFullYear(), today.getMonth() + 1, 1);
//           setProcessedData(prev => ({
//             ...prev,
//             dueDate: formatDate(nextMonthFirst),
//             daysRemaining: calculateDaysRemaining(nextMonthFirst)
//           }));
//         }
//       } catch (error) {
//         console.error("Error fetching payment summary:", error);
//         toast.error("Failed to load summary.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAndProcessData();
//   }, []);

//   if (loading) return <div className="text-gray-400 text-center py-8">Loading summary...</div>;

//   return (
//     <div className="w-full">
      
//       {/* 🔴 CRITICAL WARNING BANNER (Shows after grace period) */}
//       {processedData.status === 'CRITICAL' && (
//         <div className="w-full bg-red-600/10 border-2 border-red-500 rounded-xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-lg">
//           <div className="p-3 bg-red-500 rounded-full text-white shrink-0 animate-pulse">
//             <MdWarning className="text-3xl" />
//           </div>
//           <div className="flex-1">
//             <h3 className="text-xl font-bold text-red-500 uppercase tracking-wide mb-1">Final Warning: Action Required</h3>
//             <p className="text-gray-700 leading-relaxed">
//               Your payment is past the grace period and a late fee has been applied. 
//               Your total due is <span className="font-bold text-red-600 text-lg">Rs. {processedData.totalDue}</span>
              
//               {/* Fine එක 0ට වඩා වැඩියි නම් විතරක් මේ කෑල්ල පෙන්නනවා */}
//               {processedData.totalFine !== "0" && (
//                   <span className="text-sm text-red-500 font-bold ml-1 bg-red-100 px-2 py-0.5 rounded-full">
//                       (Includes Rs. {processedData.totalFine} Late Fee)
//                   </span>
//               )}. 
//               <br className="hidden md:block" />
//               Please settle this amount immediately to avoid further actions from the administration.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Cards Row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
//         {/* 1. Total Due Card */}
//         <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex justify-between">
//           <div className="flex flex-col gap-2">
//             <span className="text-[12px] font-bold text-gray-400 uppercase">Total Due</span>
//             <h2 className="text-3xl font-serif text-white">Rs. {processedData.totalDue}</h2>
//             <div className="flex items-center gap-2 mt-2">
//               <span className={`w-2 h-2 rounded-full ${processedData.status === 'CRITICAL' ? 'bg-red-600 animate-pulse' : processedData.status === 'OVERDUE' ? 'bg-orange-500 animate-pulse' : processedData.status === 'PENDING' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
//               <span className={`text-[13px] font-medium uppercase tracking-wider ${processedData.status === 'CRITICAL' ? 'text-red-500 font-bold' : processedData.status === 'OVERDUE' ? 'text-orange-500' : processedData.status === 'PENDING' ? 'text-orange-500' : 'text-green-500'}`}>
//                   {processedData.status === 'CRITICAL' ? 'OVERDUE' : processedData.status}
//               </span>
//             </div>
//           </div>
//           <div className="bg-white/5 p-3 rounded-full border border-white/10 flex items-center justify-center h-fit">
//             <MdCreditCard className="text-2xl text-purple-400" />
//           </div>
//         </div>

//         {/* 2. Due Date Card */}
//         <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex justify-between">
//           <div className="flex flex-col gap-2">
//             <span className="text-[12px] font-bold text-gray-400 uppercase">
//                 {processedData.status === 'NO DUES' ? 'Next Bill Date' : 'Due Date'}
//             </span>
//             <h2 className="text-3xl font-serif text-white">{processedData.dueDate}</h2>
//             <div className="flex items-center gap-2 mt-2">
//               {processedData.daysRemaining !== null && (
//                 <>
//                   <span className={`w-2 h-2 rounded-full ${processedData.daysRemaining < 0 ? 'bg-red-500' : 'bg-blue-500'}`}></span>
//                   <span className={`text-[13px] font-medium ${processedData.daysRemaining < 0 ? 'text-red-400' : 'text-blue-400'}`}>
//                       {processedData.daysRemaining < 0 ? `${Math.abs(processedData.daysRemaining)} days overdue` : processedData.daysRemaining === 0 ? "Today" : `${processedData.daysRemaining} days remaining`}
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//           <div className="bg-white/5 p-3 rounded-full border border-white/10 flex items-center justify-center h-fit">
//             <MdCalendarMonth className="text-2xl text-purple-400" />
//           </div>
//         </div>

//         {/* 3. Last Payment Card */}
//         <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex justify-between">
//           <div className="flex flex-col gap-2">
//             <span className="text-[12px] font-bold text-gray-400 uppercase">Last Payment</span>
//             <h2 className="text-3xl font-serif text-white">Rs. {processedData.lastPaymentAmount}</h2>
//             <div className="flex items-center gap-2 mt-2">
//               <span className={`w-2 h-2 rounded-full ${processedData.hasLastPayment ? 'bg-green-500' : 'bg-gray-500'}`}></span>
//               <span className={`text-[13px] font-medium ${processedData.hasLastPayment ? 'text-green-500' : 'text-gray-500'}`}>
//                 {processedData.hasLastPayment ? `Paid on ${processedData.lastPaymentDate}` : 'No payment history'}
//               </span>
//             </div>
//           </div>
//           <div className="bg-white/5 p-3 rounded-full border border-white/10 flex items-center justify-center h-fit">
//             <MdCheckCircle className="text-2xl text-green-400" />
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }