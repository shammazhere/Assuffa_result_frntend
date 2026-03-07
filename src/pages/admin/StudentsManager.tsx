import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { Plus, Trash2, Users } from 'lucide-react';
import type { StudentItem, ClassItem } from '../../types';
import StatusAlert from '../../components/admin/StatusAlert';

const StudentsManager: React.FC = () => {
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [usn, setUsn] = useState('');
    const [dob, setDob] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

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
            if (classesRes.data.length > 0) {
                setSelectedClassId(classesRes.data[0].id);
            }
        } catch (_err) {
            setError('Failed to load data');
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
            setError('Failed to filter students');
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

    const addStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim()) { setError('Please enter the student name.'); return; }
        if (!usn.trim()) { setError('Please enter a USN.'); return; }
        if (!selectedClassId) { setError('Please select a class.'); return; }

        // Validate DOB format DD/MM/YYYY
        const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!dobRegex.test(dob)) {
            setError('Please enter a valid Date of Birth in DD/MM/YYYY format (e.g. 27/03/2007).');
            return;
        }
        const [dd, mm, yyyy] = dob.split('/');
        const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
        if (isNaN(dateObj.getTime())) {
            setError('The date entered is not valid. Please check DD/MM/YYYY.');
            return;
        }
        const formattedDob = `${yyyy}-${mm}-${dd}`;

        try {
            const response = await api.post('/admin/students', {
                first_name: firstName.trim(),
                usn: usn.trim().toUpperCase(),
                dob: formattedDob,
                class_id: selectedClassId
            });

            // Attach the class name locally so it shows immediately without re-fetch
            const createdWithClass: StudentItem = {
                ...response.data,
                class: classes.find(c => c.id === selectedClassId)
            };

            // Only add to the visible list if it matches current filters
            const matchesClassFilter = !filterClassId || filterClassId === selectedClassId;
            const matchesUsnFilter = !searchUsn || createdWithClass.usn.includes(searchUsn.toUpperCase());
            if (matchesClassFilter && matchesUsnFilter) {
                setStudents(prev => [...prev, createdWithClass].sort((a, b) => a.usn.localeCompare(b.usn)));
            }

            setFirstName('');
            setUsn('');
            setDob('');
            setError('');
            setSuccess(`Student "${firstName.trim()}" registered successfully!`);

            // Auto-clear success message
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { error?: string } } };
            setError(apiErr.response?.data?.error || 'Failed to add student. Ensure the USN is unique.');
        }
    };

    const deleteStudent = async (id: string) => {
        if (!window.confirm('Are you sure? This will permanently delete the student and all their academic marks.')) return;

        try {
            await api.delete(`/admin/students/${id}`);
            setStudents(prev => prev.filter(s => s.id !== id));
            setError('');
            setSuccess('Student deleted successfully.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { error?: string } } };
            setError(apiErr.response?.data?.error || 'Failed to delete student.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4 shadow-sm" />
            <p className="text-black font-black uppercase tracking-widest text-sm animate-pulse">Loading Students Database...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 pb-4 border-b-2 border-yellow-200 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500 shadow-md">
                        <Users className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-black tracking-widest uppercase">Manage Students</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center rounded-lg bg-yellow-50 border-2 border-yellow-200 p-1.5 shadow-sm">
                        <span className="px-3 text-xs font-black text-black uppercase tracking-widest">Filter by Class:</span>
                        <select
                            value={filterClassId}
                            onChange={handleFilterChange}
                            className="bg-white px-3 py-1.5 rounded text-sm font-bold border-0 focus:ring-0 text-black shadow-sm"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center rounded-lg bg-yellow-50 border-2 border-yellow-200 p-1.5 shadow-sm">
                        <input
                            type="text"
                            placeholder="Search Register No..."
                            value={searchUsn}
                            onChange={handleSearchChange}
                            className="px-3 py-1.5 text-sm font-bold bg-white rounded border-0 focus:ring-0 uppercase text-black placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            <StatusAlert type="error" message={error} onClose={() => setError('')} />
            <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />

            {/* Add Student Form */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 shadow-sm mb-10">
                <h3 className="font-black text-black mb-4 text-sm uppercase tracking-widest border-b border-yellow-200 inline-block pb-1 flex items-center gap-2 max-w-max">
                    <Plus className="w-4 h-4" /> Add New Student
                </h3>

                <div className="bg-yellow-100/50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-sm font-bold text-yellow-900">
                        Note: The Date of Birth will be used as the student's login password.
                    </p>
                </div>

                <form onSubmit={addStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                    <div className="flex flex-col">
                        <label className="block text-xs font-black text-black uppercase tracking-widest mb-1 pl-1">Full Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter Name"
                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg shadow-sm focus:ring-0 focus:border-yellow-500 outline-none text-black font-bold"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-xs font-black text-black uppercase tracking-widest mb-1 pl-1">Register Number</label>
                        <input
                            type="text"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value.toUpperCase())}
                            placeholder="Enter Reg No"
                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg shadow-sm focus:ring-0 focus:border-yellow-500 outline-none text-black font-bold uppercase"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-xs font-black text-black uppercase tracking-widest mb-1 pl-1">Date of Birth</label>
                        <input
                            type="text"
                            value={dob}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
                                let formatted = raw;
                                if (raw.length > 4) {
                                    formatted = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4);
                                } else if (raw.length > 2) {
                                    formatted = raw.slice(0, 2) + '/' + raw.slice(2);
                                }
                                setDob(formatted);
                            }}
                            maxLength={10}
                            placeholder="DD/MM/YYYY"
                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg shadow-sm focus:ring-0 focus:border-yellow-500 outline-none text-black font-bold"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-xs font-black text-black uppercase tracking-widest mb-1 pl-1">Class</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg shadow-sm focus:ring-0 focus:border-yellow-500 outline-none text-black font-bold cursor-pointer"
                            required
                        >
                            {classes.length === 0 && <option value="">No classes available</option>}
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={classes.length === 0}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-600 flex items-center justify-center font-extrabold shadow-md border border-yellow-600 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5 mr-2" /> <span>Add Student</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Students List */}
            <div className="overflow-x-auto rounded-xl border-2 border-yellow-200 shadow-md bg-white">
                <table className="min-w-full divide-y divide-gray-200 border-0">
                    <thead className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-b border-yellow-300">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">
                                Student Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">
                                Register No
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">
                                Class
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-widest w-24">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold">
                                    No students found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            students.map((s) => (
                                <tr key={s.id} className="hover:bg-yellow-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-black border-r border-gray-100">
                                        {s.first_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <span className="text-yellow-700 font-black tracking-wider uppercase">{s.usn}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-black">{s.class?.name || '---'}</span>
                                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{s.class?.type || 'Offline'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => deleteStudent(s.id)}
                                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition border border-red-200 shadow-sm focus:opacity-100"
                                            title="Delete Student"
                                        >
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
