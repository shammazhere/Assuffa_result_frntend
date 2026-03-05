import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface StatusAlertProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

const StatusAlert: React.FC<StatusAlertProps> = ({ type, message, onClose }) => {
    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div className={`
            ${isSuccess ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}
            border-l-4 px-4 py-3 rounded shadow-sm mb-4 font-bold flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-top-2
        `}>
            <div className="flex items-center gap-2">
                {isSuccess ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                <span className="text-sm uppercase tracking-wide">{message}</span>
            </div>
            <button
                onClick={onClose}
                className={`${isSuccess ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'} transition-colors duration-200`}
                aria-label="Close"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export default StatusAlert;
