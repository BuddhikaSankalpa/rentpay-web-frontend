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
    const [filter, setFilter] = useState('all'); // all | pending | in_progress | done | closed

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/maintenance');
            setTickets(res.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // ─── Status update handler ───────────────────────────────────────
    const handleUpdateStatus = async (id, newStatus) => {
        const messages = {
            in_progress: 'Mark this ticket as In Progress?',
            closed: 'Close this ticket? This action cannot be undone.'
        };
        if (messages[newStatus] && !window.confirm(messages[newStatus])) return;

        try {
            const res = await api.patch(`/maintenance/${id}/status`, { status: newStatus });
            setTickets(tickets.map(t => t.id === id ? { ...t, ...res.data, roomNumber: t.roomNumber, users: t.users } : t));

            const successMsg = {
                in_progress: 'Marked as In Progress. Student notified!',
                closed: 'Ticket closed successfully!'
            };
            toast.success(successMsg[newStatus] || 'Status updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const shortId = (id) => `TKT-${(id || '').slice(0, 6).toUpperCase()}`;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'closed':
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><MdLockOutline /> Closed</span>;
            case 'done':
                return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><MdDoneAll /> Done — Awaiting Close</span>;
            case 'in_progress':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit animate-pulse"><MdAutorenew /> In Progress</span>;
            default:
                return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><MdPendingActions /> Pending</span>;
        }
    };

    // Counts
    const counts = {
        all: tickets.length,
        pending: tickets.filter(t => t.status === 'pending').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        done: tickets.filter(t => t.status === 'done').length,
        closed: tickets.filter(t => t.status === 'closed').length
    };

    const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

    const filterButton = (key, label) => (
        <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === key
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label} <span className="ml-1 opacity-70">({counts[key]})</span>
        </button>
    );

    return (
        <div className="w-full">

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Maintenance Requests</h2>
                    <p className="text-sm text-gray-500 mt-1">Track and resolve student complaints regarding boarding facilities.</p>
                </div>
                <button
                    onClick={fetchTickets}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <MdRefresh /> Refresh
                </button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filterButton('all', 'All')}
                {filterButton('pending', 'Pending')}
                {filterButton('in_progress', 'In Progress')}
                {filterButton('done', 'Done')}
                {filterButton('closed', 'Closed')}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {loading ? (
                    <div className="text-center py-16 text-gray-500">Loading tickets...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        {filter === 'all' ? 'No tickets yet.' : `No ${filter.replace('_', ' ')} tickets.`}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-widest">
                                    <th className="p-4 font-bold">Ticket & Date</th>
                                    <th className="p-4 font-bold">Student / Room</th>
                                    <th className="p-4 font-bold">Issue Details</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((ticket) => {
                                    const studentName = ticket.users
                                        ? `${ticket.users.first_name || ''} ${ticket.users.last_name || ''}`.trim() || '—'
                                        : '—';

                                    return (
                                        <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors align-top">
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-gray-900">{shortId(ticket.id)}</div>
                                                <div className="text-xs text-gray-500">{formatDate(ticket.created_at)}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 font-medium text-gray-800 text-sm">
                                                    <MdPerson className="text-gray-400" /> {studentName}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-indigo-500 mt-1">
                                                    <MdRoom /> Room: {ticket.roomNumber || '—'}
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-sm">
                                                <div className="text-xs font-bold text-indigo-400 uppercase mb-1">{ticket.category}</div>
                                                <div className="text-sm text-gray-800 font-medium">{ticket.subject}</div>
                                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{ticket.description}</div>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(ticket.status)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2 flex-wrap">

                                                    {/* Pending → Start Working */}
                                                    {ticket.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                                                            className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                        >
                                                            <MdAssignmentInd /> Start Working
                                                        </button>
                                                    )}

                                                    {/* In Progress → Wait for user */}
                                                    {ticket.status === 'in_progress' && (
                                                        <span className="text-xs text-blue-500 italic flex items-center gap-1">
                                                            <MdAutorenew className="animate-spin" /> Waiting for student to confirm
                                                        </span>
                                                    )}

                                                    {/* Done → Close */}
                                                    {ticket.status === 'done' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                                                            className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors border border-green-100"
                                                        >
                                                            <MdCheckCircle /> Close Ticket
                                                        </button>
                                                    )}

                                                    {/* Closed → no actions */}
                                                    {ticket.status === 'closed' && (
                                                        <span className="text-gray-400 text-xs italic">— Closed —</span>
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