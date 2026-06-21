import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    PlusIcon, MagnifyingGlassIcon, EyeIcon, TrashIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar, EmptyState, ConfirmModal, TableSkeleton, Pagination, SectionHeader } from '../../components/ui';
import toast from 'react-hot-toast';
import axios from 'axios';
import useAuth from '../../stores/authStore';

const STATUS = {
    pending:     { label:'Pending',        v:'neutral' },
    confirmed:   { label:'Terkonfirmasi',  v:'info' },
    in_progress: { label:'Berlangsung',    v:'warning' },
    done:        { label:'Selesai',        v:'success' },
    cancelled:   { label:'Dibatalkan',     v:'danger' },
};

export default function AppointmentList() {
    const { hasRole } = useAuth();
    const isDoctor  = hasRole('dokter') && !hasRole('admin');
    const isPatient = hasRole('pasien') && !hasRole('admin');
    const canCreate = hasRole('admin') || hasRole('pasien');
    const canDelete = hasRole('admin');
    // Only admin and dokter can change appointment status.
    // Dokter can only change their OWN appointments (enforced on the backend too).
    // Perawat is view-only for appointments.
    const canChangeStatus = hasRole('admin') || isDoctor;

    const [data, setData]       = useState([]);
    const [meta, setMeta]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage]       = useState(1);
    const [search, setSearch]   = useState('');
    const [statusF, setStatusF] = useState('');
    const [delModal, setDelModal] = useState({ open:false, id:null });

    const load = async (p = page) => {
        setLoading(true);
        try {
            const params = { page: p, per_page: 10 };
            if (statusF) params.status = statusF;
            const res = await axios.get('/api/appointments', { params });
            setData(res.data.data.data);
            setMeta(res.data.data);
        } catch (e) {
            toast.error('Gagal memuat janji temu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page); }, [page, statusF]);

    const filtered = data.filter(a => {
        if (!search) return true;
        const q = search.toLowerCase();
        return a.patient?.name?.toLowerCase().includes(q)
            || a.doctor?.user?.name?.toLowerCase().includes(q)
            || a.queue_number?.toLowerCase().includes(q);
    });

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/appointments/${delModal.id}`);
            toast.success('Janji temu dihapus');
            load();
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal menghapus data');
        } finally {
            setDelModal({ open:false, id:null });
        }
    };

    const changeStatus = async (id, val) => {
        try {
            await axios.put(`/api/appointments/${id}/status`, { status: val });
            setData(prev => prev.map(a => a.id === id ? { ...a, status: val } : a));
            toast.success('Status diperbarui');
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal memperbarui status');
        }
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader
                title="Janji Temu"
                subtitle={isDoctor ? 'Antrian pasien Anda' : isPatient ? 'Janji temu Anda' : 'Kelola semua jadwal janji temu pasien'}
                action={canCreate && (
                    <Link to="/appointments/create">
                        <Button variant="primary" size="sm"><PlusIcon className="w-4 h-4" />Buat Janji</Button>
                    </Link>
                )}
            />

            {/* Filter bar */}
            <Card className="p-3.5 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input input-icon text-sm" placeholder="Cari pasien, dokter, no. antrian..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input text-sm sm:w-48" value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}>
                    <option value="">Semua Status</option>
                    {Object.entries(STATUS).map(([v,{label}]) => <option key={v} value={v}>{label}</option>)}
                </select>
            </Card>

            {/* Table */}
            <Card>
                {loading ? (
                    <div className="p-5"><TableSkeleton rows={6} cols={7} /></div>
                ) : !filtered.length ? (
                    <EmptyState icon={CalendarDaysIcon} title="Tidak ada janji temu" desc="Ubah filter atau buat janji temu baru" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr>
                                {['No. Antrian','Pasien','Dokter / Poli','Tanggal & Jam','Keluhan','Status','Aksi'].map(h=>(
                                    <th key={h} className="tbl-head">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {filtered.map(a => {
                                    const s = STATUS[a.status] ?? STATUS.pending;
                                    return (
                                        <tr key={a.id} className="tbl-row">
                                            <td className="tbl-cell">
                                                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg">{a.queue_number}</span>
                                            </td>
                                            <td className="tbl-cell">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar name={a.patient?.name} size="sm" />
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">{a.patient?.name}</p>
                                                        <p className="text-xs text-slate-400">{a.patient?.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="tbl-cell">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{a.doctor?.user?.name}</p>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">{a.doctor?.specialization}</span>
                                            </td>
                                            <td className="tbl-cell">
                                                <p className="text-sm text-slate-700 dark:text-slate-200">{a.appointment_date}</p>
                                                <p className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">{a.appointment_time?.slice(0,5)}</p>
                                            </td>
                                            <td className="tbl-cell max-w-[160px]">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{a.complaint}</p>
                                            </td>
                                            <td className="tbl-cell">
                                                {canChangeStatus ? (
                                                    <select value={a.status} onChange={e => changeStatus(a.id, e.target.value)}
                                                        className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer">
                                                        {Object.entries(STATUS).map(([v,{label}]) => <option key={v} value={v}>{label}</option>)}
                                                    </select>
                                                ) : (
                                                    <Badge variant={s.v}>{s.label}</Badge>
                                                )}
                                            </td>
                                            <td className="tbl-cell">
                                                <div className="flex items-center gap-1">
                                                    <Link to={`/appointments/${a.id}`}>
                                                        <button className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                                            <EyeIcon className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    {canDelete && (
                                                        <button onClick={() => setDelModal({ open:true, id:a.id })}
                                                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination meta={meta} onChange={setPage} />
            </Card>

            <ConfirmModal open={delModal.open} onClose={() => setDelModal({ open:false, id:null })}
                title="Hapus Janji Temu" message="Data akan dipindahkan ke Log Aktivitas dan dapat dikembalikan oleh admin."
                onConfirm={handleDelete} />
        </div>
    );
}
