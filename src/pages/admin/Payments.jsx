import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MdCall, MdWarning } from 'react-icons/md';
import api from '../../utils/api'; 

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllPayments = async () => {
    try {
      const response = await api.get('/payments/all');
      if (response.data && response.data.payments) setPayments(response.data.payments);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllPayments(); }, []);

  const handleApprove = async (paymentId, method = null) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) return;
    try {
      await api.put(`/payments/${paymentId}/approve`, { paymentMethod: method });
      toast.success('Payment approved successfully!');
      fetchAllPayments(); 
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const getStatusBadge = (payment) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (payment.due_date) {
      const dueDate = new Date(payment.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      const graceEnd = new Date(dueDate);
      graceEnd.setDate(graceEnd.getDate() + 5);

      // Grace Period එකත් ඉවර නම්
      if ((payment.status === 'pending' || payment.status === 'overdue') && today > graceEnd) {
        return <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold shadow-sm animate-pulse flex items-center gap-1 w-max"><MdWarning/> Critical: Call</span>;
      }
      // Due Date එක පහු වෙලා නම්
      if ((payment.status === 'pending' || payment.status === 'overdue') && today > dueDate) {
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Overdue</span>;
      }
    }

    switch(payment.status) {
      case 'paid': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span>;
      case 'pending_verification': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium animate-pulse">Needs Approval</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Pending</span>;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Management</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase"><th className="p-4">Student / Room</th><th className="p-4">Month</th><th className="p-4">Amount (Rs.)</th><th className="p-4">Method & Ref</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{payment.users ? `${payment.users.first_name} ${payment.users.last_name}` : 'Unknown'}</div>
                      <div className="text-xs text-gray-500 flex flex-col gap-1 mt-1">
                        <span>Room: <span className="font-semibold">{payment.rooms ? payment.rooms.room_number : 'N/A'}</span></span>
                        <span className="text-indigo-600 font-medium flex items-center gap-1"><MdCall className="text-sm"/> {payment.users?.phone_number || 'No Phone'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900 font-medium">{payment.month}</div>
                      <div className="text-xs text-gray-500">Due: {new Date(payment.due_date).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900 font-bold">{(Number(payment.amount) + Number(payment.fine_amount)).toLocaleString()}</div>
                      {payment.fine_amount > 0 && <div className="text-xs text-red-500 font-bold">Includes {payment.fine_amount} Fine</div>}
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900 text-sm">{payment.payment_method || '-'}</div>
                    </td>
                    <td className="p-4">{getStatusBadge(payment)}</td>
                    <td className="p-4 flex gap-2">
                      {payment.status === 'pending_verification' && (
                        <button onClick={() => handleApprove(payment.id)} className="text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 text-sm rounded-lg">Approve</button>
                      )}
                      {(payment.status === 'pending' || payment.status === 'overdue') && (
                        <button onClick={() => handleApprove(payment.id, 'Cash')} className="text-gray-600 bg-gray-100 px-3 py-1.5 text-xs rounded-lg border">Mark Paid (Cash)</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}