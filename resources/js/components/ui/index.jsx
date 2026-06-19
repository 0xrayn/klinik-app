import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

/* ─── Button ───────────────────────────────────────────────────── */
export function Button({ children, variant = 'primary', size = 'md', loading, className, ...p }) {
    const v = { primary:'btn-primary', secondary:'btn-secondary', outline:'btn-outline', ghost:'btn-ghost', danger:'btn-danger', 'brand-soft':'btn-brand-soft' };
    const s = { xs:'btn-xs', sm:'btn-sm', md:'btn-md', lg:'btn-lg' };
    return (
        <button className={clsx(v[variant], s[size], className)} disabled={loading || p.disabled} {...p}>
            {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memuat...</>
                : children}
        </button>
    );
}

/* ─── Input ────────────────────────────────────────────────────── */
export const Input = React.forwardRef(({ label, error, hint, icon: Icon, className, ...p }, ref) => (
    <div>
        {label && <label className="field-label">{label}</label>}
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
            <input ref={ref} className={clsx('input', Icon && 'input-icon', error && 'input-error', className)} {...p} />
        </div>
        {error && <p className="field-error"><ExclamationTriangleIcon className="w-3 h-3"/>{error}</p>}
        {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
));
Input.displayName = 'Input';

/* ─── Select ───────────────────────────────────────────────────── */
export const Select = React.forwardRef(({ label, error, hint, children, className, ...p }, ref) => (
    <div>
        {label && <label className="field-label">{label}</label>}
        <select ref={ref} className={clsx('input select', error && 'input-error', className)} {...p}>{children}</select>
        {error && <p className="field-error"><ExclamationTriangleIcon className="w-3 h-3"/>{error}</p>}
        {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
));
Select.displayName = 'Select';

/* ─── Textarea ─────────────────────────────────────────────────── */
export const Textarea = React.forwardRef(({ label, error, hint, className, ...p }, ref) => (
    <div>
        {label && <label className="field-label">{label}</label>}
        <textarea ref={ref} className={clsx('input', error && 'input-error', className)} {...p} />
        {error && <p className="field-error"><ExclamationTriangleIcon className="w-3 h-3"/>{error}</p>}
        {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
));
Textarea.displayName = 'Textarea';

/* ─── Badge ────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'neutral', pulse }) {
    const v = { success:'badge-success', warning:'badge-warning', danger:'badge-danger', info:'badge-info', purple:'badge-purple', neutral:'badge-neutral', dark:'badge-dark' };
    return <span className={clsx(v[variant], pulse && 'badge-dot')}>{children}</span>;
}

/* ─── Avatar ───────────────────────────────────────────────────── */
const AVATAR_COLORS = [
    'bg-brand-100 text-brand-700', 'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
];
export function Avatar({ name = '', size = 'md', color, src }) {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
    const colorClass = color ?? AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
    const sizeClass  = { sm:'w-8 h-8 text-xs', md:'w-9 h-9 text-sm', lg:'w-11 h-11 text-base', xl:'w-14 h-14 text-lg' }[size];
    if (src) {
        return <img src={src} alt={name} className={clsx('rounded-full object-cover shrink-0', sizeClass)} />;
    }
    return <div className={clsx('rounded-full flex items-center justify-center font-semibold shrink-0', sizeClass, colorClass)}>{initials}</div>;
}

/* ─── Card ─────────────────────────────────────────────────────── */
export function Card({ children, className, hover, ...p }) {
    return <div className={clsx(hover ? 'card-hover' : 'card', className)} {...p}>{children}</div>;
}

/* ─── Modal ────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md', icon }) {
    const widths = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };
    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className={clsx('w-full bg-white dark:bg-slate-900 rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[85vh]', widths[size])}>
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                {icon && <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">{icon}</div>}
                                <Dialog.Title className="flex-1 font-semibold text-slate-900 dark:text-slate-100">{title}</Dialog.Title>
                                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><XMarkIcon className="w-4.5 h-4.5 w-5 h-5" /></button>
                            </div>
                            <div className="p-5 overflow-y-auto flex-1 min-h-0">{children}</div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}

/* ─── Confirm Modal ────────────────────────────────────────────── */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Hapus', confirmVariant = 'danger', loading }) {
    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <div className="text-center">
                <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
                    <Button variant={confirmVariant} className="flex-1" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </div>
        </Modal>
    );
}

/* ─── Empty State ──────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, desc, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            {Icon && <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4"><Icon className="w-7 h-7 text-slate-400" /></div>}
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{title}</p>
            {desc && <p className="text-sm text-slate-400 max-w-xs mb-5">{desc}</p>}
            {action}
        </div>
    );
}

/* ─── Skeleton ─────────────────────────────────────────────────── */
export function Skeleton({ className }) { return <div className={clsx('skeleton', className)} />; }
export function TableSkeleton({ rows = 5, cols = 5 }) {
    return (
        <div className="p-4 space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-3">
                    {Array.from({ length: cols }).map((_, j) => <Skeleton key={j} className={clsx('h-8 rounded-lg', j === 0 ? 'w-32' : 'flex-1')} />)}
                </div>
            ))}
        </div>
    );
}

/* ─── Pagination ───────────────────────────────────────────────── */
export function Pagination({ meta, onChange }) {
    if (!meta || meta.last_page <= 1) return null;
    const pages = Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1);
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Menampilkan <b>{meta.from}</b>–<b>{meta.to}</b> dari <b>{meta.total}</b></p>
            <div className="flex items-center gap-1">
                <button disabled={meta.current_page === 1} onClick={() => onChange(meta.current_page - 1)} className="btn btn-ghost btn-xs px-2 disabled:opacity-30">‹</button>
                {pages.map(p => (
                    <button key={p} onClick={() => onChange(p)} className={clsx('w-7 h-7 rounded-lg text-xs font-medium transition-colors', p === meta.current_page ? 'bg-brand-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800')}>{p}</button>
                ))}
                <button disabled={meta.current_page === meta.last_page} onClick={() => onChange(meta.current_page + 1)} className="btn btn-ghost btn-xs px-2 disabled:opacity-30">›</button>
            </div>
        </div>
    );
}

/* ─── Alert ────────────────────────────────────────────────────── */
export function Alert({ type = 'info', title, children }) {
    const styles = {
        info:    'bg-sky-50   border-sky-200   text-sky-800 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300',
        success: 'bg-brand-50 border-brand-200 text-brand-800 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-300',
        warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300',
        error:   'bg-rose-50  border-rose-200  text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300',
    };
    return (
        <div className={clsx('rounded-xl border px-4 py-3 text-sm', styles[type])}>
            {title && <p className="font-semibold mb-0.5">{title}</p>}
            {children}
        </div>
    );
}

/* ─── Section Header ───────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
