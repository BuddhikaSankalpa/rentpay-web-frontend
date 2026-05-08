import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    MdSupportAgent, MdBuild, MdHistory,
    MdPendingActions, MdCheckCircle, MdAutorenew, MdDoneAll,
    MdElectricBolt, MdPlumbing, MdWifi, MdCleaningServices, MdChair,
    MdThumbUp
} from 'react-icons/md';
import api from '../../utils/api';

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: 'Electrical',
        subject: '',
        description: ''
    });

    // ─── Fetch user's tickets ────────────────────────────────────────
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/maintenance/my');
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

    // ─── Submit new ticket ───────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject.trim() || !formData.description.trim()) {
            toast.error("Please fill in all the details.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/maintenance', {
                category: formData.category,
                subject: formData.subject.trim(),
                description: formData.description.trim()
            });

            setTickets([res.data, ...tickets]);
            toast.success("Maintenance request submitted!");
            setFormData({ category: 'Electrical', subject: '', description: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── User confirms work is done ──────────────────────────────────
    const handleMarkDone = async (id) => {
        if (!window.confirm("Confirm that the issue has been fixed?")) return;

        try {
            const res = await api.patch(`/maintenance/${id}/status`, { status: 'done' });
            setTickets(tickets.map(t => t.id === id ? res.data : t));
            toast.success("Marked as done. Waiting for admin to close.");
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

    // ─── Helpers ─────────────────────────────────────────────────────
    const formatDate = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'closed':
                return { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: <MdCheckCircle />, text: 'Closed' };
            case 'done':
                return { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: <MdDoneAll />, text: 'Done — Awaiting Admin' };
            case 'in_progress':
                return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <MdAutorenew className="animate-spin" />, text: 'In Progress' };
            default:
                return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <MdPendingActions />, text: 'Pending' };
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Electrical': return <MdElectricBolt />;
            case 'Plumbing': return <MdPlumbing />;
            case 'Internet / Wi-Fi': return <MdWifi />;
            case 'Cleaning': return <MdCleaningServices />;
            case 'Furniture': return <MdChair />;
            default: return <MdBuild />;
        }
    };

    // Short ticket ID display ekak (full UUID eka long nisa)
    const shortId = (id) => `TKT-${(id || '').slice(0, 6).toUpperCase()}`;

    return (
        <div className="w-full mt-8 flex flex-col gap-8 pb-10">

            {/* Header */}
            <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                        <MdSupportAgent className="text-purple-400 text-3xl" /> Support & Maintenance
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm">Facing an issue in your room? Create a request and we'll fix it.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl sticky top-6">
                        <h3 className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase mb-6 flex items-center gap-2">
                            <MdBuild className="text-blue-400 text-lg" /> New Request
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Issue Category</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                        {getCategoryIcon(formData.category)}
                                    </div>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="Electrical" className="bg-[#1E182D]">Electrical</option>
                                        <option value="Plumbing" className="bg-[#1E182D]">Plumbing</option>
                                        <option value="Internet / Wi-Fi" className="bg-[#1E182D]">Internet / Wi-Fi</option>
                                        <option value="Furniture" className="bg-[#1E182D]">Furniture</option>
                                        <option value="Cleaning" className="bg-[#1E182D]">Cleaning</option>
                                        <option value="Other" className="bg-[#1E182D]">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g. Broken chair"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    placeholder="Explain the issue in detail..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none placeholder-gray-600"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 h-12 bg-gradient-to-r from-[#4A235A] to-[#7B1FA2] hover:from-[#5B2C6F] hover:to-[#8E24AA] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20 text-sm font-bold tracking-[0.2em] uppercase text-white disabled:opacity-70"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Request History */}
                <div className="lg:col-span-2">
                    <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl min-h-[500px]">
                        <h3 className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase mb-6 flex items-center gap-2">
                            <MdHistory className="text-purple-400 text-lg" /> My Request History
                        </h3>

                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading requests...</div>
                        ) : tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">
                                <MdBuild className="text-4xl mb-3 opacity-20" />
                                <p>No maintenance requests yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket) => {
                                    const statusObj = getStatusStyle(ticket.status);
                                    return (
                                        <div key={ticket.id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all">

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 text-xl border border-white/5">
                                                        {getCategoryIcon(ticket.category)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-medium text-lg">{ticket.subject}</h4>
                                                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                            {shortId(ticket.id)} • {formatDate(ticket.created_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${statusObj.bg} ${statusObj.border} ${statusObj.color}`}>
                                                    {statusObj.icon} {statusObj.text}
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3 mt-3">
                                                {ticket.description}
                                            </div>

                                            {/* "Mark as Done" button — Only when admin already started */}
                                            {ticket.status === 'in_progress' && (
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        Has the issue been fixed? Confirm below to notify admin.
                                                    </p>
                                                    <button
                                                        onClick={() => handleMarkDone(ticket.id)}
                                                        className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        <MdThumbUp /> Yes, it's fixed
                                                    </button>
                                                </div>
                                            )}

                                            {/* Done state info */}
                                            {ticket.status === 'done' && (
                                                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-purple-300">
                                                    ✓ You confirmed the fix. Waiting for admin to close this ticket.
                                                </div>
                                            )}

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}