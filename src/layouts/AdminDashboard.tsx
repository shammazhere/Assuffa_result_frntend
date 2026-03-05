import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    BookOpen,
    GraduationCap,
    BarChart,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

const AdminDashboard: React.FC = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Classes', href: '/admin/classes', icon: BookOpen },
        { name: 'Subjects', href: '/admin/subjects', icon: GraduationCap },
        { name: 'Students', href: '/admin/students', icon: Users },
        { name: 'Marks', href: '/admin/marks', icon: BarChart },
    ];

    return (
        <div
            className="flex min-h-screen font-sans relative"
            style={{
                backgroundImage: "url('/islamic-gold-bg.png')",
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center',
            }}
        >
            {/* Bright overlay for readability */}
            <div className="fixed inset-0 bg-white/90 backdrop-blur-[2px] z-0 pointer-events-none" />
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b border-yellow-300 text-black z-20 flex justify-between items-center p-4 shadow-sm backdrop-blur-md bg-opacity-95">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
                    <span className="font-black text-lg tracking-widest uppercase">Admin Portal</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-100 rounded-md transition-colors text-black">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-10 w-72 bg-white text-black transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-300 ease-in-out shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-yellow-200 flex flex-col`}>
                <div className="flex items-center justify-center py-6 bg-white border-b-2 border-yellow-300 hidden lg:flex">
                    <img
                        src="/logo.png"
                        alt="As-Swuffah Foundation Logo"
                        className="h-16 object-contain"
                    />
                </div>

                <div className="flex-1 px-4 py-8 overflow-y-auto space-y-2 mt-16 lg:mt-0 scrollbar-thin scrollbar-thumb-yellow-200 scrollbar-track-transparent">
                    <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                        Management
                    </p>
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-gradient-to-r from-yellow-100 to-white text-black border border-yellow-300 shadow-sm font-black'
                                    : 'text-gray-600 hover:bg-yellow-50/50 hover:text-black font-bold'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-yellow-600' : 'text-gray-400 group-hover:text-yellow-500'}`} />
                                {item.name}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-yellow-500 rounded-r-md block shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-yellow-200 bg-gray-50 shrink-0">
                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-bold shadow-sm group"
                    >
                        <LogOut className="w-5 h-5 mr-2 text-gray-400 group-hover:text-red-500 transition-colors" />
                        <span>Logout Account</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col pt-[72px] lg:pt-0 min-w-0 overflow-hidden relative z-10">
                {/* Removed old decorative grid to keep it clean */}

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full relative z-10 text-black">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
