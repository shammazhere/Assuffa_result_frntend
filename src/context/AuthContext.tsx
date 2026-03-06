import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
import type { StudentItem } from '../types';

interface AuthContextType {
    student: StudentItem | null;
    adminToken: string | null;
    studentLogin: (usn: string, dob: string) => Promise<StudentItem>;
    adminLogin: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [student, setStudent] = useState<StudentItem | null>(() => {
        const saved = localStorage.getItem('studentData');
        return saved ? JSON.parse(saved) : null;
    });
    const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('adminToken'));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (adminToken) {
            localStorage.setItem('adminToken', adminToken);
        } else {
            localStorage.removeItem('adminToken');
        }
    }, [adminToken]);

    useEffect(() => {
        if (student) {
            localStorage.setItem('studentData', JSON.stringify(student));
        } else {
            localStorage.removeItem('studentData');
        }
    }, [student]);

    const studentLogin = async (usn: string, dob: string) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/student/login', { usn, dob });
            setStudent(response.data);
            return response.data;
        } finally {
            setIsLoading(false);
        }
    };

    const adminLogin = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/admin/login', { username, password });
            setAdminToken(response.data.token);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        if (adminToken) {
            try {
                await api.post('/auth/admin/logout');
            } catch (e) {
                console.error("Logout error", e);
            }
        }
        setStudent(null);
        setAdminToken(null);
    };

    return (
        <AuthContext.Provider value={{ student, adminToken, studentLogin, adminLogin, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
