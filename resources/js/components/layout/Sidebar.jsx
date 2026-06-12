import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon, CalendarDaysIcon, UserGroupIcon, UsersIcon,
    ClipboardDocumentListIcon, ClockIcon, ShieldCheckIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../../stores/authStore';
import clsx from 'clsx';

const NAV = [
    {
        group: 'Menu Utama',
        items: [
            { to: '/dashboard',    label: 'Dashboard',    Icon: HomeIcon,              roles: [] },
            { to: '/appointments', label: 'Janji Temu',   Icon: CalendarDaysIcon,      roles: [] },
            { to: '/schedules',    label: 'Jadwal Dokter',Icon: ClockIcon,             roles: [] },
        ],
    },
    {
        group: 'Data Klinik',
        items: [
            { to: '/doctors',         label: 'Dokter',       Icon: UserGroupIcon,         roles: [] },
            { to: '/patients',        label: 'Pasien',        Icon: UsersIcon,             roles: ['admin','dokter','perawat'] },
            { to: '/medical-records', label: 'Rekam Medis',  Icon: ClipboardDocumentListIcon, roles: ['admin','dokter','perawat'] },
        ],
    },
    {
        group: 'Administrasi',
        items: [
            { to: '/admin/users', label: 'Manajemen User', Icon: ShieldCheckIcon, roles: ['admin'] },
        ],
    },
];

export default function Sidebar({ open, onClose }) {
    const { hasAnyRole, user, logout } = useAuth();
    const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

    return (
        <>
            {/* Overlay */}
            <div className={clsx('fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={onClose} />

            {/* Sidebar */}
            <aside className={clsx(
                'fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-250 ease-in-out',
                'lg:relative lg:translate-x-0',
                open ? 'translate-x-0' : '-translate-x-full',
            )}>
                {/* Logo */}
                <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand/30 shadow-sm">
                            <svg className="w-4.5 h-4.5 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="leading-tight">
                            <p className="text-sm font-bold text-slate-900">Klinik Sehat</p>
                            <p className="text-[10px] text-slate-400">Management System</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5 no-scrollbar">
                    {NAV.map(section => {
                        const visible = section.items.filter(i => i.roles.length === 0 || hasAnyRole(i.roles));
                        if (!visible.length) return null;
                        return (
                            <div key={section.group}>
                                <p className="nav-group-label">{section.group}</p>
                                <div className="space-y-0.5">
                                    {visible.map(({ to, label, Icon }) => (
                                        <NavLink key={to} to={to} onClick={onClose}
                                            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
                                            <Icon className="w-4.5 h-4.5 w-5 h-5 shrink-0" />
                                            <span>{label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-3 border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">{initials}</div>
                        <div className="flex-1 min-w-0 leading-tight">
                            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{user?.roles?.[0]?.name ?? 'user'}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
