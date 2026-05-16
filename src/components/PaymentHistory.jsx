import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const StatusChip = ({ status }) => {
  const map = {
    paid:                 { bg: 'bg-green-950/40',  border: 'border-green-500/20', text: 'text-green-400',  label: 'Paid' },
    pending:              { bg: 'bg-orange-950/30', border: 'border-orange-500/20',text: 'text-orange-400', label: 'Pending' },
    overdue:              { bg: 'bg-red-950/30',    border: 'border-red-500/20',   text: 'text-red-400',    label: 'Overdue' },
    pending_verification: { bg: 'bg-blue-950/30',   border: 'border-blue-500/20',  text: 'text-blue-400',   label: 'Verifying' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.text.replace('text-', 'bg-')} ${status === 'overdue' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  );
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/payments/my-payments');
        if (data) {
          const paid = data
            .filter(p => p.status === 'paid')
            .sort((a, b) => new Date(b.paid_date || b.due_date) - new Date(a.paid_date || a.due_date))
            .slice(0, 6);
          setPayments(paid);
        }
      } catch (err) {
        console.error('Error fetching history', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="relative w-full bg-[#0e0b1a]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-8 shadow-xl mt-6 overflow-hidden hover:border-purple-500/10 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-purple-500/60" />
          <h3 className="text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase">Recent Payments</h3>
        </div>
        <button
          onClick={() => navigate('/payment-history')}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-purple-400 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-purple-500/20 px-3 py-2 rounded-lg transition-all duration-200"
        >
          View All
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="relative z-10 overflow-x-auto">
        {loading ? (
          <div className="space-y-3">
            {[0,1,2].map(i => (
              <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">No payment history yet</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase pb-3 pr-4">Month</th>
                <th className="text-left text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase pb-3 pr-4 hidden sm:table-cell">Due Date</th>
                <th className="text-left text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase pb-3 pr-4">Amount</th>
                <th className="text-left text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase pb-3 hidden md:table-cell">Paid On</th>
                <th className="text-right text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr
                  key={p.id || i}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-4 pr-4">
                    <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                      {p.month}
                    </span>
                  </td>
                  <td className="py-4 pr-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-500">{fmt(p.due_date)}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                      Rs. {(+p.amount + +(p.fine_amount || 0)).toLocaleString()}
                    </span>
                    {+p.fine_amount > 0 && (
                      <span className="ml-2 text-[10px] text-red-400/70">+{Number(p.fine_amount).toLocaleString()} fine</span>
                    )}
                  </td>
                  <td className="py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-500">{fmt(p.paid_date)}</span>
                  </td>
                  <td className="py-4 text-right">
                    <StatusChip status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { MdCheckCircle, MdChevronRight } from 'react-icons/md';
// import { useNavigate } from 'react-router-dom';
// import api from '../utils/api'; 

// export default function RecentPayments() {
//   const [payments, setPayments] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const response = await api.get('/payments/my-payments');
//         if (response.data) {
//           // ගෙවපු බිල් විතරක් වෙන් කරගන්නවා
//           const paidPayments = response.data.filter(p => p.status === 'paid');
//           // අලුත්ම බිල් 6 විතරක් ගන්නවා (slice)
//           setPayments(paidPayments.slice(0, 6)); 
//         }
//       } catch (error) {
//         console.error("Error fetching history:", error);
//       }
//     };
//     fetchHistory();
//   }, []);

//   return (
//     <div className="w-full bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl mt-8">
//       <div className="flex justify-between items-center mb-8">
//         <h3 className="text-[14px] font-bold tracking-[0.2em] text-gray-400 uppercase">
//           Recent Payments
//         </h3>
//         {/* View All Button - මේක එබුවම Payment History එකට යනවා */}
//         <button 
//           onClick={() => navigate('/payment-history')}
//           className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium border border-white/5"
//         >
//           View All <MdChevronRight className="text-xl" />
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           {/* ... (කලින් තිබ්බ Table කෝඩ් එකමයි) ... */}
//           <tbody>
//             {payments.map((payment) => (
//               <tr key={payment.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
//                 <td className="py-4 font-serif text-white">{payment.month}</td>
//                 <td className="py-4 font-serif text-white">Rs. {Number(payment.amount) + Number(payment.fine_amount)}</td>
//                 <td className="py-4">
//                   <div className="flex items-center gap-2 text-green-500 font-medium text-sm">
//                     <MdCheckCircle /> Paid
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }