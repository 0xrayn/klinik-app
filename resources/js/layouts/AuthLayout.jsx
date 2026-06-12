import React from 'react';
import { Outlet } from 'react-router-dom';

const features = [
    'Booking janji temu online real-time',
    'Rekam medis digital terstruktur',
    'Manajemen multi-dokter & jadwal',
    'Dashboard analytics & laporan',
    'Multi-role: Admin, Dokter, Pasien',
];

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-slate-900 flex-col justify-between p-10 relative overflow-hidden shrink-0">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />
                    <div className="absolute top-1/2 -right-20 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />
                    <div className="absolute -bottom-20 left-20 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl" />
                </div>

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <span className="text-white font-bold">Klinik Sehat</span>
                </div>

                {/* Content */}
                <div className="relative space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white leading-tight">
                            Sistem Manajemen<br />
                            <span className="text-brand-400">Klinik Modern</span>
                        </h1>
                        <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                            Platform lengkap untuk mengelola operasional klinik — dari booking, rekam medis, hingga laporan analitik.
                        </p>
                    </div>

                    <ul className="space-y-2.5">
                        {features.map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                                <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                </div>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} Klinik Sehat · Portfolio Project</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[400px]">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                        <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
                            <svg className="w-4.5 h-4.5 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="font-bold text-slate-900">Klinik Sehat</span>
                    </div>
                    <div className="card p-7 shadow-card-lg animate-slide-up">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
