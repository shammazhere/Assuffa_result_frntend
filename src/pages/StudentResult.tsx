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

const StudentResult: React.FC = () => {
    const { student, logout } = useAuth();
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!student) return null;

    const typedStudent = student as unknown as StudentItem;

    useEffect(() => {
        if (typedStudent.classType === 'Online') {
            navigate('/online-result');
        }
    }, [typedStudent, navigate]);

    const handleDownload = async () => {
        if (!printRef.current) return;
        setIsDownloading(true);

        try {
            // Create a temporary container for capturing a high-quality version
            const original = printRef.current;
            const clone = original.cloneNode(true) as HTMLDivElement;

            Object.assign(clone.style, {
                width: '850px',
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                borderRadius: '0',
                boxShadow: 'none',
                overflow: 'visible'
            });

            document.body.appendChild(clone);

            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 850
            });

            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
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
            backgroundColor: '#FAFAF9',
            backgroundImage: "url('/islamic-gold-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            padding: '1.5rem 0.75rem',
            position: 'relative',
        }}>
            {/* Overlay */}
            <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(2px)',
                zIndex: 0,
            }} />

            <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1.25rem' }} className="print:hidden">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1rem',
                            background: 'white',
                            color: '#111827', fontWeight: 800, fontSize: '0.75rem',
                            border: '2px solid #FCD34D', borderRadius: '0.75rem',
                            cursor: isDownloading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.14)',
                            opacity: isDownloading ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Download style={{ width: 14, height: 14 }} />
                        {isDownloading ? 'PREPARING...' : 'DOWNLOAD'}
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1rem',
                            background: '#FEF2F2', color: '#B91C1C', fontWeight: 800, fontSize: '0.75rem',
                            border: '1px solid #FECACA', borderRadius: '0.75rem', cursor: 'pointer',
                        }}
                    >
                        <LogOut style={{ width: 14, height: 14 }} /> LOGOUT
                    </button>
                </div>

                {/* Main Card */}
                <div
                    ref={printRef}
                    style={{
                        background: '#ffffff',
                        borderRadius: '1.5rem',
                        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.3)',
                        overflow: 'hidden',
                        position: 'relative',
                        width: '100%'
                    }}
                >
                    {/* Header Premium Gold-to-White Fade */}
                    <div style={{
                        background: 'linear-gradient(180deg, #FCD34D 0%, #FEF08A 60%, #FFFFFF 100%)',
                        position: 'relative',
                        padding: 'clamp(2rem, 6vw, 4rem) 1rem clamp(1.5rem, 4vw, 3rem)',
                        textAlign: 'center',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'relative', zIndex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}>
                            <div style={{
                                background: '#fff',
                                padding: '1rem',
                                borderRadius: '1.25rem',
                                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.25)',
                                border: '2px solid white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                minWidth: '140px'
                            }}>
                                <img
                                    src="/ibis-logo.png"
                                    alt="Logo"
                                    style={{
                                        maxHeight: 'clamp(60px, 12vw, 90px)',
                                        maxWidth: '240px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        </div>
                        <h1 style={{
                            position: 'relative', zIndex: 1,
                            fontSize: 'clamp(1rem, 4.5vw, 1.8rem)', fontWeight: 950,
                            color: '#92400E',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase', margin: 0,
                            lineHeight: 1.2
                        }}>
                            INTERNATIONAL BOARD OF ISLAMIC STUDIES
                        </h1>
                        <p style={{
                            position: 'relative', zIndex: 1,
                            color: '#B45309', fontWeight: 800, letterSpacing: '0.2em',
                            textTransform: 'uppercase', fontSize: '0.75rem', margin: '0.75rem 0 0',
                        }}>
                            Official Statement of Marks
                        </p>
                    </div>

                    {/* Student Details */}
                    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', background: '#FAFAF9', borderBottom: '1px solid #E7E5E4' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '0.75rem'
                        }}>
                            {[
                                { label: 'Student Name', value: typedStudent.first_name },
                                { label: 'USN / Roll No.', value: typedStudent.usn },
                                { label: 'Class / Mode', value: `${typedStudent.class?.name || 'N/A'} (${typedStudent.class?.type || 'Offline'})` },
                                { label: 'Total Marks', value: `${totalMarks} / ${maxMarks}` },
                                { label: 'Percentage', value: `${percentage}%` },
                            ].map(item => (
                                <div key={item.label} style={{
                                    background: '#fff', padding: '1rem',
                                    borderRadius: '1rem', border: '1px solid #FDE68A',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                    display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{
                                        fontSize: '0.6rem', fontWeight: 800,
                                        color: '#B45309', letterSpacing: '0.15em',
                                        textTransform: 'uppercase', marginBottom: '0.25rem',
                                    }}>{item.label}</div>
                                    <div style={{
                                        fontSize: '1.1rem', fontWeight: 900,
                                        color: '#1C1917', wordBreak: 'break-all',
                                    }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marks Table */}
                    <div style={{ padding: '1rem clamp(0.75rem, 4vw, 2rem) 2rem' }}>
                        <h2 style={{
                            fontSize: '0.65rem', fontWeight: 800,
                            color: '#B45309', letterSpacing: '0.15em',
                            textTransform: 'uppercase', marginBottom: '1rem',
                            borderBottom: '2px solid #FDE68A', paddingBottom: '0.5rem',
                        }}>Academic Performance</h2>

                        <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '2px solid #FDE68A', backgroundColor: 'white' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                <thead>
                                    <tr style={{ background: '#92400E' }}>
                                        <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                            Subject Description
                                        </th>
                                        <th style={{ padding: '1rem 0.75rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', width: '100px' }}>
                                            Marks
                                        </th>
                                        <th style={{ padding: '1rem 0.75rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', width: '100px' }}>
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
                                                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#1F2937', fontSize: '0.9rem' }}>
                                                        {typeof mark.subject === 'object' ? mark.subject.name : (mark.subject || 'N/A')}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 900, color: '#000', fontSize: '1rem', background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                                                        {mark.total}
                                                    </td>
                                                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '0.2rem 0.75rem',
                                                            borderRadius: '0.5rem',
                                                            background: gc.bg, color: gc.color,
                                                            border: `1px solid ${gc.border}`,
                                                            fontWeight: 900, fontSize: '0.75rem',
                                                        }}>{mark.grade}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>
                                                No marks records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {typedStudent.marks && typedStudent.marks.length > 0 && (
                                    <tfoot>
                                        <tr style={{ background: '#FFFBE6' }}>
                                            <td style={{ padding: '1rem 1.25rem', fontWeight: 900, color: '#92400E', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                                Aggregate Score
                                            </td>
                                            <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: 900, color: '#000', fontSize: '1.1rem' }}>
                                                {totalMarks} / {maxMarks}
                                            </td>
                                            <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: 900, color: '#B45309', fontSize: '1.1rem' }}>
                                                {percentage}%
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Detached Final Result Section */}
                        <div style={{
                            marginTop: '1.25rem',
                            background: finalResult.bg,
                            padding: '1.25rem',
                            borderRadius: '1rem',
                            border: `2px solid ${finalResult.color}22`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '0.7rem', fontWeight: 800, color: '#B45309',
                                    letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 0.1rem 0'
                                }}>FINAL RESULT STATUS</h3>
                                <p style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, margin: 0 }}>Verified Statement of Marks</p>
                            </div>
                            <div style={{
                                fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', fontWeight: 950,
                                color: finalResult.color,
                                letterSpacing: '0.02em',
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
                            flexWrap: 'wrap', gap: '2rem',
                        }}>
                            <div style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>
                                <p style={{ margin: '0 0 0.2rem 0' }}>Date Issued: {new Date().toLocaleDateString('en-GB')}</p>
                                <p style={{ margin: 0 }}>System-Generated Verified Document.</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '160px', borderBottom: '2px solid #374151', marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#1F2937', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Controller of Examinations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >

    );
};

export default StudentResult;
