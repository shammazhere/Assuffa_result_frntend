import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { BookOpen, ShieldCheck, GraduationCap, Calendar } from 'lucide-react';

interface TeacherProfileData {
    id: string;
    username: string;
    role: string;
    assignedClasses: { id: string; name: string; type: string }[];
}

const TeacherProfile: React.FC = () => {
    const [profile, setProfile] = useState<TeacherProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/admin/me');
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4 shadow-sm" />
                <p className="text-black font-black uppercase tracking-widest text-sm animate-pulse">Loading Profile...</p>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center font-bold text-gray-500 py-10">Failed to load profile.</div>;
    }

    const isSuperAdmin = profile.role === 'SUPERADMIN';

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header / ID Card */}
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
                        position: 'relative'
                    }}>
                        {profile.username.charAt(0).toUpperCase()}
                        {isSuperAdmin && (
                            <div className="absolute -bottom-2 -right-2 bg-black text-yellow-400 p-1.5 rounded-full shadow-lg border-2 border-white" title="Superadmin">
                                <ShieldCheck size={16} />
                            </div>
                        )}
                    </div>

                    {/* Teacher Info */}
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            margin: 0, fontSize: '1.6rem', fontWeight: 900,
                            color: 'var(--banner-text)', textTransform: 'uppercase', letterSpacing: '0.02em',
                        }}>
                            {profile.username}
                        </h1>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--banner-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    ROLE
                                </span>
                                <p style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--banner-text)' }}>
                                    {isSuperAdmin ? 'Platform Administrator' : 'Staff Member'}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--banner-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    ACCESS LEVEL
                                </span>
                                <p style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--banner-text)' }}>
                                    {profile.role}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--banner-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    ASSIGNED CLASSES
                                </span>
                                <p style={{ margin: '0.15rem 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--banner-text)' }}>
                                    {isSuperAdmin ? 'ALL CLASSES' : (profile.assignedClasses || []).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats / Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Access Level</p>
                        <p className="text-2xl font-black text-gray-900">{profile.role}</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Classes</p>
                        <p className="text-2xl font-black text-gray-900">
                            {isSuperAdmin ? 'ALL CLASSES' : profile.assignedClasses.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Classes List */}
            {!isSuperAdmin && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                <GraduationCap className="text-yellow-500" size={24} />
                                My Assigned Classes
                            </h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Authorized Data Access Boundaries</p>
                        </div>
                    </div>
                    
                    <div className="p-6 md:p-8 bg-gray-50/30">
                        {(!profile.assignedClasses || profile.assignedClasses.length === 0) ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-black text-gray-500">No Classes Assigned</h3>
                                <p className="text-sm font-bold text-gray-400 mt-1 max-w-sm mx-auto">Please wait for the Superadmin to assign classes to your profile before you can manage student marks and attendance.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(profile.assignedClasses || []).map(cls => (
                                    <div key={cls.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-yellow-300 transition-colors">
                                        <div>
                                            <h4 className="font-black text-gray-900 text-lg uppercase">{cls.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Mode of Study</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded font-black text-xs uppercase tracking-widest ${
                                            cls.type === 'Online' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-green-50 text-green-700 border border-green-200'
                                        }`}>
                                            {cls.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherProfile;
