import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDaysIcon, UsersIcon, ClockIcon, CheckCircleIcon,
    ArrowUpIcon, ArrowDownIcon, PlusIcon,
} from '@heroicons/react/24/outline';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, Badge, Avatar, Skeleton } from '../../components/ui';
import useAuth from '../../stores/authStore';

/* ── mock data ── */
const weekTrend = [
    { day: 'Sen', n: 14 }, { day: 'Sel', n: 21 }, { day: 'Rab', n: 17 },
    { day: 'Kam', n: 26 }, { day: 'Jum', n: 19 }, { day: 'Sab', n: 9 }, { day: 'Min', n: 4 },
];
const monthTrend = [
    { m: 'Jan', n: 112 }, { m: 'Feb', n: 138 }, { m: 'Mar', n: 125 },
    { m: 'Apr', n: 163 }, { m: 'Mei', n: 179 }, { m: 'Jun', n: 154 },
];
const todayAppts = [
    { id:1, patient:'Ahmad Fauzi',   doctor:'dr. Siti Rahayu',  poli:'Umum',    time:'08:00', status:'done' },
    { id:2, patient:'Dewi Sartika',  doctor:'dr. Budi Prakoso', poli:'Gigi',    time:'08:30', status:'in_progress' },
    { id:3, patient:'Rudi Hermawan', doctor:'dr. Siti Rahayu',  poli:'Umum',    time:'09:00', status:'confirmed' },
    { id:4, patient:'Sari Indah',    doctor:'dr. Yuni Astuti',  poli:'Anak',    time:'09:30', status:'confirmed' },
    { id:5, patient:'Budi Santoso',  doctor:'dr. Budi Prakoso', poli:'Gigi',    time:'10:00', status:'pending' },
    { id:6, patient:'Rina Wulandari',doctor:'dr. Hendra Wijaya',poli:'Jantung', time:'10:30', status:'cancelled' },
];

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
            <p className="font-semibold text-slate-700">{label}</p>
            <p className="text-brand-600 font-medium">{payload[0].value} {payload[0].name === 'n' ? 'janji' : 'pasien'}</p>
        </div>
    ) : null;

function StatCard({ icon: Icon, label, value, change, bg, iconColor, loading }) {
    if (loading) return <Skeleton className="h-28 rounded-2xl" />;
    const up = change >= 0;
    return (
        <Card className="p-5 flex items-start gap-4">
            <div className={`stat-icon ${bg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 leading-none">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1.5 leading-none">{value}</p>
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${up ? 'text-brand-600' : 'text-rose-500'}`}>
                    {up ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                    {Math.abs(change)}% vs minggu lalu
                </div>
            </div>
        </Card>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const greet = () => {
        const h = new Date().getHours();
        if (h < 11) return 'Selamat pagi';
        if (h < 15) return 'Selamat siang';
        if (h < 18) return 'Selamat sore';
        return 'Selamat malam';
    };

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Greeting */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{greet()}, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                    </p>
                </div>
                <Link to="/appointments/create">
                    <button className="btn-primary btn-sm hidden sm:flex">
                        <PlusIcon className="w-4 h-4" /> Janji Temu
                    </button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={CalendarDaysIcon} label="Janji Hari Ini"  value="24"  change={12}  bg="bg-brand-100"  iconColor="text-brand-600"  loading={loading} />
                <StatCard icon={UsersIcon}        label="Total Pasien"   value="1.2k" change={5}   bg="bg-violet-100" iconColor="text-violet-600" loading={loading} />
                <StatCard icon={ClockIcon}        label="Menunggu"       value="8"    change={-3}  bg="bg-amber-100"  iconColor="text-amber-600"  loading={loading} />
                <StatCard icon={CheckCircleIcon}  label="Selesai Hari Ini" value="16" change={20}  bg="bg-sky-100"    iconColor="text-sky-600"    loading={loading} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <Card className="p-5 lg:col-span-3">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">Tren Janji Temu</p>
                            <p className="text-xs text-slate-400">7 hari terakhir</p>
                        </div>
                        <Badge variant="success" pulse>Live</Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={170}>
                        <AreaChart data={weekTrend} margin={{ top:4, right:4, left:-24, bottom:0 }}>
                            <defs>
                                <linearGradient id="gBrand" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#00ac81" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#00ac81" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTip />} cursor={{ stroke:'#e2e8f0', strokeWidth:1 }} />
                            <Area type="monotone" dataKey="n" stroke="#00ac81" strokeWidth={2} fill="url(#gBrand)"
                                dot={{ fill:'#00ac81', r:3.5, strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-5 lg:col-span-2">
                    <div className="mb-5">
                        <p className="font-semibold text-slate-800 text-sm">Pasien Bulanan</p>
                        <p className="text-xs text-slate-400">6 bulan terakhir</p>
                    </div>
                    <ResponsiveContainer width="100%" height={170}>
                        <BarChart data={monthTrend} margin={{ top:4, right:4, left:-24, bottom:0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="m" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTip />} cursor={{ fill:'#f8fafc' }} />
                            <Bar dataKey="n" fill="#8b5cf6" radius={[5,5,0,0]} maxBarSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Today's appointments table */}
            <Card>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">Antrian Hari Ini</p>
                        <p className="text-xs text-slate-400">{todayAppts.length} janji terdaftar</p>
                    </div>
                    <Link to="/appointments" className="text-xs font-semibold text-brand-600 hover:underline">Lihat semua →</Link>
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
                            {todayAppts.map(a => {
                                const s = STATUS[a.status];
                                return (
                                    <tr key={a.id} className="tbl-row">
                                        <td className="tbl-cell">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={a.patient} size="sm" />
                                                <span className="font-medium text-slate-800">{a.patient}</span>
                                            </div>
                                        </td>
                                        <td className="tbl-cell text-slate-500 text-xs">{a.doctor}</td>
                                        <td className="tbl-cell">
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">{a.poli}</span>
                                        </td>
                                        <td className="tbl-cell font-mono text-xs font-semibold">{a.time}</td>
                                        <td className="tbl-cell">
                                            <Badge variant={s.v}>{s.label}</Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
