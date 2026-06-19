import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArchiveBoxIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, EmptyState, TableSkeleton, Pagination, SectionHeader } from '../../components/ui';

const LABELS = {
    'App\\Models\\Patient':       'Pasien',
    'App\\Models\\Doctor':        'Dokter',
    'App\\Models\\Appointment':   'Janji Temu',
    'App\\Models\\MedicalRecord': 'Rekam Medis',
    'App\\Models\\User':          'User',
};

export default function ActivityLogPage() {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const load = async (p = page) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/activity-logs', { params: { page: p } });
            setLogs(res.data.data.data);
            setMeta(res.data.data);
        } catch (e) {
            toast.error('Gagal memuat log aktivitas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page); }, [page]);

    const handleRestore = async (id) => {
        try {
            await axios.post(`/api/admin/activity-logs/${id}/restore`);
            toast.success('Data berhasil dikembalikan');
            load(page);
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal mengembalikan data');
        }
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Log Aktivitas" subtitle="Riwayat penghapusan data, bisa dikembalikan jika tidak sengaja" />

            <Card>
                {loading ? (
                    <div className="p-5"><TableSkeleton rows={6} cols={5} /></div>
                ) : logs.length === 0 ? (
                    <EmptyState icon={ArchiveBoxIcon} title="Belum ada log" desc="Riwayat penghapusan data akan muncul di sini" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    {['Data', 'Tipe', 'Dihapus Oleh', 'Waktu', 'Status', 'Aksi'].map(h => (
                                        <th key={h} className="tbl-head">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="tbl-row">
                                        <td className="tbl-cell font-semibold text-slate-800 text-sm">{log.subject_label ?? `#${log.subject_id}`}</td>
                                        <td className="tbl-cell text-xs text-slate-500">{LABELS[log.subject_type] ?? log.subject_type}</td>
                                        <td className="tbl-cell text-xs text-slate-500">{log.user?.name ?? '-'}</td>
                                        <td className="tbl-cell text-xs text-slate-400">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                        <td className="tbl-cell">
                                            <Badge variant={log.restored_at ? 'success' : 'warning'}>
                                                {log.restored_at ? 'Dikembalikan' : 'Terhapus'}
                                            </Badge>
                                        </td>
                                        <td className="tbl-cell">
                                            {!log.restored_at && (
                                                <Button variant="outline" size="xs" onClick={() => handleRestore(log.id)}>
                                                    <ArrowUturnLeftIcon className="w-3.5 h-3.5" /> Kembalikan
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination meta={meta} onChange={setPage} />
            </Card>
        </div>
    );
}
