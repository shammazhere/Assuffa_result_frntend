import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Award, BookOpen } from 'lucide-react';
import type { StudentItem, MarkItem } from '../types';

const StudentHome: React.FC = () => {
    const { student } = useAuth();
    const navigate = useNavigate();
    if (!student) return null;
    const typedStudent = student as unknown as StudentItem;

    const [activeView, setActiveView] = React.useState<{ type: 'dashboard' | 'lesson_plan' | 'cie', subject: string, marks: number, code: string }>({ type: 'dashboard', subject: '', marks: 0, code: '' });

    // Use the latest term's marks for the dashboard
    const { termMarks, latestTerm } = useMemo(() => {
        const marks = typedStudent.marks || [];
        const terms = Array.from(new Set(marks.map(m => m.term || 'Final')));
        const lt = terms.sort()[terms.length - 1] || 'Final';
        return { termMarks: marks.filter(m => (m.term || 'Final') === lt), latestTerm: lt };
    }, [typedStudent.marks]);

    // Aggregate stats
    const totalMarks = termMarks.reduce((s, m) => s + m.total, 0);
    const maxMarks = termMarks.length * 50;
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
    const highestMark = termMarks.length > 0 ? Math.max(...termMarks.map(m => m.total)) : 0;
    const highestSubject = termMarks.find(m => m.total === highestMark);
    const highestSubjectName = highestSubject ? (typeof highestSubject.subject === 'object' ? highestSubject.subject.name : highestSubject.subject || 'N/A') : 'N/A';

    // Bar chart data
    const barColors = ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', '#FCD34D', '#FBBF24', '#E5A100'];
    const barData = termMarks.map((m, i) => ({
        subject: typeof m.subject === 'object' ? m.subject.name : (m.subject || 'N/A'),
        marks: m.total,
        fill: barColors[i % barColors.length],
    }));

    // Pie chart data for overall score
    const pieData = [
        { name: 'Scored', value: totalMarks, fill: '#F59E0B' },
        { name: 'Remaining', value: Math.max(0, maxMarks - totalMarks), fill: '#FEF3C7' },
    ];

    // Attendance data
    const attendance = typedStudent.attendance || [];
    const totalClasses = attendance.length;
    const totalPresent = attendance.filter(a => a.status === 'Present').length;
    const overallAttPct = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
    
    // Group by month for Bar Chart
    const monthlyData: Record<string, { total: number; present: number }> = {};
    attendance.forEach(a => {
        const month = new Date(a.date).toLocaleString('default', { month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = { total: 0, present: 0 };
        monthlyData[month].total++;
        if (a.status === 'Present') monthlyData[month].present++;
    });

    const attBarData = Object.entries(monthlyData).map(([month, data], i) => ({
        subject: month,
        percentage: Math.round((data.present / data.total) * 100),
        fill: barColors[i % barColors.length],
    }));

    // Attendance pie
    const attPieData = [
        { name: 'Present', value: totalPresent, fill: '#10B981' },
        { name: 'Absent', value: Math.max(0, totalClasses - totalPresent), fill: '#FEE2E2' },
    ];

    // Shared button style for table
    const btnBase: React.CSSProperties = {
        display: 'inline-block', width: '90px', textAlign: 'center',
        padding: '0.4rem 0', fontSize: '0.7rem', fontWeight: 700,
        cursor: 'pointer', borderRadius: '0.25rem', letterSpacing: '0.03em',
        background: 'var(--bg-card)', transition: 'all 0.15s',
    };

    if (activeView.type === 'lesson_plan') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Inter', sans-serif" }}>
                <button onClick={() => setActiveView({ ...activeView, type: 'dashboard' })} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-card)', border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, alignSelf: 'flex-start', color: 'var(--text-muted)' }}>
                    ← Back
                </button>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Course Details
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--icon-color)', fontWeight: 600 }}>Mode:</span> <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{typedStudent.class?.type || 'Academic'}</span></div>
                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--icon-color)', fontWeight: 600 }}>Course:</span> <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{typedStudent.class?.type === 'Online' ? 'Nurture' : 'International Board'}</span></div>
                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--icon-color)', fontWeight: 600 }}>Class:</span> <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{typedStudent.class?.name || 'General'}</span></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--icon-color)', fontWeight: 600 }}>Course Name:</span> <span style={{ fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>{activeView.subject}</span></div>
                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--icon-color)', fontWeight: 600 }}>Course Code:</span> <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activeView.code}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeView.type === 'cie') {
        const rlMarks = Math.round(activeView.marks * 0.6);
        const ltMarks = activeView.marks - rlMarks;
        
        const cieChartData = [
            { name: '1st Term', obtained: rlMarks, max: 30 - rlMarks },
            { name: '2nd Term', obtained: ltMarks, max: 20 - ltMarks },
            { name: 'Combined Average', obtained: activeView.marks, max: 50 - activeView.marks }
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Inter', sans-serif" }}>
                <button onClick={() => setActiveView({ ...activeView, type: 'dashboard' })} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-card)', border: '1px solid #D1D5DB', borderRadius: '0.5rem', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, alignSelf: 'flex-start', color: 'var(--text-muted)' }}>
                    ← Back
                </button>
                
                {/* CIE Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.6rem', textAlign: 'center', border: '1px solid #D1D5DB' }}>
                            PICTURE<br/>COMING<br/>SOON
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject Lecturer</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{activeView.code} - {activeView.subject}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Internal Assessment</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ background: '#22C55E', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '0.25rem' }}>COMBINED AVERAGE: {activeView.marks}</span>
                            <span style={{ background: '#EF4444', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '0.25rem' }}>ATTENDANCE: {overallAttPct.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                {/* CIE Chart */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.25rem', padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>{activeView.subject}({activeView.code})</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cieChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                <YAxis domain={[0, 50]} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: '#F3F4F6'}} />
                                <Bar dataKey="obtained" stackId="a" fill="#7DD3FC" />
                                <Bar dataKey="max" stackId="a" fill="#FB923C" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}><div style={{ width: '12px', height: '12px', background: '#7DD3FC' }}></div> Marks Obtained</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}><div style={{ width: '12px', height: '12px', background: '#FB923C' }}></div> Max Marks</div>
                    </div>
                </div>

                {/* CIE Table */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.25rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>{activeView.subject}({activeView.code})</h3>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>1st Term</th>
                                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>2nd Term</th>
                                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Combined Average</th>
                                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>{rlMarks.toFixed(2)}/30</td>
                                <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>{ltMarks.toFixed(2)}/20</td>
                                <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>{activeView.marks}/50</td>
                                <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>{overallAttPct.toFixed(0)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ─── Quick Stats Row ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--accent-border)', boxShadow: 'var(--card-shadow, none)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--icon-bg)', borderRadius: '0.75rem', padding: '0.75rem', color: 'var(--icon-color)' }}><TrendingUp size={24} /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Overall Score</p>
                        <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-text)' }}>{percentage.toFixed(1)}%</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-muted)' }}>{totalMarks} / {maxMarks}</p>
                    </div>
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--accent-border)', boxShadow: 'var(--card-shadow, none)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--icon-bg)', borderRadius: '0.75rem', padding: '0.75rem', color: 'var(--icon-color)' }}><Award size={24} /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Best Subject</p>
                        <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-text)', textTransform: 'uppercase' }}>{highestSubjectName}</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-muted)' }}>{highestMark} / 50</p>
                    </div>
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--accent-border)', boxShadow: 'var(--card-shadow, none)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--icon-bg)', borderRadius: '0.75rem', padding: '0.75rem', color: 'var(--icon-color)' }}><BookOpen size={24} /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Subjects Enrolled</p>
                        <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-text)' }}>{termMarks.length}</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-muted)' }}>Term: {latestTerm}</p>
                    </div>
                </div>
            </div>

            {/* ─── CIE Charts Row ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '1.5rem 1.5rem 1rem', border: '1px solid var(--accent-border)', boxShadow: 'var(--card-shadow, none)' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--accent-muted)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '2px solid var(--accent-border)', paddingBottom: '0.5rem' }}>CIE - Subject-Wise Marks</h3>
                    <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--accent-muted)', fontWeight: 600 }} axisLine={{ stroke: 'var(--accent-border)' }} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                                <YAxis domain={[0, 50]} tick={{ fontSize: 11, fill: 'var(--accent-muted)' }} axisLine={{ stroke: 'var(--accent-border)' }} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(252, 211, 77, 0.1)' }} contentStyle={{ borderRadius: '0.75rem', border: '1px solid var(--accent-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#FFFBEB' }} />
                                <Bar dataKey="marks" radius={[8, 8, 0, 0]} maxBarSize={45}>
                                    {barData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--accent-border)', boxShadow: 'var(--card-shadow, none)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-muted)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', borderBottom: '2px solid var(--accent-border)', paddingBottom: '0.5rem', width: '100%' }}>Overall CIE</h3>
                    <div style={{ width: '100%', height: '200px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270} stroke="none" /></PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-text)' }}>{percentage.toFixed(0)}%</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent-muted)' }}>SCORE</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Attendance Charts Row ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '1.5rem 1.5rem 1rem', border: '1px solid var(--accent-border)', boxShadow: 'var(--card-shadow, none)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--accent-border)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--accent-muted)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Attendance</h3>
                        <button onClick={() => navigate('/dashboard/attendance')} style={{ backgroundColor: '#FDE68A', color: 'var(--accent-muted)', padding: '0.25rem 0.75rem', fontSize: '0.7rem', fontWeight: 800, borderRadius: '0.25rem', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FCD34D'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#FDE68A'}>
                            VIEW DETAILS
                        </button>
                    </div>
                    <div style={{ height: '280px', width: '100%' }}>
                        {attBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attBarData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--accent-muted)', fontWeight: 600 }} axisLine={{ stroke: 'var(--accent-border)' }} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--accent-muted)' }} axisLine={{ stroke: 'var(--accent-border)' }} tickLine={false} unit="%" />
                                    <Tooltip cursor={{ fill: 'rgba(252, 211, 77, 0.1)' }} contentStyle={{ borderRadius: '0.75rem', border: '1px solid var(--accent-border)', backgroundColor: '#FFFBEB' }} formatter={(value: any) => `${value}%`} />
                                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]} maxBarSize={45}>
                                        {attBarData.map((entry, index) => (<Cell key={`att-${index}`} fill={entry.percentage >= 80 ? '#10B981' : entry.percentage >= 60 ? '#F59E0B' : '#EF4444'} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--accent-muted)', fontStyle: 'italic' }}>No attendance data available yet.</div>
                        )}
                    </div>
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--accent-border)', boxShadow: 'var(--card-shadow, none)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-muted)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', borderBottom: '2px solid var(--accent-border)', paddingBottom: '0.5rem', width: '100%' }}>Overall Attendance</h3>
                    <div style={{ width: '100%', height: '200px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart><Pie data={attPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270} stroke="none" /></PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: totalClasses > 0 ? (overallAttPct >= 80 ? '#166534' : overallAttPct >= 60 ? '#92400E' : '#991B1B') : '#78350F' }}>{overallAttPct.toFixed(0)}%</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent-muted)' }}>ATTENDANCE</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-text)', fontWeight: 700, marginTop: '0.25rem' }}>{totalPresent} / {totalClasses} classes</div>
                </div>
            </div>

            {/* ─── Course Registration Table ─── */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--accent-border)', boxShadow: 'var(--card-shadow, none)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid var(--accent-border)' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-muted)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Course Registration - CIE and Attendance Status</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--accent-border)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', width: '100px' }}>Code</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Course Name</th>
                            <th style={{ padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', width: '130px' }}>Lesson Plan</th>
                            <th style={{ padding: '1rem 1.5rem 1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', width: '120px' }}>CIE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {termMarks.length > 0 ? termMarks.map((m: MarkItem, i: number) => {
                            const subjectName = typeof m.subject === 'object' ? m.subject.name : (m.subject || 'N/A');
                            return (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                                    onMouseOver={e => (e.currentTarget.style.background = '#FFFBEB')}
                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-text)' }}>
                                        SUB{(i + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {subjectName}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                        <button onClick={() => setActiveView({ type: 'lesson_plan', subject: subjectName, marks: m.total, code: `SUB${String(i+1).padStart(2,'0')}` })} style={{ ...btnBase, border: '1.5px solid #1D4ED8', color: '#1D4ED8' }}>LESSON PLAN</button>
                                    </td>
                                    <td style={{ padding: '0.75rem 1.5rem 0.75rem 0.5rem', textAlign: 'center' }}>
                                        <button onClick={() => setActiveView({ type: 'cie', subject: subjectName, marks: m.total, code: `SUB${String(i+1).padStart(2,'0')}` })} style={{ ...btnBase, border: '1.5px solid #10B981', color: '#10B981' }}>CIE</button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-muted)', fontStyle: 'italic' }}>No subjects registered yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentHome;
