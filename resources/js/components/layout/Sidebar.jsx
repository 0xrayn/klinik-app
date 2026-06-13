import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon, CalendarDaysIcon, UserGroupIcon, UsersIcon,
    ClipboardDocumentListIcon, ClockIcon, ShieldCheckIcon, XMarkIcon, ArchiveBoxIcon,
    ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../../stores/authStore';
import clsx from 'clsx';

const NAV = [
    {
        group: 'Menu Utama',
        items: [
            { to: '/dashboard',    label: 'Dashboard',    Icon: HomeIcon,              roles: [] },
            { to: '/appointments', label: 'Janji Temu',   Icon: CalendarDaysIcon,      roles: ['admin','dokter','pasien'] },
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
            { to: '/admin/users',         label: 'Manajemen User', Icon: ShieldCheckIcon, roles: ['admin'] },
            { to: '/admin/activity-logs', label: 'Log Aktivitas',  Icon: ArchiveBoxIcon,  roles: ['admin'] },
        ],
    },
];

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
    const { hasAnyRole, user } = useAuth();
    const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

    return (
        <>
            {/* Overlay */}
            <div className={clsx('fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={onClose} />

            {/* Sidebar */}
            <aside className={clsx(
                'fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-250 ease-in-out',
                'lg:relative lg:translate-x-0',
                collapsed ? 'lg:w-[72px]' : 'lg:w-60',
                'w-60',
                open ? 'translate-x-0' : '-translate-x-full',
            )}>
                {/* Logo */}
                <div className={clsx('flex items-center h-14 px-4 border-b border-slate-100 shrink-0', collapsed ? 'lg:justify-center lg:px-0 justify-between' : 'justify-between')}>
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand/30 shadow-sm shrink-0">
                            <svg className="w-4.5 h-4.5 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className={clsx('leading-tight whitespace-nowrap', collapsed && 'lg:hidden')}>
                            <p className="text-sm font-bold text-slate-900">Klinik Sehat</p>
                            <p className="text-[10px] text-slate-400">Management System</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Collapse toggle */}
                <button onClick={onToggleCollapse}
                    className="hidden lg:flex items-center justify-center mx-auto mt-2 w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-colors">
                    {collapsed ? <ChevronRightIcon className="w-3.5 h-3.5" /> : <ChevronLeftIcon className="w-3.5 h-3.5" />}
                </button>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5 no-scrollbar">
                    {NAV.map(section => {
                        const visible = section.items.filter(i => i.roles.length === 0 || hasAnyRole(i.roles));
                        if (!visible.length) return null;
                        return (
                            <div key={section.group}>
                                <p className={clsx('nav-group-label transition-opacity', collapsed && 'lg:hidden')}>{section.group}</p>
                                <div className="space-y-0.5">
                                    {visible.map(({ to, label, Icon }) => (
                                        <NavLink key={to} to={to} onClick={onClose} title={collapsed ? label : undefined}
                                            className={({ isActive }) => clsx(isActive ? 'nav-link-active' : 'nav-link', collapsed && 'lg:justify-center')}>
                                            <Icon className="w-4.5 h-4.5 w-5 h-5 shrink-0" />
                                            <span className={clsx(collapsed && 'lg:hidden')}>{label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-3 border-t border-slate-100 shrink-0">
                    <div className={clsx('flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors', collapsed && 'lg:justify-center')}>
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {user?.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : initials}
                        </div>
                        <div className={clsx('flex-1 min-w-0 leading-tight', collapsed && 'lg:hidden')}>
                            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{user?.roles?.[0]?.name ?? 'user'}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
