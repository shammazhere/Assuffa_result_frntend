import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import type { StudentItem } from '../types';

const StudentAttendanceDetail: React.FC = () => {
    const { student } = useAuth();
    const navigate = useNavigate();

    if (!student) return null;
    const typedStudent = student as unknown as StudentItem;

    const attendanceRecords = typedStudent.attendance || [];

    const presentRecords = attendanceRecords.filter(r => r.status === 'Present');
    const absentRecords = attendanceRecords.filter(r => r.status === 'Absent');
    const totalClasses = attendanceRecords.length;
    const totalPresent = presentRecords.length;
    const totalAbsent = absentRecords.length;
    
    const pct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
    const stillToGo = Math.max(0, Math.ceil(totalClasses * 0.8) - totalPresent);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: 'white', border: '1px solid #FDE68A', borderRadius: '0.75rem',
                    padding: '0.5rem 1rem', cursor: 'pointer', color: '#92400E',
                    fontWeight: 700, fontSize: '0.8rem', alignSelf: 'flex-start',
                }}
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {/* Subject Header */}
            <div style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                borderRadius: '1rem', padding: '1.5rem 2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 4px 15px rgba(245,158,11,0.2)',
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#451A03', textTransform: 'uppercase' }}>
                        Attendance Record
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#78350F', fontSize: '0.85rem', fontWeight: 600 }}>Overall Daily Details</p>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#166534', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 800 }}>
                        PRESENT [{totalPresent}]
                    </span>
                    <span style={{ backgroundColor: '#DC2626', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 800 }}>
                        ABSENT [{totalAbsent}]
                    </span>
                    <span style={{ backgroundColor: '#6B7280', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 800 }}>
                        STILL TO GO [{stillToGo}]
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            {totalClasses > 0 && (
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid #FDE68A' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>Attendance Progress</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: pct >= 80 ? '#166534' : pct >= 60 ? '#D97706' : '#DC2626' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '12px', borderRadius: '6px', background: '#FEF3C7', overflow: 'hidden' }}>
                        <div style={{
                            width: `${pct}%`, height: '100%', borderRadius: '6px',
                            background: pct >= 80 ? 'linear-gradient(90deg, #10B981, #059669)' : pct >= 60 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #EF4444, #DC2626)',
                            transition: 'width 0.6s ease',
                        }} />
                    </div>
                </div>
            )}

            {/* Present / Absent Split Tables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Present Table */}
                <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #BBF7D0', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', background: '#F0FDF4', borderBottom: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>Present</h3>
                        <span style={{ backgroundColor: '#166534', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '0.2rem', fontSize: '0.7rem', fontWeight: 800 }}>
                            CLASSES {presentRecords.length}
                        </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #DCFCE7' }}>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#166534', textAlign: 'center', width: '50px' }}>SL NO</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#166534' }}>DATE</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#166534', textAlign: 'center' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presentRecords.length > 0 ? presentRecords.map((r, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #F0FDF4' }}>
                                    <td style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.85rem', color: '#374151' }}>{i + 1}</td>
                                    <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                                        <span style={{ color: '#166534', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <CheckCircle2 size={14} /> Present
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontStyle: 'italic' }}>No records</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Absent Table */}
                <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #FECACA', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', background: '#FEF2F2', borderBottom: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#991B1B' }}>Absent List</h3>
                        <span style={{ backgroundColor: '#DC2626', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '0.2rem', fontSize: '0.7rem', fontWeight: 800 }}>
                            CLASSES {absentRecords.length}
                        </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #FEE2E2' }}>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#991B1B', textAlign: 'center', width: '50px' }}>SL NO</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#991B1B' }}>DATE</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#991B1B', textAlign: 'center' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {absentRecords.length > 0 ? absentRecords.map((r, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #FEF2F2' }}>
                                    <td style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.85rem', color: '#374151' }}>{i + 1}</td>
                                    <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                                        <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <XCircle size={14} /> Absent
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontStyle: 'italic' }}>No absences — well done!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceDetail;
