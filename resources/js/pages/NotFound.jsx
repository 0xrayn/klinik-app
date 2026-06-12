import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 bg-brand-100 rounded-3xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </div>
            <p className="text-7xl font-bold text-slate-900 mb-3">404</p>
            <p className="text-xl font-semibold text-slate-700 mb-2">Halaman tidak ditemukan</p>
            <p className="text-slate-400 mb-8 max-w-sm text-sm">
                Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            </p>
            <Link to="/dashboard" className="btn-primary btn-md">
                Kembali ke Dashboard
            </Link>
        </div>
    );
}
