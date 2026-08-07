import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { UserCheck, ShieldAlert, Check, ChevronRight, UserCog, BookOpen } from 'lucide-react';

interface Teacher {
    id: string;
    username: string;
    assignedClasses: { id: string; name: string; type: string }[];
}

interface ClassItem {
    id: string;
    name: string;
    type: string;
}

const TeachersManager: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teachersRes, classesRes] = await Promise.all([
                api.get('/admin/teachers'),
                api.get('/admin/classes')
            ]);
            setTeachers(teachersRes.data);
            setClasses(classesRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (teacherId: string, classIds: string[]) => {
        setSaving(teacherId);
        try {
            await api.post(`/admin/teachers/${teacherId}/assign`, { classIds });
            await fetchData();
        } catch (error) {
            console.error("Failed to assign classes:", error);
            alert("Failed to assign classes.");
        } finally {
            setSaving(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4 shadow-sm" />
            <p className="text-black font-black uppercase tracking-widest text-sm animate-pulse">Loading Directory...</p>
        </div>
    );

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-yellow-100 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                        <UserCheck className="text-yellow-600" size={32} />
                        Teacher Directory
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm font-semibold max-w-xl leading-relaxed">
                        Securely manage all registered teaching staff. Select a teacher profile from the directory below to assign or revoke class management permissions.
                    </p>
                </div>
                <div className="relative z-10 bg-yellow-50 px-6 py-4 rounded-2xl border border-yellow-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-400 rounded-xl text-black">
                        <UserCog size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-black text-black leading-none">{teachers.length}</div>
                        <div className="text-[10px] font-black text-yellow-700 uppercase tracking-widest mt-1">Total Teachers</div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-100 to-transparent opacity-50 rounded-bl-full pointer-events-none" />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side: Teacher Storage/Directory */}
                <div className={`flex-1 transition-all duration-300 ${selectedTeacherId ? 'lg:max-w-md' : 'w-full'}`}>
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-black text-black text-sm uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={18} className="text-yellow-500" />
                                Staff Records
                            </h2>
                        </div>
                        <div className="p-3 flex-1 overflow-y-auto">
                            {teachers.length === 0 ? (
                                <div className="p-10 text-center text-gray-500 font-bold flex flex-col items-center justify-center h-full">
                                    <ShieldAlert className="mx-auto text-gray-300 mb-4" size={48} />
                                    No teachers have registered yet.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {teachers.map(teacher => (
                                        <button
                                            key={teacher.id}
                                            onClick={() => setSelectedTeacherId(teacher.id)}
                                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                                selectedTeacherId === teacher.id
                                                    ? 'bg-yellow-50 border-yellow-400 shadow-md transform scale-[1.02]'
                                                    : 'bg-white border-transparent hover:border-yellow-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${
                                                    selectedTeacherId === teacher.id ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-600 group-hover:bg-yellow-100'
                                                }`}>
                                                    {teacher.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900 text-lg group-hover:text-black transition-colors">{teacher.username}</h3>
                                                    <p className="text-[10px] font-black text-yellow-600 uppercase tracking-wider mt-0.5">
                                                        {(teacher.assignedClasses || []).length} Classes Assigned
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`transition-all ${selectedTeacherId === teacher.id ? 'text-yellow-600 translate-x-1' : 'text-gray-300 group-hover:text-yellow-400'}`} size={20} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Assignment Panel */}
                {selectedTeacherId && selectedTeacher && (
                    <div className="flex-[2] animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-white rounded-3xl border-2 border-yellow-200 shadow-lg overflow-hidden h-full">
                            <div className="bg-gradient-to-r from-yellow-100 to-white p-6 md:p-8 border-b border-yellow-200">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-2xl text-black shadow-inner border border-yellow-500">
                                        {selectedTeacher.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-black">{selectedTeacher.username}</h2>
                                        <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-black uppercase tracking-widest">
                                            <ShieldAlert size={12} /> Confirmed Teacher
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8">
                                <h3 className="font-black text-black text-sm uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 flex justify-between items-center">
                                    Class Assignments
                                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs">
                                        {classes.length} Total Available
                                    </span>
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {classes.map(cls => {
                                        const assignedIds = (selectedTeacher.assignedClasses || []).map(c => c.id);
                                        const isAssigned = assignedIds.includes(cls.id);
                                        
                                        return (
                                            <button
                                                key={cls.id}
                                                onClick={() => {
                                                    const newAssigned = isAssigned 
                                                        ? assignedIds.filter(id => id !== cls.id)
                                                        : [...assignedIds, cls.id];
                                                    handleAssign(selectedTeacher.id, newAssigned);
                                                }}
                                                disabled={saving === selectedTeacher.id}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 text-left w-full ${
                                                    isAssigned 
                                                        ? 'bg-yellow-50 border-yellow-400 shadow-sm' 
                                                        : 'bg-white border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/30'
                                                } ${saving === selectedTeacher.id ? 'opacity-50 cursor-wait' : 'cursor-pointer active:scale-95'}`}
                                            >
                                                <div className="flex justify-between items-start w-full">
                                                    <span className="font-black text-gray-900 uppercase">{cls.name}</span>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                                        isAssigned ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-transparent border border-gray-200'
                                                    }`}>
                                                        <Check size={14} className={isAssigned ? 'opacity-100' : 'opacity-0'} />
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                    cls.type === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {cls.type}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {classes.length === 0 && (
                                    <p className="text-gray-500 font-bold text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                                        No classes exist in the system yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeachersManager;
