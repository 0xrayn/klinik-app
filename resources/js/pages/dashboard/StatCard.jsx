import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Card, Skeleton } from '../../components/ui';

export default function StatCard({ icon: Icon, label, value, change, bg, iconColor, loading, delay = 0 }) {
    if (loading) return <Skeleton className="h-28 rounded-2xl" />;
    const hasChange = change !== undefined && change !== null;
    const up = change >= 0;
    return (
        <Card className="stat-card p-5 flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
            <div className={`stat-icon ${bg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-none">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 leading-none font-display">{value}</p>
                {hasChange && (
                    <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${up ? 'text-brand-600' : 'text-rose-500'}`}>
                        {up ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                        {Math.abs(change)}% vs minggu lalu
                    </div>
                )}
            </div>
        </Card>
    );
}
