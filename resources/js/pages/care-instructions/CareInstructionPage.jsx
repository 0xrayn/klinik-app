import React, { useEffect, useState } from 'react';
import {
    ClipboardDocumentCheckIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Avatar, EmptyState, TableSkeleton, Pagination, SectionHeader, Modal, Textarea, Button } from '../../components/ui';
import toast from 'react-hot-toast';
import axios from 'axios';
import useAuth from '../../stores/authStore';

const STATUS = {
    pending:     { label: 'Baru',     v: 'neutral' },
    in_progress: { label: 'Diproses', v: 'warning' },
    done:        { label: 'Selesai',  v: 'success' },
};

export default function CareInstructionPage() {
    const { hasRole } = useAuth();
    const isNurse = hasRole('perawat') && !hasRole('admin');

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusF, setStatusF] = useState('');
    const [completeModal, setCompleteModal] = useState({ open: false, item: null });
    const [completionNotes, setCompletionNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = async (p = page) => {
        setLoading(true);
        try {
            const params = { page: p, per_page: 10 };
            if (statusF) params.status = statusF;
            const res = await axios.get('/api/care-instructions', { params });
            setData(res.data.data.data);
            setMeta(res.data.data);
        } catch (e) {
            toast.error('Gagal memuat instruksi perawatan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page); }, [page, statusF]);

    const claim = async (id) => {
        try {
            await axios.put(`/api/care-instructions/${id}/claim`);
            toast.success('Instruksi diambil, status diperbarui');
            load();
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal memperbarui status');
        }
    };

    const openComplete = (item) => {
        setCompletionNotes('');
        setCompleteModal({ open: true, item });
    };

    const submitComplete = async () => {
        setSubmitting(true);
        try {
            await axios.put(`/api/care-instructions/${completeModal.item.id}/complete`, { completion_notes: completionNotes });
            toast.success('Instruksi ditandai selesai');
            setCompleteModal({ open: false, item: null });
            load();
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal menyimpan');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader
                title="Instruksi Perawatan"
                subtitle={isNurse ? 'Instruksi dari dokter yang perlu dilaksanakan' : 'Instruksi yang Anda kirim ke perawat'}
            />

            <Card className="p-3.5 flex flex-wrap gap-2">
                {['', 'pending', 'in_progress', 'done'].map(s => (
                    <button key={s} onClick={() => { setStatusF(s); setPage(1); }}
                        className={s === statusF ? 'tab-active' : 'tab-item'}>
                        {s === '' ? 'Semua' : STATUS[s].label}
                    </button>
                ))}
            </Card>

            <Card>
                {loading ? (
                    <div className="p-5"><TableSkeleton rows={5} cols={5} /></div>
                ) : !data.length ? (
                    <EmptyState icon={ClipboardDocumentCheckIcon} title="Tidak ada instruksi" desc="Belum ada instruksi perawatan tercatat" />
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map(ins => {
                            const s = STATUS[ins.status] ?? STATUS.pending;
                            return (
                                <div key={ins.id} className="px-5 py-4 flex items-start gap-3.5">
                                    <Avatar name={ins.patient?.name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{ins.instruction}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {ins.patient?.name} - dr. {ins.doctor?.user?.name}
                                            {ins.assigned_nurse && <> - diambil oleh {ins.assigned_nurse.name}</>}
                                        </p>
                                        {ins.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5">{ins.notes}</p>}
                                        {ins.completion_notes && (
                                            <p className="text-xs text-brand-700 dark:text-brand-300 mt-1 bg-brand-50 dark:bg-brand-500/10 rounded-lg px-2.5 py-1.5">
                                                <span className="font-semibold">Catatan pelaksanaan:</span> {ins.completion_notes}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <Badge variant={s.v}>{s.label}</Badge>
                                        {isNurse && ins.status === 'pending' && (
                                            <button onClick={() => claim(ins.id)} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                                                Ambil Tugas
                                            </button>
                                        )}
                                        {isNurse && ins.status === 'in_progress' && (
                                            <button onClick={() => openComplete(ins)} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                                                <CheckIcon className="w-3.5 h-3.5" /> Tandai Selesai
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <Pagination meta={meta} onChange={setPage} />
            </Card>

            <Modal open={completeModal.open} onClose={() => setCompleteModal({ open: false, item: null })} title="Selesaikan Instruksi" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{completeModal.item?.instruction}</p>
                    <Textarea label="Catatan Pelaksanaan (opsional)" placeholder="Contoh: obat sudah diberikan pukul 14:00, kondisi pasien stabil..."
                        rows={3} value={completionNotes} onChange={e => setCompletionNotes(e.target.value)} />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" onClick={() => setCompleteModal({ open: false, item: null })}>Batal</Button>
                        <Button variant="primary" size="sm" loading={submitting} onClick={submitComplete}>Selesai</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
