import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    MdAddAlert, MdDelete, MdWarning, MdInfo, MdCheckCircle,
    MdCampaign, MdAccessTime, MdLibraryBooks, MdClose, MdSearch
} from 'react-icons/md';
import api from '../../utils/api';

const NOTICE_TEMPLATES = [
    { category: 'Utilities', title: 'Water Supply Interruption', type: 'warning', message: 'There will be a water supply interruption on [date] from [start time] to [end time] due to main line maintenance. Please store adequate water in advance. We apologize for the inconvenience.' },
    { category: 'Utilities', title: 'Scheduled Power Cut', type: 'warning', message: 'A scheduled power cut is announced for [date] from [start time] to [end time]. Please charge your devices and prepare accordingly. The generator will not be available during this period.' },
    { category: 'Utilities', title: 'Wi-Fi Service Disruption', type: 'warning', message: 'The Wi-Fi service will be temporarily unavailable on [date] from [start time] to [end time] due to network upgrades. Mobile data is recommended during this period.' },
    { category: 'Payments', title: 'Monthly Rent Reminder', type: 'info', message: 'This is a friendly reminder that all pending room rents must be cleared before the [date] of this month to avoid late fees. Please contact the office if you need assistance.' },
    { category: 'Payments', title: 'Late Payment Notice', type: 'warning', message: 'Residents with unpaid rent for the previous month must settle their dues by [date]. A late fee of Rs. [amount] per day will apply afterwards.' },
    { category: 'Maintenance', title: 'Pest Control Service', type: 'warning', message: 'Pest control service is scheduled for [date] from [start time] to [end time]. Please cover all food items, store toothbrushes safely, and stay out of treated areas for at least 4 hours afterwards.' },
    { category: 'Maintenance', title: 'Common Area Cleaning', type: 'info', message: 'Deep cleaning of common areas (corridors, kitchen, bathrooms) is scheduled for [date]. Please keep your belongings inside your rooms during this time.' },
    { category: 'Maintenance', title: 'Building Maintenance Work', type: 'warning', message: 'General maintenance and repair work is scheduled for [date]. Some noise and minor disruptions are expected between [start time] and [end time]. Thank you for your patience.' },
    { category: 'Safety', title: 'Fire Safety Drill', type: 'warning', message: 'A mandatory fire safety drill is scheduled for [date] at [time]. All residents must participate. Please assemble at the front courtyard when you hear the alarm.' },
    { category: 'Safety', title: 'Security Reminder', type: 'warning', message: 'Please ensure your room door and personal locker are properly locked when leaving. Report any suspicious activity or unfamiliar persons to the admin immediately.' },
    { category: 'Safety', title: 'Gate Curfew Reminder', type: 'info', message: 'Reminder: The main gate is locked at 10:00 PM sharp. Late arrivals must inform the admin at least 1 hour in advance. Repeated violations may incur a fine.' },
    { category: 'Events', title: 'Resident Meeting', type: 'info', message: 'A resident meeting is scheduled for [date] at [time] in the common hall. Important matters regarding the boarding will be discussed. Your attendance is highly appreciated.' },
    { category: 'Events', title: 'Public Holiday — Office Closed', type: 'info', message: 'The boarding office will be closed on [date] in observance of [holiday name]. For emergencies, please contact [contact number]. Normal operations resume the next working day.' },
    { category: 'Events', title: 'Festive Greetings', type: 'success', message: 'Wishing all our residents a wonderful [festival name]! May this season bring you joy, peace, and success in your studies. Decorations in common areas are welcome — please keep things tidy.' },
    { category: 'General', title: 'New Resident Welcome', type: 'success', message: 'Please join us in welcoming our new residents joining the boarding this week. Let\'s make them feel at home — kindness and support go a long way!' },
    { category: 'General', title: 'Visitor Policy Reminder', type: 'info', message: 'A reminder that outside visitors are not permitted inside the rooms without prior admin approval. Visitors may be received in the common area between [start time] and [end time].' }
];

