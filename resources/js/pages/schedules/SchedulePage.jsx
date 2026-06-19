import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Card, Badge, SectionHeader } from '../../components/ui';
import useAuth from '../../stores/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAY_SHORT   = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function capVariant(booked, quota) {
    const p = booked / quota;
    if (p >= 1)   return 'danger';
    if (p >= 0.7) return 'warning';
    return 'success';
}

function fmtTime(t) {
    return t ? t.slice(0, 5) : '';
}

export default function SchedulePage() {
    const { user, hasRole } = useAuth();
    const isDoctor = hasRole('dokter') && !hasRole('admin');
    const myDoctorId = user?.doctor?.id;

    const today = new Date();
    const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [sel, setSel] = useState(today.toISOString().split('T')[0]);
    const [schedules, setSchedules] = useState([]);
    const [occupancy, setOccupancy] = useState({});
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(isDoctor ? 'mine' : 'all');

    useEffect(() => {
        axios.get('/api/schedules')
            .then(res => setSchedules(res.data.data))
            .catch(() => toast.error('Gagal memuat jadwal dokter'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        axios.get('/api/schedules/occupancy', { params: { date: sel } })
            .then(res => setOccupancy(res.data.data))
            .catch(() => setOccupancy({}));
    }, [sel]);

    const y = cur.getFullYear(), m = cur.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cells = Array.from({ length: firstDay + days }, (_, i) => i < firstDay ? null : i - firstDay + 1);
    const toKey = d => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const todayKey = today.toISOString().split('T')[0];

    const selDate = new Date(sel + 'T00:00:00');
    const allTodaySchedules = schedules.filter(s => s.day_of_week === selDate.getDay());
    const schedule = tab === 'mine' && isDoctor
        ? allTodaySchedules.filter(s => s.doctor_id === myDoctorId)
        : allTodaySchedules;

    const dayHasSchedule = (date) => {
        const list = schedules.filter(s => s.day_of_week === date.getDay());
        if (tab === 'mine' && isDoctor) return list.some(s => s.doctor_id === myDoctorId);
        return list.length > 0;
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Jadwal Dokter" subtitle="Jadwal praktik dokter berdasarkan hari" />

            {isDoctor && (
                <div className="tab-bar w-fit">
                    <button onClick={() => setTab('mine')} className={tab === 'mine' ? 'tab-active' : 'tab-item'}>
                        Jadwal Saya
                    </button>
                    <button onClick={() => setTab('all')} className={tab === 'all' ? 'tab-active' : 'tab-item'}>
                        Semua Dokter
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Calendar */}
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCur(new Date(y, m-1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"><ChevronLeftIcon className="w-4 h-4"/></button>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{MONTH_NAMES[m]} {y}</p>
                        <button onClick={() => setCur(new Date(y, m+1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"><ChevronRightIcon className="w-4 h-4"/></button>
                    </div>
                    <div className="grid grid-cols-7 mb-1">
                        {DAY_SHORT.map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                        {cells.map((day, i) => {
                            if (!day) return <div key={i} />;
                            const key = toKey(day);
                            const date = new Date(y, m, day);
                            const isToday = key === todayKey;
                            const isSel   = key === sel;
                            const hasSched = dayHasSchedule(date);
                            return (
                                <button key={i} onClick={() => setSel(key)}
                                    className={clsx('relative aspect-square flex items-center justify-center text-xs rounded-xl font-medium transition-all duration-150',
                                        isSel   ? 'bg-brand-600 text-white shadow-sm' :
                                        isToday ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold' :
                                                  'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300')}>
                                    {day}
                                    {hasSched && !isSel && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block"/>Ada jadwal</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-lg bg-brand-100 dark:bg-brand-500/20 inline-block"/>Hari ini</span>
                    </div>
                </Card>

                {/* Slot list */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                                {selDate.toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {loading ? 'Memuat...' : tab === 'mine' && isDoctor
                                    ? (schedule.length ? 'Anda bertugas hari ini' : 'Anda tidak bertugas hari ini')
                                    : `${schedule.length} dokter bertugas`}
                            </p>
                        </div>

                        {!loading && !schedule.length ? (
                            <div className="py-14 text-center text-slate-400">
                                <p className="font-medium">Tidak ada jadwal</p>
                                <p className="text-sm mt-1">Pilih tanggal lain{tab === 'mine' ? ' atau lihat tab Semua Dokter' : ''}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {schedule.map((s) => {
                                    const b = occupancy[s.id] ?? 0;
                                    const v = capVariant(b, s.quota);
                                    const pct = Math.min(100, Math.round(b / s.quota * 100));
                                    const label = v === 'danger' ? 'Penuh' : v === 'warning' ? 'Hampir Penuh' : 'Tersedia';
                                    const isMine = s.doctor_id === myDoctorId;
                                    return (
                                        <div key={s.id} className={clsx('px-5 py-4 flex items-center gap-4', isMine && tab === 'all' && 'bg-brand-50/40 dark:bg-brand-500/5')}>
                                            <div className="w-24 text-center shrink-0">
                                                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">{fmtTime(s.start_time)}-{fmtTime(s.end_time)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                                                    {s.doctor?.user?.name}
                                                    {isMine && <Badge variant="info">Anda</Badge>}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Poli {s.doctor?.specialization}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={clsx('h-full rounded-full transition-all', v==='danger'?'bg-rose-500':v==='warning'?'bg-amber-500':'bg-brand-500')}
                                                            style={{ width:`${pct}%` }} />
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 shrink-0">{b}/{s.quota}</span>
                                                </div>
                                            </div>
                                            <Badge variant={v}>{label}</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
