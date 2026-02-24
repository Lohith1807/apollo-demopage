import React, { useState, useEffect } from 'react';
import {
    Calendar, ChevronDown, Search, Filter,
    BookOpen, CheckCircle2, XCircle, Clock,
    BarChart3, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAttendance } from '../../services/api';

const AttendanceDoughnut = ({ percentage }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="w-full h-full -rotate-90">
                <circle
                    cx="96"
                    cy="96"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100"
                />
                <circle
                    cx="96"
                    cy="96"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-apollo-red transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">{percentage.toFixed(1)}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Attendance</span>
            </div>
        </div>
    );
};

export default function Attendance() {
    const { user } = useAuth();
    const [selectedTerm, setSelectedTerm] = useState('Others/1/24-25');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    const terms = [
        'Others/1/24-25',
        'Others/2/24-25',
        'Others/3/24-25',
        'Others/4/24-25',
        'Fall/2024',
        'Spring/2025',
        'Winter/2025'
    ];

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user?._id) return;
            try {
                const { data } = await getAttendance(user._id);
                setAttendanceData(data || []);
            } catch (err) {
                console.error("Failed to fetch attendance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [user]);

    // Grouping logic for subjects
    const subjectStats = attendanceData.reduce((acc, curr) => {
        if (!acc[curr.subject]) {
            acc[curr.subject] = { attended: 0, total: 0 };
        }
        acc[curr.subject].total += 1;
        if (curr.status?.toLowerCase() === 'present') {
            acc[curr.subject].attended += 1;
        }
        return acc;
    }, {});

    const subjectsList = Object.keys(subjectStats).map(name => ({
        name,
        attended: subjectStats[name].attended,
        total: subjectStats[name].total,
        percentage: ((subjectStats[name].attended / subjectStats[name].total) * 100).toFixed(1)
    }));

    const totalSessions = attendanceData.length;
    const presentCount = attendanceData.filter(a => a.status?.toLowerCase() === 'present').length;
    const absentCount = totalSessions - presentCount;
    const overallPercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header / Top Stats Section - Ultra Compact */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Circle Chart - Smaller for space */}
                    <div className="shrink-0 scale-75 -my-4">
                        <AttendanceDoughnut percentage={overallPercentage} />
                    </div>

                    {/* Stats Row - All in one compact line */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Attendance</h1>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">{user?.name} • {user?.rollNo}</p>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center justify-between w-56 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-white hover:border-apollo-red transition-all shadow-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <Calendar size={14} className="text-apollo-red" />
                                        {selectedTerm}
                                    </span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in duration-200">
                                        <div className="max-h-32 overflow-y-auto scrollbar-hide space-y-1">
                                            {terms.map(term => (
                                                <button
                                                    key={term}
                                                    onClick={() => { setSelectedTerm(term); setDropdownOpen(false); }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedTerm === term ? 'bg-apollo-red text-white' : 'hover:bg-slate-50 text-slate-500'
                                                        }`}
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sessions</p>
                                <h4 className="text-lg font-black text-slate-800 tracking-tighter">{totalSessions}</h4>
                            </div>
                            <div className="px-4 py-3 bg-emerald-50/40 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest">Present</p>
                                <h4 className="text-lg font-black text-emerald-600 tracking-tighter">{presentCount}</h4>
                            </div>
                            <div className="px-4 py-3 bg-red-50/40 rounded-2xl border border-red-100 flex items-center justify-between">
                                <p className="text-[8px] font-black text-apollo-red/60 uppercase tracking-widest">Absent</p>
                                <h4 className="text-lg font-black text-apollo-red tracking-tighter">{absentCount}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-apollo-red/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                </div>
            </div>

            {/* Subject Table (Image 1 style) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Course Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Attended</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Scheduled</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {subjectsList.length > 0 ? subjectsList.map((sub, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-apollo-red group-hover:text-white transition-all">
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{sub.name}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Verified Record</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-sm font-black text-slate-700">{sub.attended}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-sm font-black text-slate-500">{sub.total}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${parseFloat(sub.percentage) >= 75 ? 'bg-emerald-500' : 'bg-apollo-red'
                                                        }`}
                                                    style={{ width: `${sub.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-sm font-black ${parseFloat(sub.percentage) >= 75 ? 'text-emerald-600' : 'text-apollo-red'
                                                }`}>
                                                {sub.percentage}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <Clock size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No attendance records found for this term</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Regulatory Notice */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-center justify-between shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <Filter size={20} className="text-apollo-red" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest">Attendance Regulation</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Requirement: Minimum 75% per course for examination eligibility.</p>
                    </div>
                </div>
                <ArrowRight className="text-white/20" size={24} />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-apollo-red/10 to-transparent"></div>
            </div>
        </div >
    );
}
