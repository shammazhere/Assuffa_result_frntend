import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle } from 'lucide-react';
import api from '../../config/api';

const AdminSignup: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/admin/signup', { username, password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create account. Username might exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]"
            style={{
                backgroundImage: "url('/islamic-gold-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
            <div className="absolute inset-0 bg-[#FAFAF9]/95 backdrop-blur-[2px]" />

            <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-yellow-200 relative z-10 m-4">
                <div className="text-center mb-10">
                    <img src="/Asswuffah_Logo.webp" alt="Daaruswuffah Logo" className="h-20 mx-auto mb-6 drop-shadow-md" />
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Teacher Signup</h2>
                    <p className="text-gray-500 mt-2 text-sm font-semibold tracking-wide">Create your teacher portal account</p>
                </div>

                {success ? (
                    <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl mb-6 text-sm font-bold text-center shadow-sm">
                        Account created successfully! Redirecting to login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm">
                                <AlertCircle size={18} className="shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-600 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all font-semibold"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-600 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all font-semibold"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-black rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.23)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:transform-none"
                        >
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/admin/login" className="text-sm font-bold text-yellow-700 hover:text-yellow-600 transition-colors">
                                Already have an account? Login here
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminSignup;
