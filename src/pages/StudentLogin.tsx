import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const StudentLogin: React.FC = () => {
    const [usn, setUsn] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');
    const { studentLogin, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (dob.length !== 10) {
                setError('Please enter Date of Birth in DD/MM/YYYY format');
                return;
            }
            const parts = dob.split('/');
            const formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
            const studentData = await studentLogin(usn, formattedDob);
            if (studentData.classType === 'Online') {
                navigate('/online-result');
            } else {
                navigate('/result');
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg || 'Invalid Register Number or Date of Birth. Please try again.');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundImage: "url('/islamic-gold-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Dark overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(3px)',
            }} />

            {/* Card */}
            <div style={{
                position: 'relative', zIndex: 10,
                background: 'rgba(255,255,255,0.97)',
                borderRadius: '1.25rem',
                boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
                padding: 'clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 5vw, 2rem)',
                width: '100%',
                maxWidth: '440px',
                borderTop: '5px solid #EAB308',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <img
                        src="/logo.png"
                        alt="As-Swuffah Foundation Logo"
                        style={{
                            height: 'auto',
                            maxHeight: '90px',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                        }}
                    />
                </div>

                <h1 style={{
                    textAlign: 'center', fontSize: '1.6rem',
                    fontWeight: 900, color: '#CA8A04',
                    letterSpacing: '0.04em', marginBottom: '0',
                    lineHeight: '1.1',
                    textTransform: 'uppercase',
                }}>
                    DAARU-SSWUFFAH
                </h1>
                <div style={{
                    textAlign: 'center', fontSize: '0.85rem',
                    fontWeight: 900, color: '#CA8A04',
                    letterSpacing: '0.1em', marginBottom: '0.2rem',
                    lineHeight: '1.2',
                    textTransform: 'uppercase',
                }}>
                    center of excellence
                </div>
                <div style={{
                    textAlign: 'center', fontSize: '0.75rem',
                    fontWeight: 500, color: '#000',
                    letterSpacing: '0.08em', marginBottom: '0.8rem',
                    textTransform: 'uppercase',
                }}>
                    Jeppu, Mangalore
                </div>
                <h2 style={{
                    textAlign: 'center', fontSize: '1rem',
                    fontWeight: 800, color: '#CA8A04',
                    letterSpacing: '0.1em', marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                }}>
                    Result Portal
                </h2>
                <p style={{
                    textAlign: 'center', fontSize: '0.8rem',
                    color: '#222', fontWeight: 700,
                    marginBottom: '1.75rem', letterSpacing: '0.06em',
                }}>
                    "Empowering education, ensuring excellence."<br />
                    <span style={{ color: '#CA8A04', fontWeight: 700, fontStyle: 'italic', display: 'inline-block', marginTop: '0.4rem' }}>"Wishing you all the best of luck!"</span>
                </p>

                {error && (
                    <div style={{
                        background: '#FEF2F2', borderLeft: '4px solid #EF4444',
                        padding: '0.75rem 1rem', borderRadius: '0.5rem',
                        marginBottom: '1rem', color: '#991B1B',
                        fontSize: '0.875rem', fontWeight: 600,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.75rem',
                            fontWeight: 800, color: '#000',
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            borderBottom: '2px solid #EAB308',
                            paddingBottom: '2px',
                        }}>
                            Register Number
                        </label>
                        <input
                            type="text"
                            required
                            value={usn}
                            onChange={(e) => setUsn(e.target.value.toUpperCase())}
                            placeholder="Enter Register Number"
                            style={{
                                width: '100%', padding: '0.75rem 1rem',
                                border: '2px solid #FDE68A', borderRadius: '0.5rem',
                                fontSize: '0.9rem', fontWeight: 700,
                                color: '#000', background: '#FFFBEB',
                                outline: 'none', boxSizing: 'border-box',
                                textTransform: 'uppercase',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#EAB308'; e.target.style.background = '#fff'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#FDE68A'; e.target.style.background = '#FFFBEB'; }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.75rem',
                            fontWeight: 800, color: '#000',
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            borderBottom: '2px solid #EAB308',
                            paddingBottom: '2px',
                        }}>
                            Date of Birth
                        </label>
                        <input
                            type="text"
                            required
                            value={dob}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
                                let formatted = raw;
                                if (raw.length > 4) {
                                    formatted = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4);
                                } else if (raw.length > 2) {
                                    formatted = raw.slice(0, 2) + '/' + raw.slice(2);
                                }
                                setDob(formatted);
                            }}
                            maxLength={10}
                            placeholder="DD/MM/YYYY"
                            style={{
                                width: '100%', padding: '0.75rem 1rem',
                                border: '2px solid #FDE68A', borderRadius: '0.5rem',
                                fontSize: '0.9rem', fontWeight: 700,
                                color: '#000', background: '#FFFBEB',
                                outline: 'none', boxSizing: 'border-box',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#EAB308'; e.target.style.background = '#fff'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#FDE68A'; e.target.style.background = '#FFFBEB'; }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '0.85rem',
                            background: 'linear-gradient(135deg, #EAB308, #CA8A04)',
                            color: '#000', fontWeight: 800,
                            fontSize: '0.9rem', letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            border: '1px solid #A16207', borderRadius: '0.5rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(234,179,8,0.4)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <LogIn style={{ width: 18, height: 18 }} />
                        {isLoading ? 'Signing In...' : 'View My Result'}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem', paddingTop: '1rem',
                    borderTop: '1px solid #E5E7EB',
                    textAlign: 'center',
                }}>
                    <a href="/admin/login" style={{
                        color: '#9CA3AF', fontSize: '0.7rem',
                        fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EAB308')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                    >
                        🔐 Admin Portal
                    </a>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
