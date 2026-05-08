import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdChevronRight } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; 

export default function RecentPayments() {
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/payments/my-payments');
        if (response.data) {
          // ගෙවපු බිල් විතරක් වෙන් කරගන්නවා
          const paidPayments = response.data.filter(p => p.status === 'paid');
          // අලුත්ම බිල් 6 විතරක් ගන්නවා (slice)
          setPayments(paidPayments.slice(0, 6)); 
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="w-full bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl mt-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[14px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          Recent Payments
        </h3>
        {/* View All Button - මේක එබුවම Payment History එකට යනවා */}
        <button 
          onClick={() => navigate('/payment-history')}
          className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium border border-white/5"
        >
          View All <MdChevronRight className="text-xl" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* ... (කලින් තිබ්බ Table කෝඩ් එකමයි) ... */}
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 font-serif text-white">{payment.month}</td>
                <td className="py-4 font-serif text-white">Rs. {Number(payment.amount) + Number(payment.fine_amount)}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2 text-green-500 font-medium text-sm">
                    <MdCheckCircle /> Paid
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}