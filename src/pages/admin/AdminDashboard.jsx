import React, { useState, useEffect } from 'react';
import { 
  MdAccountBalanceWallet, MdPendingActions, 
  MdMeetingRoom, MdBuild, MdTrendingUp,
  MdWarning, MdCheckCircle, MdCall 
} from 'react-icons/md';
import api from '../../utils/api'; 
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    availableBeds: 0,
    activeTickets: 0,
    pendingApprovals: 0,
    overdueAccounts: 0,
    actionRequired: 0 
  });

  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [paymentsRes, roomsRes, maintenanceRes] = await Promise.all([
          api.get('/payments/all'),    
          api.get('/properties'),      
          api.get('/maintenance').catch(() => ({ data: [] }))
        ]);

        const allPayments = Array.isArray(paymentsRes.data) ? paymentsRes.data : (paymentsRes.data?.payments || []);
        const allRooms = Array.isArray(roomsRes.data) ? roomsRes.data : (roomsRes.data?.properties || roomsRes.data?.rooms || []);
        const allTickets = Array.isArray(maintenanceRes.data) ? maintenanceRes.data : (maintenanceRes.data?.tickets || maintenanceRes.data?.maintenance || []);

        let revenue = 0;
        let pending = 0;
        let approvals = 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueUsers = new Set();
        const criticalUsers = new Set(); 
        const paidList = [];

        allPayments.forEach(p => {
          const total = Number(p.amount || 0) + Number(p.fine_amount || 0);
          
          if (p.status === 'paid') {
            revenue += total;
            paidList.push(p);
          } else if (p.status === 'pending' || p.status === 'unpaid' || p.status === 'overdue') {
            pending += total;
            
            let isOverdue = false;
            let isCritical = false;
            
            if (p.due_date) {
              const dueDate = new Date(p.due_date);
              dueDate.setHours(0, 0, 0, 0);
              
              const gracePeriodEnd = new Date(dueDate);
              gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);

              if (today.getTime() > gracePeriodEnd.getTime()) {
                isCritical = true;
                isOverdue = true;
              } else if (today.getTime() > dueDate.getTime()) {
                isOverdue = true;
              }
            }

            if (p.status === 'overdue') {
              isOverdue = true;
            }

            if (isCritical && p.user_id) {
              criticalUsers.add(p.user_id);
            } else if (isOverdue && p.user_id) {
              overdueUsers.add(p.user_id);
            }
          } else if (p.status === 'pending_verification') {
            approvals += 1;
          }
        });

        const sortedPaid = paidList.sort((a, b) => new Date(b.paid_date || b.created_at) - new Date(a.paid_date || a.created_at));
        setRecentPayments(sortedPaid.slice(0, 5));

        let availableBedsCount = 0;
        allRooms.forEach(r => {
          if (r.capacity) {
            const totalBeds = Number(r.capacity);
            const occupiedBeds = Number(r.occupant_count || 0);
            const freeBeds = totalBeds - occupiedBeds; 
            
            if (freeBeds > 0) {
              availableBedsCount += freeBeds;
            }
          }
        });

        const activeMaint = allTickets.filter(t => t.status !== 'resolved' && t.status !== 'completed' && t.status !== 'closed').length;

        setStats({
          totalRevenue: revenue,
          pendingAmount: pending,
          availableBeds: availableBedsCount,
          activeTickets: activeMaint,
          pendingApprovals: approvals,
          overdueAccounts: overdueUsers.size,
          actionRequired: criticalUsers.size 
        });

      } catch (error) {
        console.error("Error fetching admin stats:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#09090e]">
        <div className="w-10 h-10 border-4 border-[#4a3975]/30 border-t-[#805ad5] rounded-full animate-spin"></div>
        <p className="mt-4 text-[#8a8a9d] font-medium tracking-wide">Summoning Data...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#09090e] text-gray-200">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-100 uppercase tracking-widest">Admin Dashboard</h2>
        <p className="text-sm text-[#8a8a9d] mt-2 italic border-l-2 border-[#5b3e96] pl-3">"Discipline. Dedication. Due payments."</p>
      </div>

      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-[#12121a] rounded-xl p-6 shadow-lg border border-[#232333] flex items-center justify-between hover:border-[#4a3975] transition-colors">
          <div>
            <p className="text-[10px] font-bold text-[#6d6d88] uppercase tracking-[0.15em] mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-100">Rs. {stats.totalRevenue.toLocaleString()}</h3>
            <span className="text-xs font-medium text-[#10b981] flex items-center gap-1 mt-2">
              <MdTrendingUp /> From paid invoices
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981] text-2xl border border-[#10b981]/20">
            <MdAccountBalanceWallet />
          </div>
        </div>

        {/* Pending Dues Card */}
        <div className="bg-[#12121a] rounded-xl p-6 shadow-lg border border-[#232333] flex items-center justify-between hover:border-[#4a3975] transition-colors">
          <div>
            <p className="text-[10px] font-bold text-[#6d6d88] uppercase tracking-[0.15em] mb-1">Pending Dues</p>
            <h3 className="text-2xl font-bold text-gray-100">Rs. {stats.pendingAmount.toLocaleString()}</h3>
            <span className="text-xs font-medium text-[#f59e0b] mt-2 block">
              Needs collection
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] text-2xl border border-[#f59e0b]/20">
            <MdPendingActions />
          </div>
        </div>

        {/* Available Beds Card */}
        <div className="bg-[#12121a] rounded-xl p-6 shadow-lg border border-[#232333] flex items-center justify-between hover:border-[#4a3975] transition-colors">
          <div>
            <p className="text-[10px] font-bold text-[#6d6d88] uppercase tracking-[0.15em] mb-1">Available Beds</p>
            <h3 className="text-2xl font-bold text-gray-100">{stats.availableBeds}</h3>
            <span className="text-xs font-medium text-[#8b5cf6] mt-2 block">
              Ready for new students
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] text-2xl border border-[#8b5cf6]/20">
            <MdMeetingRoom />
          </div>
        </div>

        {/* Active Issues Card */}
        <div className="bg-[#12121a] rounded-xl p-6 shadow-lg border border-[#232333] flex items-center justify-between hover:border-[#4a3975] transition-colors">
          <div>
            <p className="text-[10px] font-bold text-[#6d6d88] uppercase tracking-[0.15em] mb-1">Maintenance</p>
            <h3 className="text-2xl font-bold text-gray-100">{stats.activeTickets}</h3>
            <span className="text-xs font-medium text-[#ef4444] mt-2 block">
              Unresolved tickets
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444] text-2xl border border-[#ef4444]/20">
            <MdBuild />
          </div>
        </div>
      </div>

      {/* 2. Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Payments Table */}
        <div className="lg:col-span-2 bg-[#12121a] rounded-xl shadow-lg border border-[#232333] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif tracking-wide text-gray-100 uppercase">Recent Transactions</h3>
            <button className="text-sm font-medium text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2a3d] text-[#6d6d88] text-[10px] uppercase tracking-widest">
                  <th className="pb-3 font-bold">Student</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-[#6d6d88] text-sm italic">
                      No recent transactions found.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((payment) => {
                    const totalAmt = Number(payment.amount) + Number(payment.fine_amount || 0);
                    const dateStr = payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : 'N/A';
                    
                    return (
                      <tr key={payment.id} className="border-b border-[#1b1b26] hover:bg-[#161622] transition-colors">
                        <td className="py-4">
                          <div className="font-medium text-gray-200 text-sm">
                            {payment.users?.first_name ? `${payment.users.first_name} ${payment.users.last_name}` : `Student ID: ${payment.user_id}`}
                          </div>
                          <div className="text-xs text-[#8a8a9d] mt-1">
                            {payment.rooms?.room_number ? `Room ${payment.rooms.room_number}` : payment.month}
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-gray-200 text-sm tracking-wider">Rs. {totalAmt.toLocaleString()}</td>
                        <td className="py-4 text-xs text-[#8a8a9d]">{dateStr}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] rounded text-[10px] font-bold uppercase tracking-widest">
                            Paid
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Alerts - Darkened Purple Vibe */}
        <div className="bg-[#1a132c] border border-[#2d224b] rounded-xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#4c1d95]/20 rounded-full blur-3xl"></div>
          
          <h3 className="text-lg font-serif tracking-wide text-gray-100 uppercase mb-6 relative z-10">Quick Actions</h3>
          
          <div className="space-y-4 relative z-10">
            
            {stats.actionRequired > 0 && (
              <div className="bg-[#450a0a] border border-[#7f1d1d] p-4 rounded-lg flex items-start gap-3 shadow-md animate-pulse">
                <MdCall className="text-2xl text-[#fca5a5] shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-[#fca5a5] uppercase tracking-wide">{stats.actionRequired} Calls Required</h4>
                  <p className="text-xs text-[#fecaca] mt-1 opacity-80">Students exceeded grace period. Contact immediately.</p>
                </div>
              </div>
            )}

            {stats.pendingApprovals > 0 ? (
              <div className="bg-[#24173d] border border-[#4a3473] p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm">
                <MdPendingActions className="text-2xl text-[#c4b5fd] shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-[#c4b5fd] uppercase tracking-wide">{stats.pendingApprovals} Pending Approvals</h4>
                  <p className="text-xs text-[#a78bfa] mt-1 opacity-80">Students uploaded bank slips. Please review.</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] border border-[#232333] p-4 rounded-lg flex items-start gap-3 opacity-80">
                <MdCheckCircle className="text-2xl text-[#10b981] shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-[#10b981] uppercase tracking-wide">No Pending Slips</h4>
                  <p className="text-xs text-[#6d6d88] mt-1">All payments verified.</p>
                </div>
              </div>
            )}

            {stats.overdueAccounts > 0 ? (
              <div className="bg-[#3b1c1c] border border-[#7c2d12] p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm">
                <MdWarning className="text-2xl text-[#fb923c] shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-semibold text-sm text-[#fb923c] uppercase tracking-wide">{stats.overdueAccounts} Overdue Accounts</h4>
                  <p className="text-xs text-[#fdba74] mt-1 opacity-80">Passed payment deadline.</p>
                </div>
              </div>
            ) : (
              stats.actionRequired === 0 && (
                <div className="bg-[#12121a] border border-[#232333] p-4 rounded-lg flex items-start gap-3 opacity-80">
                  <MdCheckCircle className="text-2xl text-[#10b981] shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#10b981] uppercase tracking-wide">No Overdue Payments</h4>
                    <p className="text-xs text-[#6d6d88] mt-1">Payments are up to date.</p>
                  </div>
                </div>
              )
            )}

            {stats.activeTickets > 0 ? (
              <div className="bg-[#24173d] border border-[#4a3473] p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm">
                <MdBuild className="text-2xl text-[#c4b5fd] shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-[#c4b5fd] uppercase tracking-wide">{stats.activeTickets} Unresolved Tickets</h4>
                  <p className="text-xs text-[#a78bfa] mt-1 opacity-80">Maintenance requests pending.</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] border border-[#232333] p-4 rounded-lg flex items-start gap-3 opacity-80">
                <MdCheckCircle className="text-2xl text-[#10b981] shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-[#10b981] uppercase tracking-wide">Maintenance Clear</h4>
                  <p className="text-xs text-[#6d6d88] mt-1">No issues reported.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { 
//   MdAccountBalanceWallet, MdPendingActions, 
//   MdMeetingRoom, MdBuild, MdTrendingUp,
//   MdWarning, MdCheckCircle, MdCall // MdCall අලුතින් එකතු කළා
// } from 'react-icons/md';
// import api from '../../utils/api'; 
// import toast from 'react-hot-toast';

// export default function AdminDashboard() {
//   const [stats, setStats] = useState({
//     totalRevenue: 0,
//     pendingAmount: 0,
//     availableBeds: 0,
//     activeTickets: 0,
//     pendingApprovals: 0,
//     overdueAccounts: 0,
//     actionRequired: 0 // අලුතින් එකතු කළා (Call ගන්න ඕන ගාණ)
//   });

//   const [recentPayments, setRecentPayments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const [paymentsRes, roomsRes, maintenanceRes] = await Promise.all([
//           api.get('/payments/all'),    
//           api.get('/properties'),      
//           api.get('/maintenance').catch(() => ({ data: [] }))
//         ]);

//         const allPayments = Array.isArray(paymentsRes.data) ? paymentsRes.data : (paymentsRes.data?.payments || []);
//         const allRooms = Array.isArray(roomsRes.data) ? roomsRes.data : (roomsRes.data?.properties || roomsRes.data?.rooms || []);
//         const allTickets = Array.isArray(maintenanceRes.data) ? maintenanceRes.data : (maintenanceRes.data?.tickets || maintenanceRes.data?.maintenance || []);

//         let revenue = 0;
//         let pending = 0;
//         let approvals = 0;
        
//         // අද දිනය ගන්නවා වෙලාව අයින් කරලා (Date comparison වලට ලේසි වෙන්න)
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // එකම ළමයා දෙපාරක් ගණන් නොහැදෙන්න Set එකක් පාවිච්චි කරනවා
//         const overdueUsers = new Set();
//         const criticalUsers = new Set(); // NEW: දවස් 15 පහු වුණ ළමයි වෙනම ගන්න
//         const paidList = [];

//         allPayments.forEach(p => {
//           const total = Number(p.amount || 0) + Number(p.fine_amount || 0);
          
//           if (p.status === 'paid') {
//             revenue += total;
//             paidList.push(p);
//           } else if (p.status === 'pending' || p.status === 'unpaid' || p.status === 'overdue') {
//             pending += total;
            
//             // --- අලුත් Overdue Logic එක + Call Logic ---
//             let isOverdue = false;
//             let isCritical = false;
            
//             if (p.due_date) {
//               const dueDate = new Date(p.due_date);
//               dueDate.setHours(0, 0, 0, 0);
              
//               const gracePeriodEnd = new Date(dueDate);
//               gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);

//               // 1. දවස් 15 පහු වෙලා නම් (Grace period ඉවරයි - Critical)
//               if (today.getTime() > gracePeriodEnd.getTime()) {
//                 isCritical = true;
//                 isOverdue = true;
//               } 
//               // 2. දවස් 10-15 අතර නම් (Overdue විතරයි)
//               else if (today.getTime() > dueDate.getTime()) {
//                 isOverdue = true;
//               }
//             }

//             // 3. Status එක කෙලින්ම overdue ආවත් Overdue එකට ගන්නවා
//             if (p.status === 'overdue') {
//               isOverdue = true;
//             }

//             // ළමයාගේ ID එක අදාළ Set එකට දානවා (Duplicate නොවෙන්න)
//             if (isCritical && p.user_id) {
//               criticalUsers.add(p.user_id);
//             } else if (isOverdue && p.user_id) {
//               // Critical වුණ අයව සාමාන්‍ය Overdue එකේ පෙන්නන්නෙ නෑ
//               overdueUsers.add(p.user_id);
//             }
//             // -----------------------------

//           } else if (p.status === 'pending_verification') {
//             approvals += 1;
//           }
//         });

//         const sortedPaid = paidList.sort((a, b) => new Date(b.paid_date || b.created_at) - new Date(a.paid_date || a.created_at));
//         setRecentPayments(sortedPaid.slice(0, 5));

//         let availableBedsCount = 0;
//         allRooms.forEach(r => {
//           if (r.capacity) {
//             const totalBeds = Number(r.capacity);
//             const occupiedBeds = Number(r.occupant_count || 0);
//             const freeBeds = totalBeds - occupiedBeds; 
            
//             if (freeBeds > 0) {
//               availableBedsCount += freeBeds;
//             }
//           }
//         });

//         const activeMaint = allTickets.filter(t => t.status !== 'resolved' && t.status !== 'completed' && t.status !== 'closed').length;

//         setStats({
//           totalRevenue: revenue,
//           pendingAmount: pending,
//           availableBeds: availableBedsCount,
//           activeTickets: activeMaint,
//           pendingApprovals: approvals,
//           overdueAccounts: overdueUsers.size,
//           actionRequired: criticalUsers.size // NEW
//         });

//       } catch (error) {
//         console.error("Error fetching admin stats:", error);
//         toast.error("Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="w-full h-screen flex flex-col items-center justify-center">
//         <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
//         <p className="mt-4 text-gray-500 font-medium">Loading Dashboard Data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="mb-8">
//         <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
//         <p className="text-sm text-gray-500 mt-1">Overview of your boarding house for this month.</p>
//       </div>

//       {/* 1. Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {/* Revenue Card */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
//             <h3 className="text-2xl font-bold text-gray-800">Rs. {stats.totalRevenue.toLocaleString()}</h3>
//             <span className="text-xs font-medium text-green-500 flex items-center gap-1 mt-2">
//               <MdTrendingUp /> From paid invoices
//             </span>
//           </div>
//           <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-2xl">
//             <MdAccountBalanceWallet />
//           </div>
//         </div>

//         {/* Pending Dues Card */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Dues</p>
//             <h3 className="text-2xl font-bold text-gray-800">Rs. {stats.pendingAmount.toLocaleString()}</h3>
//             <span className="text-xs font-medium text-orange-500 mt-2 block">
//               Needs collection
//             </span>
//           </div>
//           <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-2xl">
//             <MdPendingActions />
//           </div>
//         </div>

//         {/* Available Beds Card */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Available Beds</p>
//             <h3 className="text-2xl font-bold text-gray-800">{stats.availableBeds}</h3>
//             <span className="text-xs font-medium text-blue-500 mt-2 block">
//               Ready for new students
//             </span>
//           </div>
//           <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-2xl">
//             <MdMeetingRoom />
//           </div>
//         </div>

//         {/* Active Issues Card */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Maintenance</p>
//             <h3 className="text-2xl font-bold text-gray-800">{stats.activeTickets}</h3>
//             <span className="text-xs font-medium text-red-500 mt-2 block">
//               Unresolved tickets
//             </span>
//           </div>
//           <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-2xl">
//             <MdBuild />
//           </div>
//         </div>
//       </div>

//       {/* 2. Bottom Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* Recent Payments Table */}
//         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
//             <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</button>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
//                   <th className="pb-3 font-semibold">Student</th>
//                   <th className="pb-3 font-semibold">Amount</th>
//                   <th className="pb-3 font-semibold">Date</th>
//                   <th className="pb-3 font-semibold">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentPayments.length === 0 ? (
//                   <tr>
//                     <td colSpan="4" className="py-8 text-center text-gray-500 text-sm">
//                       No recent transactions found.
//                     </td>
//                   </tr>
//                 ) : (
//                   recentPayments.map((payment) => {
//                     const totalAmt = Number(payment.amount) + Number(payment.fine_amount || 0);
//                     const dateStr = payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : 'N/A';
                    
//                     return (
//                       <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50/50">
//                         <td className="py-4">
//                           <div className="font-medium text-gray-800 text-sm">
//                             {payment.users?.first_name ? `${payment.users.first_name} ${payment.users.last_name}` : `Student ID: ${payment.user_id}`}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {payment.rooms?.room_number ? `Room ${payment.rooms.room_number}` : payment.month}
//                           </div>
//                         </td>
//                         <td className="py-4 font-semibold text-gray-800 text-sm">Rs. {totalAmt.toLocaleString()}</td>
//                         <td className="py-4 text-xs text-gray-500">{dateStr}</td>
//                         <td className="py-4">
//                           <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase tracking-wider">
//                             Paid
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Quick Alerts */}
//         <div className="bg-indigo-600 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
//           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
//           <h3 className="text-lg font-bold mb-6 relative z-10">Quick Actions Needed</h3>
          
//           <div className="space-y-4 relative z-10">
            
//             {/* NEW: 0. Call Required Warning (15 වෙනිදායින් පසු) */}
//             {stats.actionRequired > 0 && (
//               <div className="bg-red-500 border border-red-400 p-4 rounded-lg flex items-start gap-3 shadow-lg animate-pulse">
//                 <MdCall className="text-2xl text-white shrink-0" />
//                 <div>
//                   <h4 className="font-bold text-sm text-white">{stats.actionRequired} Calls Required</h4>
//                   <p className="text-xs text-red-100 mt-1">Students exceeded the grace period. Contact them immediately.</p>
//                 </div>
//               </div>
//             )}

//             {/* 1. Pending Approvals */}
//             {stats.pendingApprovals > 0 ? (
//               <div className="bg-white/10 border border-white/20 p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm">
//                 <MdPendingActions className="text-2xl text-orange-300 shrink-0" />
//                 <div>
//                   <h4 className="font-semibold text-sm">{stats.pendingApprovals} Pending Approvals</h4>
//                   <p className="text-xs text-indigo-200 mt-1">Students have uploaded bank slips. Please review them.</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm opacity-70">
//                 <MdCheckCircle className="text-2xl text-green-300 shrink-0" />
//                 <div>
//                   <h4 className="font-semibold text-sm text-green-300">No Pending Slips</h4>
//                   <p className="text-xs text-indigo-200 mt-1">All payments are verified.</p>
//                 </div>
//               </div>
//             )}

//             {/* 2. Overdue Accounts */}
//             {stats.overdueAccounts > 0 ? (
//               <div className="bg-orange-500/20 border border-orange-400/40 p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm">
//                 <MdWarning className="text-2xl text-orange-300 shrink-0 animate-pulse" />
//                 <div>
//                   <h4 className="font-semibold text-sm text-orange-100">{stats.overdueAccounts} Overdue Accounts</h4>
//                   <p className="text-xs text-orange-200/80 mt-1">Students have passed their payment deadline.</p>
//                 </div>
//               </div>
//             ) : (
//               // මේක පෙන්නන්නේ Overdue 0යි, Call Required 0යි වුණොත් විතරයි
//               stats.actionRequired === 0 && (
//                 <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm opacity-70">
//                   <MdCheckCircle className="text-2xl text-green-300 shrink-0" />
//                   <div>
//                     <h4 className="font-semibold text-sm text-green-300">No Overdue Payments</h4>
//                     <p className="text-xs text-indigo-200 mt-1">All student payments are up to date.</p>
//                   </div>
//                 </div>
//               )
//             )}

//             {/* 3. Active Tickets */}
//             {stats.activeTickets > 0 ? (
//               <div className="bg-white/10 border border-white/20 p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm">
//                 <MdBuild className="text-2xl text-orange-300 shrink-0" />
//                 <div>
//                   <h4 className="font-semibold text-sm">{stats.activeTickets} Unresolved Tickets</h4>
//                   <p className="text-xs text-indigo-200 mt-1">Maintenance requests are pending.</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-start gap-3 backdrop-blur-sm opacity-70">
//                 <MdCheckCircle className="text-2xl text-green-300 shrink-0" />
//                 <div>
//                   <h4 className="font-semibold text-sm text-green-300">Maintenance Clear</h4>
//                   <p className="text-xs text-indigo-200 mt-1">No maintenance issues reported.</p>
//                 </div>
//               </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }