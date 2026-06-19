import React from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDaysIcon, ClipboardDocumentListIcon, CheckCircleIcon,
    UserGroupIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, EmptyState } from '../../components/ui';
import GreetingBanner from './GreetingBanner';
import StatCard from './StatCard';
import useAuth from '../../stores/authStore';

export default function PatientDashboard({ stats, loading }) {
    const { user } = useAuth();
    const upcoming = stats?.upcoming_appointments ?? [];
    const history  = stats?.recent_history ?? [];

    return (
        <div className="space-y-6">
            <GreetingBanner user={user}
                subtitle="Kelola janji temu dan pantau riwayat kesehatan Anda di sini."
                ctaLabel="Buat Janji Temu" ctaTo="/appointments/create" />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard icon={CalendarDaysIcon} label="Janji Mendatang" value={upcoming.length} bg="bg-brand-100" iconColor="text-brand-600" loading={loading} delay={0} />
                <StatCard icon={CheckCircleIcon}  label="Total Kunjungan" value={stats?.total_visits ?? 0} bg="bg-sky-100" iconColor="text-sky-600" loading={loading} delay={60} />
                <StatCard icon={ClipboardDocumentListIcon} label="Rekam Medis" value={stats?.medical_records_count ?? 0} bg="bg-violet-100" iconColor="text-violet-600" loading={loading} delay={120} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Upcoming appointments */}
                <Card className="animate-slide-up" style={{ animationDelay: '180ms' }}>
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Janji Temu Mendatang</p>
                            <p className="text-xs text-slate-400">{upcoming.length} terjadwal</p>
                        </div>
                        <Link to="/appointments" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 group">
                            Lihat semua <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                        </Link>
                    </div>
                    {!loading && !upcoming.length ? (
                        <EmptyState icon={CalendarDaysIcon} title="Belum ada janji temu" desc="Buat janji temu baru dengan dokter pilihan Anda" />
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {upcoming.map(a => (
                                <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase">
                                            {new Date(`${a.appointment_date}T00:00:00`).toLocaleDateString('id-ID', { month: 'short' })}
                                        </span>
                                        <span className="text-sm font-extrabold text-brand-700 dark:text-brand-300 font-display leading-none">
                                            {new Date(`${a.appointment_date}T00:00:00`).getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{a.doctor?.user?.name}</p>
                                        <p className="text-xs text-slate-400">{a.doctor?.specialization} - pukul {a.appointment_time?.slice(0,5)}</p>
                                    </div>
                                    <Badge variant={a.status === 'confirmed' ? 'info' : 'neutral'}>
                                        {a.status === 'confirmed' ? 'Terkonfirmasi' : 'Menunggu'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Recent history */}
                <Card className="animate-slide-up" style={{ animationDelay: '240ms' }}>
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Riwayat Kunjungan</p>
                            <p className="text-xs text-slate-400">{history.length} kunjungan terakhir</p>
                        </div>
                    </div>
                    {!loading && !history.length ? (
                        <EmptyState icon={ClipboardDocumentListIcon} title="Belum ada riwayat" desc="Riwayat kunjungan Anda akan tampil di sini" />
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {history.map(a => (
                                <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <CheckCircleIcon className="w-5 h-5 text-brand-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{a.doctor?.user?.name}</p>
                                        <p className="text-xs text-slate-400">{a.appointment_date} - {a.doctor?.specialization}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/doctors" className="card-hover p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-brand-100 dark:bg-brand-500/15 flex items-center justify-center shrink-0">
                        <UserGroupIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Cari Dokter</p>
                        <p className="text-xs text-slate-400">Lihat profil dan jadwal dokter</p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                </Link>
                <Link to="/schedules" className="card-hover p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                        <CalendarDaysIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Jadwal Dokter</p>
                        <p className="text-xs text-slate-400">Cek ketersediaan jadwal praktik</p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                </Link>
            </div>
        </div>
    );
}
