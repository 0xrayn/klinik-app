import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

export function greet() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
}

export function displayName(name) {
    const parts = name?.split(' ') ?? [];
    const first = parts[0]?.replace(/\.$/, '').toLowerCase();
    if (['dr', 'drg'].includes(first) && parts[1]) {
        return `${parts[0]} ${parts[1]}`;
    }
    return parts[0] || '';
}

export default function GreetingBanner({ user, subtitle, ctaLabel, ctaTo }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-sky-600 p-6 sm:p-7 shadow-brand animate-slide-up">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/10 blur-3xl animate-blob" />
            <div className="absolute -bottom-20 left-1/3 w-48 h-48 rounded-full bg-sky-300/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

            <div className="relative flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-xs font-semibold text-brand-100 uppercase tracking-widest mb-1">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                        {greet()}, {displayName(user?.name)} <span className="inline-block animate-float">👋</span>
                    </h1>
                    <p className="text-sm text-brand-100 mt-1.5 max-w-md">
                        {subtitle}
                    </p>
                </div>
                {ctaLabel && ctaTo && (
                    <Link to={ctaTo}>
                        <button className="btn bg-white text-brand-700 hover:bg-brand-50 btn-sm shadow-md font-semibold">
                            <PlusIcon className="w-4 h-4" /> {ctaLabel}
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}
