import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { Trash2, Users, Plus } from 'lucide-react';
import type { StudentItem, ClassItem } from '../../types';
import StatusAlert from '../../components/admin/StatusAlert';

const StudentsManager: React.FC = () => {
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);

    // Add student form state
    const [newName, setNewName] = useState('');
    const [newUsn, setNewUsn] = useState('');
    const [newDob, setNewDob] = useState('');
    const [newClassId, setNewClassId] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Filter & Search State
    const [filterClassId, setFilterClassId] = useState('');
    const [searchUsn, setSearchUsn] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [classesRes, studentsRes] = await Promise.all([
                api.get('/admin/classes'),
                api.get('/admin/students')
            ]);
            setClasses(classesRes.data);
            setStudents(studentsRes.data);
        } catch (_err) {
            setError('Failed to load initial data. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFilteredStudents = async (classId: string, usnQuery: string) => {
        try {
            const params = new URLSearchParams();
            if (classId) params.append('class_id', classId);
            if (usnQuery) params.append('usn', usnQuery);

            const url = `/admin/students?${params.toString()}`;
            const res = await api.get(url);
            setStudents(res.data);
        } catch (_err) {
            setError('Failed to filter students.');
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFilterClassId(val);
        fetchFilteredStudents(val, searchUsn);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchUsn(val);
        fetchFilteredStudents(filterClassId, val);
    };

    // Standardized Beast-Mode DOB Normalization: handles 2-digit years and varied separators
    const normalizeDob = (raw: string): string => {
        let s = raw.trim().replace(/\s/g, '');
        if (!s) return "";
        if (/^\d{8}$/.test(s)) {
            return `${s.slice(0, 2)}/${s.slice(2, 4)}/${s.slice(4)}`;
        }
        const parts = s.split(/[/\-.]/);
        if (parts.length === 3) {
            let [p1, p2, p3] = parts;
            // Handle YYYY-MM-DD
            if (p1.length === 4) {
                const [y, m, d] = [p1, p2, p3];
                return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
            }
            // Handle D/M/Y or DD/MM/YYYY
            let d = p1, m = p2, y = p3;
            if (y.length === 2) {
                y = (parseInt(y) < 50 ? "20" : "19") + y;
            }
            return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
        }
        return s;
    };

    const addStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newUsn || !newDob || !newClassId) {
            setError('Please fill in all fields.');
            return;
        }
        setIsAdding(true);
        try {
            const normalizedDob = normalizeDob(newDob);
            await api.post('/admin/students', {
                first_name: newName.trim().toUpperCase(),
                usn: newUsn.trim().toUpperCase(),
                dob: normalizedDob,
                class_id: newClassId,
            });
            setSuccess(`Student "${newName.toUpperCase()}" added successfully.`);
            setNewName('');
            setNewUsn('');
            setNewDob('');
            setNewClassId('');
            fetchInitialData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add student.');
        } finally {
            setIsAdding(false);
        }
    };

    const deleteStudent = async (id: string) => {
        if (!window.confirm('Are you sure? This will permanently delete the student and their marks.')) return;

        try {
            await api.delete(`/admin/students/${id}`);
            setStudents(prev => prev.filter(s => s.id !== id));
            setSuccess('Student deleted successfully.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete student.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4" />
            <p className="text-black font-black uppercase tracking-widest text-sm">Synchronizing Database...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 pb-4 border-b-2 border-yellow-200 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500 shadow-md">
                        <Users className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-black tracking-widest uppercase">Students Portal</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center rounded-lg bg-yellow-50 border-2 border-yellow-200 p-1.5 shadow-sm">
                        <select
                            value={filterClassId}
                            onChange={handleFilterChange}
                            className="bg-white px-3 py-1.5 rounded text-sm font-bold border-0 focus:ring-0 text-black shadow-sm"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center rounded-lg bg-yellow-50 border-2 border-yellow-200 p-1.5 shadow-sm">
                        <input
                            type="text"
                            placeholder="Search Reg No..."
                            value={searchUsn}
                            onChange={handleSearchChange}
                            className="px-3 py-1.5 text-sm font-bold bg-white rounded border-0 focus:ring-0 uppercase text-black"
                        />
                    </div>
                </div>
            </div>

            <StatusAlert type="error" message={error} onClose={() => setError('')} />
            <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />

            {/* Add Student Form */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 shadow-sm mb-8">
                <h3 className="font-black text-black mb-4 text-sm uppercase tracking-widest border-b border-yellow-200 pb-2 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Student
                </h3>
                <form onSubmit={addStudent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Full Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full px-3 py-2.5 bg-white border-2 border-yellow-200 rounded-lg text-black font-bold text-sm focus:outline-none focus:border-yellow-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Reg No / USN</label>
                        <input
                            type="text"
                            value={newUsn}
                            onChange={e => setNewUsn(e.target.value)}
                            placeholder="e.g. DSOG201"
                            className="w-full px-3 py-2.5 bg-white border-2 border-yellow-200 rounded-lg text-black font-bold text-sm focus:outline-none focus:border-yellow-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">DOB (DD/MM/YYYY)</label>
                        <input
                            type="text"
                            value={newDob}
                            onChange={e => setNewDob(e.target.value)}
                            placeholder="e.g. 01/01/2006"
                            className="w-full px-3 py-2.5 bg-white border-2 border-yellow-200 rounded-lg text-black font-bold text-sm focus:outline-none focus:border-yellow-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-black uppercase tracking-widest mb-1">Class</label>
                        <select
                            value={newClassId}
                            onChange={e => setNewClassId(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border-2 border-yellow-200 rounded-lg text-black font-bold text-sm focus:outline-none focus:border-yellow-500"
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name.toUpperCase()} - {c.type.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2.5 rounded-lg font-extrabold text-sm shadow-md border border-yellow-600 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            {isAdding ? 'Adding...' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Students List */}
            <div className="overflow-x-auto rounded-xl border-2 border-yellow-200 shadow-md bg-white">
                <table className="min-w-full divide-y divide-gray-200 border-0">
                    <thead className="bg-yellow-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">Reg No</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">Class</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-widest w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {students.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold">No students matched.</td></tr>
                        ) : (
                            students.map((s) => (
                                <tr key={s.id} className="hover:bg-yellow-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap font-black uppercase text-black border-r border-gray-100">{s.first_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <span className="text-yellow-700 font-black tracking-wider uppercase">{s.usn}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <span className="font-bold text-black uppercase">
                                            {s.class?.name || '---'} - {s.class?.type || 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button onClick={() => deleteStudent(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition border border-red-100">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsManager;
