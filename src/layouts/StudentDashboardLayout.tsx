import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, LogOut, Moon } from 'lucide-react';
import type { StudentItem } from '../types';

const StudentDashboardLayout: React.FC = () => {
    const { student, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    if (!student) return null;
    const typedStudent = student as unknown as StudentItem;

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark-theme');
    };

    const navItems = [
        { name: 'HOME', path: '/dashboard', icon: Home },
        { name: 'EXAM RESULTS', path: '/dashboard/exam-results', icon: FileText },
    ];

    const logoSrc = '/Asswuffah_Logo.webp';
    const institutionName = 'ASSWUFFAH STUDENT PORTAL';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', fontFamily: "'Inter', sans-serif" }}>

            {/* ─── Top Navigation Bar ─── */}
            <header style={{
                background: 'var(--nav-bg, rgba(255,255,255,0.8))',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderBottom: '1px solid var(--border-color)',
            }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.5rem', height: '115px',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src={logoSrc} alt="Logo" style={{ height: '105px', objectFit: 'contain', filter: 'var(--logo-glow, none)' }} />
                    </div>

                    {/* Navigation Links */}
                    <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {navItems.map(item => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        background: isActive ? 'var(--bg-muted)' : 'transparent',
                                        border: 'none',
                                        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        transition: 'all 0.2s ease',
                                        letterSpacing: '0.05em',
                                        borderBottom: isActive ? '2px solid var(--text-main)' : '2px solid transparent',
                                    }}
                                >
                                    <Icon size={15} />
                                    {item.name}
                                </button>
                            );
                        })}

                        {/* Divider */}
                        <div style={{ width: '1px', height: '28px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

                        <button
                            onClick={logout}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#EF4444',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.5rem 0.85rem',
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s ease',
                                letterSpacing: '0.05em',
                            }}
                        >
                            <LogOut size={14} /> LOGOUT
                        </button>
                        
                        {/* Theme Switcher */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem',
                                marginLeft: '0.5rem',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Moon size={20} />
                        </button>
                    </nav>
                </div>
            </header>

            {/* ─── Profile Banner ─── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                <div style={{
                    marginTop: '1.5rem',
                    background: 'var(--banner-bg)',
                    borderRadius: '1.25rem',
                    padding: '2rem 2.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'var(--banner-shadow)',
                }}>
                    {/* Decorative circles */}
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                    <div style={{ position: 'absolute', bottom: '-60px', right: '80px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ position: 'absolute', top: '20px', left: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
                        {/* Avatar */}
                        <div style={{
                            width: '90px', height: '90px',
                            borderRadius: '50%',
                            border: '4px solid rgba(255,255,255,0.6)',
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', fontWeight: 900,
                            color: 'var(--banner-text)',
                            flexShrink: 0,
                            backdropFilter: 'blur(10px)',
                        }}>
                            {typedStudent.first_name.charAt(0).toUpperCase()}
                        </div>

                        {/* Student Info */}
                        <div style={{ flex: 1 }}>
                            <h1 style={{
                                margin: 0, fontSize: '1.6rem', fontWeight: 900,
                                color: 'var(--banner-text)', textTransform: 'uppercase', letterSpacing: '0.02em',
                            }}>
                                {typedStudent.first_name}
                            </h1>
                            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                <div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--banner-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        USN / ROLL NO.
                                    </span>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--banner-text)' }}>
                                        {typedStudent.usn}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--banner-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        COURSE
                                    </span>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--banner-text)' }}>
                                        {typedStudent.class?.type === 'Online' ? 'Nurture' : 'International Board'}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--banner-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        CLASS
                                    </span>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--banner-text)' }}>
                                        {typedStudent.class?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--banner-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        MODE
                                    </span>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--banner-text)' }}>
                                        {typedStudent.class?.type || 'Offline'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Date */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--banner-text-muted)', letterSpacing: '0.1em' }}>LAST UPDATED</span>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--banner-text)' }}>
                                {typedStudent.updatedAt 
                                    ? new Date(typedStudent.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Content Area ─── */}
            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
                <Outlet />
            </main>

            {/* ─── Footer ─── */}
            <footer style={{
                maxWidth: '1200px', margin: '0 auto', padding: '1.5rem',
                borderTop: '1px solid var(--accent-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.7rem', color: 'var(--accent-muted)', fontWeight: 500,
            }}>
                <span>© {new Date().getFullYear()} {institutionName}</span>
                <span>System-Generated Portal</span>
            </footer>
        </div>
    );
};

export default StudentDashboardLayout;
