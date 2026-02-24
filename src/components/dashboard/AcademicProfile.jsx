import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getResults, getAttendance } from '../../services/api';
import {
    User, BookOpen, Award, BarChart3,
    Download, Printer, AlertCircle,
    CheckCircle2, ChevronRight, GraduationCap,
    Mail, Phone, MapPin, Calendar, UserCheck,
    Hash, Globe, Home, Briefcase
} from 'lucide-react';

const ProfileStatCard = ({ label, value, sub, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-current group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{value}</h3>
            {sub && <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{sub}</p>}
        </div>
    </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Icon size={18} />
        </div>
        <div className="overflow-hidden">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-700 truncate">{value || 'Not Provided'}</p>
        </div>
    </div>
);

export default function AcademicProfile() {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return;
            try {
                const [resData, attnData] = await Promise.all([
                    getResults(user._id),
                    getAttendance(user._id)
                ]);
                setResults(resData.data || []);
                setAttendance(attnData.data || []);
            } catch (err) {
                console.error("Failed to fetch academic data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const getGradePoint = (grade) => {
        const points = { 'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'P': 5, 'F': 0 };
        return points[grade] || 0;
    };

    const totalCredits = results.reduce((sum, res) => sum + (res.credits || 3), 0);
    const weightedPoints = results.reduce((sum, res) => sum + (getGradePoint(res.grade) * (res.credits || 3)), 0);
    const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';

    const attendancePercent = attendance.length > 0
        ? ((attendance.filter(a => a.status?.toLowerCase() === 'present').length / attendance.length) * 100).toFixed(1)
        : '0.0';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header: Personal Info & Identity */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-apollo-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    <div className="relative">
                        <div className="w-36 h-36 rounded-3xl ring-4 ring-slate-50 overflow-hidden shadow-2xl bg-slate-100 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=e33e33&color=fff&size=200&bold=true`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl border-4 border-white shadow-xl">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight uppercase">{user?.name}</h1>
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest self-center md:self-auto">
                                    {user?.role}
                                </span>
                            </div>
                            <p className="text-xs font-black text-apollo-red uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-2">
                                <Hash size={14} /> ID: {user?.rollNo || user?.id || 'PENDING'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-100"><Mail size={14} className="text-apollo-red" /> {user?.email}</span>
                            <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-100"><Calendar size={14} className="text-apollo-red" /> Batch: {user?.batch || '2024'}</span>
                            <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-100"><Globe size={14} className="text-apollo-red" /> Apollo Main Campus</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                        <button className="flex items-center justify-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
                            <Download size={16} className="text-apollo-red" /> Edit Profile
                        </button>
                        <button className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-apollo-red transition-all shadow-sm">
                            <Printer size={16} /> Print ID Card
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Personal Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Personal Information</h3>
                            <UserCheck size={16} className="text-apollo-red" />
                        </div>
                        <div className="p-2 space-y-1">
                            <DetailItem icon={Mail} label="Official Email" value={user?.email} />
                            <DetailItem icon={Phone} label="Phone Number" value={user?.phone || '91XXXXXX00'} />
                            <DetailItem icon={Calendar} label="Date of Birth" value={user?.dob || '18 April 2005'} />
                            <DetailItem icon={User} label="Gender" value={user?.gender || 'Male'} />
                            <DetailItem icon={MapPin} label="Home Town" value={user?.place || 'Hyderabad, India'} />
                            <DetailItem icon={Home} label="Full Address" value={user?.address || 'Apollo Knowledge City Campus, Gachibowli'} />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 relative z-10">Academic Progress</h3>
                        <div className="flex items-end gap-3 mb-4 relative z-10">
                            <span className="text-4xl font-black text-apollo-red">15%</span>
                            <span className="text-[10px] font-bold opacity-40 mb-1.5 uppercase">Course Completion</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2 relative z-10">
                            <div className="h-full bg-apollo-red transition-all duration-1000" style={{ width: '15%' }}></div>
                        </div>
                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest relative z-10">Goal: 180 Credits for Graduation</p>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-apollo-red/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                </div>

                {/* Column 2 & 3: Academic Stats & Identity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProfileStatCard label="Computed CGPA" value={`${cgpa} / 10`} sub="Real-time Assessment" icon={GraduationCap} color="bg-indigo-600" />
                        <ProfileStatCard label="Total Attendance" value={`${attendancePercent} %`} sub="Current Term" icon={BarChart3} color="bg-emerald-600" />
                        <ProfileStatCard label="Total Credits" value={`${totalCredits} Units`} sub="Verified" icon={BookOpen} color="bg-blue-600" />
                        <ProfileStatCard label="Registration" value="Verified" sub="No Backlogs" icon={Award} color="bg-amber-500" />
                    </div>

                    {/* Academic Information Table */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Academic Information</h3>
                            <Briefcase size={16} className="text-slate-400" />
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">School / Department</p>
                                    <p className="text-[13px] font-black text-slate-800">{user?.branch || 'School of Advanced Computing'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Branch / Stream</p>
                                    <p className="text-[13px] font-black text-slate-800">{user?.specialization || 'Computer Science Engineering'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Semester</p>
                                    <p className="text-[13px] font-black text-slate-800">{user?.semester || 'Semester 1'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrollment Year</p>
                                    <p className="text-[13px] font-black text-slate-800">{user?.batch?.split('-')[0] || '2024'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Section / Group</p>
                                    <p className="text-[13px] font-black text-slate-800">{user?.section || 'Group A'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campus Location</p>
                                    <p className="text-[13px] font-black text-slate-800">Cyb-1 Campus</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Notifications Sidebar-style inside main */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100/50 flex gap-4">
                            <AlertCircle className="text-apollo-red shrink-0" size={20} />
                            <div>
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1">Administrative Notice</h4>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">"Please ensure your details are verified by the office."</p>
                            </div>
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex gap-4">
                            <GraduationCap className="text-blue-500 shrink-0" size={20} />
                            <div>
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1">Dean's List Status</h4>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">"Your current CGPA qualifies you for the academic excellence award program."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
