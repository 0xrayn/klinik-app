import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, AcademicCapIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Card, Badge, Button } from '../../components/ui';

const DOC = {
    id:1, name:'dr. Siti Rahayu, Sp.PD', spec:'Penyakit Dalam', exp:12, rating:4.8, rev:234, patients:1240,
    fee:'Rp 150.000', available:true,
    bio:'Spesialis penyakit dalam dengan pengalaman lebih dari 12 tahun. Fokus pada penanganan diabetes, hipertensi, dan penyakit ginjal kronik.',
    education:['FK Universitas Airlangga (2005)', 'Sp.PD Universitas Indonesia (2012)', 'Fellowship Nefrologi RSCM (2015)'],
    schedule:[
        { day:'Senin',  time:'08:00 – 14:00' }, { day:'Selasa', time:'08:00 – 14:00' },
        { day:'Rabu',   time:'08:00 – 14:00' }, { day:'Kamis',  time:'08:00 – 14:00' },
        { day:'Jumat',  time:'08:00 – 12:00' },
    ],
    reviews:[
        { name:'Ahmad F.', rating:5, comment:'Dokternya ramah dan penjelasannya sangat jelas. Sangat puas!', date:'Des 2024' },
        { name:'Dewi S.',  rating:5, comment:'Antri tidak terlalu lama, penanganan cepat dan profesional.', date:'Nov 2024' },
        { name:'Rudi H.',  rating:4, comment:'Pelayanan baik, tempat bersih dan nyaman.',                  date:'Nov 2024' },
    ],
};

export default function DoctorDetail() {
    const { id } = useParams();
    const d = DOC;

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
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-white">{d.name.replace('dr. ','')[0]}</span>
                    </div>
                    <h2 className="font-bold text-slate-900 text-base leading-snug">{d.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">{d.spec}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 mb-3">
                        {[1,2,3,4,5].map(i => <StarSolid key={i} className={`w-3.5 h-3.5 ${i<=Math.round(d.rating)?'text-amber-400':'text-slate-200'}`} />)}
                        <span className="text-xs text-slate-500 ml-1">{d.rating} ({d.rev})</span>
                    </div>
                    <Badge variant={d.available ? 'success' : 'neutral'} pulse={d.available}>
                        {d.available ? 'Praktek Hari Ini' : 'Tidak Praktek'}
                    </Badge>

                    <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-900">{d.exp}</p>
                            <p className="text-[11px] text-slate-400">Tahun Pengalaman</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-900">{d.patients.toLocaleString()}</p>
                            <p className="text-[11px] text-slate-400">Total Pasien</p>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-brand-50 rounded-xl">
                        <p className="text-xs text-slate-500">Biaya Konsultasi</p>
                        <p className="text-lg font-bold text-brand-600 mt-0.5">{d.fee}</p>
                    </div>

                    {d.available && (
                        <Link to={`/appointments/create?doctor=${d.id}`} className="block mt-4">
                            <Button variant="primary" size="md" className="w-full">
                                <CalendarDaysIcon className="w-4 h-4" />Buat Janji
                            </Button>
                        </Link>
                    )}
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tentang</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{d.bio}</p>
                    </Card>

                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Jadwal Praktek</p>
                        <div className="space-y-1">
                            {d.schedule.map(s => (
                                <div key={s.day} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                        <span className="text-sm font-medium text-slate-700">{s.day}</span>
                                    </div>
                                    <span className="text-sm text-slate-500 font-mono">{s.time}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

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

                    <Card className="p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ulasan Pasien</p>
                        <div className="space-y-3">
                            {d.reviews.map((r, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-xs font-semibold text-slate-700">{r.name}</p>
                                        <div className="flex items-center gap-1">
                                            {[1,2,3,4,5].map(s => <StarSolid key={s} className={`w-3 h-3 ${s<=r.rating?'text-amber-400':'text-slate-200'}`} />)}
                                            <span className="text-[10px] text-slate-400 ml-1">{r.date}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
