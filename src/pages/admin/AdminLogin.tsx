import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { adminLogin, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await adminLogin(username, password);
            navigate('/admin/classes');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg || 'Invalid username or password');
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
            }}
        >
            {/* Dark overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(4px)',
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
                    Admin Portal
                </h2>
                <p style={{
                    textAlign: 'center', fontSize: '0.8rem',
                    color: '#222', fontWeight: 700,
                    marginBottom: '1.75rem', letterSpacing: '0.06em',
                }}>
                    "Empowering education, ensuring excellence."<br />
                    <span style={{ color: '#CA8A04', fontWeight: 700, fontStyle: 'italic', display: 'inline-block', marginTop: '0.4rem' }}>Secure access for administrators.</span>
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
                            display: 'inline-block', fontSize: '0.75rem',
                            fontWeight: 800, color: '#000',
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            marginBottom: '0.5rem',
                            borderBottom: '2px solid #EAB308',
                            paddingBottom: '2px',
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            style={{
                                display: 'block', width: '100%',
                                padding: '0.75rem 1rem',
                                border: '2px solid #FDE68A', borderRadius: '0.5rem',
                                fontSize: '0.9rem', fontWeight: 700,
                                color: '#000', background: '#FFFBEB',
                                outline: 'none', boxSizing: 'border-box',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#EAB308'; e.target.style.background = '#fff'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#FDE68A'; e.target.style.background = '#FFFBEB'; }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label style={{
                            display: 'inline-block', fontSize: '0.75rem',
                            fontWeight: 800, color: '#000',
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            marginBottom: '0.5rem',
                            borderBottom: '2px solid #EAB308',
                            paddingBottom: '2px',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                display: 'block', width: '100%',
                                padding: '0.75rem 1rem',
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
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            color: '#EAB308', fontWeight: 800,
                            fontSize: '0.9rem', letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            border: '2px solid #EAB308', borderRadius: '0.5rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box',
                        }}
                    >
                        <LogIn style={{ width: 18, height: 18 }} />
                        {isLoading ? 'Authenticating...' : 'Sign in as Admin'}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem', paddingTop: '1rem',
                    borderTop: '1px solid #E5E7EB',
                    textAlign: 'center',
                }}>
                    <a href="/" style={{
                        color: '#9CA3AF', fontSize: '0.7rem',
                        fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EAB308')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                    >
                        ← Return to Student Portal
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
