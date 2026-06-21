import React, { useEffect, useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, ClipboardDocumentListIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar, Modal, ConfirmModal, EmptyState, TableSkeleton, Pagination, SectionHeader, Input, Select, Textarea } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import useAuth from '../../stores/authStore';

export default function MedicalRecordPage() {
    const { hasRole } = useAuth();
    const canEdit = hasRole('admin') || hasRole('dokter');

    const [data, setData]     = useState([]);
    const [meta, setMeta]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage]     = useState(1);
    const [search, setSearch] = useState('');

    const [patients, setPatients] = useState([]);
    const [patientQuery, setPatientQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [addOpen, setAdd] = useState(false);
    const [view, setView]   = useState(null);
    const [editRec, setEditRec] = useState(null);
    const [del, setDel]     = useState({ open: false, id: null });
    const [sendInstr, setSendInstr] = useState(null);
    const [instrText, setInstrText] = useState('');
    const [instrNotes, setInstrNotes] = useState('');
    const [sendingInstr, setSendingInstr] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const load = async (p = page, q = search) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/medical-records', { params: { page: p, search: q || undefined, per_page: 10 } });
            setData(res.data.data.data);
            setMeta(res.data.data);
        } catch (e) {
            toast.error('Gagal memuat rekam medis');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page, search); }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load(1, search);
    };

    // Search patients for the "tambah" form
    useEffect(() => {
        if (!addOpen) return;
        const t = setTimeout(() => {
            axios.get('/api/patients', { params: { search: patientQuery || undefined, per_page: 8 } })
                .then(res => setPatients(res.data.data.data))
                .catch(() => setPatients([]));
        }, 250);
        return () => clearTimeout(t);
    }, [patientQuery, addOpen]);

    const openAdd = () => {
        reset({ examination_date: new Date().toISOString().split('T')[0], status: 'draft' });
        setSelectedPatient(null);
        setPatientQuery('');
        setEditRec(null);
        setAdd(true);
    };

    const openEdit = (rec) => {
        reset({
            diagnosis: rec.diagnosis, icd_code: rec.icd_code, prescription: rec.prescription ?? '',
            treatment: rec.treatment ?? '', notes: rec.notes ?? '', status: rec.status,
            examination_date: rec.examination_date,
        });
        setSelectedPatient(rec.patient);
        setEditRec(rec);
        setAdd(true);
    };

    const onSubmit = async (d) => {
        if (!editRec && !selectedPatient) {
            toast.error('Pilih pasien terlebih dahulu');
            return;
        }
        try {
            if (editRec) {
                await axios.put(`/api/medical-records/${editRec.id}`, d);
                toast.success('Rekam medis diperbarui');
            } else {
                await axios.post('/api/medical-records', { ...d, patient_id: selectedPatient.id });
                toast.success('Rekam medis disimpan');
            }
            setAdd(false);
            load();
        } catch (e) {
            const msg = e.response?.data?.errors
                ? Object.values(e.response.data.errors).flat().join(', ')
                : (e.response?.data?.message ?? 'Gagal menyimpan rekam medis');
            toast.error(msg);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/medical-records/${del.id}`);
            toast.success('Rekam medis dihapus');
            load();
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal menghapus data');
        } finally {
            setDel({ open: false, id: null });
        }
    };

    const submitInstruction = async () => {
        if (!instrText.trim()) return toast.error('Instruksi tidak boleh kosong');
        setSendingInstr(true);
        try {
            await axios.post('/api/care-instructions', {
                medical_record_id: sendInstr.id,
                patient_id: sendInstr.patient_id,
                instruction: instrText,
                notes: instrNotes,
            });
            toast.success('Instruksi berhasil dikirim ke perawat');
            setSendInstr(null);
            setInstrText('');
            setInstrNotes('');
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal mengirim instruksi');
        } finally {
            setSendingInstr(false);
        }
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Rekam Medis" subtitle="Diagnosis, tindakan, dan resep pasien"
                action={canEdit && <Button variant="primary" size="sm" onClick={openAdd}><PlusIcon className="w-4 h-4"/>Input Hasil Kunjungan</Button>} />

            <Card className="p-3.5">
                <form onSubmit={handleSearch} className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input input-icon text-sm" placeholder="Cari pasien, diagnosis, kode ICD..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </form>
            </Card>

            <Card>
                {loading ? (
                    <div className="p-5"><TableSkeleton rows={6} cols={7} /></div>
                ) : !data.length
                    ? <EmptyState icon={ClipboardDocumentListIcon} title="Tidak ada data" desc="Belum ada rekam medis tersimpan" />
                    : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr>
                                    {['Pasien','Dokter','Tanggal','Diagnosis','ICD-10','Status','Aksi'].map(h=><th key={h} className="tbl-head">{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {data.map(r => (
                                        <tr key={r.id} className="tbl-row">
                                            <td className="tbl-cell">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={r.patient?.name} size="sm" />
                                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{r.patient?.name}</span>
                                                </div>
                                            </td>
                                            <td className="tbl-cell text-xs text-slate-500 dark:text-slate-400">{r.doctor?.user?.name}</td>
                                            <td className="tbl-cell text-sm dark:text-slate-300">{r.examination_date}</td>
                                            <td className="tbl-cell max-w-[180px]">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{r.diagnosis}</p>
                                            </td>
                                            <td className="tbl-cell">
                                                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg font-semibold">{r.icd_code}</span>
                                            </td>
                                            <td className="tbl-cell">
                                                <Badge variant={r.status === 'final' ? 'success' : 'warning'}>{r.status === 'final' ? 'Final' : 'Draft'}</Badge>
                                            </td>
                                            <td className="tbl-cell">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setView(r)} className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                                        <EyeIcon className="w-4 h-4"/>
                                                    </button>
                                                    {canEdit && (
                                                        <>
                                                            <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                                                <PencilSquareIcon className="w-4 h-4"/>
                                                            </button>
                                                            <button onClick={() => setDel({ open:true, id:r.id })} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                                                <TrashIcon className="w-4 h-4"/>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
                <Pagination meta={meta} onChange={setPage} />
            </Card>

            {/* Add / Edit Modal */}
            <Modal open={addOpen} onClose={() => setAdd(false)} title={editRec ? 'Edit Rekam Medis' : 'Input Hasil Kunjungan'} size="lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {!editRec && (
                        <div>
                            <label className="field-label">Pasien</label>
                            {selectedPatient ? (
                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-brand-200 bg-brand-50 dark:bg-brand-500/10 dark:border-brand-500/20">
                                    <Avatar name={selectedPatient.name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedPatient.name}</p>
                                        <p className="text-xs text-slate-400">NIK {selectedPatient.nik}</p>
                                    </div>
                                    <button type="button" onClick={() => setSelectedPatient(null)} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">Ganti</button>
                                </div>
                            ) : (
                                <div>
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input className="input input-icon text-sm" placeholder="Cari nama atau NIK pasien..."
                                            value={patientQuery} onChange={e => setPatientQuery(e.target.value)} />
                                    </div>
                                    {patients.length > 0 && (
                                        <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                                            {patients.map(p => (
                                                <button type="button" key={p.id} onClick={() => setSelectedPatient(p)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                    <Avatar name={p.name} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.name}</p>
                                                        <p className="text-xs text-slate-400">NIK {p.nik}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Self-reported history context */}
                    {selectedPatient && (selectedPatient.allergies || selectedPatient.chronic_diseases || selectedPatient.medical_history) && (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-3.5 py-3 text-xs space-y-1.5">
                            <p className="font-semibold text-amber-700 dark:text-amber-300">Riwayat dari Pasien</p>
                            {selectedPatient.allergies && <p className="text-amber-700 dark:text-amber-300"><span className="font-medium">Alergi:</span> {selectedPatient.allergies}</p>}
                            {selectedPatient.chronic_diseases && <p className="text-amber-700 dark:text-amber-300"><span className="font-medium">Penyakit kronis:</span> {selectedPatient.chronic_diseases}</p>}
                            {selectedPatient.medical_history && <p className="text-amber-700 dark:text-amber-300"><span className="font-medium">Riwayat lain:</span> {selectedPatient.medical_history}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Tanggal Pemeriksaan" type="date" error={errors.examination_date?.message}
                            {...register('examination_date', { required:'Wajib diisi' })} />
                        <Select label="Status" {...register('status', { required:true })}>
                            <option value="draft">Draft</option>
                            <option value="final">Final</option>
                        </Select>
                        <div className="sm:col-span-2">
                            <Input label="Diagnosis" placeholder="Diagnosis utama" error={errors.diagnosis?.message}
                                {...register('diagnosis', { required:'Wajib diisi' })} />
                        </div>
                        <Input label="Kode ICD-10" placeholder="Contoh: I10" error={errors.icd_code?.message}
                            {...register('icd_code', { required:'Wajib diisi', maxLength:{value:10,message:'Maks. 10 karakter'} })} />
                        <div className="sm:col-span-2">
                            <Textarea label="Tindakan / Penanganan" placeholder="Tindakan yang dilakukan..." rows={2} {...register('treatment')} />
                        </div>
                        <div className="sm:col-span-2">
                            <Textarea label="Resep Obat" placeholder="Daftar obat dan dosis..." rows={3} {...register('prescription')} />
                        </div>
                        <div className="sm:col-span-2">
                            <Textarea label="Catatan Tambahan" placeholder="Saran, tindak lanjut..." rows={2} {...register('notes')} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setAdd(false)}>Batal</Button>
                        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>Simpan</Button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            {view && (
                <Modal open={!!view} onClose={() => setView(null)} title="Detail Rekam Medis" size="md">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <Avatar name={view.patient?.name} />
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{view.patient?.name}</p>
                                <p className="text-xs text-slate-400">{view.examination_date} - {view.doctor?.user?.name}</p>
                            </div>
                            <div className="ml-auto">
                                <Badge variant={view.status === 'final' ? 'success' : 'warning'}>{view.status === 'final' ? 'Final' : 'Draft'}</Badge>
                            </div>
                        </div>
                        {[['Diagnosis', view.diagnosis], ['Kode ICD-10', view.icd_code], ['Tindakan', view.treatment], ['Resep Obat', view.prescription], ['Catatan', view.notes]].map(([k,v]) => v && (
                            <div key={k}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k}</p>
                                <p className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 whitespace-pre-line">{v}</p>
                            </div>
                        ))}
                        {canEdit && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => { setView(null); setSendInstr(view); }}
                                    className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                                    Kirim Instruksi Perawatan ke Perawat
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            <ConfirmModal open={del.open} onClose={() => setDel({ open:false, id:null })}
                title="Hapus Rekam Medis" message="Data akan dipindahkan ke Log Aktivitas dan dapat dikembalikan oleh admin."
                onConfirm={handleDelete} />

            {/* Send care instruction to nurse */}
            <Modal open={!!sendInstr} onClose={() => setSendInstr(null)} title="Kirim Instruksi ke Perawat" size="sm">
                <div className="space-y-4">
                    <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 px-3 py-2.5 text-xs">
                        <p className="font-semibold text-violet-700 dark:text-violet-300">Pasien: {sendInstr?.patient?.name}</p>
                        <p className="text-violet-600 dark:text-violet-400 mt-0.5">Diagnosis: {sendInstr?.diagnosis}</p>
                    </div>
                    <Textarea label="Instruksi untuk Perawat" placeholder="Contoh: Berikan Paracetamol 500mg 3x1 sehari, ganti perban tiap 8 jam..."
                        rows={3} value={instrText} onChange={e => setInstrText(e.target.value)} />
                    <Textarea label="Catatan Tambahan (opsional)" placeholder="Informasi pendukung untuk perawat..."
                        rows={2} value={instrNotes} onChange={e => setInstrNotes(e.target.value)} />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" onClick={() => setSendInstr(null)}>Batal</Button>
                        <Button variant="primary" size="sm" loading={sendingInstr} onClick={submitInstruction}>Kirim ke Perawat</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
