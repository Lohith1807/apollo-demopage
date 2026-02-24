import React, { useState, useEffect } from 'react';
import { getHierarchy } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    User, Lock, Eye, EyeOff, Globe, ArrowRight, HelpCircle, Mail, Briefcase, MapPin, Phone, Calendar as CalendarIcon, Users as UsersIcon
} from 'lucide-react';

export default function Login() {
    console.log("Login Component Rendering...");
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        university: '',
        school: '',
        department: '',
        batch: '',
        phone: '',
        gender: 'Male',
        dob: '',
        address: ''
    });

    const [hierarchy, setHierarchy] = useState([]);

    const { login, signup, loading, error } = useAuth();
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchHierarchy = async () => {
            try {
                const { data } = await getHierarchy();
                if (data.success) {
                    setHierarchy(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch hierarchy", err);
            }
        };
        fetchHierarchy();
    }, []);

    // Selection cascade (Derived State)
    const uni = hierarchy.find(u => u._id === formData.university);
    const schools = uni?.schools || [];

    const sch = schools.find(s => s._id === formData.school);
    const departments = sch?.departments || [];

    const dept = departments.find(d => d._id === formData.department);
    const batches = dept?.batches || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                // IMPORTANT: Do NOT send 'role' in the login payload.
                // The backend checks role only if provided. If we send 'student' (default state)
                // but logging in as 'admin', it fails.
                await login({ email: formData.email, password: formData.password });
            } else {
                // For signup, we can default to student or pending
                await signup({ ...formData, role: 'student' });
                setSignupSuccess(true);
            }
        } catch (err) {
            console.error('Auth error:', err);
        }
    };

    if (signupSuccess) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 font-sans p-6">
                <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowRight size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">Registration Submitted!</h2>
                    <p className="text-slate-500 text-sm mb-6">Your application is pending admin approval. You will be able to login once the admin reviews your details.</p>
                    <button
                        onClick={() => { setSignupSuccess(false); setIsLogin(true); }}
                        className="w-full py-3 bg-apollo-red text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative bg-slate-100 font-sans overflow-hidden py-10">
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: 'url("/au_image.jpeg")' }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <div className={`relative z-10 w-full ${isLogin ? 'max-w-[440px]' : 'max-w-[800px]'} px-6 transition-all duration-500`}>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="pt-8 pb-4 flex flex-col items-center border-b border-slate-50">
                        <img src="/apollo.png" alt="Apollo University" className="h-14 mb-3 object-contain" />
                        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">APOLLO UNIVERSITY</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Smart Campus Portal</p>
                    </div>

                    <div className="px-10 py-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className={isLogin ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"}>

                                {/* Common Fields */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / ID</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                        <input
                                            type="email"
                                            placeholder="email@apollo.edu"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                        {isLogin && <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-apollo-red transition-colors uppercase tracking-widest">Forgot?</a>}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {!isLogin && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <input
                                                    type="tel"
                                                    placeholder="+91 9876543210"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                            <div className="relative group">
                                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <input
                                                    type="date"
                                                    value={formData.dob}
                                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                            <div className="relative group">
                                                <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <select
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm appearance-none"
                                                    required={!isLogin}
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-4 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <textarea
                                                    placeholder="Enter your full address"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm min-h-[80px]"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">University</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <select
                                                    value={formData.university}
                                                    onChange={(e) => setFormData({ ...formData, university: e.target.value, school: '', department: '', batch: '' })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm appearance-none"
                                                    required={!isLogin}
                                                >
                                                    <option value="">Select University</option>
                                                    {hierarchy.map(uni => (
                                                        <option key={uni._id} value={uni._id}>{uni.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">School</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <select
                                                    value={formData.school}
                                                    onChange={(e) => setFormData({ ...formData, school: e.target.value, department: '', batch: '' })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm appearance-none"
                                                    required={!isLogin}
                                                    disabled={!formData.university}
                                                >
                                                    <option value="">Select School</option>
                                                    {schools.map(sch => (
                                                        <option key={sch._id} value={sch._id}>{sch.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                            <div className="relative group">
                                                <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <select
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({ ...formData, department: e.target.value, batch: '' })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm appearance-none"
                                                    required={!isLogin}
                                                    disabled={!formData.school}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map(dept => (
                                                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch / Section</label>
                                            <div className="relative group">
                                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-apollo-red transition-colors" size={16} />
                                                <select
                                                    value={formData.batch}
                                                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-apollo-red/20 focus:bg-white outline-none transition-all font-semibold text-slate-700 text-sm appearance-none"
                                                    required={!isLogin}
                                                    disabled={!formData.department}
                                                >
                                                    <option value="">Select Batch</option>
                                                    {batches.map(b => (
                                                        <option key={b._id} value={b._id}>{b.year} - Section {b.section}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-apollo-red text-white flex items-center justify-center gap-3 rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all mt-4"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{isLogin ? 'Sign In' : 'Register Now'}</>}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[11px] font-bold text-slate-500 hover:text-apollo-red uppercase tracking-widest transition-colors"
                            >
                                {isLogin ? "New Student? Applied for Admission" : "Already Registered? Login Here"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-10 py-4 flex justify-center items-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Powered By</span>
                        <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
                        <span className="text-[11px] font-black text-slate-500 tracking-tighter">Lohith <span className="text-apollo-red">Reddy</span></span>
                    </div>
                </div>


            </div>
        </div>
    );
}
