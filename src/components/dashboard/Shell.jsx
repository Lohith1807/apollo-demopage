import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LogOut, LayoutDashboard, Menu, X, Settings,
    MessageSquare, LayoutGrid, Calendar, Bell, Mail,
    Search, GraduationCap, ChevronDown, User, ShieldCheck,
    BookOpen, ClipboardList, HelpCircle, Briefcase, FileText,
    Users, CheckSquare, QrCode, Home, Clock
} from 'lucide-react';

export default function Shell({ children, activeTab, setActiveTab }) {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);

    const menuGroups = [
        {
            title: "Navigation",
            items: [
                { id: 'dashboard', name: 'Home', icon: Home },

                // Registrar (Super Admin) specific
                ...(user?.role === 'registrar' ? [
                    { id: 'institution', name: 'Institutional Setup', icon: LayoutGrid },
                    { id: 'reports', name: 'Global Reports', icon: FileText }
                ] : []),

                // Dean (School Admin) specific
                ...(user?.role === 'dean' ? [
                    { id: 'school-management', name: 'School Control', icon: ShieldCheck },
                    { id: 'faculty-allocation', name: 'Dean Office', icon: ClipboardList }
                ] : []),

                // Standard Admin / COE role
                ...(['admin', 'coe'].includes(user?.role) ? [
                    { id: 'classroom', name: 'Applications', icon: BookOpen },
                    { id: 'attendance', name: 'Manage Attendance', icon: ClipboardList },
                    { id: 'reports', name: 'Dept Reports', icon: FileText },
                    { id: 'exam-control', name: 'Exam Hub', icon: Settings }
                ] : []),

                // Teacher specific
                ...(user?.role === 'teacher' ? [
                    { id: 'classroom', name: 'My Classroom', icon: BookOpen },
                    { id: 'attendance', name: 'Mark Attendance', icon: ClipboardList },
                    { id: 'exam-control', name: 'Marks Entry', icon: Settings }
                ] : []),

                // Student specific
                ...(user?.role === 'student' ? [
                    { id: 'classroom', name: 'Classroom', icon: BookOpen },
                    { id: 'attendance', name: 'My Attendance', icon: CheckSquare },
                    { id: 'results', name: 'Academic Results', icon: GraduationCap }
                ] : []),

                // Common items
                { id: 'curriculum', name: 'Course Catalog', icon: Briefcase },
                { id: 'directory', name: 'Global Directory', icon: Users },
                { id: 'exams', name: 'Examinations', icon: FileText },
            ]
        },
        {
            title: "Support",
            items: [
                { id: 'calendar', name: 'Calendar & Events', icon: Calendar },
                { id: 'help', name: 'Help & Support', icon: HelpCircle },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col font-sans overflow-hidden">

            {/* Top Navigation Bar - Responsive */}
            <header className={`h-14 flex items-center justify-between px-4 sticky top-0 z-[60] shadow-sm transition-colors duration-300 ${sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? 'bg-white' : 'bg-apollo-red md:bg-white md:border-b md:border-slate-200'}`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`p-2 rounded-lg transition-colors ${sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? 'text-slate-500 hover:bg-slate-100' : 'text-white md:text-slate-500 md:hover:bg-slate-100'}`}
                    >
                        <Menu size={22} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                        <span className={`text-xl font-black tracking-tighter uppercase transition-colors md:hidden ${sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? 'text-slate-900' : 'text-white'}`}>TAU</span>
                        <div className="hidden md:flex items-center gap-2">
                            <img src="/apollo.png" alt="Apollo" className="h-8 w-auto" />
                            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                            <h2 className="text-sm font-black text-slate-700 tracking-tight hidden sm:block uppercase">
                                {user?.university?.name?.split(' ').slice(0, -1).join(' ')} <span className="text-apollo-red">{user?.university?.name?.split(' ').slice(-1)}</span>
                                {!user?.university && <>The Apollo <span className="text-apollo-red">University</span></>}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Desktop Search */}
                <div className="flex-1 max-w-xl px-12 hidden lg:block">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-apollo-red transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search courses, files, or faculty..."
                            className="w-full bg-slate-100 border-transparent border focus:bg-white focus:border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs font-medium outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Mobile Icons */}
                    <div className="flex md:hidden gap-1 items-center">
                        <button className="p-2 text-white/90 hover:text-white transition-all">
                            <Search size={22} strokeWidth={2.5} />
                        </button>
                        <button className="p-2 text-white/90 hover:text-white transition-all">
                            <QrCode size={22} strokeWidth={2.5} />
                        </button>
                        <button className="p-2 text-white/90 hover:text-white transition-all relative">
                            <Bell size={22} strokeWidth={2.5} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full ring-2 ring-apollo-red"></span>
                        </button>
                    </div>

                    {/* Desktop profile */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex gap-1 mr-2">
                            <button className="p-2 text-slate-400 hover:text-apollo-red hover:bg-slate-100 rounded-lg transition-all relative">
                                <Mail size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-apollo-red hover:bg-slate-100 rounded-lg transition-all relative">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-apollo-red rounded-full ring-2 ring-white"></span>
                            </button>
                        </div>

                        <div className="relative">
                            <div
                                className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer group"
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <div className="text-right hidden md:block">
                                    <h4 className="text-xs font-bold text-slate-800 leading-none">{user?.name}</h4>
                                    <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">{user?.role}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 group-hover:border-apollo-red transition-colors">
                                    <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=e33e33&color=fff&bold=true`} alt="" />
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                                    </div>
                                    <button
                                        onClick={() => { setActiveTab('profile'); setProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-apollo-red transition-all"
                                    >
                                        <User size={14} /> My Profile
                                    </button>
                                    <button
                                        onClick={() => { setProfileOpen(false); setActiveTab('settings'); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-apollo-red transition-all"
                                    >
                                        <Settings size={14} /> Settings
                                    </button>
                                    <div className="h-px bg-slate-50 my-1"></div>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <LogOut size={14} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className={`flex flex-1 overflow-hidden relative`}>
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[45]" onClick={() => setSidebarOpen(false)}></div>
                )}

                {/* Sidebar - Responsive Design */}
                <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50 fixed inset-y-0 left-0 md:relative ${sidebarOpen ? 'w-[85%] md:w-64 translate-x-0 shadow-2xl md:shadow-none' : 'w-0 -translate-x-full lg:w-16 lg:translate-x-0'}`}>

                    {/* Student Identity Mobile Header */}
                    {sidebarOpen && (
                        <div className="md:hidden">
                            <div className="bg-apollo-red p-6 text-white relative overflow-hidden">
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] backdrop-blur-md flex items-center justify-center p-1 border border-white/20 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'student'}`} alt="Profile" className="w-full h-full object-cover rounded-[1.2rem]" />
                                    </div>
                                    <button className="p-2 bg-white/10 rounded-xl">
                                        <QrCode size={24} />
                                    </button>
                                </div>
                                <div className="mt-4 relative z-10">
                                    <h3 className="text-xl font-black tracking-tight">{user?.name}</h3>
                                    <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-widest">{user?.rollNo || user?.id}</p>

                                    <div className="mt-6">
                                        <div className="inline-block px-4 py-1.5 bg-white text-apollo-red rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-white/10">
                                            {user?.role === 'student' ? 'Student Portal' : user?.role === 'teacher' ? 'Faculty Portal' : 'Admin Portal'}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Identity Module */}
                    {sidebarOpen && user?.role === 'student' && (
                        <div className="hidden md:block p-4 border-b border-slate-100 mb-2">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
                                <div className="h-20 bg-apollo-red relative">
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                                        <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg group-hover:scale-105 transition-all">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'student'}`} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <button className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all">
                                            <QrCode size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-12 pb-5 px-3 text-center">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{user?.name}</h4>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.rollNo || user?.id}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight italic">
                                            {user?.semester}nd Year | Section {user?.section || 'A'} {user?.batch?.split('-')[0]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden md:py-2 scrollbar-none">
                        {menuGroups.map((group, gIdx) => (
                            <div key={gIdx} className={`mb-6 px-3 ${gIdx === 0 && 'mt-2'}`}>
                                {sidebarOpen && <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-3 opacity-60">{group.title}</h3>}
                                <div className="space-y-1">
                                    {group.items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveTab(item.id.toLowerCase());
                                                if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${activeTab.toLowerCase() === item.id.toLowerCase()
                                                ? 'bg-red-50 text-apollo-red shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold uppercase tracking-tight'
                                                }`}
                                        >
                                            <item.icon size={22} className={`flex-shrink-0 ${activeTab.toLowerCase() === item.id.toLowerCase() ? 'text-apollo-red' : 'text-slate-400'}`} />
                                            {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="text-[14px] font-bold">{item.name}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="md:hidden p-4 border-t border-slate-100">
                        <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 text-red-500 font-black uppercase tracking-widest text-xs">
                            <LogOut size={20} /> Close Session
                        </button>
                    </div>

                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-white md:bg-slate-50 p-4 md:p-6 scroll-smooth pb-24 md:pb-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>

                    <footer className="mt-12 py-6 border-t border-slate-200 hidden md:flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                            <span>Powered By</span>
                            <div className="h-3 w-[1px] bg-slate-300"></div>
                            <span className="text-slate-500">Lohith <span className="text-apollo-red">Reddy</span></span>
                        </div>
                    </footer>
                </main>
            </div>

            {/* Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around px-6 z-[60] pb-2">
                {[
                    { id: 'dashboard', name: 'Feed', icon: Home },
                    { id: 'classroom', name: 'Classroom', icon: BookOpen },
                    { id: 'help', name: 'Help Center', icon: HelpCircle },
                    { id: 'message', name: 'Message', icon: MessageSquare },
                    { id: 'reminders', name: 'Reminders', icon: Clock }
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-apollo-red scale-110' : 'text-slate-400 opacity-70'}`}
                    >
                        <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{item.name}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
