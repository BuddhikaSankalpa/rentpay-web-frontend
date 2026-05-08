import React, { useState, useEffect } from 'react';
import { 
  MdTrendingUp, MdDownload, MdAttachMoney, MdWarning, MdPieChart 
} from 'react-icons/md';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  
  // States for calculated data
  const [summary, setSummary] = useState({
    totalRevenueYTD: 0,
    avgMonthlyIncome: 0,
    totalOverdue: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const response = await api.get('/payments/all');
        const payments = response.data.payments || [];

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-11

        let ytdRevenue = 0;
        let totalOverdueAmt = 0;

        let standardRentTotal = 0;
        let sharedRentTotal = 0;
        let finesTotal = 0;

        // 1. පහුගිය මාස 6 සඳහා හිස් Array එකක් හදාගන්නවා
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          last6Months.push({
            name: monthNames[d.getMonth()],
            monthIndex: d.getMonth(),
            year: d.getFullYear(),
            Rent: 0,
            Fines: 0
          });
        }

        // 2. Payments ඔක්කොම loop කරලා ගණන් හදනවා
        payments.forEach(p => {
          const amt = Number(p.amount || 0);
          const fine = Number(p.fine_amount || 0);
          const paymentDate = p.paid_date ? new Date(p.paid_date) : new Date(p.due_date);

          // Overdue ගණනය කිරීම
          if (p.status === 'overdue') {
            totalOverdueAmt += (amt + fine);
          }

          // ගෙවපු ඒවා (Paid) විතරක් ආදායමට එකතු කරනවා
          if (p.status === 'paid') {
            // YTD (මේ අවුරුද්දේ) ආදායම
            if (paymentDate.getFullYear() === currentYear) {
              ytdRevenue += (amt + fine);
              finesTotal += fine;

              // කාමර වර්ගය අනුව වෙන් කිරීම
              // (API එකෙන් room_type ආවේ නැත්නම් capacity එකෙන් බලනවා: 1=Single, >1=Shared)
              const capacity = p.rooms?.capacity || 1;
              const roomType = p.rooms?.room_type || '';
              
              if (roomType.toLowerCase().includes('shared') || capacity > 1) {
                sharedRentTotal += amt;
              } else {
                standardRentTotal += amt;
              }
            }

            // Chart එකට මාස 6ක data වෙන් කිරීම
            const chartMonth = last6Months.find(m => m.monthIndex === paymentDate.getMonth() && m.year === paymentDate.getFullYear());
            if (chartMonth) {
              chartMonth.Rent += amt;
              chartMonth.Fines += fine;
            }
          }
        });

        // 3. Breakdown Percentages ගණනය කිරීම
        const totalCalculatedRevenue = standardRentTotal + sharedRentTotal + finesTotal;
        
        const getPercentage = (value) => {
          if (totalCalculatedRevenue === 0) return "0%";
          return Math.round((value / totalCalculatedRevenue) * 100) + "%";
        };

        const finalBreakdown = [
          { source: "Standard/Single Rooms", amount: standardRentTotal, percentage: getPercentage(standardRentTotal) },
          { source: "Shared Rooms", amount: sharedRentTotal, percentage: getPercentage(sharedRentTotal) },
          { source: "Late Payment Fines", amount: finesTotal, percentage: getPercentage(finesTotal) },
        ];

        // 4. States Update කිරීම
        setSummary({
          totalRevenueYTD: ytdRevenue,
          avgMonthlyIncome: Math.round(ytdRevenue / (currentMonth + 1)), // මේ අවුරුද්දේ ගෙවිච්ච මාස ගාණෙන් බෙදනවා
          totalOverdue: totalOverdueAmt
        });
        setChartData(last6Months);
        setBreakdown(finalBreakdown);

      } catch (error) {
        console.error("Error generating reports:", error);
        toast.error("Failed to load reports data");
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Generating Reports...</div>;
  }

  return (
    <div className="w-full pb-10">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Track your boarding house revenue and financial growth.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <MdDownload className="text-lg" /> Export Report (PDF)
        </button>
      </div>

      {/* 1. Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-2xl shrink-0">
            <MdAttachMoney />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue (YTD)</p>
            <h3 className="text-2xl font-bold text-gray-800">Rs. {summary.totalRevenueYTD.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-2xl shrink-0">
            <MdTrendingUp />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg. Monthly Income</p>
            <h3 className="text-2xl font-bold text-gray-800">Rs. {summary.avgMonthlyIncome.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-2xl shrink-0">
            <MdWarning />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Overdue</p>
            <h3 className="text-2xl font-bold text-gray-800">Rs. {summary.totalOverdue.toLocaleString()}</h3>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 2. Main Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MdTrendingUp className="text-indigo-500" /> Revenue Last 6 Months
          </h3>
          
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(value) => value > 0 ? `Rs.${value/1000}k` : '0'} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="Rent" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} name="Room Rent" />
                <Bar dataKey="Fines" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late Fines" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Income Breakdown Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MdPieChart className="text-blue-500" /> Income Breakdown
          </h3>
          
          <div className="flex flex-col gap-5">
            {breakdown.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-gray-600">{item.source}</span>
                  <span className="text-sm font-bold text-gray-800">Rs. {item.amount.toLocaleString()}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${index === 0 ? 'bg-indigo-500' : index === 1 ? 'bg-blue-400' : 'bg-orange-400'}`} 
                    style={{ width: item.percentage }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              * Breakdowns are calculated based on the current financial year. Percentages represent the proportion of total collected revenue.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}