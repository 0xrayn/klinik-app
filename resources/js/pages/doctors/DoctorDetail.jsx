import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, AcademicCapIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Card, Badge, Button, Skeleton } from '../../components/ui';
import axios from 'axios';
import toast from 'react-hot-toast';

const DAY_NAMES = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

export default function DoctorDetail() {
    const { id } = useParams();
    const [d, setD] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/doctors/${id}`)
            .then(res => setD(res.data.data))
            .catch(() => toast.error('Gagal memuat data dokter'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl space-y-5">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    if (!d) return null;

    const schedules = (d.schedules ?? [])
        .filter(s => s.is_active)
        .sort((a, b) => a.day_of_week - b.day_of_week);

    const initial = d.user?.name?.replace(/^(dr\.|drg\.?)\s*/i, '')[0] ?? '?';

    return (
        <div className="max-w-4xl space-y-5 animate-slide-up">
            <div className="flex items-center gap-3">
                <Link to="/doctors">
                    <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                </Link>
                <h1 className="page-title">Profil Dokter</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Profile card */}
                <Card className="p-6 text-center">
                    {d.photo_url ? (
                        <img src={d.photo_url} alt={d.user?.name} className="w-20 h-20 rounded-3xl object-cover mx-auto mb-4 bg-slate-100" />
                    ) : (
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-white">{initial}</span>
                        </div>
                    )}
                    <h2 className="font-bold text-slate-900 text-base leading-snug">{d.user?.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">{d.specialization}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 mb-3">
                        {[1,2,3,4,5].map(i => <StarSolid key={i} className={`w-3.5 h-3.5 ${i<=Math.round(d.rating)?'text-amber-400':'text-slate-200'}`} />)}
                        <span className="text-xs text-slate-500 ml-1">{d.rating} ({d.total_reviews})</span>
                    </div>
                    <Badge variant="success" pulse>Aktif</Badge>

                    <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-900">{d.experience_years}</p>
                            <p className="text-[11px] text-slate-400">Tahun Pengalaman</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-900">{d.total_reviews}</p>
                            <p className="text-[11px] text-slate-400">Ulasan</p>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-brand-50 rounded-xl">
                        <p className="text-xs text-slate-500">Biaya Konsultasi</p>
                        <p className="text-lg font-bold text-brand-600 mt-0.5">Rp {Number(d.consultation_fee).toLocaleString('id-ID')}</p>
                    </div>

                    <Link to="/appointments/create" className="block mt-4">
                        <Button variant="primary" size="md" className="w-full">
                            <CalendarDaysIcon className="w-4 h-4" />Buat Janji
                        </Button>
                    </Link>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    {d.bio && (
                        <Card className="p-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tentang</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{d.bio}</p>
                        </Card>
                    )}

                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Jadwal Praktek</p>
                        {schedules.length === 0 ? (
                            <p className="text-sm text-slate-400">Belum ada jadwal praktek.</p>
                        ) : (
                            <div className="space-y-1">
                                {schedules.map(s => (
                                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                            <span className="text-sm font-medium text-slate-700">{DAY_NAMES[s.day_of_week]}</span>
                                        </div>
                                        <span className="text-sm text-slate-500 font-mono">{s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {d.education?.length > 0 && (
                        <Card className="p-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Pendidikan</p>
                            <div className="space-y-2">
                                {d.education.map((e, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                                            <AcademicCapIcon className="w-3.5 h-3.5 text-violet-600" />
                                        </div>
                                        <p className="text-sm text-slate-700 mt-0.5">{e}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
