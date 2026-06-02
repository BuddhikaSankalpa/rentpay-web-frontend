import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdDownload, MdAttachMoney, MdWarning, MdPieChart } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalRevenueYTD: 0, avgMonthlyIncome: 0, totalOverdue: 0 });
  const [chartData, setChartData] = useState([]);
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const response = await api.get('/payments/all');
        const payments = response.data.payments || [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); 

        let ytdRevenue = 0; let totalOverdueAmt = 0; let standardRentTotal = 0; let sharedRentTotal = 0; let finesTotal = 0;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          last6Months.push({ name: monthNames[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear(), Rent: 0, Fines: 0 });
        }

        payments.forEach(p => {
          const amt = Number(p.amount || 0); const fine = Number(p.fine_amount || 0);
          const paymentDate = p.paid_date ? new Date(p.paid_date) : new Date(p.due_date);

          if (p.status === 'overdue') { totalOverdueAmt += (amt + fine); }
          if (p.status === 'paid') {
            if (paymentDate.getFullYear() === currentYear) {
              ytdRevenue += (amt + fine); finesTotal += fine;
              const capacity = p.rooms?.capacity || 1;
              const roomType = p.rooms?.room_type || '';
              if (roomType.toLowerCase().includes('shared') || capacity > 1) { sharedRentTotal += amt; } 
              else { standardRentTotal += amt; }
            }
            const chartMonth = last6Months.find(m => m.monthIndex === paymentDate.getMonth() && m.year === paymentDate.getFullYear());
            if (chartMonth) { chartMonth.Rent += amt; chartMonth.Fines += fine; }
          }
        });

        const totalCalculatedRevenue = standardRentTotal + sharedRentTotal + finesTotal;
        const getPercentage = (value) => totalCalculatedRevenue === 0 ? "0%" : Math.round((value / totalCalculatedRevenue) * 100) + "%";

        setSummary({ totalRevenueYTD: ytdRevenue, avgMonthlyIncome: Math.round(ytdRevenue / (currentMonth + 1)), totalOverdue: totalOverdueAmt });
        setChartData(last6Months);
        setBreakdown([
          { source: "Solitary Quarters", amount: standardRentTotal, percentage: getPercentage(standardRentTotal) },
          { source: "Shared Chambers", amount: sharedRentTotal, percentage: getPercentage(sharedRentTotal) },
          { source: "Punitive Fines", amount: finesTotal, percentage: getPercentage(finesTotal) },
        ]);
      } catch (error) { toast.error("Failed to load reports"); } 
      finally { setLoading(false); }
    };
    fetchAndProcessData();
  }, []);

  if (loading) return <div className="text-center py-20 text-[#6d6d88] italic bg-[#09090e] h-full">Calculating Wealth...</div>;

  return (
    <div className="w-full pb-10 bg-[#09090e] text-gray-200">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-100 uppercase tracking-widest">Treasury Reports</h2>
          <p className="text-sm text-[#8a8a9d] mt-1 border-l-2 border-[#5b3e96] pl-3">Analyze the flow of capital.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a26] hover:bg-[#252536] border border-[#2a2a3d] text-[#a0a0b5] px-4 py-2 rounded text-[10px] uppercase font-bold tracking-widest transition-colors shadow-sm">
          <MdDownload className="text-lg text-[#c4b5fd]" /> Export Cipher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] p-6 flex items-center gap-4 hover:border-[#4a3975] transition-colors">
          <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981] text-2xl border border-[#10b981]/20"><MdAttachMoney /></div>
          <div>
            <p className="text-[10px] font-bold text-[#6d6d88] uppercase tracking-widest mb-1">Total Hoard (YTD)</p>
            <h3 className="text-2xl font-bold text-gray-100 tracking-wider">Rs. {summary.totalRevenueYTD.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] p-6 flex items-center gap-4 hover:border-[#4a3975] transition-colors">
          <div className="w-12 h-12 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] text-2xl border border-[#3b82f6]/20"><MdTrendingUp /></div>
          <div>
            <p className="text-[10px] font-bold text-[#6d6d88] uppercase tracking-widest mb-1">Avg. Monthly Yield</p>
            <h3 className="text-2xl font-bold text-gray-100 tracking-wider">Rs. {summary.avgMonthlyIncome.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] p-6 flex items-center gap-4 hover:border-[#4a3975] transition-colors">
          <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444] text-2xl border border-[#ef4444]/20"><MdWarning /></div>
          <div>
            <p className="text-[10px] font-bold text-[#6d6d88] uppercase tracking-widest mb-1">Deficits (Overdue)</p>
            <h3 className="text-2xl font-bold text-gray-100 tracking-wider">Rs. {summary.totalOverdue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-[#12121a] rounded-xl shadow-lg border border-[#232333] p-6">
          <h3 className="text-lg font-serif font-bold text-gray-100 uppercase tracking-widest mb-6 flex items-center gap-2">
            <MdTrendingUp className="text-[#a78bfa]" /> Revenue Archive (6 Mo)
          </h3>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a3d" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8a8a9d', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8a8a9d', fontSize: 11}} dx={-10} tickFormatter={(value) => value > 0 ? `Rs.${value/1000}k` : '0'} />
                <Tooltip cursor={{fill: '#1a1a26'}} contentStyle={{backgroundColor: '#0d0d14', borderRadius: '4px', border: '1px solid #2a2a3d', color: '#e0e0e0', fontSize: '12px'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '11px', color: '#8a8a9d', textTransform: 'uppercase'}} />
                <Bar dataKey="Rent" stackId="a" fill="#5b3e96" radius={[0, 0, 4, 4]} name="Room Rent" />
                <Bar dataKey="Fines" stackId="a" fill="#7f1d1d" radius={[4, 4, 0, 0]} name="Punitive Fines" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] p-6">
          <h3 className="text-lg font-serif font-bold text-gray-100 uppercase tracking-widest mb-6 flex items-center gap-2">
            <MdPieChart className="text-[#3b82f6]" /> Wealth Breakdown
          </h3>
          <div className="flex flex-col gap-6">
            {breakdown.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#8a8a9d]">{item.source}</span>
                  <span className="text-sm font-bold text-gray-200 tracking-wider">Rs. {item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-[#1b1b26] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${index === 0 ? 'bg-[#7c3aed]' : index === 1 ? 'bg-[#3b82f6]' : 'bg-[#ef4444]'}`} style={{ width: item.percentage }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-[#2a2a3d]">
            <p className="text-[10px] uppercase tracking-wider text-[#6d6d88] text-center leading-relaxed italic">
              * Calculations reflect current year cycles. Proportions represent total harvested wealth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { 
//   MdTrendingUp, MdDownload, MdAttachMoney, MdWarning, MdPieChart 
// } from 'react-icons/md';
// import { 
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
// } from 'recharts';
// import api from '../../utils/api';
// import toast from 'react-hot-toast';

// export default function AdminReports() {
//   const [loading, setLoading] = useState(true);
  
//   // States for calculated data
//   const [summary, setSummary] = useState({
//     totalRevenueYTD: 0,
//     avgMonthlyIncome: 0,
//     totalOverdue: 0
//   });
  
//   const [chartData, setChartData] = useState([]);
//   const [breakdown, setBreakdown] = useState([]);

//   useEffect(() => {
//     const fetchAndProcessData = async () => {
//       try {
//         const response = await api.get('/payments/all');
//         const payments = response.data.payments || [];

//         const today = new Date();
//         const currentYear = today.getFullYear();
//         const currentMonth = today.getMonth(); // 0-11

//         let ytdRevenue = 0;
//         let totalOverdueAmt = 0;

//         let standardRentTotal = 0;
//         let sharedRentTotal = 0;
//         let finesTotal = 0;

//         // 1. පහුගිය මාස 6 සඳහා හිස් Array එකක් හදාගන්නවා
//         const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//         let last6Months = [];
//         for (let i = 5; i >= 0; i--) {
//           const d = new Date(currentYear, currentMonth - i, 1);
//           last6Months.push({
//             name: monthNames[d.getMonth()],
//             monthIndex: d.getMonth(),
//             year: d.getFullYear(),
//             Rent: 0,
//             Fines: 0
//           });
//         }

//         // 2. Payments ඔක්කොම loop කරලා ගණන් හදනවා
//         payments.forEach(p => {
//           const amt = Number(p.amount || 0);
//           const fine = Number(p.fine_amount || 0);
//           const paymentDate = p.paid_date ? new Date(p.paid_date) : new Date(p.due_date);

//           // Overdue ගණනය කිරීම
//           if (p.status === 'overdue') {
//             totalOverdueAmt += (amt + fine);
//           }

//           // ගෙවපු ඒවා (Paid) විතරක් ආදායමට එකතු කරනවා
//           if (p.status === 'paid') {
//             // YTD (මේ අවුරුද්දේ) ආදායම
//             if (paymentDate.getFullYear() === currentYear) {
//               ytdRevenue += (amt + fine);
//               finesTotal += fine;

//               // කාමර වර්ගය අනුව වෙන් කිරීම
//               // (API එකෙන් room_type ආවේ නැත්නම් capacity එකෙන් බලනවා: 1=Single, >1=Shared)
//               const capacity = p.rooms?.capacity || 1;
//               const roomType = p.rooms?.room_type || '';
              
//               if (roomType.toLowerCase().includes('shared') || capacity > 1) {
//                 sharedRentTotal += amt;
//               } else {
//                 standardRentTotal += amt;
//               }
//             }

//             // Chart එකට මාස 6ක data වෙන් කිරීම
//             const chartMonth = last6Months.find(m => m.monthIndex === paymentDate.getMonth() && m.year === paymentDate.getFullYear());
//             if (chartMonth) {
//               chartMonth.Rent += amt;
//               chartMonth.Fines += fine;
//             }
//           }
//         });

//         // 3. Breakdown Percentages ගණනය කිරීම
//         const totalCalculatedRevenue = standardRentTotal + sharedRentTotal + finesTotal;
        
//         const getPercentage = (value) => {
//           if (totalCalculatedRevenue === 0) return "0%";
//           return Math.round((value / totalCalculatedRevenue) * 100) + "%";
//         };

//         const finalBreakdown = [
//           { source: "Standard/Single Rooms", amount: standardRentTotal, percentage: getPercentage(standardRentTotal) },
//           { source: "Shared Rooms", amount: sharedRentTotal, percentage: getPercentage(sharedRentTotal) },
//           { source: "Late Payment Fines", amount: finesTotal, percentage: getPercentage(finesTotal) },
//         ];

//         // 4. States Update කිරීම
//         setSummary({
//           totalRevenueYTD: ytdRevenue,
//           avgMonthlyIncome: Math.round(ytdRevenue / (currentMonth + 1)), // මේ අවුරුද්දේ ගෙවිච්ච මාස ගාණෙන් බෙදනවා
//           totalOverdue: totalOverdueAmt
//         });
//         setChartData(last6Months);
//         setBreakdown(finalBreakdown);

//       } catch (error) {
//         console.error("Error generating reports:", error);
//         toast.error("Failed to load reports data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAndProcessData();
//   }, []);

//   if (loading) {
//     return <div className="text-center py-20 text-gray-500">Generating Reports...</div>;
//   }

//   return (
//     <div className="w-full pb-10">
      
//       {/* Header */}
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
//           <p className="text-sm text-gray-500 mt-1">Track your boarding house revenue and financial growth.</p>
//         </div>
//         <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
//           <MdDownload className="text-lg" /> Export Report (PDF)
//         </button>
//       </div>

//       {/* 1. Top Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
//           <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-2xl shrink-0">
//             <MdAttachMoney />
//           </div>
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue (YTD)</p>
//             <h3 className="text-2xl font-bold text-gray-800">Rs. {summary.totalRevenueYTD.toLocaleString()}</h3>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
//           <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-2xl shrink-0">
//             <MdTrendingUp />
//           </div>
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg. Monthly Income</p>
//             <h3 className="text-2xl font-bold text-gray-800">Rs. {summary.avgMonthlyIncome.toLocaleString()}</h3>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
//           <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-2xl shrink-0">
//             <MdWarning />
//           </div>
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Overdue</p>
//             <h3 className="text-2xl font-bold text-gray-800">Rs. {summary.totalOverdue.toLocaleString()}</h3>
//           </div>
//         </div>

//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
//         {/* 2. Main Revenue Chart */}
//         <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
//             <MdTrendingUp className="text-indigo-500" /> Revenue Last 6 Months
//           </h3>
          
//           <div className="w-full h-[350px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={chartData}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
//                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
//                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(value) => value > 0 ? `Rs.${value/1000}k` : '0'} />
//                 <Tooltip 
//                   cursor={{fill: '#f9fafb'}}
//                   contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
//                 />
//                 <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
//                 <Bar dataKey="Rent" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} name="Room Rent" />
//                 <Bar dataKey="Fines" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late Fines" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* 3. Income Breakdown Table */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
//             <MdPieChart className="text-blue-500" /> Income Breakdown
//           </h3>
          
//           <div className="flex flex-col gap-5">
//             {breakdown.map((item, index) => (
//               <div key={index} className="flex flex-col gap-2">
//                 <div className="flex justify-between items-end">
//                   <span className="text-sm font-medium text-gray-600">{item.source}</span>
//                   <span className="text-sm font-bold text-gray-800">Rs. {item.amount.toLocaleString()}</span>
//                 </div>
//                 {/* Progress Bar */}
//                 <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
//                   <div 
//                     className={`h-full rounded-full ${index === 0 ? 'bg-indigo-500' : index === 1 ? 'bg-blue-400' : 'bg-orange-400'}`} 
//                     style={{ width: item.percentage }}
//                   ></div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-8 pt-6 border-t border-gray-100">
//             <p className="text-xs text-gray-500 text-center leading-relaxed">
//               * Breakdowns are calculated based on the current financial year. Percentages represent the proportion of total collected revenue.
//             </p>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }