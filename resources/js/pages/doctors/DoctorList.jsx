import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Card, Badge, Button, SectionHeader, EmptyState, Skeleton } from '../../components/ui';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../../stores/authStore';

function Stars({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => i <= Math.round(rating)
                ? <StarSolid key={i} className="w-3 h-3 text-amber-400" />
                : <StarOutline key={i} className="w-3 h-3 text-slate-300" />)}
        </div>
    );
}

function DoctorAvatar({ doctor, size = 'w-12 h-12' }) {
    const name = doctor.user?.name ?? '';
    if (doctor.photo_url) {
        return <img src={doctor.photo_url} alt={name} className={`${size} rounded-2xl object-cover shrink-0 bg-slate-100`} />;
    }
    return (
        <div className={`${size} rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shrink-0`}>
            <span className="text-xl font-bold text-white">{name.replace(/^(dr\.|drg\.?)\s*/i, '')[0] ?? '?'}</span>
        </div>
    );
}

export default function DoctorList() {
    const { hasAnyRole } = useAuth();
    const canBook = hasAnyRole(['admin', 'pasien']);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [spec, setSpec]       = useState('Semua');

    useEffect(() => {
        axios.get('/api/doctors', { params: { per_page: 50 } })
            .then(res => setDoctors(res.data.data.data))
            .catch(() => toast.error('Gagal memuat daftar dokter'))
            .finally(() => setLoading(false));
    }, []);

    const SPECS = ['Semua', ...new Set(doctors.map(d => d.specialization))];

    const filtered = doctors.filter(d => {
        const q = search.toLowerCase();
        return (!search || d.user?.name?.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q))
            && (spec === 'Semua' || d.specialization === spec);
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
                </div>
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
                </div>
            ) : !filtered.length ? (
                <EmptyState title="Dokter tidak ditemukan" desc="Coba ubah filter pencarian" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(d => (
                        <Card key={d.id} hover className="p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <DoctorAvatar doctor={d} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm leading-tight">{d.user?.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{d.specialization}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Stars rating={Number(d.rating)} />
                                        <span className="text-xs text-slate-500">{d.rating} <span className="text-slate-300">({d.total_reviews})</span></span>
                                    </div>
                                </div>
                                <Badge variant="success" pulse>Aktif</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-500">
                                <div className="bg-slate-50 rounded-xl px-3 py-2">
                                    <p className="text-slate-400">Pengalaman</p>
                                    <p className="font-semibold text-slate-700 mt-0.5">{d.experience_years} tahun</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl px-3 py-2">
                                    <p className="text-slate-400">Ulasan</p>
                                    <p className="font-semibold text-slate-700 mt-0.5">{d.total_reviews}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-brand-600">Rp {Number(d.consultation_fee).toLocaleString('id-ID')}</p>
                                <div className="flex gap-2">
                                    <Link to={`/doctors/${d.id}`}><Button variant="outline" size="xs">Profil</Button></Link>
                                    {canBook && <Link to="/appointments/create"><Button variant="primary" size="xs">Buat Janji</Button></Link>}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
