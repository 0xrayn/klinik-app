import React from 'react';

export default function Splash() {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-5">
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-brand/40 shadow-lg">
                    <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-brand-600 animate-ping opacity-20" />
            </div>
            <div className="text-center">
                <p className="font-bold text-slate-900">Klinik Sehat</p>
                <p className="text-sm text-slate-400 mt-0.5">Memuat sistem...</p>
            </div>
        </div>
    );
}
