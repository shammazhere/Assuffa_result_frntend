import React, { useState, useRef } from 'react';
import api from '../../config/api';
import { Upload, FileDown, CheckCircle2 } from 'lucide-react';
import StatusAlert from '../../components/admin/StatusAlert';
import * as XLSX from 'xlsx';

const BulkUpload: React.FC = () => {
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBulkFile(e.target.files[0]);
        }
    };

    const processComprehensiveUpload = async () => {
        if (!bulkFile) { setError('Please select a file first.'); return; }

        setIsProcessing(true);
        setError('');

        try {
            const data = await bulkFile.arrayBuffer();
            const workbook = XLSX.read(data, { cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'dd/mm/yyyy' }) as any[][];

            if (rows.length < 2) {
                setError('The file appears to be empty or missing data rows.');
                setIsProcessing(false);
                return;
            }

            const headers = rows[0].map(h => String(h || '').trim());
            
            const formattedData = rows.map((row, index) => {
                const first_name = String(row[0] || '').trim().toUpperCase();
                const usn = String(row[1] || '').trim().toUpperCase();
                const dob = String(row[2] || '').trim();
                const class_name = String(row[3] || '').trim().toUpperCase();
                const class_type = String(row[4] || 'Offline').trim();

                if (!first_name || first_name.toLowerCase() === 'name' || first_name.toLowerCase() === 'student name') return null;
                
                if (!usn || !dob || !class_name) {
                    console.warn(`Skipping row ${index + 1} due to missing data:`, { usn, dob, class_name });
                    return null;
                }

                const marks: any[] = [];
                for (let i = 5; i < row.length; i++) {
                    const subjectName = headers[i] || `Subject ${i - 4}`;
                    const rawVal = row[i];
                    if (rawVal !== undefined && rawVal !== '') {
                        const val = parseInt(String(rawVal));
                        if (!isNaN(val)) {
                            marks.push({
                                subject_name: subjectName.toUpperCase(),
                                total: val
                            });
                        }
                    }
                }

                return { first_name, usn, dob, class_name, class_type, marks };
            }).filter(s => s !== null);

            if (formattedData.length === 0) {
                setError('Master Sync found no valid student data. Check column order: 1:Name, 2:USN, 3:DOB, 4:Class, 5:Type.');
                setIsProcessing(false);
                return;
            }

            const response = await api.post('/admin/bulk-complete', formattedData);
            setSuccess(`Success! Synchronized ${response.data.count} student profiles and their marks.`);
            setBulkFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            console.error('Master Upload Fault:', err);
            const msg = err.response?.data?.error || err.message || 'Unknown processing fault.';
            setError(`Intelligence Sync Failed: ${msg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 pb-4 border-b-2 border-yellow-200 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500 shadow-md">
                        <Upload className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-black tracking-widest uppercase">Master Upload</h2>
                </div>
            </div>

            <StatusAlert type="error" message={error} onClose={() => setError('')} />
            <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />

            <div className="flex flex-wrap gap-2 mb-6">
                <div className="px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-black text-yellow-400 border-2 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Master Data Synchronization Engine
                </div>
            </div>

            <div className="bg-gradient-to-br from-black to-slate-900 p-6 md:p-10 rounded-xl border border-yellow-500 shadow-2xl overflow-hidden relative">
                <div className="absolute top-[-20px] right-[-20px] opacity-10 pointer-events-none">
                    <Upload className="w-64 h-64 text-yellow-500" />
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                            <div className="p-2 bg-yellow-500 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="font-black text-yellow-500 text-2xl uppercase tracking-[0.2em]">Upload Master Sheet</h3>
                        </div>

                        <p className="text-sm md:text-base text-gray-300 mb-8 font-medium leading-relaxed max-w-2xl">
                            This elite tool handles <span className="text-yellow-400 font-black">Students + Classes + Subjects + Marks</span> in a single click.
                            The system uses <span className="italic text-white underline decoration-yellow-500 font-black">Positional Intelligence</span> to map everything automatically.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 mb-8">
                            <div className="flex-1 relative">
                                <input
                                    type="file"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-16 border-2 border-dashed border-gray-700 bg-black/50 rounded-xl flex items-center px-6 gap-4 text-sm font-bold uppercase text-white hover:border-yellow-500 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-yellow-500 transition-colors text-gray-400">
                                        <FileDown className="w-4 h-4 group-hover:text-black" />
                                    </div>
                                    <span className="truncate">{bulkFile ? bulkFile.name : 'Choose Comprehensive Excel/CSV...'}</span>
                                </button>
                            </div>
                            <button
                                onClick={processComprehensiveUpload}
                                disabled={!bulkFile || isProcessing}
                                className="px-8 h-16 bg-yellow-500 text-black rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center min-w-[240px]"
                            >
                                {isProcessing ? 'Verifying & Saving...' : 'Synchronize Database'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {['Name', 'USN', 'DOB', 'Class', 'Type'].map(header => (
                                <div key={header} className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_yellow]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{header}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-left">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Note: Any column after 'Type' will be treated as a Subject.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkUpload;
