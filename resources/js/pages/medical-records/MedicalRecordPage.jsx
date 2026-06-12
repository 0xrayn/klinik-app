import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar, Modal, EmptyState, SectionHeader } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const MOCK = [
    { id:1, patient:'Ahmad Fauzi',    doctor:'dr. Siti Rahayu',   date:'2024-12-10', diagnosis:'Hipertensi Esensial',    icd:'I10',  prescription:'Amlodipine 5mg 1x1\nCaptopril 12.5mg 2x1', notes:'Kontrol 1 bulan', status:'final' },
    { id:2, patient:'Dewi Sartika',   doctor:'dr. Budi Prakoso',  date:'2024-12-08', diagnosis:'Karies Gigi',             icd:'K02',  prescription:'Amoxicillin 500mg 3x1',                     notes:'Gigi ditambal', status:'final' },
    { id:3, patient:'Rudi Hermawan',  doctor:'dr. Siti Rahayu',   date:'2024-11-30', diagnosis:'Diabetes Mellitus Tipe 2',icd:'E11',  prescription:'Metformin 500mg 2x1\nGlibenclamide 5mg 1x1',notes:'HbA1c 7.8%', status:'final' },
    { id:4, patient:'Sari Indah',     doctor:'dr. Yuni Astuti',   date:'2024-12-12', diagnosis:'ISPA pada Anak',          icd:'J06',  prescription:'Amoxicillin syr 3x1\nParacetamol syr 3x1',  notes:'Istirahat cukup', status:'draft' },
];

export default function MedicalRecordPage() {
    const [data, setData]     = useState(MOCK);
    const [search, setSearch] = useState('');
    const [addOpen, setAdd]   = useState(false);
    const [view, setView]     = useState(null);
    const { register, handleSubmit, reset, formState:{ isSubmitting } } = useForm();

    const filtered = data.filter(r => {
        const q = search.toLowerCase();
        return r.patient.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q) || r.icd.toLowerCase().includes(q);
    });

    const onSubmit = async (d) => {
        await new Promise(r => setTimeout(r, 700));
        setData(prev => [{ id: Date.now(), ...d, doctor:'dr. Siti Rahayu' }, ...prev]);
        toast.success('Rekam medis disimpan');
        setAdd(false); reset();
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Rekam Medis" subtitle="Diagnosa dan resep pasien"
                action={<Button variant="primary" size="sm" onClick={() => setAdd(true)}><PlusIcon className="w-4 h-4"/>Tambah</Button>} />

            <Card className="p-3.5">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input input-icon text-sm" placeholder="Cari pasien, diagnosis, kode ICD…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </Card>

            <Card>
                {!filtered.length
                    ? <EmptyState icon={ClipboardDocumentListIcon} title="Tidak ada data" desc="Belum ada rekam medis tersimpan" />
                    : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr>
                                    {['Pasien','Dokter','Tanggal','Diagnosis','ICD-10','Status','Aksi'].map(h=><th key={h} className="tbl-head">{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {filtered.map(r => (
                                        <tr key={r.id} className="tbl-row">
                                            <td className="tbl-cell">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={r.patient} size="sm" />
                                                    <span className="font-semibold text-sm text-slate-800">{r.patient}</span>
                                                </div>
                                            </td>
                                            <td className="tbl-cell text-xs text-slate-500">{r.doctor}</td>
                                            <td className="tbl-cell text-sm">{r.date}</td>
                                            <td className="tbl-cell max-w-[180px]">
                                                <p className="text-sm font-medium text-slate-700 truncate">{r.diagnosis}</p>
                                            </td>
                                            <td className="tbl-cell">
                                                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-semibold">{r.icd}</span>
                                            </td>
                                            <td className="tbl-cell">
                                                <Badge variant={r.status === 'final' ? 'success' : 'warning'}>{r.status === 'final' ? 'Final' : 'Draft'}</Badge>
                                            </td>
                                            <td className="tbl-cell">
                                                <button onClick={() => setView(r)} className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                                                    <EyeIcon className="w-4 h-4"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </Card>

            {/* Add Modal */}
            <Modal open={addOpen} onClose={() => setAdd(false)} title="Tambah Rekam Medis" size="lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="field-label">Nama Pasien</label>
                            <input className="input" placeholder="Nama pasien" {...register('patient', { required:true })} />
                        </div>
                        <div>
                            <label className="field-label">Tanggal Pemeriksaan</label>
                            <input type="date" className="input" {...register('date', { required:true })} />
                        </div>
                        <div>
                            <label className="field-label">Diagnosis</label>
                            <input className="input" placeholder="Diagnosis utama" {...register('diagnosis', { required:true })} />
                        </div>
                        <div>
                            <label className="field-label">Kode ICD-10</label>
                            <input className="input" placeholder="Contoh: I10" {...register('icd', { required:true })} />
                        </div>
                        <div className="col-span-2">
                            <label className="field-label">Resep Obat</label>
                            <textarea rows={3} className="input" placeholder="Daftar obat dan dosis…" {...register('prescription')} />
                        </div>
                        <div className="col-span-2">
                            <label className="field-label">Catatan</label>
                            <textarea rows={2} className="input" placeholder="Saran, tindak lanjut…" {...register('notes')} />
                        </div>
                        <div>
                            <label className="field-label">Status</label>
                            <select className="input" {...register('status', { required:true })}>
                                <option value="draft">Draft</option>
                                <option value="final">Final</option>
                            </select>
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
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <Avatar name={view.patient} />
                            <div>
                                <p className="font-semibold text-slate-900">{view.patient}</p>
                                <p className="text-xs text-slate-400">{view.date} · {view.doctor}</p>
                            </div>
                            <div className="ml-auto">
                                <Badge variant={view.status === 'final' ? 'success' : 'warning'}>{view.status}</Badge>
                            </div>
                        </div>
                        {[['Diagnosis', view.diagnosis], ['Kode ICD-10', view.icd], ['Resep Obat', view.prescription], ['Catatan', view.notes]].map(([k,v]) => v && (
                            <div key={k}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k}</p>
                                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 whitespace-pre-line">{v}</p>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
        </div>
    );
}
