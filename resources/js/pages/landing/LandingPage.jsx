import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDaysIcon, ClipboardDocumentListIcon, UserGroupIcon, ChartBarIcon,
    ShieldCheckIcon, ClockIcon, ArrowRightIcon, SunIcon, MoonIcon, Bars3Icon, XMarkIcon,
} from '@heroicons/react/24/outline';
import useTheme from '../../stores/themeStore';
import useReveal from '../../hooks/useReveal';
import clsx from 'clsx';

/* ── Reveal wrapper ─────────────────────────────────────────────── */
function Reveal({ children, className, delay = 0 }) {
    const [ref, visible] = useReveal();
    return (
        <div ref={ref} className={clsx('reveal', visible && 'is-visible', className)}
            style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

/* ── Logo mark ──────────────────────────────────────────────────── */
function LogoMark({ className = 'w-9 h-9' }) {
    return (
        <div className={clsx(className, 'bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-brand shrink-0')}>
            <svg className="w-1/2 h-1/2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
    );
}

/* ── Animated ECG line ────────────────────────────────────────────
   Drawn once on mount via stroke-dashoffset animation (.ecg-path),
   then a glowing dot pulses at the end. */
function VitalsLine({ className }) {
    const d = "M0 60 L60 60 L78 60 L92 18 L108 102 L124 36 L140 60 L200 60 L218 60 L232 24 L248 96 L264 42 L280 60 L340 60 L356 60 L370 18 L386 102 L402 36 L418 60 L480 60";
    return (
        <svg viewBox="0 0 480 120" className={className} preserveAspectRatio="none" fill="none">
            {[20, 40, 60, 80, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
            ))}
            <path d={d} stroke="#bfdbfe" strokeOpacity="0.5" strokeWidth="2" />
            <path d={d} stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ecg-path" />
            <circle cx="480" cy="60" r="4" fill="#2563eb" className="ecg-dot" />
        </svg>
    );
}

/* ── Live clock for the monitor panel ─────────────────────────────── */
function useClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
}

/* ── Data ───────────────────────────────────────────────────────── */
const LOG_ENTRIES = [
    { id: 'MOD-01', Icon: CalendarDaysIcon,          title: 'Booking real-time',     desc: 'Pasien memilih dokter, tanggal, dan jam praktik yang masih kosong, slot terkunci begitu dipesan.' },
    { id: 'MOD-02', Icon: ClipboardDocumentListIcon, title: 'Rekam medis digital',    desc: 'Diagnosis, kode ICD-10, resep, dan tindakan tersimpan terstruktur per kunjungan.' },
    { id: 'MOD-03', Icon: UserGroupIcon,             title: 'Jadwal multi-dokter',    desc: 'Setiap dokter punya jadwal praktik, kuota harian, dan spesialisasi sendiri.' },
    { id: 'MOD-04', Icon: ChartBarIcon,              title: 'Dashboard analitik',     desc: 'Tren janji temu dan jumlah pasien per bulan terlihat dalam satu pandangan.' },
    { id: 'MOD-05', Icon: ShieldCheckIcon,           title: 'Akses berbasis peran',   desc: 'Admin, dokter, perawat, dan pasien masing-masing punya tampilan dan izin sendiri.' },
    { id: 'MOD-06', Icon: ClockIcon,                 title: 'Antrian otomatis',       desc: 'Nomor antrian dan ketersediaan slot dihitung otomatis dari jadwal dokter.' },
];

const TIMELINE = [
    { time: '08:02', title: 'Pasien mendaftar & memilih dokter', desc: 'Akun dibuat, poli dan dokter dipilih sesuai keluhan.' },
    { time: '08:05', title: 'Slot jadwal dipilih',               desc: 'Sistem menampilkan jam praktik yang masih tersedia hari itu.' },
    { time: '09:30', title: 'Konsultasi & rekam medis diisi',    desc: 'Dokter mencatat diagnosis, resep, dan tindakan langsung ke sistem.' },
    { time: '17:00', title: 'Admin memantau rekap harian',       desc: 'Seluruh aktivitas klinik terlihat dari satu dashboard terpusat.' },
];

const TICKER = [
    '08:02 - Janji temu baru: Penyakit Dalam',
    '08:14 - Rekam medis diperbarui',
    '08:30 - Jadwal dr. Anak ditambahkan',
    '09:05 - Pasien baru terdaftar',
    '09:41 - Antrian dr. Gigi & Mulut penuh',
    '10:12 - Laporan bulanan dibuat',
];

