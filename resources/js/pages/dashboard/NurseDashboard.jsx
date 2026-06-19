import React from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDaysIcon, ClockIcon, UsersIcon, ClipboardDocumentCheckIcon,
    CheckCircleIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Avatar, EmptyState } from '../../components/ui';
import GreetingBanner from './GreetingBanner';
import StatCard from './StatCard';
import useAuth from '../../stores/authStore';

const STATUS = {
    pending:     { label:'Pending',        v:'neutral' },
    confirmed:   { label:'Terkonfirmasi',  v:'info' },
    in_progress: { label:'Berlangsung',    v:'warning' },
    done:        { label:'Selesai',        v:'success' },
    cancelled:   { label:'Dibatalkan',     v:'danger' },
};

export default function NurseDashboard({ stats, loading }) {
    const { user } = useAuth();
    const recent = stats?.recent_appointments ?? [];
    const instructions = stats?.pending_instructions ?? [];

    return (
        <div className="space-y-6">
            <GreetingBanner user={user}
                subtitle="Berikut instruksi perawatan dan antrian pasien hari ini." />

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={ClipboardDocumentCheckIcon} label="Instruksi Menunggu" value={stats?.instructions_pending ?? '-'} bg="bg-violet-100" iconColor="text-violet-600" loading={loading} delay={0} />
                <StatCard icon={CheckCircleIcon}  label="Instruksi Selesai Hari Ini" value={stats?.instructions_done_today ?? '-'} bg="bg-brand-100" iconColor="text-brand-600" loading={loading} delay={60} />
                <StatCard icon={CalendarDaysIcon} label="Janji Hari Ini"   value={stats?.appointments_today ?? '-'} bg="bg-sky-100"  iconColor="text-sky-600"  loading={loading} delay={120} />
                <StatCard icon={UsersIcon}        label="Total Pasien"    value={stats?.total_patients ?? '-'} bg="bg-amber-100" iconColor="text-amber-600" loading={loading} delay={180} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Care instructions worklist - the core nurse task */}
                <Card className="animate-slide-up" style={{ animationDelay: '220ms' }}>
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Instruksi dari Dokter</p>
                            <p className="text-xs text-slate-400">{instructions.length} menunggu dilaksanakan</p>
                        </div>
                        <Link to="/care-instructions" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 group">
                            Lihat semua <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                        </Link>
                    </div>
                    {!loading && !instructions.length ? (
                        <EmptyState icon={ClipboardDocumentCheckIcon} title="Tidak ada instruksi" desc="Belum ada instruksi perawatan dari dokter" />
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {instructions.map(ins => (
                                <div key={ins.id} className="px-5 py-3.5 flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <ClipboardDocumentCheckIcon className="w-5 h-5 text-violet-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{ins.instruction}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{ins.patient?.name} - dr. {ins.doctor?.user?.name}</p>
                                    </div>
                                    <Badge variant={ins.status === 'in_progress' ? 'warning' : 'neutral'}>
                                        {ins.status === 'in_progress' ? 'Diproses' : 'Baru'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Today's appointment queue (read-only context) */}
                <Card className="animate-slide-up" style={{ animationDelay: '280ms' }}>
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Antrian Hari Ini</p>
                            <p className="text-xs text-slate-400">{recent.length} pasien terdaftar</p>
                        </div>
                        <Link to="/appointments" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 group">
                            Lihat semua <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                        </Link>
                    </div>
                    {!loading && !recent.length ? (
                        <EmptyState icon={CalendarDaysIcon} title="Belum ada antrian" desc="Tidak ada janji temu hari ini" />
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recent.map(a => {
                                const s = STATUS[a.status] ?? STATUS.pending;
                                return (
                                    <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                                        <Avatar name={a.patient?.name} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{a.patient?.name}</p>
                                            <p className="text-xs text-slate-400">{a.doctor?.user?.name} - pukul {a.appointment_time?.slice(0,5)}</p>
                                        </div>
                                        <Badge variant={s.v}>{s.label}</Badge>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/patients" className="card-hover p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                        <UsersIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Data Pasien</p>
                        <p className="text-xs text-slate-400">Catat vital, alergi, dan riwayat klinis</p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                </Link>
                <Link to="/care-instructions" className="card-hover p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center shrink-0">
                        <ClipboardDocumentCheckIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Instruksi Perawatan</p>
                        <p className="text-xs text-slate-400">Lihat dan laksanakan instruksi dokter</p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                </Link>
            </div>
        </div>
    );
}
