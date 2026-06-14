import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, ChevronDownIcon, ArrowRightOnRectangleIcon, UserCircleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../stores/authStore';
import useTheme from '../../stores/themeStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Topbar({ onMenu }) {
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const nav = useNavigate();
    const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
    const roleName = user?.roles?.[0]?.name ?? 'user';

    const [notifications, setNotifications] = React.useState([]);
    const [notifLoading, setNotifLoading] = React.useState(true);
    const notifCount = notifications.filter(n => !n.read).length;

    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const params = roleName === 'pasien'
            ? { date_from: today, status: 'confirmed', per_page: 5 }
            : { date: today, status: 'pending', per_page: 5 };

        axios.get('/api/appointments', { params })
            .then(res => {
                let read = [];
                try { read = JSON.parse(localStorage.getItem('read-notifications') || '[]'); } catch (_) {}
                const list = res.data.data.data.map(a => ({
                    id: a.id,
                    title: roleName === 'pasien'
                        ? `Janji temu dengan ${a.doctor?.user?.name ?? 'dokter'}`
                        : `Janji temu: ${a.patient?.name ?? 'Pasien'}`,
                    subtitle: `${a.appointment_date} · ${a.appointment_time?.slice(0,5)}`,
                    read: read.includes(a.id),
                }));
                setNotifications(list);
            })
            .catch(() => setNotifications([]))
            .finally(() => setNotifLoading(false));
    }, [roleName]);

    const markAsRead = (id) => {
        setNotifications(list => list.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            const read = JSON.parse(localStorage.getItem('read-notifications') || '[]');
            if (!read.includes(id)) {
                read.push(id);
                localStorage.setItem('read-notifications', JSON.stringify(read));
            }
        } catch (_) {}
    };

    const handleLogout = async () => {
        await logout();
        toast.success('Berhasil keluar');
        nav('/login');
    };

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center px-4 sm:px-6 gap-3 shrink-0 sticky top-0 z-10">
            <button onClick={onMenu} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors">
                <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Breadcrumb placeholder / title */}
            <div className="flex-1" />

            {/* Right */}
            <div className="flex items-center gap-1">
                {/* Theme toggle */}
                <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors">
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <Menu as="div" className="relative">
                    <Menu.Button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors">
                        <BellIcon className="w-5 h-5" />
                        {notifCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />}
                    </Menu.Button>

                    <Transition as={Fragment}
                        enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95 translate-y-1" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card-lg py-1 z-50 focus:outline-none max-h-96 overflow-y-auto">
                            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifikasi</p>
                                {notifCount > 0 && <span className="text-xs text-brand-600 font-medium">{notifCount} baru</span>}
                            </div>
                            {notifLoading ? (
                                <div className="px-3 py-6 text-center text-xs text-slate-400">Memuat…</div>
                            ) : notifications.length === 0 ? (
                                <div className="px-3 py-6 text-center text-xs text-slate-400">Tidak ada notifikasi baru</div>
                            ) : notifications.map(n => (
                                <Menu.Item key={n.id}>{({ active }) => (
                                    <button onClick={() => { markAsRead(n.id); nav('/appointments'); }}
                                        className={clsx('flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs border-b border-slate-50 dark:border-slate-800 last:border-0', active && 'bg-slate-50 dark:bg-slate-800', !n.read && 'bg-brand-50/40 dark:bg-brand-500/10')}>
                                        <span className={clsx('mt-1 w-1.5 h-1.5 rounded-full shrink-0', n.read ? 'bg-transparent' : 'bg-brand-500')} />
                                        <span className="flex flex-col items-start gap-0.5">
                                            <span className={clsx('font-semibold', n.read ? 'text-slate-500' : 'text-slate-700 dark:text-slate-100')}>{n.title}</span>
                                            <span className="text-slate-400">{n.subtitle}</span>
                                        </span>
                                    </button>
                                )}</Menu.Item>
                            ))}
                        </Menu.Items>
                    </Transition>
                </Menu>

                {/* User menu */}
                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                            {user?.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : initials}
                        </div>
                        <div className="hidden sm:block text-left leading-tight">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{roleName}</p>
                        </div>
                        <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    </Menu.Button>

                    <Transition as={Fragment}
                        enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95 translate-y-1" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card-lg py-1 z-50 focus:outline-none">
                            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                                <p className="text-xs text-slate-400">{user?.email}</p>
                            </div>
                            {[
                                { label: 'Profil Saya', Icon: UserCircleIcon, onClick: () => nav('/profile') },
                            ].map(({ label, Icon, onClick }) => (
                                <Menu.Item key={label}>{({ active }) => (
                                    <button onClick={onClick} className={clsx('flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200', active && 'bg-slate-50 dark:bg-slate-800')}>
                                        <Icon className="w-4 h-4 text-slate-400" />{label}
                                    </button>
                                )}</Menu.Item>
                            ))}
                            <div className="border-t border-slate-100 dark:border-slate-800 mt-1">
                                <Menu.Item>{({ active }) => (
                                    <button onClick={handleLogout} className={clsx('flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-600', active && 'bg-rose-50')}>
                                        <ArrowRightOnRectangleIcon className="w-4 h-4" />Keluar
                                    </button>
                                )}</Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
}
