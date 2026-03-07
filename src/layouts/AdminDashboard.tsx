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
            <div className="fixed inset-0 bg-[#FAFAF9]/95 backdrop-blur-[1px] z-0 pointer-events-none" />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Header Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b border-yellow-300 text-black z-40 flex justify-between items-center px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
                    <span className="font-black text-sm tracking-tight uppercase text-yellow-700">Admin Control</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-yellow-50 rounded-xl transition-all border border-transparent active:border-yellow-200"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white text-black transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-out shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-yellow-200 flex flex-col`}>
                <div className="flex items-center justify-center py-8 bg-white border-b-2 border-yellow-300 hidden lg:flex">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-16 object-contain"
                    />
                </div>

                <div className="flex-1 px-4 py-8 overflow-y-auto space-y-1.5 mt-0 lg:mt-0 scrollbar-none">
                    <p className="px-4 text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] mb-4 opacity-70">
                        Administration
                    </p>
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-yellow-50 text-black border border-yellow-200 font-black shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50/80 hover:text-black font-bold'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3.5 transition-colors ${isActive ? 'text-yellow-600' : 'text-gray-400 group-hover:text-yellow-500'}`} />
                                <span className="text-[15px]">{item.name}</span>
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-yellow-500 rounded-r-full shadow-[0_0_15px_rgba(234,179,8,0.6)]"></span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-yellow-100 bg-gray-50/50">
                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-black shadow-sm group text-sm"
                    >
                        <LogOut className="w-4 h-4 mr-2 text-gray-400 group-hover:text-red-500 transition-colors" />
                        <span>Logout Account</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col pt-16 lg:pt-0 min-w-0 overflow-hidden relative z-10">
                <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto w-full text-black">
                    <div className="max-w-7xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
