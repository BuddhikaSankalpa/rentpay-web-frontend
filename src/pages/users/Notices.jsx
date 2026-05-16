import React, { useState, useEffect } from 'react';
import {
    MdCampaign, MdNotificationsActive, MdRule,
    MdWarning, MdInfoOutline, MdCheckCircleOutline
} from 'react-icons/md';
import api from '../../utils/api';

const NOTICES_LAST_VISIT_KEY = 'notices_last_visited';

export default function Notices() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const [lastVisitedAt] = useState(() => {
        const stored = localStorage.getItem(NOTICES_LAST_VISIT_KEY);
        return stored ? new Date(stored) : null;
    });

    const rules = [
        "Main gate will be locked at 10:00 PM. Late arrivals must inform the admin in advance.",
        "No loud music or disturbing noise after 9:30 PM to respect studying students.",
        "Garbage must be separated (Plastic/Organic) and put into the main bins on the ground floor.",
        "Outside visitors are not allowed inside the rooms without prior permission from the admin.",
        "Turn off all lights and fans when leaving the room to save electricity."
    ];

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await api.get('/notices');
                setAnnouncements(res.data || []);
            } catch (err) {
                console.error('Failed to load notices:', err);
                setAnnouncements([]);
            } finally {
                setLoading(false);
                localStorage.setItem(NOTICES_LAST_VISIT_KEY, new Date().toISOString());
            }
        };
        fetchNotices();
    }, []);

    const formatDate = (iso) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const isNew = (createdAt) => {
        if (!createdAt) return false;
        if (!lastVisitedAt) return true;  
        return new Date(createdAt) > lastVisitedAt;
    };

    const getNoticeStyle = (type) => {
        switch (type) {
            case 'warning':
                return { icon: <MdWarning />, color: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20' };
            case 'success':
                return { icon: <MdCheckCircleOutline />, color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/20' };
            default:
                return { icon: <MdInfoOutline />, color: 'text-[#A58ED4]', bg: 'bg-[#A58ED4]/5', border: 'border-[#A58ED4]/20' };
        }
    };

    return (
        <div className="w-full mt-8 flex flex-col gap-8 pb-10">

            {(loading || announcements.length > 0) && (
                <div className="bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[#A58ED4]">
                            <MdNotificationsActive className="text-2xl" />
                        </div>
                        <h2 className="text-2xl font-serif text-white tracking-wide">Latest Announcements</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500 font-serif italic">Loading announcements...</div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {announcements.map((notice) => {
                                const style = getNoticeStyle(notice.type);
                                const isNewNotice = isNew(notice.created_at);

                                return (
                                    <div
                                        key={notice.id}
                                        className={`relative p-6 rounded-xl border ${style.border} ${style.bg} transition-all hover:bg-white/[0.04] flex gap-5`}
                                    >
                                        {isNewNotice && (
                                            <div className="absolute -top-2 -right-2 flex items-center">
                                                <span className="relative flex h-3 w-3 mr-1">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </span>
                                                <span className="bg-red-500 text-white text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full shadow-lg">
                                                    NEW
                                                </span>
                                            </div>
                                        )}

                                        <div className={`text-3xl mt-1 ${style.color}`}>
                                            {style.icon}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                                <h3 className={`text-lg font-serif tracking-wide ${isNewNotice ? 'text-white' : 'text-gray-300'}`}>
                                                    {notice.title}
                                                </h3>
                                                <span className="text-[10px] tracking-widest uppercase font-bold text-gray-500 whitespace-nowrap">
                                                    {formatDate(notice.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {notice.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className="bg-[#0a0815]/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-400">
                        <MdRule className="text-2xl" />
                    </div>
                    <h2 className="text-2xl font-serif text-white tracking-wide">Boarding Rules & Guidelines</h2>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6">
                    <ul className="space-y-4">
                        {rules.map((rule, index) => (
                            <li key={index} className="flex items-start gap-4 text-gray-400 text-sm">
                                <MdCampaign className="text-[#A58ED4] text-xl mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{rule}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}
// import React, { useState, useEffect } from 'react';
// import {
//     MdCampaign, MdNotificationsActive, MdRule,
//     MdWarning, MdInfoOutline, MdCheckCircleOutline
// } from 'react-icons/md';
// import api from '../../utils/api';

// const NOTICES_LAST_VISIT_KEY = 'notices_last_visited';

// export default function Notices() {
//     const [announcements, setAnnouncements] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Page load wena weleta last visit timestamp eka mathaka thiyaganna.
//     // Mehema unata, NEW badge eka detect karanna kalin value eka use karanawa,
//     // visit kerma update kerma component re-render karanne nä.
//     const [lastVisitedAt] = useState(() => {
//         const stored = localStorage.getItem(NOTICES_LAST_VISIT_KEY);
//         return stored ? new Date(stored) : null;
//     });

//     const rules = [
//         "Main gate will be locked at 10:00 PM. Late arrivals must inform the admin in advance.",
//         "No loud music or disturbing noise after 9:30 PM to respect studying students.",
//         "Garbage must be separated (Plastic/Organic) and put into the main bins on the ground floor.",
//         "Outside visitors are not allowed inside the rooms without prior permission from the admin.",
//         "Turn off all lights and fans when leaving the room to save electricity."
//     ];

//     useEffect(() => {
//         const fetchNotices = async () => {
//             try {
//                 const res = await api.get('/notices');
//                 setAnnouncements(res.data || []);
//             } catch (err) {
//                 console.error('Failed to load notices:', err);
//                 setAnnouncements([]);
//             } finally {
//                 setLoading(false);
//                 // Page eka load wenne ithin user dänatama notices dakkanawa
//                 // → ithin "last visited" eka now ekata update karanawa.
//                 // Mehema unata oyaa next thawath rääsa ekak wennama mage badge eka mathuwenne nä.
//                 localStorage.setItem(NOTICES_LAST_VISIT_KEY, new Date().toISOString());
//             }
//         };
//         fetchNotices();
//     }, []);

//     const formatDate = (iso) => {
//         if (!iso) return '';
//         return new Date(iso).toLocaleDateString('en-US', {
//             month: 'short', day: 'numeric', year: 'numeric'
//         });
//     };

//     // Notice eka "NEW" wenne, last visit ekata passe e eka create unā nam witharai.
//     // First-ever visit nam (lastVisitedAt null), all notices = NEW.
//     const isNew = (createdAt) => {
//         if (!createdAt) return false;
//         if (!lastVisitedAt) return true;  // First visit — okkoma NEW
//         return new Date(createdAt) > lastVisitedAt;
//     };

//     const getNoticeStyle = (type) => {
//         switch (type) {
//             case 'warning':
//                 return { icon: <MdWarning />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
//             case 'success':
//                 return { icon: <MdCheckCircleOutline />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
//             default:
//                 return { icon: <MdInfoOutline />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
//         }
//     };

//     return (
//         <div className="w-full mt-8 flex flex-col gap-8 pb-10">

//             {/* Latest Announcements */}
//             {(loading || announcements.length > 0) && (
//                 <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
//                     <div className="flex items-center gap-3 mb-8">
//                         <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
//                             <MdNotificationsActive className="text-2xl" />
//                         </div>
//                         <h2 className="text-xl font-serif text-white">Latest Announcements</h2>
//                     </div>

//                     {loading ? (
//                         <div className="text-center py-8 text-gray-500">Loading announcements...</div>
//                     ) : (
//                         <div className="flex flex-col gap-4">
//                             {announcements.map((notice) => {
//                                 const style = getNoticeStyle(notice.type);
//                                 const isNewNotice = isNew(notice.created_at);

//                                 return (
//                                     <div
//                                         key={notice.id}
//                                         className={`relative p-6 rounded-xl border ${style.border} ${style.bg} transition-all hover:bg-white/5 flex gap-4`}
//                                     >
//                                         {isNewNotice && (
//                                             <div className="absolute -top-2 -right-2 flex items-center">
//                                                 <span className="relative flex h-3 w-3 mr-1">
//                                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                                                     <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
//                                                 </span>
//                                                 <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
//                                                     NEW
//                                                 </span>
//                                             </div>
//                                         )}

//                                         <div className={`text-3xl mt-1 ${style.color}`}>
//                                             {style.icon}
//                                         </div>
//                                         <div className="flex flex-col flex-1">
//                                             <div className="flex justify-between items-start mb-2">
//                                                 <h3 className={`text-lg font-bold ${isNewNotice ? 'text-white' : 'text-gray-300'}`}>
//                                                     {notice.title}
//                                                 </h3>
//                                                 <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
//                                                     {formatDate(notice.created_at)}
//                                                 </span>
//                                             </div>
//                                             <p className="text-gray-400 text-sm leading-relaxed">
//                                                 {notice.message}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Permanent Rules */}
//             <div className="bg-[#161121]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
//                 <div className="flex items-center gap-3 mb-8">
//                     <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
//                         <MdRule className="text-2xl" />
//                     </div>
//                     <h2 className="text-xl font-serif text-white">Boarding Rules & Guidelines</h2>
//                 </div>

//                 <div className="bg-white/5 border border-white/5 rounded-xl p-6">
//                     <ul className="space-y-4">
//                         {rules.map((rule, index) => (
//                             <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
//                                 <MdCampaign className="text-purple-400 text-lg mt-0.5 flex-shrink-0" />
//                                 <span className="leading-relaxed">{rule}</span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>

//         </div>
//     );
// }