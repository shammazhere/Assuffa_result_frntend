import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { Settings, Calendar, Save, CheckCircle2 } from 'lucide-react';
import StatusAlert from '../../components/admin/StatusAlert';

const SettingsManager: React.FC = () => {
    const [academicYear, setAcademicYear] = useState('2024-2025');
    const [customYear, setCustomYear] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data && res.data.academic_year) {
                setAcademicYear(res.data.academic_year);
            }
        } catch (_err) {
            setError('Failed to load current settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAcademicYear = async (yearToSave: string) => {
        if (!yearToSave.trim()) {
            setError('Academic Year cannot be empty.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/settings', {
                key: 'academic_year',
                value: yearToSave.trim()
            });
            setAcademicYear(yearToSave.trim());
            setCustomYear('');
            setSuccess(`Active Academic Year successfully set to "${yearToSave.trim()}".`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update academic year.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4 shadow-sm" />
            <p className="text-black font-black uppercase tracking-widest text-sm animate-pulse">Loading System Settings...</p>
        </div>
    );

    const commonYears = ['2023-2024', '2024-2025', '2025-2026', '2026-2027', '2027-2028'];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b-2 border-yellow-200 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500 shadow-md">
                        <Settings className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-black tracking-widest uppercase">System Settings</h2>
                        <p className="text-gray-500 font-semibold text-xs mt-0.5">Superadmin Control Panel for Global Platform Settings</p>
                    </div>
                </div>
            </div>

            <StatusAlert type="error" message={error} onClose={() => setError('')} />
            <StatusAlert type="success" message={success} onClose={() => setSuccess('')} />

            {/* Academic Year Control Card */}
            <div className="bg-gradient-to-br from-yellow-50/80 to-white p-6 md:p-8 rounded-2xl border-2 border-yellow-200 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-yellow-400 text-black rounded-xl">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-black text-xl uppercase tracking-wider">Active Academic Year</h3>
                        <p className="text-gray-600 text-xs font-bold">Currently Active: <span className="text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded font-black text-sm">{academicYear}</span></p>
                    </div>
                </div>

                <p className="text-gray-600 text-sm font-medium leading-relaxed mb-6">
                    When teachers enter marks or perform bulk uploads, the platform automatically attaches all marks to the active academic year set here. Changing the year creates a fresh cycle for new entries without deleting previous years' data.
                </p>

                {/* Quick Selection Buttons */}
                <div className="mb-6">
                    <label className="block text-xs font-black text-black uppercase tracking-widest mb-3">Quick Presets</label>
                    <div className="flex flex-wrap gap-2">
                        {commonYears.map(yr => (
                            <button
                                key={yr}
                                onClick={() => handleSaveAcademicYear(yr)}
                                disabled={saving}
                                className={`px-4 py-2.5 rounded-xl font-black text-sm border transition-all flex items-center gap-2 ${
                                    academicYear === yr
                                        ? 'bg-yellow-500 text-black border-yellow-600 shadow-md scale-105'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                                }`}
                            >
                                {academicYear === yr && <CheckCircle2 className="w-4 h-4 text-black" />}
                                {yr}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Year Input */}
                <div className="border-t border-yellow-200 pt-6">
                    <label htmlFor="customYearInput" className="block text-xs font-black text-black uppercase tracking-widest mb-2">Create Custom Academic Year</label>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                        <input
                            id="customYearInput"
                            type="text"
                            value={customYear}
                            onChange={(e) => setCustomYear(e.target.value)}
                            placeholder="e.g. 2028-2029"
                            className="flex-1 px-4 py-3 bg-white border-2 border-yellow-200 rounded-xl font-bold text-black focus:outline-none focus:border-yellow-500"
                        />
                        <button
                            onClick={() => handleSaveAcademicYear(customYear)}
                            disabled={saving || !customYear.trim()}
                            className="px-6 py-3 bg-black hover:bg-gray-800 text-yellow-400 font-black rounded-xl border border-yellow-500 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Set Active Year'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsManager;
