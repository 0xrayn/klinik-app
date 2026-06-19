import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from './stores/authStore';

import Splash from './components/ui/Splash';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentCreate from './pages/appointments/AppointmentCreate';
import AppointmentDetail from './pages/appointments/AppointmentDetail';
import SchedulePage from './pages/schedules/SchedulePage';
import DoctorList from './pages/doctors/DoctorList';
import DoctorDetail from './pages/doctors/DoctorDetail';
import PatientList from './pages/patients/PatientList';
import PatientForm from './pages/patients/PatientForm';
import PatientDetail from './pages/patients/PatientDetail';
import MedicalRecordPage from './pages/medical-records/MedicalRecordPage';
import CareInstructionPage from './pages/care-instructions/CareInstructionPage';
import UserManagement from './pages/admin/UserManagement';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, roles = [] }) {
    const { isAuthenticated, hasAnyRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !hasAnyRole(roles)) {
        toast.error('Anda tidak memiliki akses ke halaman ini');
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function GuestRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function RootRedirect() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

export default function App() {
    const { init } = useAuth();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        init().finally(() => setReady(true));
    }, []);

    if (!ready) {
        return <Splash />;
    }

    return (
        <Routes>
            {/* Guest / Auth routes */}
            <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Protected / Dashboard routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/appointments" element={<ProtectedRoute roles={['admin','perawat','pasien','dokter']}><AppointmentList /></ProtectedRoute>} />
                <Route path="/appointments/create" element={<ProtectedRoute roles={['admin','pasien']}><AppointmentCreate /></ProtectedRoute>} />
                <Route path="/appointments/:id" element={<ProtectedRoute roles={['admin','perawat','pasien','dokter']}><AppointmentDetail /></ProtectedRoute>} />

                <Route path="/schedules" element={<SchedulePage />} />

                <Route path="/doctors" element={<DoctorList />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />

                <Route
                    path="/patients"
                    element={<ProtectedRoute roles={['admin', 'dokter', 'perawat']}><PatientList /></ProtectedRoute>}
                />
                <Route
                    path="/patients/create"
                    element={<ProtectedRoute roles={['admin']}><PatientForm /></ProtectedRoute>}
                />
                <Route
                    path="/patients/:id/edit"
                    element={<ProtectedRoute roles={['admin', 'dokter', 'perawat']}><PatientForm /></ProtectedRoute>}
                />
                <Route
                    path="/patients/:id"
                    element={<ProtectedRoute roles={['admin', 'dokter', 'perawat']}><PatientDetail /></ProtectedRoute>}
                />

                <Route
                    path="/medical-records"
                    element={<ProtectedRoute roles={['admin', 'dokter', 'perawat']}><MedicalRecordPage /></ProtectedRoute>}
                />

                <Route path="/profile" element={<ProfilePage />} />
                <Route
                    path="/care-instructions"
                    element={<ProtectedRoute roles={['admin','dokter','perawat']}><CareInstructionPage /></ProtectedRoute>}
                />

                <Route
                    path="/admin/users"
                    element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>}
                />
                <Route
                    path="/admin/activity-logs"
                    element={<ProtectedRoute roles={['admin']}><ActivityLogPage /></ProtectedRoute>}
                />
            </Route>

            {/* Redirects & fallback */}
            <Route path="/" element={
                <RootRedirect />
            } />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
