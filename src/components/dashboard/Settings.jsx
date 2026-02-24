import React from 'react';
import {
    Settings as SettingsIcon, Bell, Lock, Eye,
    Smartphone, Languages, Shield, HelpCircle,
    BarChart3
} from 'lucide-react';

const SettingGroup = ({ title, description, children }) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{title}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{description}</p>
        </div>
        <div className="p-2 space-y-1">
            {children}
        </div>
    </div>
);

const SettingItem = ({ icon: Icon, label, value, color = "text-slate-500" }) => (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-2xl cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center ${color}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-700">{label}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{value}</p>
            </div>
        </div>
        <div className="w-10 h-6 bg-slate-100 rounded-full relative p-1 group-hover:bg-apollo-red/10 transition-colors">
            <div className="w-4 h-4 bg-white rounded-full shadow-sm border border-slate-200"></div>
        </div>
    </div>
);

export default function Settings() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Benefits Header */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-apollo-red/20 rounded-full text-apollo-red text-[10px] font-black uppercase tracking-widest mb-6">
                            <SettingsIcon size={12} /> Portal Settings
                        </div>
                        <h1 className="text-4xl font-black tracking-tight leading-none mb-4 uppercase">Settings</h1>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Customize your academic experience. Proper configuration ensures your data is secure,
                            your notifications are timely, and your workspace environment is optimized for study.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <h4 className="text-[10px] font-black uppercase text-apollo-red mb-1">Security</h4>
                            <p className="text-[9px] font-bold text-slate-300">Biometric & MFA Integration</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-1">Privacy</h4>
                            <p className="text-[9px] font-bold text-slate-300">Data Visibility Controls</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <h4 className="text-[10px] font-black uppercase text-blue-400 mb-1">Alerts</h4>
                            <p className="text-[9px] font-bold text-slate-300">Push Notifications</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <h4 className="text-[10px] font-black uppercase text-amber-400 mb-1">Theme</h4>
                            <p className="text-[9px] font-bold text-slate-300">Standard & Dark Mode</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-apollo-red/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <SettingGroup title="Account & Security" description="Manage your credentials and sessions">
                        <SettingItem icon={Lock} label="Two-Factor Auth" value="Enabled" color="text-emerald-500" />
                        <SettingItem icon={Shield} label="Session Lockdown" value="Every 24 Hours" />
                        <SettingItem icon={Smartphone} label="Mobile Link" value="iPhone 15 Pro" />
                    </SettingGroup>

                    <SettingGroup title="Communications" description="Notification and alert preferences">
                        <SettingItem icon={Bell} label="Exam Alerts" value="SMS & Push" />
                        <SettingItem icon={Languages} label="Preferred Language" value="English (Global)" />
                    </SettingGroup>
                </div>

                <div className="space-y-8">
                    <SettingGroup title="Display & Interface" description="How the portal looks and feels">
                        <SettingItem icon={Eye} label="Dark Mode" value="Auto-Sync" />
                        <SettingItem icon={BarChart3} label="Compact Mode" value="Disabled" />
                    </SettingGroup>

                    {/* Information about Benefits */}
                    <div className="bg-apollo-red p-8 rounded-3xl text-white shadow-xl shadow-red-500/20 relative overflow-hidden">
                        <HelpCircle className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
                        <h3 className="text-xl font-black uppercase tracking-tight mb-4">Why use settings?</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white shrink-0"></div>
                                <p className="text-xs font-bold leading-relaxed opacity-90 italic">"Settings protect your information by allowing precise control over who sees your data."</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white shrink-0"></div>
                                <p className="text-xs font-bold leading-relaxed opacity-90 italic">"Proper alert configuration ensures you never miss a surprise quiz or a faculty announcement."</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
