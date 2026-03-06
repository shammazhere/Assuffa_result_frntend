import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Download, LogOut } from 'lucide-react';
import type { StudentItem, MarkItem } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const gradeColor = (grade: string | undefined) => {
    if (!grade) return { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' };
    if (grade.startsWith('A')) return { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
    if (grade.startsWith('B')) return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
    if (grade.startsWith('C')) return { bg: '#FEFCE8', color: '#854D0E', border: '#FDE68A' };
    if (grade.startsWith('D')) return { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' };
    return { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' };
};

const StudentResultOnline: React.FC = () => {
    const { student, logout } = useAuth();
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!student) return null;

    const typedStudent = student as unknown as StudentItem;

    useEffect(() => {
        if (typedStudent.classType !== 'Online') {
            navigate('/result');
        }
    }, [typedStudent, navigate]);

    const handleDownload = async () => {
        if (!printRef.current) return;
        setIsDownloading(true);

        try {
            // Give a tiny bit of time for any styles to settle
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(printRef.current, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // If the content is taller than A4, we still fit it on one page or scale it
            // For results, usually it fits on one page.
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${typedStudent.first_name}_Result.pdf`);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const totalMarks = typedStudent.marks?.reduce((sum: number, m: MarkItem) => sum + m.total, 0) ?? 0;
    const maxMarks = (typedStudent.marks?.length ?? 0) * 100;
    const percentageNum = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
    const percentage = percentageNum.toFixed(1);

    const getFinalResult = (p: number) => {
        if (p >= 85) return { text: 'DISTINCTION', color: '#166534', bg: '#F0FDF4' };
        if (p >= 70) return { text: 'FIRST CLASS', color: '#1E40AF', bg: '#EFF6FF' };
        if (p >= 55) return { text: 'SECOND CLASS', color: '#854D0E', bg: '#FEFCE8' };
        if (p >= 40) return { text: 'THIRD CLASS', color: '#C2410C', bg: '#FFF7ED' };
        return { text: 'NOT ELIGIBLE', color: '#7F1D1D', bg: '#FEF2F2' };
    };

    const finalResult = getFinalResult(percentageNum);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: "url('/islamic-gold-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            padding: '2rem 1rem',
            position: 'relative',
        }}>
            {/* Overlay */}
            <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(4px)',
                zIndex: 0,
            }} />

            <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }} className="print:hidden">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.25rem',
                            background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                            color: '#92400E', fontWeight: 800, fontSize: '0.85rem',
                            border: '1px solid #FDE68A', borderRadius: '0.5rem',
                            cursor: isDownloading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                            opacity: isDownloading ? 0.7 : 1,
                        }}
                    >
                        <Download style={{ width: 16, height: 16 }} />
                        {isDownloading ? 'Generating PDF...' : 'Download Result'}
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.25rem',
                            background: '#FEF2F2', color: '#B91C1C', fontWeight: 700, fontSize: '0.85rem',
                            border: '1px solid #FECACA', borderRadius: '0.5rem', cursor: 'pointer',
                        }}
                    >
                        <LogOut style={{ width: 16, height: 16 }} /> Logout
                    </button>
                </div>

                {/* Main Card */}
                <div
                    ref={printRef}
                    style={{
                        background: '#ffffff',
                        borderRadius: '1.5rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.3)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {/* Header Premium Gold-to-White Fade */}
                    <div style={{
                        background: 'linear-gradient(180deg, #FCD34D 0%, #FEF08A 45%, #FFFFFF 100%)',
                        position: 'relative',
                        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1rem, 5vw, 2rem) clamp(2rem, 5vw, 3rem)',
                        textAlign: 'center',
                        overflow: 'hidden',
                    }}>
                        {/* Shimmering Top Light */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }} />

                        <div style={{
                            position: 'relative', zIndex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.75rem',
                        }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '1rem 2rem',
                                borderRadius: '1rem', // Rounded rectangle for wide logo
                                boxShadow: '0 15px 35px rgba(245, 158, 11, 0.3), inset 0 2px 5px rgba(255,255,255,1)',
                                border: '2px solid rgba(255,255,255,1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <img
                                    src="/online-logo.png"
                                    alt="Online Nurture English Medium Madrasa Logo"
                                    style={{
                                        maxHeight: '90px',
                                        maxWidth: '250px', // Wider max width
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        </div>
                        <h1 style={{
                            position: 'relative', zIndex: 1,
                            fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', fontWeight: 900,
                            color: '#D97706', // Peach/Creme Gold tone
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase', margin: 0,
                            textShadow: '0 2px 10px rgba(255,255,255,0.5)'
                        }}>
                            ONLINE NURTURE ENGLISH MEDIUM MADRASA
                        </h1>
                        <p style={{
                            position: 'relative', zIndex: 1,
                            color: '#B45309', fontWeight: 800, letterSpacing: '0.3em',
                            textTransform: 'uppercase', fontSize: '0.85rem', margin: '0.75rem 0 0',
                        }}>
                            Official Statement of Marks
                        </p>
                    </div>

                    {/* Student Details */}
                    <div style={{ padding: 'clamp(1.5rem, 5vw, 2rem)', background: '#FAFAF9', borderBottom: '1px solid #E7E5E4' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)', // Column of 3
                            gap: '1.25rem'
                        }}>
                            {[
                                { label: 'Student Name', value: typedStudent.first_name },
                                { label: 'USN / Roll No.', value: typedStudent.usn },
                                { label: 'Class', value: typedStudent.class?.name || 'N/A' },
                                { label: 'Mode', value: typedStudent.class?.type || 'Offline' },
                                { label: 'Total Marks', value: `${totalMarks} / ${maxMarks}` },
                                { label: 'Percentage', value: `${percentage}%` },
                            ].map(item => (
                                <div key={item.label} style={{
                                    background: '#fff', padding: '1.25rem',
                                    borderRadius: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.03), inset 0 2px 0 rgba(255,255,255,1)',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #FCD34D, #FDE68A)' }} />

                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 800,
                                        color: '#B45309', letterSpacing: '0.15em',
                                        textTransform: 'uppercase', marginBottom: '0.5rem',
                                    }}>{item.label}</div>
                                    <div style={{
                                        fontSize: '1.2rem', fontWeight: 900,
                                        color: '#1C1917', wordBreak: 'break-all',
                                    }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marks Table */}
                    <div style={{ padding: 'clamp(1rem, 5vw, 1.5rem) clamp(1rem, 5vw, 2rem) 2rem' }}>
                        <h2 style={{
                            fontSize: '0.7rem', fontWeight: 800,
                            color: '#B45309', letterSpacing: '0.15em',
                            textTransform: 'uppercase', marginBottom: '1rem',
                            borderBottom: '2px solid #FDE68A', paddingBottom: '0.5rem',
                        }}>Subject-Wise Marks</h2>

                        <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '2px solid #FDE68A' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(to right, #D97706, #F59E0B)' }}>
                                        <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 900, color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                            Subject
                                        </th>
                                        <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase', width: '140px' }}>
                                            Marks / 100
                                        </th>
                                        <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase', width: '120px' }}>
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {typedStudent.marks && typedStudent.marks.length > 0 ? (
                                        typedStudent.marks.map((mark: MarkItem, idx: number) => {
                                            const gc = gradeColor(mark.grade);
                                            return (
                                                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#FFFBEB', borderBottom: '1px solid #FDE68A' }}>
                                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#000', borderRight: '1px solid #FDE68A' }}>
                                                        {typeof mark.subject === 'object' ? mark.subject.name : (mark.subject || 'N/A')}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 900, color: '#000', fontSize: '1.1rem', borderRight: '1px solid #FDE68A' }}>
                                                        {mark.total}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '0.3rem 1rem',
                                                            borderRadius: '9999px',
                                                            background: gc.bg, color: gc.color,
                                                            border: `1px solid ${gc.border}`,
                                                            fontWeight: 900, fontSize: '0.8rem',
                                                            letterSpacing: '0.1em',
                                                        }}>{mark.grade}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>
                                                No results published yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {/* Total Row */}
                                {typedStudent.marks && typedStudent.marks.length > 0 && (
                                    <tfoot>
                                        <tr style={{ background: '#FFFBEB', borderTop: '2px solid #FBBF24' }}>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 900, color: '#000', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em', borderRight: '1px solid #FDE68A' }}>
                                                Total Aggregate
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 900, color: '#000', fontSize: '1.2rem', borderRight: '1px solid #FDE68A' }}>
                                                {totalMarks} / {maxMarks}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 900, color: '#B45309', fontSize: '1rem' }}>
                                                {percentage}%
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Detached Final Result Section */}
                        <div style={{
                            marginTop: '1.5rem',
                            background: finalResult.bg,
                            padding: '1.5rem 2rem',
                            borderRadius: '1rem',
                            border: `2px solid ${finalResult.color}33`, // Low opacity border
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '0.8rem', fontWeight: 800, color: '#B45309',
                                    letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 0.25rem 0'
                                }}>Statement of Result</h3>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Final outcome based on official aggregate.</p>
                            </div>
                            <div style={{
                                fontSize: '1.8rem', fontWeight: 950,
                                color: finalResult.color,
                                letterSpacing: '0.05em',
                                textAlign: 'right'
                            }}>
                                {finalResult.text}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            marginTop: '2rem', paddingTop: '1.5rem',
                            borderTop: '1px solid #E5E7EB',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                            flexWrap: 'wrap', gap: '1.5rem',
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                                <p>Date Printed: {new Date().toLocaleDateString()}</p>
                                <p>This is a system generated document.</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '180px', borderBottom: '1px solid #374151', marginBottom: '0.4rem' }} />
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>Controller of Examinations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StudentResultOnline;
