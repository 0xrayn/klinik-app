import React from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDaysIcon, UsersIcon, ClockIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, Badge, Avatar } from '../../components/ui';
import GreetingBanner from './GreetingBanner';
import StatCard from './StatCard';
import useAuth from '../../stores/authStore';

const STATUS = {
    done:        { label:'Selesai',       v:'success' },
    in_progress: { label:'Berlangsung',   v:'warning' },
    confirmed:   { label:'Terkonfirmasi', v:'info' },
    pending:     { label:'Pending',       v:'neutral' },
    cancelled:   { label:'Dibatalkan',    v:'danger' },
};

const CustomTip = ({ active, payload, label }) =>
    active && payload?.length ? (
        <div className="card px-3 py-2 text-xs shadow-card-md">
            <p className="font-semibold text-slate-700 dark:text-slate-200">{label}</p>
            <p className="text-brand-600 font-medium">{payload[0].value} {payload[0].name === 'count' ? 'janji' : 'pasien'}</p>
        </div>
    ) : null;

export default function AdminDashboard({ stats, loading }) {
    const { user } = useAuth();

    const weekTrend  = stats?.weekly_trend ?? [];
    const monthTrend = (stats?.monthly_trend ?? []).map(m => ({ month: m.month, patients: m.patients }));
    const recent     = stats?.recent_appointments ?? [];

    return (
        <div className="space-y-6">
            <GreetingBanner user={user}
                subtitle="Berikut ringkasan aktivitas klinik Anda hari ini."
                ctaLabel="Janji Temu" ctaTo="/appointments/create" />

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={CalendarDaysIcon} label="Janji Hari Ini"  value={stats?.appointments_today ?? '-'}  bg="bg-brand-100"  iconColor="text-brand-600"  loading={loading} delay={0} />
                <StatCard icon={UsersIcon} label="Total Pasien" value={stats?.total_patients ?? '-'} bg="bg-violet-100" iconColor="text-violet-600" loading={loading} delay={60} />
                <StatCard icon={ClockIcon}        label="Menunggu"       value={stats?.appointments_waiting ?? '-'} bg="bg-amber-100"  iconColor="text-amber-600"  loading={loading} delay={120} />
                <StatCard icon={CheckCircleIcon}  label="Selesai Hari Ini" value={stats?.appointments_done ?? '-'} bg="bg-sky-100"    iconColor="text-sky-600"    loading={loading} delay={180} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <Card className="p-5 lg:col-span-3 animate-slide-up" style={{ animationDelay: '220ms' }}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Tren Janji Temu</p>
                                <p className="text-xs text-slate-400">7 hari terakhir</p>
                            </div>
                            <Badge variant="success" pulse>Live</Badge>
                        </div>
                        <ResponsiveContainer width="100%" height={170}>
                            <AreaChart data={weekTrend} margin={{ top:4, right:4, left:-24, bottom:0 }}>
                                <defs>
                                    <linearGradient id="gBrand" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTip />} cursor={{ stroke:'#e2e8f0', strokeWidth:1 }} />
                                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#gBrand)"
                                    dot={{ fill:'#2563eb', r:3.5, strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card className="p-5 lg:col-span-2 animate-slide-up" style={{ animationDelay: '280ms' }}>
                        <div className="mb-5">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Pasien Bulanan</p>
                            <p className="text-xs text-slate-400">6 bulan terakhir</p>
                        </div>
                        <ResponsiveContainer width="100%" height={170}>
                            <BarChart data={monthTrend} margin={{ top:4, right:4, left:-24, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTip />} cursor={{ fill:'#f8fafc' }} />
                                <Bar dataKey="patients" fill="#0ea5e9" radius={[5,5,0,0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

            {/* Today's appointments table */}
            <Card className="animate-slide-up" style={{ animationDelay: '340ms' }}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Antrian Hari Ini</p>
                        <p className="text-xs text-slate-400">{recent.length} janji terdaftar</p>
                    </div>
                    <Link to="/appointments" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 group">
                        Lihat semua <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                {['Pasien','Dokter','Poli','Jam','Status'].map(h => (
                                    <th key={h} className="tbl-head">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map(a => {
                                const s = STATUS[a.status] ?? STATUS.pending;
                                return (
                                    <tr key={a.id} className="tbl-row">
                                        <td className="tbl-cell">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={a.patient?.name} size="sm" />
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{a.patient?.name}</span>
                                            </div>
                                        </td>
                                        <td className="tbl-cell text-slate-500 text-xs">{a.doctor?.user?.name}</td>
                                        <td className="tbl-cell">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg font-medium">{a.doctor?.specialization}</span>
                                        </td>
                                        <td className="tbl-cell font-mono text-xs font-semibold dark:text-slate-200">{a.appointment_time?.slice(0,5)}</td>
                                        <td className="tbl-cell">
                                            <Badge variant={s.v}>{s.label}</Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!recent.length && !loading && (
                                <tr><td colSpan={5} className="tbl-cell text-center text-slate-400 py-8">Belum ada janji temu hari ini</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
