import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === '1');

    const toggleCollapsed = () => {
        setCollapsed(c => {
            localStorage.setItem('sidebar-collapsed', !c ? '1' : '0');
            return !c;
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar onMenu={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-5 lg:p-6 max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