function TemplateModal({ isOpen, onClose, onSelect }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    if (!isOpen) return null;

    const categories = ['All', ...new Set(NOTICE_TEMPLATES.map(t => t.category))];
    const filtered = NOTICE_TEMPLATES.filter(t => {
        const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.message.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const typeBadge = (type) => {
        const styles = {
            warning: 'bg-[#450a0a] text-[#fca5a5] border-[#7f1d1d]',
            success: 'bg-[#064e3b] text-[#34d399] border-[#065f46]',
            info: 'bg-[#1e3a8a] text-[#93c5fd] border-[#1e40af]'
        };
        return styles[type] || styles.info;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-[#2a2a3d] bg-[#171721] rounded-t-xl">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-gray-100 flex items-center gap-2 uppercase tracking-widest">
                            <MdLibraryBooks className="text-[#a78bfa]" /> Chronicles
                        </h3>
                        <p className="text-xs text-[#8a8a9d] mt-1 italic">Choose a parchment template to disseminate.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-[#6d6d88] hover:text-white transition-colors">
                        <MdClose className="text-2xl" />
                    </button>
                </div>
                <div className="p-6 border-b border-[#2a2a3d] space-y-4 bg-[#0d0d14]">
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d6d88] text-xl" />
                        <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#161622] border border-[#2a2a3d] text-gray-200 rounded outline-none focus:border-[#7c3aed] text-sm" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors border ${activeCategory === cat ? 'bg-[#3e277a] text-[#e0e0e0] border-[#5b3e96]' : 'bg-[#1a1a26] text-[#8a8a9d] border-[#2a2a3d] hover:bg-[#252536]'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-[#09090e]">
                    {filtered.length === 0 ? (
                        <div className="text-center py-10 text-[#6d6d88] italic">No scrolls found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filtered.map((tpl, idx) => (
                                <button key={idx} onClick={() => onSelect(tpl)} className="text-left p-4 border border-[#2a2a3d] bg-[#12121a] rounded hover:border-[#5b3e96] hover:bg-[#1a152e] transition-all group flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#8a8a9d]">{tpl.category}</span>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${typeBadge(tpl.type)}`}>{tpl.type}</span>
                                    </div>
                                    <h4 className="font-medium text-gray-200 mb-2 group-hover:text-[#c4b5fd] transition-colors">{tpl.title}</h4>
                                    <p className="text-xs text-[#6d6d88] line-clamp-3 leading-relaxed flex-1">{tpl.message}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-[#2a2a3d] bg-[#171721] rounded-b-xl text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[#8a8a9d]">💡 Tip: Replace <code className="bg-[#09090e] px-1 border border-[#2a2a3d] text-[#c4b5fd] rounded">[brackets]</code> before publishing.</p>
                </div>
            </div>
        </div>
    );
}

export default function AdminNotices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    const [formData, setFormData] = useState({ title: '', message: '', type: 'info', expiresInDays: '0' });

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notices');
            setNotices(res.data || []);
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to load notices'); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotices(); }, []);

    const formatDate = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleTemplateSelect = (template) => {
        setFormData({ ...formData, title: template.title, message: template.message, type: template.type });
        setShowTemplates(false);
        toast.success('Scroll loaded! Fill in the blanks.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.message.trim()) { toast.error("Complete the decree first."); return; }
        if (formData.message.includes('[') && formData.message.includes(']')) {
            if (!window.confirm('Message still contains [placeholders]. Publish anyway?')) return;
        }

        setIsSubmitting(true);
        try {
            const payload = { title: formData.title.trim(), message: formData.message.trim(), type: formData.type, expiresInDays: Number(formData.expiresInDays) || 0 };
            const res = await api.post('/notices', payload);
            setNotices([res.data, ...notices]);
            toast.success('Decree published!');
            setFormData({ title: '', message: '', type: 'info', expiresInDays: '0' });
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to publish'); } 
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Burn this notice?")) return;
        try {
            await api.delete(`/notices/${id}`);
            setNotices(notices.filter(n => n.id !== id));
            toast.success('Notice incinerated!');
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to delete'); }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'warning': return { icon: <MdWarning />, color: 'text-[#fb923c]', bg: 'bg-[#3b1c1c]/30', border: 'border-[#7c2d12]' };
            case 'success': return { icon: <MdCheckCircle />, color: 'text-[#34d399]', bg: 'bg-[#064e3b]/30', border: 'border-[#065f46]' };
            default: return { icon: <MdInfo />, color: 'text-[#93c5fd]', bg: 'bg-[#1e3a8a]/30', border: 'border-[#1e40af]' };
        }
    };

    return (
        <div className="w-full bg-[#09090e] text-gray-200 min-h-full relative">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-100 uppercase tracking-widest">Proclamations</h2>
                    <p className="text-sm text-[#8a8a9d] mt-1 border-l-2 border-[#5b3e96] pl-3">Broadcast decrees to all inhabitants.</p>
                </div>
                <div className="p-3 bg-[#1a152e] text-[#a78bfa] rounded-full border border-[#2d224b]">
                    <MdCampaign className="text-2xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] p-6 sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-serif font-bold text-gray-100 uppercase tracking-widest flex items-center gap-2">
                                <MdAddAlert className="text-[#a78bfa]" /> Draft Edict
                            </h3>
                        </div>

                        <button type="button" onClick={() => setShowTemplates(true)} className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a152e] hover:bg-[#24173d] text-[#c4b5fd] font-bold text-xs uppercase tracking-widest rounded border border-[#4a3473] transition-colors">
                            <MdLibraryBooks className="text-lg" /> Inspect Archives
                        </button>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Subject</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm" placeholder="e.g. Curfew Adjustments" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Severity</label>
                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm [color-scheme:dark]">
                                    <option value="info">General Info (Blue)</option>
                                    <option value="warning">Dire Warning (Orange)</option>
                                    <option value="success">Good Tidings (Green)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Expiration</label>
                                <select value={formData.expiresInDays} onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })} className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm [color-scheme:dark]">
                                    <option value="0">Eternal (Manual wipe)</option>
                                    <option value="1">1 Night</option><option value="3">3 Nights</option>
                                    <option value="7">1 Week</option><option value="30">1 Moon (30d)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#8a8a9d] mb-2">Declaration</label>
                                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows="6" className="w-full bg-[#0d0d14] border border-[#2a2a3d] text-gray-200 rounded p-2.5 outline-none focus:border-[#7c3aed] text-sm resize-none" placeholder="Transcribe here..." />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#3e277a] hover:bg-[#5233a3] border border-[#5b3e96] text-white font-bold text-xs uppercase tracking-widest py-3 rounded transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                                {isSubmitting ? 'Sealing...' : 'Publish Edict'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-[#12121a] rounded-xl shadow-lg border border-[#232333] p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-[#2a2a3d] pb-4">
                            <h3 className="text-lg font-serif font-bold text-gray-100 uppercase tracking-widest">Active Bulletins</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] bg-[#1a152e] border border-[#2d224b] px-3 py-1 rounded">
                                {notices.length} Live
                            </span>
                        </div>
                        {loading ? (
                            <div className="text-center py-10 text-[#6d6d88] italic">Reading the winds...</div>
                        ) : notices.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-[#2a2a3d] rounded bg-[#0d0d14] text-[#6d6d88] italic">
                                Silence across the halls. No active decrees.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notices.map((notice) => {
                                    const style = getTypeStyles(notice.type);
                                    return (
                                        <div key={notice.id} className={`flex gap-4 p-5 rounded border-l-2 ${style.border} ${style.bg} border border-[#2a2a3d] relative group`}>
                                            <div className={`text-2xl mt-1 ${style.color}`}>{style.icon}</div>
                                            <div className="flex-1 pr-8">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-200 tracking-wide">{notice.title}</h4>
                                                    <span className="text-[10px] font-mono text-[#6d6d88]">{formatDate(notice.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-[#a0a0b5] leading-relaxed whitespace-pre-wrap">{notice.message}</p>
                                                {notice.expires_at && (
                                                    <div className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#fb923c] bg-[#3b1c1c] border border-[#7c2d12] px-2 py-0.5 rounded tracking-widest">
                                                        <MdAccessTime /> Vanishes on {formatDate(notice.expires_at)}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => handleDelete(notice.id)} className="absolute top-4 right-4 p-2 text-[#6d6d88] hover:text-[#ef4444] hover:bg-[#3b1c1c] rounded transition-all opacity-0 group-hover:opacity-100" title="Delete">
                                                <MdDelete className="text-lg" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MEKA THAMA MISS WELA THIBBE */}
            <TemplateModal
                isOpen={showTemplates}
                onClose={() => setShowTemplates(false)}
                onSelect={handleTemplateSelect}
            />
        </div>
    );
}
// import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import {
//     MdAddAlert, MdDelete, MdWarning, MdInfo, MdCheckCircle,
//     MdCampaign, MdAccessTime, MdLibraryBooks, MdClose, MdSearch
// } from 'react-icons/md';
// import api from '../../utils/api';

// // ─── Pre-built templates ────────────────────────────────────────────────
// // Admin innate kelin pawichchi karanna puluwan important messages.
// // [date], [time] wage placeholders thiyenawa — ewa replace karanna oni.
// const NOTICE_TEMPLATES = [
//     // ── Utilities ──
//     {
//         category: 'Utilities',
//         title: 'Water Supply Interruption',
//         type: 'warning',
//         message: 'There will be a water supply interruption on [date] from [start time] to [end time] due to main line maintenance. Please store adequate water in advance. We apologize for the inconvenience.'
//     },
//     {
//         category: 'Utilities',
//         title: 'Scheduled Power Cut',
//         type: 'warning',
//         message: 'A scheduled power cut is announced for [date] from [start time] to [end time]. Please charge your devices and prepare accordingly. The generator will not be available during this period.'
//     },
//     {
//         category: 'Utilities',
//         title: 'Wi-Fi Service Disruption',
//         type: 'warning',
//         message: 'The Wi-Fi service will be temporarily unavailable on [date] from [start time] to [end time] due to network upgrades. Mobile data is recommended during this period.'
//     },

//     // ── Payments ──
//     {
//         category: 'Payments',
//         title: 'Monthly Rent Reminder',
//         type: 'info',
//         message: 'This is a friendly reminder that all pending room rents must be cleared before the [date] of this month to avoid late fees. Please contact the office if you need assistance.'
//     },
//     {
//         category: 'Payments',
//         title: 'Late Payment Notice',
//         type: 'warning',
//         message: 'Residents with unpaid rent for the previous month must settle their dues by [date]. A late fee of Rs. [amount] per day will apply afterwards.'
//     },

//     // ── Maintenance ──
//     {
//         category: 'Maintenance',
//         title: 'Pest Control Service',
//         type: 'warning',
//         message: 'Pest control service is scheduled for [date] from [start time] to [end time]. Please cover all food items, store toothbrushes safely, and stay out of treated areas for at least 4 hours afterwards.'
//     },
//     {
//         category: 'Maintenance',
//         title: 'Common Area Cleaning',
//         type: 'info',
//         message: 'Deep cleaning of common areas (corridors, kitchen, bathrooms) is scheduled for [date]. Please keep your belongings inside your rooms during this time.'
//     },
//     {
//         category: 'Maintenance',
//         title: 'Building Maintenance Work',
//         type: 'warning',
//         message: 'General maintenance and repair work is scheduled for [date]. Some noise and minor disruptions are expected between [start time] and [end time]. Thank you for your patience.'
//     },

//     // ── Safety ──
//     {
//         category: 'Safety',
//         title: 'Fire Safety Drill',
//         type: 'warning',
//         message: 'A mandatory fire safety drill is scheduled for [date] at [time]. All residents must participate. Please assemble at the front courtyard when you hear the alarm.'
//     },
//     {
//         category: 'Safety',
//         title: 'Security Reminder',
//         type: 'warning',
//         message: 'Please ensure your room door and personal locker are properly locked when leaving. Report any suspicious activity or unfamiliar persons to the admin immediately.'
//     },
//     {
//         category: 'Safety',
//         title: 'Gate Curfew Reminder',
//         type: 'info',
//         message: 'Reminder: The main gate is locked at 10:00 PM sharp. Late arrivals must inform the admin at least 1 hour in advance. Repeated violations may incur a fine.'
//     },

//     // ── Events ──
//     {
//         category: 'Events',
//         title: 'Resident Meeting',
//         type: 'info',
//         message: 'A resident meeting is scheduled for [date] at [time] in the common hall. Important matters regarding the boarding will be discussed. Your attendance is highly appreciated.'
//     },
//     {
//         category: 'Events',
//         title: 'Public Holiday — Office Closed',
//         type: 'info',
//         message: 'The boarding office will be closed on [date] in observance of [holiday name]. For emergencies, please contact [contact number]. Normal operations resume the next working day.'
//     },
//     {
//         category: 'Events',
//         title: 'Festive Greetings',
//         type: 'success',
//         message: 'Wishing all our residents a wonderful [festival name]! May this season bring you joy, peace, and success in your studies. Decorations in common areas are welcome — please keep things tidy.'
//     },

//     // ── General ──
//     {
//         category: 'General',
//         title: 'New Resident Welcome',
//         type: 'success',
//         message: 'Please join us in welcoming our new residents joining the boarding this week. Let\'s make them feel at home — kindness and support go a long way!'
//     },
//     {
//         category: 'General',
//         title: 'Visitor Policy Reminder',
//         type: 'info',
//         message: 'A reminder that outside visitors are not permitted inside the rooms without prior admin approval. Visitors may be received in the common area between [start time] and [end time].'
//     }
// ];

// // ─── Template Picker Modal ──────────────────────────────────────────────
// function TemplateModal({ isOpen, onClose, onSelect }) {
//     const [search, setSearch] = useState('');
//     const [activeCategory, setActiveCategory] = useState('All');

//     if (!isOpen) return null;

//     const categories = ['All', ...new Set(NOTICE_TEMPLATES.map(t => t.category))];

//     const filtered = NOTICE_TEMPLATES.filter(t => {
//         const matchesSearch = !search ||
//             t.title.toLowerCase().includes(search.toLowerCase()) ||
//             t.message.toLowerCase().includes(search.toLowerCase());
//         const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
//         return matchesSearch && matchesCategory;
//     });

//     const typeBadge = (type) => {
//         const styles = {
//             warning: 'bg-orange-100 text-orange-700',
//             success: 'bg-green-100 text-green-700',
//             info: 'bg-blue-100 text-blue-700'
//         };
//         return styles[type] || styles.info;
//     };

//     return (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">

//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b border-gray-100">
//                     <div>
//                         <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                             <MdLibraryBooks className="text-indigo-500" />
//                             Notice Templates
//                         </h3>
//                         <p className="text-sm text-gray-500 mt-1">
//                             Choose a template to quickly fill out the form. You can edit before publishing.
//                         </p>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                     >
//                         <MdClose className="text-2xl text-gray-500" />
//                     </button>
//                 </div>

//                 {/* Search + Categories */}
//                 <div className="p-6 border-b border-gray-100 space-y-3">
//                     <div className="relative">
//                         <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
//                         <input
//                             type="text"
//                             placeholder="Search templates..."
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
//                         />
//                     </div>

//                     <div className="flex flex-wrap gap-2">
//                         {categories.map(cat => (
//                             <button
//                                 key={cat}
//                                 onClick={() => setActiveCategory(cat)}
//                                 className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
//                                     activeCategory === cat
//                                         ? 'bg-indigo-600 text-white'
//                                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                                 }`}
//                             >
//                                 {cat}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Templates list */}
//                 <div className="flex-1 overflow-y-auto p-6">
//                     {filtered.length === 0 ? (
//                         <div className="text-center py-10 text-gray-500">No templates match your search.</div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {filtered.map((tpl, idx) => (
//                                 <button
//                                     key={idx}
//                                     onClick={() => onSelect(tpl)}
//                                     className="text-left p-4 border border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/30 transition-all group"
//                                 >
//                                     <div className="flex items-center justify-between mb-2">
//                                         <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
//                                             {tpl.category}
//                                         </span>
//                                         <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeBadge(tpl.type)}`}>
//                                             {tpl.type}
//                                         </span>
//                                     </div>
//                                     <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
//                                         {tpl.title}
//                                     </h4>
//                                     <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
//                                         {tpl.message}
//                                     </p>
//                                 </button>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer */}
//                 <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-center">
//                     <p className="text-xs text-gray-500">
//                         💡 Tip: Replace placeholders like <code className="bg-white px-1.5 py-0.5 rounded border">[date]</code> and <code className="bg-white px-1.5 py-0.5 rounded border">[time]</code> with actual values before publishing.
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // ─── Main Component ─────────────────────────────────────────────────────
// export default function AdminNotices() {
//     const [notices, setNotices] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [showTemplates, setShowTemplates] = useState(false);

//     const [formData, setFormData] = useState({
//         title: '',
//         message: '',
//         type: 'info',
//         expiresInDays: '0'
//     });

//     const fetchNotices = async () => {
//         try {
//             setLoading(true);
//             const res = await api.get('/notices');
//             setNotices(res.data || []);
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to load notices');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchNotices();
//     }, []);

//     const formatDate = (iso) => {
//         if (!iso) return '';
//         return new Date(iso).toLocaleDateString('en-US', {
//             month: 'short', day: 'numeric', year: 'numeric'
//         });
//     };

//     // Template selection handler
//     const handleTemplateSelect = (template) => {
//         setFormData({
//             ...formData,
//             title: template.title,
//             message: template.message,
//             type: template.type
//         });
//         setShowTemplates(false);
//         toast.success('Template loaded! Edit placeholders before publishing.');
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!formData.title.trim() || !formData.message.trim()) {
//             toast.error("Please fill in all fields");
//             return;
//         }

//         // Placeholder check — admin replace karanna marak walatath publish karannath ona
//         if (formData.message.includes('[') && formData.message.includes(']')) {
//             const confirm = window.confirm(
//                 'Your message still contains placeholders like [date] or [time]. Publish anyway?'
//             );
//             if (!confirm) return;
//         }

//         setIsSubmitting(true);
//         try {
//             const payload = {
//                 title: formData.title.trim(),
//                 message: formData.message.trim(),
//                 type: formData.type,
//                 expiresInDays: Number(formData.expiresInDays) || 0
//             };

//             const res = await api.post('/notices', payload);
//             setNotices([res.data, ...notices]);
//             toast.success('Notice published successfully!');
//             setFormData({ title: '', message: '', type: 'info', expiresInDays: '0' });

//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to publish notice');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this notice?")) return;

//         try {
//             await api.delete(`/notices/${id}`);
//             setNotices(notices.filter(n => n.id !== id));
//             toast.success('Notice deleted!');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to delete notice');
//         }
//     };

//     const getTypeStyles = (type) => {
//         switch (type) {
//             case 'warning':
//                 return { icon: <MdWarning />, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-500' };
//             case 'success':
//                 return { icon: <MdCheckCircle />, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-500' };
//             default:
//                 return { icon: <MdInfo />, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500' };
//         }
//     };

//     return (
//         <div className="w-full">
//             {/* Header */}
//             <div className="mb-6 flex items-center justify-between">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-800">Notice Management</h2>
//                     <p className="text-sm text-gray-500 mt-1">Create and manage announcements for all students.</p>
//                 </div>
//                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
//                     <MdCampaign className="text-2xl" />
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//                 {/* Create Form */}
//                 <div className="lg:col-span-1">
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                                 <MdAddAlert className="text-indigo-500" /> Create New Notice
//                             </h3>
//                         </div>

//                         {/* Browse Templates Button */}
//                         <button
//                             type="button"
//                             onClick={() => setShowTemplates(true)}
//                             className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg border border-indigo-200 transition-colors text-sm"
//                         >
//                             <MdLibraryBooks className="text-lg" />
//                             Browse Templates
//                         </button>

//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title</label>
//                                 <input
//                                     type="text"
//                                     value={formData.title}
//                                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                                     placeholder="e.g. Water Supply Interruption"
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Notice Type</label>
//                                 <select
//                                     value={formData.type}
//                                     onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm bg-white"
//                                 >
//                                     <option value="info">Information (Blue)</option>
//                                     <option value="warning">Warning / Alert (Orange)</option>
//                                     <option value="success">Success / Good News (Green)</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Auto-Delete After
//                                 </label>
//                                 <select
//                                     value={formData.expiresInDays}
//                                     onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm bg-white"
//                                 >
//                                     <option value="0">Never (Manual delete only)</option>
//                                     <option value="1">1 Day</option>
//                                     <option value="3">3 Days</option>
//                                     <option value="7">7 Days</option>
//                                     <option value="30">30 Days</option>
//                                 </select>
//                                 <p className="text-[11px] text-gray-400 mt-1">
//                                     "Never" means it stays until you delete it manually.
//                                 </p>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
//                                 <textarea
//                                     value={formData.message}
//                                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                                     rows="6"
//                                     placeholder="Type your detailed announcement here..."
//                                     className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm resize-none"
//                                 />
//                             </div>

//                             <button
//                                 type="submit"
//                                 disabled={isSubmitting}
//                                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 text-sm disabled:opacity-70"
//                             >
//                                 {isSubmitting ? 'Publishing...' : 'Publish Notice'}
//                             </button>
//                         </form>
//                     </div>
//                 </div>

//                 {/* Published List */}
//                 <div className="lg:col-span-2">
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-semibold text-gray-800">Published Notices</h3>
//                             <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
//                                 {notices.length} active
//                             </span>
//                         </div>

//                         {loading ? (
//                             <div className="text-center py-10 text-gray-500">Loading notices...</div>
//                         ) : notices.length === 0 ? (
//                             <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
//                                 No notices published yet.
//                             </div>
//                         ) : (
//                             <div className="space-y-4">
//                                 {notices.map((notice) => {
//                                     const style = getTypeStyles(notice.type);
//                                     return (
//                                         <div
//                                             key={notice.id}
//                                             className={`flex gap-4 p-5 rounded-xl border-l-4 ${style.border} bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-100 group relative`}
//                                         >
//                                             <div className={`text-2xl mt-0.5 ${style.color}`}>
//                                                 {style.icon}
//                                             </div>
//                                             <div className="flex-1 pr-8">
//                                                 <div className="flex justify-between items-center mb-1">
//                                                     <h4 className="font-semibold text-gray-800">{notice.title}</h4>
//                                                     <span className="text-xs text-gray-500">
//                                                         {formatDate(notice.created_at)}
//                                                     </span>
//                                                 </div>
//                                                 <p className="text-sm text-gray-600 leading-relaxed">
//                                                     {notice.message}
//                                                 </p>
//                                                 {notice.expires_at && (
//                                                     <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
//                                                         <MdAccessTime />
//                                                         Auto-deletes on {formatDate(notice.expires_at)}
//                                                     </div>
//                                                 )}
//                                             </div>

//                                             <button
//                                                 onClick={() => handleDelete(notice.id)}
//                                                 className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
//                                                 title="Delete Notice"
//                                             >
//                                                 <MdDelete className="text-lg" />
//                                             </button>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//             </div>

//             {/* Template Picker Modal */}
//             <TemplateModal
//                 isOpen={showTemplates}
//                 onClose={() => setShowTemplates(false)}
//                 onSelect={handleTemplateSelect}
//             />
//         </div>
//     );
// }