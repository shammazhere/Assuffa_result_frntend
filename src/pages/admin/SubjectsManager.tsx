import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { Plus, Trash2, Library, GraduationCap } from 'lucide-react';
import type { SubjectItem, ClassItem } from '../../types';
import StatusAlert from '../../components/admin/StatusAlert';

const SubjectsManager: React.FC = () => {
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [filterClassId, setFilterClassId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                api.get('/admin/classes'),
                api.get('/admin/subjects')
            ]);
            setClasses(classesRes.data);
            setSubjects(subjectsRes.data);
            if (classesRes.data.length > 0) {
                setSelectedClassId(classesRes.data[0].id);
            }
        } catch (_err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const addSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim() || !selectedClassId) return;

        try {
            const response = await api.post('/admin/subjects', {
                name: newSubjectName.trim(),
                class_id: selectedClassId
            });

            // Attach the class name locally so it shows immediately
            const createdWithClass: SubjectItem = {
                ...response.data,
                class: classes.find(c => c.id === selectedClassId)
            };

            setSubjects(prev => [...prev, createdWithClass]);
            setNewSubjectName('');
            setError('');
            setSuccess(`Subject "${newSubjectName.trim()}" added to ${createdWithClass.class?.name}.`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add subject');
        }
    };

    const deleteSubject = async (id: string) => {
        if (!window.confirm('Are you sure? Deleting a subject will permanently remove all associated student marks.')) return;

        try {
            await api.delete(`/admin/subjects/${id}`);
            setSubjects(prev => prev.filter(s => s.id !== id));
            setError('');
            setSuccess('Subject deleted successfully.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete subject');
        }
    };

    const filteredSubjects = filterClassId
        ? subjects.filter(s => s.class_id === filterClassId)
        : subjects;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4 shadow-sm" />
            <p className="text-black font-black uppercase tracking-widest text-sm animate-pulse">Loading Subjects Database...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b-2 border-yellow-200 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500 shadow-md">
                        <Library className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-black tracking-widest uppercase">Manage Subjects</h2>
                </div>

                <div className="flex items-center rounded-lg bg-yellow-50 border-2 border-yellow-200 p-1.5 shadow-sm">
                    <span className="px-3 text-xs font-black text-black uppercase tracking-widest">Filter by Class:</span>
                    <select
                        value={filterClassId}
                        onChange={(e) => setFilterClassId(e.target.value)}
                        className="bg-white px-3 py-1.5 rounded text-sm font-bold border-0 focus:ring-0 text-black shadow-sm"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <StatusAlert type="error" message={error} onClose={() => setError('')} />
            <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />

            {/* Add Subject Form */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 shadow-sm mb-8">
                <h3 className="font-black text-black mb-4 text-sm uppercase tracking-widest border-b border-yellow-200 inline-block pb-1 flex items-center gap-2 max-w-max">
                    <Plus className="w-4 h-4" /> Add New Subject
                </h3>
                <form onSubmit={addSubject} className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-1 relative">
                        <label htmlFor="subjectName" className="block text-xs font-black text-black uppercase tracking-widest mb-1 pl-1">Subject Name</label>
                        <input
                            id="subjectName"
                            type="text"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="e.g. Mathematics"
                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg shadow-sm focus:ring-0 focus:border-yellow-500 outline-none text-black font-bold"
                            required
                        />
                    </div>
                    <div className="sm:w-64 relative">
                        <label htmlFor="classSelect" className="block text-xs font-black text-black uppercase tracking-widest mb-1 pl-1">Assign to Class</label>
                        <div className="relative">
                            <select
                                id="classSelect"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg shadow-sm focus:ring-0 focus:border-yellow-500 outline-none text-black font-bold appearance-none pr-10 cursor-pointer"
                                required
                            >
                                {classes.length === 0 && <option value="">No classes available</option>}
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-yellow-600">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end mt-4 sm:mt-0">
                        <button
                            type="submit"
                            disabled={classes.length === 0}
                            className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-600 flex items-center justify-center font-extrabold shadow-md border border-yellow-600 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Add Subject</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Subjects List */}
            <div className="overflow-x-auto rounded-xl border-2 border-yellow-200 shadow-md bg-white">
                <table className="min-w-full divide-y divide-gray-200 border-0">
                    <thead className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-b border-yellow-300">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">
                                Subject Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">
                                Class Focus
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-widest w-24">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredSubjects.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <GraduationCap className="w-10 h-10 text-yellow-300 mb-3" />
                                        <p className="font-bold text-gray-400">No subjects found.</p>
                                        <p className="text-sm mt-1 font-semibold text-gray-400">Add one above to get started.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredSubjects.map((s) => (
                                <tr key={s.id} className="hover:bg-yellow-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-black border-r border-gray-100">
                                        {s.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <span className="bg-yellow-100/80 text-yellow-900 border border-yellow-300 shadow-sm px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                            {s.class?.name || 'Unknown Class'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => deleteSubject(s.id)}
                                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition border border-red-200 shadow-sm focus:opacity-100"
                                            title="Delete Subject"
                                        >
                                            <Trash2 className="w-4 h-4" />
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

export default SubjectsManager;
