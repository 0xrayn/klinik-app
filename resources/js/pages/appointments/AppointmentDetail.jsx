import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon, CalendarDaysIcon, ClockIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar } from '../../components/ui';

const MOCK = {
    id:1, queue:'A001', status:'confirmed',
    patient:{ name:'Ahmad Fauzi', nik:'3578012345678901', phone:'081234567890', birth_date:'1990-05-15', address:'Jl. Mawar No. 12, Bangil, Pasuruan', blood_type:'O+', allergies:'Penisilin' },
    doctor:{ name:'dr. Siti Rahayu, Sp.PD', spec:'Penyakit Dalam' },
    date:'2024-12-15', time:'08:00',
    complaint:'Demam sejak 3 hari, disertai batuk kering dan sakit kepala yang cukup mengganggu.',
    notes:'Pasien memiliki riwayat alergi penisilin. Pernah dirawat inap 2021.',
    created_at:'2024-12-14 14:30',
};
const STATUS = {
    pending:     { label:'Pending',       v:'neutral' },
    confirmed:   { label:'Terkonfirmasi', v:'info' },
    in_progress: { label:'Berlangsung',   v:'warning' },
    done:        { label:'Selesai',       v:'success' },
    cancelled:   { label:'Dibatalkan',    v:'danger' },
};
const TIMELINE = [
    { label:'Janji dibuat',           done:true,  time:'2024-12-14 14:30' },
    { label:'Dikonfirmasi admin',      done:true,  time:'2024-12-14 15:00' },
    { label:'Pasien hadir & diperiksa',done:false, time:null },
    { label:'Pemeriksaan selesai',     done:false, time:null },
];

export default function AppointmentDetail() {
    const { id } = useParams();
    const a = MOCK;
    const s = STATUS[a.status];

    return (
        <div className="max-w-4xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/appointments">
                        <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="page-title">Detail Janji Temu</h1>
                            <Badge variant={s.v} pulse={a.status === 'in_progress'}>{s.label}</Badge>
                        </div>
                        <p className="page-subtitle">No. Antrian: <span className="font-mono font-bold">{a.queue}</span></p>
                    </div>
                </div>
                <Button variant="outline" size="sm"><PrinterIcon className="w-4 h-4" />Cetak</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Patient */}
                <Card className="p-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Data Pasien</p>
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar name={a.patient.name} size="lg" />
                        <div>
                            <p className="font-semibold text-slate-900">{a.patient.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{a.patient.nik}</p>
                        </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2 text-slate-600">
                            <PhoneIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />{a.patient.phone}
                        </li>
                        <li className="flex items-start gap-2 text-slate-600">
                            <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />{a.patient.address}
                        </li>
                    </ul>
                    <div className="flex gap-2 mt-4">
                        <span className="badge badge-info">Gol. {a.patient.blood_type}</span>
                        {a.patient.allergies && <span className="badge badge-danger">Alergi: {a.patient.allergies}</span>}
                    </div>
                </Card>

                {/* Right panels */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Schedule */}
                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Jadwal</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 bg-brand-50 rounded-xl p-3">
                                <CalendarDaysIcon className="w-5 h-5 text-brand-600 shrink-0" />
                                <div className="leading-tight">
                                    <p className="text-[10px] text-slate-500">Tanggal</p>
                                    <p className="font-semibold text-slate-900 text-sm">{a.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-violet-50 rounded-xl p-3">
                                <ClockIcon className="w-5 h-5 text-violet-600 shrink-0" />
                                <div className="leading-tight">
                                    <p className="text-[10px] text-slate-500">Jam</p>
                                    <p className="font-semibold text-slate-900 font-mono text-sm">{a.time}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl">
                            <Avatar name={a.doctor.name} size="sm" color="bg-violet-100 text-violet-700" />
                            <div className="leading-tight">
                                <p className="text-sm font-semibold text-slate-800">{a.doctor.name}</p>
                                <p className="text-xs text-slate-400">Poli {a.doctor.spec}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Complaint */}
                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Keluhan</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{a.complaint}</p>
                        {a.notes && (
                            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Catatan</p>
                                <p className="text-xs text-amber-800">{a.notes}</p>
                            </div>
                        )}
                    </Card>

                    {/* Timeline */}
                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Progress</p>
                        <div className="space-y-3">
                            {TIMELINE.map((t, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${t.done ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        {t.done ? <CheckIcon /> : i+1}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${t.done ? 'text-slate-800' : 'text-slate-400'}`}>{t.label}</p>
                                        {t.time && <p className="text-xs text-slate-400">{t.time}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function CheckIcon() {
    return <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
}