export default function LandingPage() {
    const { theme, toggle } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const clock = useClock();

    return (
        <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
            {/* ── Navbar ─────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <LogoMark className="w-9 h-9" />
                        <div className="leading-tight">
                            <span className="font-bold text-slate-900 dark:text-white font-serif text-lg">Klinik Sehat</span>
                            <p className="text-[10px] font-mono-data text-slate-400 tracking-wider -mt-0.5">SISTEM-001</p>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <a href="#modul" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Modul</a>
                        <a href="#alur" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Alur Kerja</a>
                        <a href="#kontak" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Kontak</a>
                    </nav>

                    <div className="flex items-center gap-2">
                        <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors">
                            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        </button>
                        <Link to="/login" className="hidden sm:inline-flex btn btn-ghost btn-sm">Masuk</Link>
                        <Link to="/register" className="hidden sm:inline-flex btn btn-primary btn-sm">
                            Daftar <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className={clsx('md:hidden overflow-hidden transition-all duration-300', mobileOpen ? 'max-h-64' : 'max-h-0')}>
                    <div className="px-4 pb-4 flex flex-col gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <a href="#modul" onClick={() => setMobileOpen(false)}>Modul</a>
                        <a href="#alur" onClick={() => setMobileOpen(false)}>Alur Kerja</a>
                        <a href="#kontak" onClick={() => setMobileOpen(false)}>Kontak</a>
                        <div className="flex gap-2 pt-2">
                            <Link to="/login" className="btn btn-outline btn-sm flex-1">Masuk</Link>
                            <Link to="/register" className="btn btn-primary btn-sm flex-1">Daftar</Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Hero ───────────────────────────────────────────── */}
            <section className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
                    {/* Copy */}
                    <div className="space-y-6">
                        <Reveal>
                            <div className="inline-flex items-center gap-2 font-mono-data text-xs text-brand-600 dark:text-brand-400">
                                <span className="w-2 h-2 rounded-full bg-brand-500 ecg-dot" />
                                SISTEM AKTIF &middot; v2.0
                            </div>
                        </Reveal>

                        <Reveal delay={80}>
                            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold font-serif leading-[1.12] tracking-tight">
                                Detak operasional<br />
                                klinik Anda, <span className="text-gradient-brand">terbaca jelas</span>
                            </h1>
                        </Reveal>

                        <Reveal delay={160}>
                            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                                Satu sistem untuk booking janji temu, rekam medis digital, jadwal multi-dokter,
                                dan laporan klinik, dibangun agar setiap peran (admin, dokter, perawat, pasien)
                                hanya melihat apa yang relevan bagi mereka.
                            </p>
                        </Reveal>

                        <Reveal delay={240} className="flex flex-wrap gap-3 pt-2">
                            <Link to="/register" className="btn btn-primary btn-md group">
                                Mulai Sekarang
                                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link to="/login" className="btn btn-outline btn-md">
                                Masuk ke Akun
                            </Link>
                        </Reveal>
                    </div>

                    {/* Vitals monitor panel */}
                    <Reveal delay={120}>
                        <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card-lg overflow-hidden bg-slate-950">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                                </div>
                                <p className="font-mono-data text-[11px] text-slate-400">
                                    {clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                            </div>

                            {/* ECG */}
                            <div className="px-5 pt-5">
                                <p className="font-mono-data text-[11px] text-brand-400 mb-1">JANJI TEMU HARI INI</p>
                                <VitalsLine className="w-full h-24 text-white" />
                            </div>

                            {/* Stat readouts */}
                            <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
                                {[
                                    { label: 'ANTRIAN', value: '12' },
                                    { label: 'DOKTER AKTIF', value: '05' },
                                    { label: 'POLI', value: '05' },
                                ].map((s, i) => (
                                    <div key={s.label} className="px-5 py-4" style={{ animation: `countUp 0.5s ${0.4 + i * 0.12}s ease-out backwards` }}>
                                        <p className="font-mono-data text-[10px] text-slate-500 tracking-wider">{s.label}</p>
                                        <p className="text-2xl font-semibold text-white font-serif mt-1">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer strip */}
                            <div className="px-5 py-3 bg-white/[0.03] border-t border-white/10 flex items-center justify-between">
                                <p className="font-mono-data text-[10px] text-slate-500">REC: {new Date().toISOString().split('T')[0]}</p>
                                <p className="font-mono-data text-[10px] text-brand-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 ecg-dot" /> Live
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Activity ticker ──────────────────────────────────── */}
            <section className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 py-3 overflow-hidden">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...TICKER, ...TICKER].map((t, i) => (
                        <span key={i} className="font-mono-data text-xs text-slate-400 dark:text-slate-500 px-8">{t}</span>
                    ))}
                </div>
            </section>

            {/* ── Modules (chart-log style) ─────────────────────────── */}
            <section id="modul" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
                <Reveal className="mb-12">
                    <p className="font-mono-data text-xs text-brand-600 dark:text-brand-400 mb-2">LOG MODUL SISTEM</p>
                    <h2 className="text-3xl sm:text-4xl font-semibold font-serif tracking-tight">
                        Enam modul, satu sistem
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl">
                        Setiap modul tercatat seperti entri rekam medis, ringkas, terstruktur, dan mudah ditelusuri.
                    </p>
                </Reveal>

                <div className="chart-paper rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {LOG_ENTRIES.map((f, i) => (
                        <Reveal key={f.id} delay={i * 60}>
                            <div className={clsx(
                                'group flex items-start sm:items-center gap-4 sm:gap-6 px-5 sm:px-7 py-5 transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-500/5',
                                i !== LOG_ENTRIES.length - 1 && 'border-b border-slate-200 dark:border-slate-800',
                            )}>
                                <span className="font-mono-data text-xs text-slate-400 dark:text-slate-500 w-16 shrink-0 pt-1 sm:pt-0">{f.id}</span>
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand shrink-0">
                                    <f.Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white font-serif">{f.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── How it works (admission timeline) ────────────────── */}
            <section id="alur" className="bg-slate-50 dark:bg-slate-900/40 py-20 lg:py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <Reveal className="mb-14">
                        <p className="font-mono-data text-xs text-brand-600 dark:text-brand-400 mb-2">ALUR KUNJUNGAN</p>
                        <h2 className="text-3xl sm:text-4xl font-semibold font-serif tracking-tight">
                            Dari pendaftaran sampai rekap harian
                        </h2>
                    </Reveal>

                    <div className="relative">
                        <div className="absolute left-[3.2rem] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                        <div className="space-y-8">
                            {TIMELINE.map((s, i) => (
                                <Reveal key={s.time} delay={i * 90}>
                                    <div className="flex items-start gap-4 sm:gap-6">
                                        <div className="w-[3.2rem] shrink-0 text-right">
                                            <span className="font-mono-data text-xs sm:text-sm text-brand-600 dark:text-brand-400 font-semibold">{s.time}</span>
                                        </div>
                                        <div className="relative shrink-0 hidden sm:block">
                                            <div className="w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white dark:ring-slate-900 mt-1.5" />
                                        </div>
                                        <div className="card p-5 flex-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white font-serif">{s.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA with record mockup ────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
                <Reveal>
                    <div className="grid lg:grid-cols-2 gap-8 items-center rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Image side */}
                        <div className="relative h-64 lg:h-full min-h-[320px]">
                            <img
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=900&fit=crop&q=80"
                                alt="Dokter memeriksa pasien di ruang praktik"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent lg:bg-gradient-to-r" />
                        </div>

                        {/* Copy side */}
                        <div className="px-6 sm:px-10 py-12 lg:py-0">
                            <p className="font-mono-data text-xs text-brand-600 dark:text-brand-400 mb-3">MULAI HARI INI</p>
                            <h2 className="text-3xl sm:text-4xl font-semibold font-serif tracking-tight">
                                Buat akun, dan klinik Anda mulai tercatat
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                                Pasien bisa langsung memesan janji temu. Dokter dan perawat mendapat akses
                                setelah disetujui admin, agar data klinik tetap terjaga.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-7">
                                <Link to="/register" className="btn btn-primary btn-md">
                                    Daftar Gratis <ArrowRightIcon className="w-4 h-4" />
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-md">
                                    Masuk
                                </Link>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ── Footer ────────────────────────────────────────────── */}
            <footer id="kontak" className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2.5 mb-3">
                            <LogoMark className="w-8 h-8" />
                            <span className="font-bold text-slate-900 dark:text-white font-serif text-lg">Klinik Sehat</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Sistem manajemen klinik untuk booking, rekam medis, dan operasional harian.
                        </p>
                    </div>

                    <div>
                        <p className="font-mono-data text-xs font-semibold text-slate-900 dark:text-white mb-3 tracking-wider">PRODUK</p>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#modul" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Modul</a></li>
                            <li><a href="#alur" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Alur Kerja</a></li>
                            <li><Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Masuk</Link></li>
                            <li><Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Daftar</Link></li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-mono-data text-xs font-semibold text-slate-900 dark:text-white mb-3 tracking-wider">PERAN PENGGUNA</p>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li>Admin Klinik</li>
                            <li>Dokter</li>
                            <li>Perawat</li>
                            <li>Pasien</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-mono-data text-xs font-semibold text-slate-900 dark:text-white mb-3 tracking-wider">KONTAK</p>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li>Jl. Sehat Sentosa No. 1, Jakarta</li>
                            <li>halo@klinikSehat.id</li>
                            <li>(021) 555-0123</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-mono-data">
                        <p>© {new Date().getFullYear()} Klinik Sehat &middot; Portfolio Project, bukan layanan medis sungguhan</p>
                        <div className="flex gap-4">
                            <span>Kebijakan Privasi</span>
                            <span>Syarat &amp; Ketentuan</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
