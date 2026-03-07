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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b-2 border-yellow-200 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500 shadow-md">
                        <BookOpen className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-black tracking-widest uppercase">Manage Classes</h2>
                </div>
            </div>

            <StatusAlert type="error" message={error} onClose={() => setError('')} />
            <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />

            {/* Add Class Form */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 shadow-sm mb-10">
                <h3 className="font-black text-black mb-4 text-sm uppercase tracking-widest border-b border-yellow-200 inline-block pb-1 flex items-center gap-2 max-w-max">
                    <Plus className="w-4 h-4" /> Add New Class
                </h3>
                <form onSubmit={addClass} className="flex flex-col md:flex-row gap-5">
                    <div className="flex-1">
                        <label htmlFor="className" className="block text-xs font-black text-black uppercase tracking-widest mb-1 pl-1">Class Name</label>
                        <input
                            id="className"
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="e.g. 10th Standard"
                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg shadow-sm focus:ring-0 focus:border-yellow-500 outline-none text-black font-bold"
                            required
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <label htmlFor="classType" className="block text-xs font-black text-black uppercase tracking-widest mb-1 pl-1">Class Type</label>
                        <select
                            id="classType"
                            value={newClassType}
                            onChange={(e) => setNewClassType(e.target.value as 'Offline' | 'Online')}
                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg shadow-sm focus:ring-0 focus:border-yellow-500 outline-none text-black font-bold cursor-pointer"
                        >
                            <option value="Offline">Offline</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-600 flex items-center justify-center font-extrabold shadow-md border border-yellow-600 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5 md:mr-2" /> <span className="hidden md:inline">Add Class</span><span className="md:hidden">Add Class</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Classes List */}
            <div className="overflow-x-auto rounded-xl border-2 border-yellow-200 shadow-md bg-white">
                <table className="min-w-full divide-y divide-gray-200 border-0">
                    <thead className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-b border-yellow-300">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">
                                Class Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-widest border-r border-yellow-200">
                                Type
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-widest w-24">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {classes.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-bold">
                                    No classes found. Add one above to get started.
                                </td>
                            </tr>
                        ) : (
                            classes.map((c) => (
                                <tr key={c.id} className="hover:bg-yellow-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-black border-r border-gray-100">
                                        {c.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${c.type === 'Online'
                                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                                            : 'bg-green-100 text-green-900 border-green-300'
                                            }`}>
                                            {c.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => deleteClass(c.id)}
                                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition border border-red-200 shadow-sm"
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
