
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedAdminRoute = () => {
    const { adminToken } = useAuth();
    if (!adminToken) {
        return <Navigate to="/admin/login" replace />;
    }
    return <Outlet />;
};

export const ProtectedStudentRoute = () => {
    const { student } = useAuth();
    if (!student) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};
