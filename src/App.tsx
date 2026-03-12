import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedAdminRoute, ProtectedStudentRoute } from './components/ProtectedRoutes';

// Lazy load all pages for maximum performance
const StudentLogin = React.lazy(() => import('./pages/StudentLogin'));
const StudentResult = React.lazy(() => import('./pages/StudentResult'));
const StudentResultOnline = React.lazy(() => import('./pages/StudentResultOnline'));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./layouts/AdminDashboard'));
const ClassesManager = React.lazy(() => import('./pages/admin/ClassesManager'));
const SubjectsManager = React.lazy(() => import('./pages/admin/SubjectsManager'));
const StudentsManager = React.lazy(() => import('./pages/admin/StudentsManager'));
const MarksManager = React.lazy(() => import('./pages/admin/MarksManager'));
const BulkUpload = React.lazy(() => import('./pages/admin/BulkUpload'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<StudentLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Student Routes */}
            <Route element={<ProtectedStudentRoute />}>
              <Route path="/result" element={<StudentResult />} />
              <Route path="/online-result" element={<StudentResultOnline />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedAdminRoute />}>
              <Route element={<AdminDashboard />}>
                <Route index element={<Navigate to="classes" replace />} />
                <Route path="classes" element={<ClassesManager />} />
                <Route path="subjects" element={<SubjectsManager />} />
                <Route path="students" element={<StudentsManager />} />
                <Route path="marks" element={<MarksManager />} />
                <Route path="upload" element={<BulkUpload />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
