import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    MdPerson, MdRoom, MdAssignmentInd, MdCheckCircle,
    MdDoneAll, MdAutorenew, MdPendingActions, MdLockOutline,
    MdRefresh
} from 'react-icons/md';
import api from '../../utils/api';

export default function AdminMaintenance() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/maintenance');
            setTickets(res.data || []);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to load tickets'); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        const messages = {
            in_progress: 'Assign task and begin work?',
            closed: 'Seal this ticket eternally? Cannot be undone.'
        };
        if (messages[newStatus] && !window.confirm(messages[newStatus])) return;
        try {
            const res = await api.patch(`/maintenance/${id}/status`, { status: newStatus });
            setTickets(tickets.map(t => t.id === id ? { ...t, ...res.data, roomNumber: t.roomNumber, users: t.users } : t));
            const successMsg = { in_progress: 'Work begun. Resident warned.', closed: 'Sealed successfully.' };
            toast.success(successMsg[newStatus] || 'Status amended');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const shortId = (id) => `TKT-${(id || '').slice(0, 6).toUpperCase()}`;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'closed': return <span className="px-2 py-1 bg-[#1a1a26] text-[#6d6d88] border border-[#2a2a3d] rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit"><MdLockOutline /> Sealed</span>;
            case 'done': return <span className="px-2 py-1 bg-[#24173d] text-[#c4b5fd] border border-[#4a3473] rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit"><MdDoneAll /> Awaiting Close</span>;
            case 'in_progress': return <span className="px-2 py-1 bg-[#1e3a8a]/30 text-[#93c5fd] border border-[#1e40af] rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit animate-pulse"><MdAutorenew /> In Progress</span>;
            default: return <span className="px-2 py-1 bg-[#3b1c1c] text-[#fb923c] border border-[#7c2d12] rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit"><MdPendingActions /> Pending</span>;
        }
    };

    const counts = {
        all: tickets.length,
        pending: tickets.filter(t => t.status === 'pending').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        done: tickets.filter(t => t.status === 'done').length,
        closed: tickets.filter(t => t.status === 'closed').length
    };

    const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

    const filterButton = (key, label) => (
        <button key={key} onClick={() => setFilter(key)} className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors border ${filter === key ? 'bg-[#3e277a] text-[#e0e0e0] border-[#5b3e96]' : 'bg-[#12121a] text-[#6d6d88] border-[#2a2a3d] hover:bg-[#1a1a26] hover:text-[#8a8a9d]'}`}>
            {label} <span className="ml-1 opacity-60">({counts[key]})</span>
        </button>
    );

    return (
        <div className="w-full bg-[#09090e] text-gray-200">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-100 uppercase tracking-widest">Grievances</h2>
                    <p className="text-sm text-[#8a8a9d] mt-1 border-l-2 border-[#5b3e96] pl-3">Oversee repairs and structural decay.</p>
                </div>
                <button onClick={fetchTickets} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] hover:text-[#c4b5fd] border border-[#2d224b] bg-[#1a152e] px-3 py-1.5 rounded transition-colors">
                    <MdRefresh className="text-lg" /> Refresh
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {filterButton('all', 'All')}
                {filterButton('pending', 'Pending')}
                {filterButton('in_progress', 'In Progress')}
                {filterButton('done', 'Completed')}
                {filterButton('closed', 'Sealed')}
            </div>

            <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] overflow-hidden">
                {loading ? (
                    <div className="text-center py-16 text-[#6d6d88] italic">Seeking scrolls...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-[#6d6d88] italic">
                        {filter === 'all' ? 'The halls are silent.' : `No ${filter.replace('_', ' ')} grievances.`}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-[#171721] border-b border-[#2a2a3d] text-[#8a8a9d] text-[10px] uppercase tracking-widest">
                                    <th className="p-4 font-bold">Ticket & Date</th>
                                    <th className="p-4 font-bold">Inhabitant</th>
                                    <th className="p-4 font-bold">Issue Profile</th>
                                    <th className="p-4 font-bold">State</th>
                                    <th className="p-4 font-bold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((ticket) => {
                                    const studentName = ticket.users ? `${ticket.users.first_name || ''} ${ticket.users.last_name || ''}`.trim() || '—' : '—';
                                    return (
                                        <tr key={ticket.id} className="border-b border-[#1b1b26] hover:bg-[#161622] transition-colors align-top">
                                            <td className="p-4">
                                                <div className="text-sm font-mono font-bold text-[#c4b5fd]">{shortId(ticket.id)}</div>
                                                <div className="text-[10px] text-[#6d6d88] mt-1">{formatDate(ticket.created_at)}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 font-medium text-gray-200 text-sm">
                                                    <MdPerson className="text-[#6d6d88]" /> {studentName}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[#a78bfa] mt-2">
                                                    <MdRoom /> Chamber: {ticket.roomNumber || '—'}
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-sm">
                                                <div className="text-[10px] font-bold text-[#fca5a5] uppercase mb-1 tracking-widest">{ticket.category}</div>
                                                <div className="text-sm text-gray-100 font-bold tracking-wide">{ticket.subject}</div>
                                                <div className="text-xs text-[#a0a0b5] mt-1.5 line-clamp-2 leading-relaxed">{ticket.description}</div>
                                            </td>
                                            <td className="p-4">{getStatusBadge(ticket.status)}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                                    {ticket.status === 'pending' && (
                                                        <button onClick={() => handleUpdateStatus(ticket.id, 'in_progress')} className="flex items-center gap-1 bg-[#1e3a8a]/20 text-[#93c5fd] border border-[#1e40af] px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#1e3a8a]/40 transition-colors">
                                                            <MdAssignmentInd /> Dispatch
                                                        </button>
                                                    )}
                                                    {ticket.status === 'in_progress' && (
                                                        <span className="text-[10px] text-[#93c5fd] italic flex items-center gap-1 uppercase tracking-widest">
                                                            <MdAutorenew className="animate-spin" /> Awaiting Confirmation
                                                        </span>
                                                    )}
                                                    {ticket.status === 'done' && (
                                                        <button onClick={() => handleUpdateStatus(ticket.id, 'closed')} className="flex items-center gap-1 bg-[#064e3b]/30 text-[#34d399] border border-[#065f46] px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#064e3b]/50 transition-colors">
                                                            <MdCheckCircle /> Seal Permanently
                                                        </button>
                                                    )}
                                                    {ticket.status === 'closed' && (
                                                        <span className="text-[#6d6d88] text-[10px] font-bold uppercase tracking-widest">— Sealed —</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
// import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import {
//     MdPerson, MdRoom, MdAssignmentInd, MdCheckCircle,
//     MdDoneAll, MdAutorenew, MdPendingActions, MdLockOutline,
//     MdRefresh
// } from 'react-icons/md';
// import api from '../../utils/api';

// export default function AdminMaintenance() {
//     const [tickets, setTickets] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [filter, setFilter] = useState('all'); // all | pending | in_progress | done | closed

//     const fetchTickets = async () => {
//         try {
//             setLoading(true);
//             const res = await api.get('/maintenance');
//             setTickets(res.data || []);
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Failed to load tickets');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchTickets();
//     }, []);

//     // ─── Status update handler ───────────────────────────────────────
//     const handleUpdateStatus = async (id, newStatus) => {
//         const messages = {
//             in_progress: 'Mark this ticket as In Progress?',
//             closed: 'Close this ticket? This action cannot be undone.'
//         };
//         if (messages[newStatus] && !window.confirm(messages[newStatus])) return;

//         try {
//             const res = await api.patch(`/maintenance/${id}/status`, { status: newStatus });
//             setTickets(tickets.map(t => t.id === id ? { ...t, ...res.data, roomNumber: t.roomNumber, users: t.users } : t));

//             const successMsg = {
//                 in_progress: 'Marked as In Progress. Student notified!',
//                 closed: 'Ticket closed successfully!'
//             };
//             toast.success(successMsg[newStatus] || 'Status updated');
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Failed to update');
//         }
//     };

//     const formatDate = (iso) => {
//         if (!iso) return '';
//         return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
//     };

//     const shortId = (id) => `TKT-${(id || '').slice(0, 6).toUpperCase()}`;

//     const getStatusBadge = (status) => {
//         switch (status) {
//             case 'closed':
//                 return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><MdLockOutline /> Closed</span>;
//             case 'done':
//                 return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><MdDoneAll /> Done — Awaiting Close</span>;
//             case 'in_progress':
//                 return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit animate-pulse"><MdAutorenew /> In Progress</span>;
//             default:
//                 return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><MdPendingActions /> Pending</span>;
//         }
//     };

//     // Counts
//     const counts = {
//         all: tickets.length,
//         pending: tickets.filter(t => t.status === 'pending').length,
//         in_progress: tickets.filter(t => t.status === 'in_progress').length,
//         done: tickets.filter(t => t.status === 'done').length,
//         closed: tickets.filter(t => t.status === 'closed').length
//     };

//     const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

//     const filterButton = (key, label) => (
//         <button
//             key={key}
//             onClick={() => setFilter(key)}
//             className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
//                 filter === key
//                     ? 'bg-indigo-600 text-white shadow'
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//         >
//             {label} <span className="ml-1 opacity-70">({counts[key]})</span>
//         </button>
//     );

//     return (
//         <div className="w-full">

//             {/* Header */}
//             <div className="mb-6 flex items-start justify-between">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-800">Maintenance Requests</h2>
//                     <p className="text-sm text-gray-500 mt-1">Track and resolve student complaints regarding boarding facilities.</p>
//                 </div>
//                 <button
//                     onClick={fetchTickets}
//                     className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
//                 >
//                     <MdRefresh /> Refresh
//                 </button>
//             </div>

//             {/* Filter pills */}
//             <div className="flex flex-wrap gap-2 mb-6">
//                 {filterButton('all', 'All')}
//                 {filterButton('pending', 'Pending')}
//                 {filterButton('in_progress', 'In Progress')}
//                 {filterButton('done', 'Done')}
//                 {filterButton('closed', 'Closed')}
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

//                 {loading ? (
//                     <div className="text-center py-16 text-gray-500">Loading tickets...</div>
//                 ) : filtered.length === 0 ? (
//                     <div className="text-center py-16 text-gray-500">
//                         {filter === 'all' ? 'No tickets yet.' : `No ${filter.replace('_', ' ')} tickets.`}
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left border-collapse min-w-[1000px]">
//                             <thead>
//                                 <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-widest">
//                                     <th className="p-4 font-bold">Ticket & Date</th>
//                                     <th className="p-4 font-bold">Student / Room</th>
//                                     <th className="p-4 font-bold">Issue Details</th>
//                                     <th className="p-4 font-bold">Status</th>
//                                     <th className="p-4 font-bold text-center">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {filtered.map((ticket) => {
//                                     const studentName = ticket.users
//                                         ? `${ticket.users.first_name || ''} ${ticket.users.last_name || ''}`.trim() || '—'
//                                         : '—';

//                                     return (
//                                         <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors align-top">
//                                             <td className="p-4">
//                                                 <div className="text-sm font-bold text-gray-900">{shortId(ticket.id)}</div>
//                                                 <div className="text-xs text-gray-500">{formatDate(ticket.created_at)}</div>
//                                             </td>
//                                             <td className="p-4">
//                                                 <div className="flex items-center gap-2 font-medium text-gray-800 text-sm">
//                                                     <MdPerson className="text-gray-400" /> {studentName}
//                                                 </div>
//                                                 <div className="flex items-center gap-2 text-xs text-indigo-500 mt-1">
//                                                     <MdRoom /> Room: {ticket.roomNumber || '—'}
//                                                 </div>
//                                             </td>
//                                             <td className="p-4 max-w-sm">
//                                                 <div className="text-xs font-bold text-indigo-400 uppercase mb-1">{ticket.category}</div>
//                                                 <div className="text-sm text-gray-800 font-medium">{ticket.subject}</div>
//                                                 <div className="text-xs text-gray-500 mt-1 line-clamp-2">{ticket.description}</div>
//                                             </td>
//                                             <td className="p-4">
//                                                 {getStatusBadge(ticket.status)}
//                                             </td>
//                                             <td className="p-4">
//                                                 <div className="flex items-center justify-center gap-2 flex-wrap">

//                                                     {/* Pending → Start Working */}
//                                                     {ticket.status === 'pending' && (
//                                                         <button
//                                                             onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
//                                                             className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
//                                                         >
//                                                             <MdAssignmentInd /> Start Working
//                                                         </button>
//                                                     )}

//                                                     {/* In Progress → Wait for user */}
//                                                     {ticket.status === 'in_progress' && (
//                                                         <span className="text-xs text-blue-500 italic flex items-center gap-1">
//                                                             <MdAutorenew className="animate-spin" /> Waiting for student to confirm
//                                                         </span>
//                                                     )}

//                                                     {/* Done → Close */}
//                                                     {ticket.status === 'done' && (
//                                                         <button
//                                                             onClick={() => handleUpdateStatus(ticket.id, 'closed')}
//                                                             className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors border border-green-100"
//                                                         >
//                                                             <MdCheckCircle /> Close Ticket
//                                                         </button>
//                                                     )}

//                                                     {/* Closed → no actions */}
//                                                     {ticket.status === 'closed' && (
//                                                         <span className="text-gray-400 text-xs italic">— Closed —</span>
//                                                     )}

//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }