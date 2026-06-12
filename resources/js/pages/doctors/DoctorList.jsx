// DoctorList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Card, Badge, Button, SectionHeader } from '../../components/ui';

const DOCTORS = [
    { id:1, name:'dr. Siti Rahayu, Sp.PD',  spec:'Penyakit Dalam', exp:12, rating:4.8, rev:234, patients:1240, fee:'Rp 150.000', available:true,  schedule:'Sen–Jum 08:00–14:00' },
    { id:2, name:'dr. Budi Prakoso, drg',    spec:'Gigi & Mulut',   exp:8,  rating:4.7, rev:189, patients:890,  fee:'Rp 120.000', available:true,  schedule:'Sen–Sab 09:00–15:00' },
    { id:3, name:'dr. Yuni Astuti, Sp.A',    spec:'Anak',           exp:15, rating:4.9, rev:312, patients:1560, fee:'Rp 175.000', available:false, schedule:'Sel–Sab 08:00–13:00' },
    { id:4, name:'dr. Hendra Wijaya, Sp.JP', spec:'Jantung',        exp:20, rating:4.6, rev:156, patients:780,  fee:'Rp 250.000', available:true,  schedule:'Sen–Kam 13:00–18:00' },
    { id:5, name:'dr. Maya Kusuma, Sp.M',    spec:'Mata',           exp:10, rating:4.8, rev:201, patients:940,  fee:'Rp 140.000', available:true,  schedule:'Rab–Min 08:00–14:00' },
    { id:6, name:'dr. Andi Prasetyo, Sp.KK', spec:'Kulit & Kelamin',exp:7,  rating:4.5, rev:143, patients:670,  fee:'Rp 130.000', available:false, schedule:'Sen–Jum 10:00–16:00' },
];
const SPECS = ['Semua', 'Penyakit Dalam', 'Gigi & Mulut', 'Anak', 'Jantung', 'Mata', 'Kulit & Kelamin'];

function Stars({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => i <= Math.round(rating)
                ? <StarSolid key={i} className="w-3 h-3 text-amber-400" />
                : <StarOutline key={i} className="w-3 h-3 text-slate-300" />)}
        </div>
    );
}

export default function DoctorList() {
    const [search, setSearch]   = useState('');
    const [spec, setSpec]       = useState('Semua');
    const [onlyAvail, setAvail] = useState(false);

    const filtered = DOCTORS.filter(d => {
        const q = search.toLowerCase();
        return (!search || d.name.toLowerCase().includes(q) || d.spec.toLowerCase().includes(q))
            && (spec === 'Semua' || d.spec === spec)
            && (!onlyAvail || d.available);
    });

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Dokter" subtitle="Temukan dokter yang sesuai kebutuhan Anda" />

            <Card className="p-3.5 space-y-3">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input input-icon text-sm" placeholder="Cari nama dokter atau spesialisasi…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {SPECS.map(s => (
                        <button key={s} onClick={() => setSpec(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                                ${spec === s ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {s}
                        </button>
                    ))}
                    <label className="ml-auto flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 font-medium">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            checked={onlyAvail} onChange={e => setAvail(e.target.checked)} />
                        Tersedia hari ini
                    </label>
                </div>
            </Card>

            {!filtered.length ? (
                <div className="text-center py-16 text-slate-400">
                    <p className="font-medium">Dokter tidak ditemukan</p>
                    <p className="text-sm mt-1">Coba ubah filter pencarian</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(d => (
                        <Card key={d.id} hover className="p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shrink-0">
                                    <span className="text-xl font-bold text-white">{d.name.replace('dr. ','')[0]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm leading-tight">{d.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{d.spec}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Stars rating={d.rating} />
                                        <span className="text-xs text-slate-500">{d.rating} <span className="text-slate-300">({d.rev})</span></span>
                                    </div>
                                </div>
                                <Badge variant={d.available ? 'success' : 'neutral'} pulse={d.available}>
                                    {d.available ? 'Buka' : 'Libur'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-500">
                                <div className="bg-slate-50 rounded-xl px-3 py-2">
                                    <p className="text-slate-400">Pengalaman</p>
                                    <p className="font-semibold text-slate-700 mt-0.5">{d.exp} tahun</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl px-3 py-2">
                                    <p className="text-slate-400">Pasien</p>
                                    <p className="font-semibold text-slate-700 mt-0.5">{d.patients.toLocaleString()}</p>
                                </div>
                                <div className="col-span-2 bg-slate-50 rounded-xl px-3 py-2">
                                    <p className="text-slate-400">Jadwal</p>
                                    <p className="font-semibold text-slate-700 mt-0.5">{d.schedule}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-brand-600">{d.fee}</p>
                                <div className="flex gap-2">
                                    <Link to={`/doctors/${d.id}`}><Button variant="outline" size="xs">Profil</Button></Link>
                                    {d.available && <Link to={`/appointments/create?doctor=${d.id}`}><Button variant="primary" size="xs">Buat Janji</Button></Link>}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
