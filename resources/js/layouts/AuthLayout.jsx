import React from 'react';
import { Outlet } from 'react-router-dom';
import {
    CalendarDaysIcon, ClipboardDocumentListIcon, UserGroupIcon,
    ChartBarIcon, ShieldCheckIcon, SunIcon, MoonIcon,
} from '@heroicons/react/24/outline';
import useTheme from '../stores/themeStore';
import clsx from 'clsx';

const FEATURES = [
    { Icon: CalendarDaysIcon,          title: 'Booking janji temu online real-time',  desc: 'Pasien pilih dokter dan jam praktik yang masih kosong tanpa antre telepon.' },
    { Icon: ClipboardDocumentListIcon, title: 'Rekam medis digital terstruktur',      desc: 'Diagnosis, resep, dan riwayat tindakan tersimpan rapi per pasien.' },
    { Icon: UserGroupIcon,             title: 'Manajemen multi-dokter & jadwal',      desc: 'Atur jadwal praktik, kuota, dan spesialisasi setiap dokter.' },
    { Icon: ChartBarIcon,              title: 'Dashboard analytics & laporan',        desc: 'Pantau tren janji temu dan performa klinik secara visual.' },
    { Icon: ShieldCheckIcon,           title: 'Multi-role: Admin, Dokter, Pasien',    desc: 'Hak akses terpisah untuk setiap peran, lengkap dengan log aktivitas.' },
];

function FeatureShowcase() {
    const [active, setActive] = React.useState(0);

    React.useEffect(() => {
        const id = setInterval(() => setActive(a => (a + 1) % FEATURES.length), 3200);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative space-y-5">
            {/* Active feature card */}
            <div className="relative h-[104px] sm:h-[96px]">
                {FEATURES.map((f, i) => (
                    <div key={f.title}
                        className={clsx(
                            'absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex items-start gap-3.5 transition-all duration-500',
                            i === active ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none',
                        )}>
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 shadow-brand">
                            <f.Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white leading-snug">{f.title}</p>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
                {FEATURES.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                        className={clsx('h-1.5 rounded-full transition-all duration-300', i === active ? 'w-6 bg-brand-400' : 'w-1.5 bg-white/20 hover:bg-white/30')}
                        aria-label={`Fitur ${i + 1}`} />
                ))}
            </div>
        </div>
    );
}

export default function AuthLayout() {
    const { theme, toggle } = useTheme();

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-slate-950 flex-col justify-between p-10 relative overflow-hidden shrink-0">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-grid opacity-40" />
                    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl animate-blob" />
                    <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl animate-blob" style={{ animationDelay: '5s' }} />
                    <div className="absolute -bottom-24 left-20 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl animate-blob" style={{ animationDelay: '9s' }} />
                </div>

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-brand">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <span className="text-white font-bold font-display tracking-tight">Klinik Sehat</span>
                </div>

                {/* Content */}
                <div className="relative space-y-7">
                    <div className="animate-slide-up">
                        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white leading-[1.15] tracking-tight">
                            Sistem Manajemen<br />
                            <span className="text-gradient-brand">Klinik Modern</span>
                        </h1>
                        <p className="text-slate-400 mt-3 text-sm leading-relaxed max-w-sm">
                            Platform lengkap untuk mengelola operasional klinik, dari booking, rekam medis, hingga laporan analitik.
                        </p>
                    </div>

                    <FeatureShowcase />
                </div>

                <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} Klinik Sehat &middot; Portfolio Project</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none lg:hidden" />
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-400/10 dark:bg-brand-500/5 blur-3xl pointer-events-none" />

                {/* Theme toggle */}
                <button onClick={toggle}
                    className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 shadow-card hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {theme === 'dark' ? <SunIcon className="w-4.5 h-4.5 w-5 h-5" /> : <MoonIcon className="w-4.5 h-4.5 w-5 h-5" />}
                </button>

                <div className="relative w-full max-w-[400px]">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                        <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-brand">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white font-display">Klinik Sehat</span>
                    </div>
                    <div className="card p-7 shadow-card-lg animate-slide-up">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
