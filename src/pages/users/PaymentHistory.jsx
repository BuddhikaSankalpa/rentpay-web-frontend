import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdFileDownload, MdHistory } from 'react-icons/md';
import api from '../../utils/api'; 
import toast from 'react-hot-toast';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullHistory = async () => {
      try {
        const response = await api.get('/payments/my-payments');
        if (response.data) {
          // ගෙවපු ඔක්කොම බිල් ටික ගන්නවා (කිසිම ලිමිට් එකක් නෑ)
          const paidPayments = response.data.filter(p => p.status === 'paid');
          setPayments(paidPayments);
        }
      } catch (error) {
        toast.error("Failed to load full payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchFullHistory();
  }, []);

  return (
    <div className="w-full pb-10">
      
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-gray-800 flex items-center gap-3">
          <MdHistory className="text-blue-600 text-3xl" /> Complete Payment History
        </h2>
        <p className="text-gray-500 mt-2 text-sm">View and download all your past rent payment receipts here.</p>
      </div>

      <div className="w-full bg-[#161121] border border-white/10 rounded-2xl p-8 shadow-xl">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading complete history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 text-[12px] font-bold tracking-widest text-gray-500 uppercase">Billing Month</th>
                  <th className="text-left py-4 text-[12px] font-bold tracking-widest text-gray-500 uppercase">Paid Date</th>
                  <th className="text-left py-4 text-[12px] font-bold tracking-widest text-gray-500 uppercase">Amount Paid</th>
                  <th className="text-left py-4 text-[12px] font-bold tracking-widest text-gray-500 uppercase">Status</th>
                  <th className="text-center py-4 text-[12px] font-bold tracking-widest text-gray-500 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                      No payment history found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => {
                    const totalAmount = Number(payment.amount) + Number(payment.fine_amount);
                    const paidDate = payment.paid_date ? new Date(payment.paid_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

                    return (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-6 font-serif text-white text-lg">{payment.month}</td>
                        <td className="py-6 text-gray-400 text-sm">{paidDate}</td>
                        <td className="py-6 font-serif text-white text-lg">Rs. {totalAmount}</td>
                        <td className="py-6">
                          <div className="flex items-center gap-2 text-green-500 font-medium bg-green-500/10 px-3 py-1 rounded-full w-fit">
                            <MdCheckCircle /> Paid
                          </div>
                        </td>
                        <td className="py-6 text-center">
                          <button 
                            className="p-3 text-purple-400 hover:text-white hover:bg-purple-600 rounded-full transition-all"
                            title="Download Receipt"
                          >
                            <MdFileDownload className="text-xl" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}