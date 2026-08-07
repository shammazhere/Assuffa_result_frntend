import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { ClassItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AttendanceStudent {
    id: string;
    first_name: string;
    usn: string;
    status: 'Present' | 'Absent';
}

const AttendanceManager: React.FC = () => {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const { adminRole } = useAuth();
    
    const [students, setStudents] = useState<AttendanceStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModified, setIsModified] = useState(true);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/classes`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                setClasses(res.data);
            } catch (error) {
                toast.error('Failed to load classes');
            }
        };
        fetchClasses();
    }, []);



    useEffect(() => {
        if (!selectedClass) {
            setStudents([]);
            return;
        }
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/attendance/class/${selectedClass}/students?date=${date}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                const fetchedStudents: any[] = res.data.students;
                
                const hasExisting = fetchedStudents.some(s => s.status !== null);
                setAlreadySubmitted(hasExisting);
                setIsModified(!hasExisting); // Only enable save immediately if not already submitted
                
                setStudents(fetchedStudents.map(s => ({
                    id: s.id,
                    first_name: s.first_name,
                    usn: s.usn,
                    status: s.status || 'Present' // Use existing status, or default to Present
                })));
            } catch (error) {
                toast.error('Failed to load students');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedClass]);

    const toggleAttendance = (id: string) => {
        setIsModified(true);
        setStudents(prev => prev.map(s => {
            if (s.id === id) {
                return { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' };
            }
            return s;
        }));
    };

    const markAll = (status: 'Present' | 'Absent') => {
        setIsModified(true);
        setStudents(prev => prev.map(s => ({ ...s, status })));
    };

    const submitAttendance = async () => {
        if (!selectedClass || !date || students.length === 0) {
            toast.warning('Please complete all required fields.');
            return;
        }
        
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(`${import.meta.env.VITE_API_URL}/attendance/mark`, {
                date,
                students: students.map(s => ({ student_id: s.id, status: s.status }))
            }, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            toast.success('Attendance marked successfully!');
            setAlreadySubmitted(true);
            setIsModified(false);
        } catch (error) {
            toast.error('Failed to mark attendance.');
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 lg:p-10 border border-yellow-200/50 shadow-xl">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-black tracking-tight mb-2 uppercase">Mark Attendance</h1>
                    <p className="text-gray-500 font-medium">Digital attendance entry for specific subjects and time slots.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Class</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all font-medium text-black bg-white"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Date</label>
                    <input
                        type="date"
                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 font-medium ${
                            adminRole === 'SUPERADMIN' 
                                ? 'bg-white text-black focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10' 
                                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                        value={date}
                        onChange={(e) => adminRole === 'SUPERADMIN' && setDate(e.target.value)}
                        disabled={adminRole !== 'SUPERADMIN'}
                    />
                </div>
            </div>

            {loading && <div className="text-center py-10 font-bold text-yellow-600">Loading Students...</div>}

            {students.length > 0 && !loading && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                        <div className="font-bold text-gray-700">Total Students: {students.length}</div>
                        <div className="flex gap-2">
                            <button onClick={() => markAll('Present')} className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors text-sm uppercase">Mark All Present</button>
                            <button onClick={() => markAll('Absent')} className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors text-sm uppercase">Mark All Absent</button>
                        </div>
                    </div>
                    
                    {alreadySubmitted && !isModified && (
                        <div className="bg-blue-50 border-b border-blue-100 p-3 text-center text-blue-700 font-bold text-sm">
                            ℹ️ Attendance for this class has already been submitted today.
                        </div>
                    )}

                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 sticky top-0 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-black text-xs text-gray-500 uppercase tracking-wider w-[100px]">SL NO</th>
                                    <th className="px-6 py-4 font-black text-xs text-gray-500 uppercase tracking-wider">Register No</th>
                                    <th className="px-6 py-4 font-black text-xs text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 font-black text-xs text-gray-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {students.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-yellow-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{idx + 1}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 uppercase">{student.usn}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 uppercase">{student.first_name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleAttendance(student.id)}
                                                className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wide border-2 transition-all w-32 ${
                                                    student.status === 'Present'
                                                        ? 'bg-green-50 text-green-600 border-green-500 hover:bg-green-100 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                                        : 'bg-red-50 text-red-600 border-red-500 hover:bg-red-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                                }`}
                                            >
                                                {student.status}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
                        {!isModified && alreadySubmitted && (
                            <span className="text-sm font-bold text-gray-500 uppercase">No unsaved changes</span>
                        )}
                        <button
                            onClick={submitAttendance}
                            disabled={!isModified}
                            className={`px-8 py-3 font-black rounded-xl shadow-lg transition-all transform hover:scale-105 uppercase tracking-wider text-sm ${
                                isModified ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/30" : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                            }`}
                        >
                            {isModified ? "Save Attendance" : "Saved"}
                        </button>
                    </div>
                </div>
            )}
            
            {!selectedClass && !loading && (
                <div className="text-center py-20 bg-yellow-50/50 border border-yellow-100 rounded-2xl">
                    <div className="w-16 h-16 mx-auto bg-white border border-yellow-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <span className="text-2xl">{adminRole === 'TEACHER' && classes.length === 0 ? '🔒' : '📋'}</span>
                    </div>
                    <p className="text-gray-700 font-bold uppercase tracking-widest">
                        {adminRole === 'TEACHER' && classes.length === 0 
                            ? "Waiting for Admin Assignment" 
                            : "Select a class to begin"}
                    </p>
                    {adminRole === 'TEACHER' && classes.length === 0 ? (
                        <p className="text-gray-500 text-xs font-semibold mt-2">You have no assigned classes yet. Please ask the Superadmin to assign classes to your account.</p>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default AttendanceManager;
