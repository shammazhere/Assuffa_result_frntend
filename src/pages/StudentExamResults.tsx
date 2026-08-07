import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import type { StudentItem } from '../types';

const StudentExamResults: React.FC = () => {
    const { student } = useAuth();
    const navigate = useNavigate();

    if (!student) return null;
    const typedStudent = student as unknown as StudentItem;

    const availableTerms = useMemo(() => {
        const terms = new Set(typedStudent.marks?.map(m => m.term || 'Final'));
        return Array.from(terms).sort();
    }, [typedStudent.marks]);

    return (
        <div style={{ padding: '0.5rem 0' }}>
            <h2 style={{
                color: '#92400E', fontSize: '0.85rem', fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                borderBottom: '2px solid #FDE68A', paddingBottom: '0.75rem',
                marginBottom: '2rem',
            }}>
                Select Examination Term
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {availableTerms.map(term => (
                    <div key={term} style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '1.25rem',
                        border: '1px solid #FDE68A',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.08)',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '200px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}>
                        {/* Decorative corner */}
                        <div style={{
                            position: 'absolute', top: 0, right: 0,
                            width: '80px', height: '80px',
                            background: 'linear-gradient(135deg, transparent 50%, #FFFBEB 50%)',
                        }} />
                        <div style={{
                            position: 'absolute', top: '12px', right: '12px',
                            color: '#D97706', opacity: 0.4,
                        }}>
                            <FileText size={20} />
                        </div>

                        <div>
                            <h3 style={{
                                margin: '0 0 0.5rem 0', color: '#78350F',
                                fontSize: '1.25rem', fontWeight: 800,
                            }}>
                                {term}
                            </h3>
                            <p style={{ margin: 0, color: '#B45309', fontSize: '0.85rem', fontWeight: 500 }}>
                                Official Statement of Marks
                            </p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
                            <span style={{ color: '#D97706', fontSize: '0.7rem', fontWeight: 600 }}>
                                Last Updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => navigate(`/${typedStudent.classType === 'Online' ? 'online-print-result' : 'print-result'}/${encodeURIComponent(term)}`)}
                                style={{
                                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.65rem 1.25rem',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    letterSpacing: '0.05em',
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                                }}
                            >
                                VIEW RESULTS <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {availableTerms.length === 0 && (
                    <div style={{
                        gridColumn: '1 / -1',
                        padding: '4rem 2rem', textAlign: 'center',
                        background: 'white', borderRadius: '1.25rem',
                        border: '1px solid #FDE68A',
                    }}>
                        <FileText size={48} style={{ color: '#FDE68A', marginBottom: '1rem' }} />
                        <h3 style={{ color: '#92400E', fontWeight: 700 }}>No Exam Results Published</h3>
                        <p style={{ color: '#B45309', fontSize: '0.9rem' }}>Results will appear here once they are published by the administration.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentExamResults;
