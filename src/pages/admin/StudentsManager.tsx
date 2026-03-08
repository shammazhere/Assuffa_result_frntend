import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api';
import { Plus, Trash2, Users, Upload, FileDown, CheckCircle2 } from 'lucide-react';
import type { StudentItem, ClassItem } from '../../types';
import StatusAlert from '../../components/admin/StatusAlert';
import Papa from 'papaparse';

const StudentsManager: React.FC = () => {
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [usn, setUsn] = useState('');
    const [dob, setDob] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    // Bulk Upload State
    const [uploadMode, setUploadMode] = useState<'single' | 'bulk' | 'comprehensive'>('single');
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const addStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim()) { setError('Please enter the student name.'); return; }
        if (!usn.trim()) { setError('Please enter a Register Number.'); return; }
        if (!selectedClassId) { setError('Please select a class.'); return; }

        // Validate DOB format DD/MM/YYYY
        const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!dobRegex.test(dob)) {
            setError('Please enter a valid Date of Birth in DD/MM/YYYY format.');
            return;
        }

        const [dd, mm, yyyy] = dob.split('/');
        const formattedDob = `${yyyy}-${mm}-${dd}`;

        try {
            const response = await api.post('/admin/students', {
                first_name: firstName.trim(),
                usn: usn.trim().toUpperCase(),
                dob: formattedDob,
                class_id: selectedClassId
            });

            const createdWithClass: StudentItem = {
                ...response.data,
                class: classes.find(c => c.id === selectedClassId)
            };

            const matchesClassFilter = !filterClassId || filterClassId === selectedClassId;
            const matchesUsnFilter = !searchUsn || createdWithClass.usn.includes(searchUsn.toUpperCase());
            if (matchesClassFilter && matchesUsnFilter) {
                setStudents(prev => [...prev, createdWithClass].sort((a, b) => a.usn.localeCompare(b.usn)));
            }

            setFirstName('');
            setUsn('');
            setDob('');
            setSuccess(`Student "${firstName.trim()}" registered successfully!`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add student. Ensure Reg No is unique.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBulkFile(e.target.files[0]);
        }
    };

    const processBulkUpload = async () => {
        if (!bulkFile) { setError('Please select a CSV file first.'); return; }
        if (!selectedClassId) { setError('Please select a target class for this upload.'); return; }

        setIsProcessing(true);
        setError('');

        Papa.parse(bulkFile, {
            header: false,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data as string[][];

                const formattedData = rows.map(row => {
                    const name = row[0]?.trim();
                    const regNo = row[1]?.trim().toUpperCase();
                    const rawDob = row[2]?.trim();

                    if (!name || !regNo || !rawDob) return null;

                    let dobValue = rawDob;
                    if (rawDob.includes('/')) {
                        const [d, m, y] = rawDob.split('/');
                        dobValue = `${y}-${m}-${d}`;
                    }

                    return {
                        first_name: name,
                        usn: regNo,
                        dob: dobValue,
                        class_id: selectedClassId
                    };
                }).filter(s => s !== null);

                if (formattedData.length === 0) {
                    setError('The CSV file appears to be empty or in the wrong format.');
                    setIsProcessing(false);
                    return;
                }

                try {
                    const response = await api.post('/admin/students/bulk', formattedData);
                    setSuccess(`Successfully imported ${response.data.count} students!`);
                    setBulkFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    fetchInitialData();
                } catch (err: any) {
                    setError(err.response?.data?.error || 'Bulk upload failed. Check CSV formatting.');
                } finally {
                    setIsProcessing(false);
                }
            }
        });
    };

    const processComprehensiveUpload = async () => {
        if (!bulkFile) { setError('Please select a CSV file first.'); return; }

        setIsProcessing(true);
        setError('');

        Papa.parse(bulkFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data as any[];

                const formattedData = rows.map(row => {
                    const first_name = row['Name'] || row['name'] || row['Student Name'];
                    const usn = row['USN'] || row['usn'] || row['Register Number'] || row['Reg No'];
                    const dob = row['DOB'] || row['dob'] || row['Date of Birth'];
                    const class_name = row['Class'] || row['class'] || row['ClassName'];

                    if (!first_name || !usn || !dob || !class_name) return null;

                    const marks: any[] = [];
                    Object.keys(row).forEach(key => {
                        const stdKeys = ['Name', 'name', 'Student Name', 'USN', 'usn', 'Register Number', 'Reg No', 'DOB', 'dob', 'Date of Birth', 'Class', 'class', 'ClassName'];
                        if (!stdKeys.includes(key) && row[key]) {
                            const val = parseInt(row[key]);
                            if (!isNaN(val)) {
                                marks.push({
                                    subject_name: key,
                                    total: val
                                });
                            }
                        }
                    });

                    return { first_name, usn, dob, class_name, marks };
                }).filter(s => s !== null);

                if (formattedData.length === 0) {
                    setError('Invalid headers in CSV. Ensure columns: Name, USN, DOB, Class are present.');
                    setIsProcessing(false);
                    return;
                }

                try {
                    const response = await api.post('/admin/bulk-complete', formattedData);
                    setSuccess(`Comprehensive Import finished! Processed ${response.data.count} student profiles with their respective marks.`);
                    setBulkFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    fetchInitialData();
                } catch (err: any) {
                    setError(err.response?.data?.error || 'Full data upload failed. Ensure CSV columns are correct.');
                } finally {
                    setIsProcessing(false);
                }
            }
        });
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
                                <option key={c.id} value={c.id}>{c.name}</option>
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

            {/* Toggle Mode */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setUploadMode('single')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all shadow-sm ${uploadMode === 'single' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                    Single Entry
                </button>
                <button
                    onClick={() => setUploadMode('bulk')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all shadow-sm ${uploadMode === 'bulk' ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-500'}`}
                >
                    Quick Student Upload
                </button>
                <button
                    onClick={() => setUploadMode('comprehensive')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all shadow-sm ${uploadMode === 'comprehensive' ? 'bg-black text-yellow-400 border-2 border-yellow-400' : 'bg-gray-100 text-gray-500'}`}
                >
                    Master Batch Import (Complete Data)
                </button>
            </div>

            {uploadMode === 'single' && (
                <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 shadow-sm mb-10">
                    <h3 className="font-black text-black mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Individual Student
                    </h3>
                    <form onSubmit={addStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase mb-1 ml-1">Name</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg font-bold" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase mb-1 ml-1">Reg No</label>
                            <input type="text" value={usn} onChange={e => setUsn(e.target.value.toUpperCase())} placeholder="USN" className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg font-bold uppercase" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase mb-1 ml-1">DOB</label>
                            <input type="text" value={dob} onChange={e => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
                                let f = raw;
                                if (raw.length > 4) f = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4);
                                else if (raw.length > 2) f = raw.slice(0, 2) + '/' + raw.slice(2);
                                setDob(f);
                            }} placeholder="DD/MM/YYYY" className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg font-bold" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase mb-1 ml-1">Class</label>
                            <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg font-bold">
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-black text-white px-4 py-3 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-lg">Save Student</button>
                        </div>
                    </form>
                </div>
            )}

            {uploadMode === 'bulk' && (
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-dashed border-gray-300 shadow-sm mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h3 className="font-black text-black mb-2 text-sm uppercase tracking-widest flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Bulk Registration
                            </h3>
                            <p className="text-xs text-gray-600 mb-6 font-semibold leading-relaxed">
                                Upload a CSV file with columns: <span className="text-black font-black bg-yellow-100 px-1">Name, RegisterNo, DOB</span>.
                                <br />Format DOB as DD/MM/YYYY. All students in the file will be added to the selected class.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 ml-1 block">Target Class</label>
                                    <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg font-bold mb-4">
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <div className="relative w-full mb-4">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            ref={fileInputRef}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-[52px] border-2 border-dashed border-yellow-400 bg-yellow-50 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase text-yellow-800 hover:bg-yellow-100 transition-all"
                                        >
                                            <FileDown className="w-4 h-4" />
                                            {bulkFile ? bulkFile.name : 'Select CSV File'}
                                        </button>
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <button
                                        onClick={processBulkUpload}
                                        disabled={!bulkFile || isProcessing}
                                        className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Processing Students...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Start Batch Import
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-64 bg-black text-white p-5 rounded-xl border-4 border-yellow-500 shadow-xl">
                            <h4 className="text-[10px] font-black tracking-widest uppercase mb-4 text-yellow-400">CSV Guide</h4>
                            <div className="space-y-3">
                                <div className="border-b border-gray-800 pb-2">
                                    <p className="text-[9px] text-gray-400 uppercase font-black">Column 1</p>
                                    <p className="text-xs font-bold">Student Full Name</p>
                                </div>
                                <div className="border-b border-gray-800 pb-2">
                                    <p className="text-[9px] text-gray-400 uppercase font-black">Column 2</p>
                                    <p className="text-xs font-bold">Register Number (USN)</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase font-black">Column 3</p>
                                    <p className="text-xs font-bold italic">DD/MM/YYYY</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {uploadMode === 'comprehensive' && (
                <div className="bg-gradient-to-br from-black to-slate-900 p-6 rounded-xl border border-yellow-500 shadow-2xl mb-10 overflow-hidden relative">
                    {/* Decorative Background Icon */}
                    <div className="absolute top-[-20px] right-[-20px] opacity-10 pointer-events-none">
                        <Upload className="w-64 h-64 text-yellow-500" />
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-500 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="font-black text-yellow-500 text-xl uppercase tracking-[0.2em]">Master Batch Import</h3>
                            </div>

                            <p className="text-sm text-gray-300 mb-8 font-medium leading-relaxed max-w-2xl">
                                This elite tool handles <span className="text-yellow-400 font-black">Students + Classes + Subjects + Marks</span> in a single click.
                                The system uses <span className="italic text-white underline decoration-yellow-500">Header-Based Auto Detection</span> to map your subjects and create missing records automatically.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 mb-8">
                                <div className="flex-1 relative">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        ref={fileInputRef}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-16 border-2 border-dashed border-gray-700 bg-black/50 rounded-xl flex items-center px-6 gap-4 text-sm font-bold uppercase text-white hover:border-yellow-500 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                                            <FileDown className="w-4 h-4 group-hover:text-black" />
                                        </div>
                                        <span className="truncate">{bulkFile ? bulkFile.name : 'Choose Comprehensive CSV...'}</span>
                                    </button>
                                </div>
                                <button
                                    onClick={processComprehensiveUpload}
                                    disabled={!bulkFile || isProcessing}
                                    className="px-8 h-16 bg-yellow-500 text-black rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center min-w-[240px]"
                                >
                                    {isProcessing ? 'Verifying & Saving...' : 'Synchronize Whole Batch'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {['Name', 'USN', 'DOB', 'Class'].map(header => (
                                    <div key={header} className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_yellow]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{header}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-black border-r border-gray-100">{s.first_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <span className="text-yellow-700 font-black tracking-wider uppercase">{s.usn}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-black">{s.class?.name || '---'}</span>
                                            <span className="text-[10px] font-black uppercase text-gray-400">{s.class?.type || 'Offline'}</span>
                                        </div>
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
