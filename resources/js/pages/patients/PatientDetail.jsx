import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PencilSquareIcon, CalendarDaysIcon, DocumentTextIcon, ClipboardDocumentListIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar } from '../../components/ui';
import clsx from 'clsx';

const MOCK = {
    id:1, name:'Ahmad Fauzi', nik:'3578012345678901', phone:'081234567890',
    dob:'1990-05-15', gender:'L', blood:'O+',
    address:'Jl. Mawar No. 12, Bangil, Pasuruan, Jawa Timur',
    bpjs:'0001234567890', allergies:'Penisilin', chronic:'Hipertensi', status:'active',
    appointments:[
        { id:1, date:'2024-12-15', doctor:'dr. Siti Rahayu', poli:'Umum',    status:'confirmed' },
        { id:2, date:'2024-12-10', doctor:'dr. Siti Rahayu', poli:'Umum',    status:'done' },
        { id:3, date:'2024-11-25', doctor:'dr. Budi Prakoso',poli:'Gigi',    status:'done' },
    ],
    records:[
        { id:1, date:'2024-12-10', doctor:'dr. Siti Rahayu', diagnosis:'Hipertensi Esensial',   icd:'I10',  prescription:'Amlodipine 5mg 1x1\nCaptopril 12.5mg 2x1', notes:'Kontrol 1 bulan lagi' },
        { id:2, date:'2024-11-25', doctor:'dr. Budi Prakoso',diagnosis:'Karies Gigi',           icd:'K02',  prescription:'Amoxicillin 500mg 3x1\nParacetamol 500mg 3x1', notes:'Gigi sudah ditambal' },
    ],
};
const APPT_STATUS = { done:{label:'Selesai',v:'success'}, confirmed:{label:'Terkonfirmasi',v:'info'}, cancelled:{label:'Dibatalkan',v:'danger'} };
const TABS = [
    { id:'info',    label:'Informasi',       Icon:DocumentTextIcon },
    { id:'visits',  label:'Kunjungan',       Icon:CalendarDaysIcon },
    { id:'records', label:'Rekam Medis',     Icon:ClipboardDocumentListIcon },
];

function age(dob) {
    const b = new Date(dob), t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() - b.getMonth() < 0) a--;
    return a;
}

export default function PatientDetail() {
    const { id } = useParams();
    const [tab, setTab] = useState('info');
    const p = MOCK;

    return (
        <div className="max-w-4xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/patients"><button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"><ArrowLeftIcon className="w-4 h-4"/></button></Link>
                    <div>
                        <h1 className="page-title">Detail Pasien</h1>
                        <p className="page-subtitle font-mono text-xs">{p.nik}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/appointments/create?patient=${p.id}`}>
                        <Button variant="brand-soft" size="sm"><CalendarDaysIcon className="w-4 h-4"/>Buat Janji</Button>
                    </Link>
                    <Link to={`/patients/${p.id}/edit`}>
                        <Button variant="outline" size="sm"><PencilSquareIcon className="w-4 h-4"/>Edit</Button>
                    </Link>
                </div>
            </div>

            {/* Profile summary */}
            <Card className="p-5">
                <div className="flex items-center gap-4 flex-wrap">
                    <Avatar name={p.name} size="xl" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-bold text-slate-900 text-lg">{p.name}</h2>
                            <Badge variant={p.status === 'active' ? 'success' : 'neutral'} pulse={p.status === 'active'}>
                                {p.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500">
                            <span>{age(p.dob)} tahun · {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            <span>Gol. Darah: <b className="text-slate-700">{p.blood}</b></span>
                            <span>BPJS: <span className="font-mono">{p.bpjs}</span></span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {p.allergies && <Badge variant="danger">Alergi: {p.allergies}</Badge>}
                            {p.chronic   && <Badge variant="warning">Penyakit: {p.chronic}</Badge>}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="tab-bar w-fit">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'tab-active' : 'tab-item'}>
                        <t.Icon className="w-4 h-4" />{t.label}
                    </button>
                ))}
            </div>

            {/* Tab: Info */}
            {tab === 'info' && (
                <div className="grid sm:grid-cols-2 gap-4 animate-scale-in">
                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Data Pribadi</p>
                        <dl className="space-y-2.5 text-sm">
                            {[['Nama',p.name],['NIK',p.nik],['Tgl Lahir',p.dob],['Jenis Kelamin',p.gender==='L'?'Laki-laki':'Perempuan'],['Telepon',p.phone]].map(([k,v])=>(
                                <div key={k} className="flex justify-between gap-2">
                                    <dt className="text-slate-400 shrink-0">{k}</dt>
                                    <dd className="font-medium text-slate-800 text-right truncate">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </Card>
                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Riwayat Medis</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Alergi</p>
                                <div className="bg-rose-50 text-rose-700 rounded-xl px-3 py-2 text-sm">{p.allergies || 'Tidak ada'}</div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Penyakit Bawaan</p>
                                <div className="bg-amber-50 text-amber-700 rounded-xl px-3 py-2 text-sm">{p.chronic || 'Tidak ada'}</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-5 sm:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Alamat</p>
                        <div className="flex items-start gap-2 text-sm text-slate-700">
                            <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />{p.address}
                        </div>
                    </Card>
                </div>
            )}

            {/* Tab: Visits */}
            {tab === 'visits' && (
                <Card className="animate-scale-in">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr>
                                {['Tanggal','Dokter','Poli','Status'].map(h=><th key={h} className="tbl-head">{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {p.appointments.map(a => {
                                    const s = APPT_STATUS[a.status] || { label:a.status, v:'neutral' };
                                    return (
                                        <tr key={a.id} className="tbl-row">
                                            <td className="tbl-cell font-medium">{a.date}</td>
                                            <td className="tbl-cell">{a.doctor}</td>
                                            <td className="tbl-cell"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">{a.poli}</span></td>
                                            <td className="tbl-cell"><Badge variant={s.v}>{s.label}</Badge></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Tab: Records */}
            {tab === 'records' && (
                <div className="space-y-3 animate-scale-in">
                    {p.records.map(r => (
                        <Card key={r.id} className="p-5">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <p className="font-semibold text-slate-900">{r.diagnosis}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{r.date} · {r.doctor}</p>
                                </div>
                                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-semibold">{r.icd}</span>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Resep Obat</p>
                                    <p className="bg-slate-50 rounded-xl px-3 py-2 text-slate-700 whitespace-pre-line text-xs">{r.prescription}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Catatan Dokter</p>
                                    <p className="bg-slate-50 rounded-xl px-3 py-2 text-slate-700 text-xs">{r.notes}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
