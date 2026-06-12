// SchedulePage.jsx
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Card, Badge, SectionHeader } from '../../components/ui';
import clsx from 'clsx';

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAY_SHORT   = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

const SCHEDULES = {
    '2024-12-15':[
        { time:'08:00', doctor:'dr. Siti Rahayu',   poli:'Umum',    booked:5,  quota:10 },
        { time:'09:00', doctor:'dr. Budi Prakoso',  poli:'Gigi',    booked:8,  quota:8  },
        { time:'10:00', doctor:'dr. Yuni Astuti',   poli:'Anak',    booked:6,  quota:8  },
        { time:'13:00', doctor:'dr. Hendra Wijaya', poli:'Jantung', booked:2,  quota:6  },
    ],
    '2024-12-16':[
        { time:'08:00', doctor:'dr. Siti Rahayu',  poli:'Umum', booked:3, quota:10 },
        { time:'09:30', doctor:'dr. Maya Kusuma',  poli:'Mata', booked:5, quota:8  },
    ],
    '2024-12-17':[
        { time:'10:00', doctor:'dr. Budi Prakoso',  poli:'Gigi',    booked:2, quota:8 },
        { time:'14:00', doctor:'dr. Hendra Wijaya', poli:'Jantung', booked:1, quota:6 },
    ],
};

function capVariant(booked, quota) {
    const p = booked / quota;
    if (p >= 1)   return 'danger';
    if (p >= 0.7) return 'warning';
    return 'success';
}

export default function SchedulePage() {
    const today = new Date();
    const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [sel, setSel] = useState(today.toISOString().split('T')[0]);

    const y = cur.getFullYear(), m = cur.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cells = Array.from({ length: firstDay + days }, (_, i) => i < firstDay ? null : i - firstDay + 1);
    const toKey = d => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const todayKey = today.toISOString().split('T')[0];

    const schedule = SCHEDULES[sel] || [];

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Jadwal Dokter" subtitle="Ketersediaan dokter per tanggal" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Calendar */}
                <Card className="p-5">
                    {/* Nav */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCur(new Date(y, m-1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><ChevronLeftIcon className="w-4 h-4"/></button>
                        <p className="font-semibold text-slate-800 text-sm">{MONTH_NAMES[m]} {y}</p>
                        <button onClick={() => setCur(new Date(y, m+1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><ChevronRightIcon className="w-4 h-4"/></button>
                    </div>
                    {/* Days header */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAY_SHORT.map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>)}
                    </div>
                    {/* Cells */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {cells.map((day, i) => {
                            if (!day) return <div key={i} />;
                            const key = toKey(day);
                            const isToday = key === todayKey;
                            const isSel   = key === sel;
                            const hasSched = !!SCHEDULES[key];
                            return (
                                <button key={i} onClick={() => setSel(key)}
                                    className={clsx('relative aspect-square flex items-center justify-center text-xs rounded-xl font-medium transition-all duration-150',
                                        isSel   ? 'bg-brand-600 text-white shadow-sm' :
                                        isToday ? 'bg-brand-100 text-brand-700 font-bold' :
                                                  'hover:bg-slate-100 text-slate-700')}>
                                    {day}
                                    {hasSched && !isSel && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block"/>Ada jadwal</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-lg bg-brand-100 inline-block"/>Hari ini</span>
                    </div>
                </Card>

                {/* Slot list */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="px-5 py-3.5 border-b border-slate-100">
                            <p className="font-semibold text-slate-800 text-sm">
                                {new Date(sel + 'T00:00:00').toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{schedule.length} dokter bertugas</p>
                        </div>

                        {!schedule.length ? (
                            <div className="py-14 text-center text-slate-400">
                                <p className="font-medium">Tidak ada jadwal</p>
                                <p className="text-sm mt-1">Pilih tanggal lain</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {schedule.map((s, i) => {
                                    const v    = capVariant(s.booked, s.quota);
                                    const pct  = Math.round(s.booked / s.quota * 100);
                                    const label = v === 'danger' ? 'Penuh' : v === 'warning' ? 'Hampir Penuh' : 'Tersedia';
                                    return (
                                        <div key={i} className="px-5 py-4 flex items-center gap-4">
                                            <div className="w-12 text-center shrink-0">
                                                <span className="font-mono text-sm font-bold text-slate-800">{s.time}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-800 text-sm">{s.doctor}</p>
                                                <p className="text-xs text-slate-500">Poli {s.poli}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={clsx('h-full rounded-full transition-all', v==='danger'?'bg-rose-500':v==='warning'?'bg-amber-500':'bg-brand-500')}
                                                            style={{ width:`${pct}%` }} />
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 shrink-0">{s.booked}/{s.quota}</span>
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
