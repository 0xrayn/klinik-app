import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../../stores/authStore';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import NurseDashboard from './NurseDashboard';
import PatientDashboard from './PatientDashboard';

export default function DashboardPage() {
    const { hasRole } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/dashboard/stats')
            .then(res => setStats(res.data.data))
            .catch(e => toast.error(e.response?.data?.error || e.response?.data?.message || 'Gagal memuat data dashboard'))
            .finally(() => setLoading(false));
    }, []);

    if (hasRole('pasien')) {
        return <PatientDashboard stats={stats} loading={loading} />;
    }

    if (hasRole('dokter') && !hasRole('admin')) {
        return <DoctorDashboard stats={stats} loading={loading} />;
    }

    if (hasRole('perawat') && !hasRole('admin')) {
        return <NurseDashboard stats={stats} loading={loading} />;
    }

    // admin gets the full operational dashboard with analytics
    return <AdminDashboard stats={stats} loading={loading} />;
}
