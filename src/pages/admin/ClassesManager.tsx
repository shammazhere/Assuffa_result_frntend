import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import type { ClassItem } from '../../types';
import StatusAlert from '../../components/admin/StatusAlert';

const ClassesManager: React.FC = () => {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [newClassName, setNewClassName] = useState('');
    const [newClassType, setNewClassType] = useState<'Offline' | 'Online'>('Offline');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/admin/classes');
            setClasses(response.data);
        } catch (_err) {
            setError('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const addClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        try {
            const response = await api.post('/admin/classes', {
                name: newClassName.trim(),
                type: newClassType
            });
            setClasses([...classes, response.data]);
            setNewClassName('');
            setNewClassType('Offline');
            setError('');
            setSuccess(`Class "${newClassName.trim()}" (${newClassType}) added successfully.`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add class. Ensure the name is unique.');
        }
    };

    const deleteClass = async (id: string) => {
        if (!window.confirm('WARNING: Deleting a class will also delete all associated subjects, students, and marks. This cannot be undone.')) return;

        try {
            await api.delete(`/admin/classes/${id}`);
            setClasses(classes.filter(c => c.id !== id));
            setError('');
            setSuccess('Class deleted successfully.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (_err: unknown) {
            setError('Failed to delete class. It might have linked data that prevents deletion.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4 shadow-sm" />
            <p className="text-black font-black uppercase tracking-widest text-sm animate-pulse">Loading Classes Database...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8 border-b-2 border-yellow-200 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500 shadow-md">
                        <BookOpen className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-black tracking-widest uppercase">Manage Classes</h2>
                        <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider text-black">Add, view, and remove organizational classes.</p>
                    </div>
                </div>
            </div>

            <StatusAlert type="error" message={error} onClose={() => setError('')} />
            <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />

            {/* Add Class Form */}
            <form onSubmit={addClass} className="flex flex-col sm:flex-row gap-4 mb-8 bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 shadow-sm">
                <div className="flex-1 relative">
                    <label htmlFor="className" className="block text-xs font-black text-black uppercase tracking-widest mb-2 pl-1 border-b border-yellow-200 inline-block pb-1">Class Name</label>
                    <input
                        id="className"
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="e.g. 10th Grade Sec A"
                        className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg focus:ring-0 focus:border-yellow-500 transition-shadow outline-none text-black font-bold"
                        required
                    />
                </div>
                <div className="w-full sm:w-48 relative">
                    <label htmlFor="classType" className="block text-xs font-black text-black uppercase tracking-widest mb-2 pl-1 border-b border-yellow-200 inline-block pb-1">Class Type</label>
                    <select
                        id="classType"
                        value={newClassType}
                        onChange={(e) => setNewClassType(e.target.value as 'Offline' | 'Online')}
                        className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg focus:ring-0 focus:border-yellow-500 transition-shadow outline-none text-black font-bold appearance-none"
                    >
                        <option value="Offline">Offline</option>
                        <option value="Online">Online</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-600 flex items-center justify-center font-extrabold shadow-md border border-yellow-600 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add Class
                    </button>
                </div>
            </form>

            {/* Classes List */}
            <div className="overflow-x-auto rounded-xl border-2 border-yellow-200 shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-b border-yellow-300">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest">
                                Class Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-l border-yellow-200">
                                Mode
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-widest w-32 border-l border-yellow-200">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {classes.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-gray-500 font-bold">
                                    No classes found. Add one above.
                                </td>
                            </tr>
                        ) : (
                            classes.map((c) => (
                                <tr key={c.id} className="hover:bg-yellow-50/30 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap font-black text-black text-base border-r border-gray-100">
                                        {c.name}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap border-r border-gray-100">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${c.type === 'Online'
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-green-100 text-green-700 border border-green-200'
                                            }`}>
                                            {c.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => deleteClass(c.id)}
                                            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2.5 rounded-lg transition border border-red-200 shadow-sm"
                                            title="Delete Class"
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

export default ClassesManager;
