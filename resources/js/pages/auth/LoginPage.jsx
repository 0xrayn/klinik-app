import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Button, Input, Alert } from '../../components/ui';
import useAuth from '../../stores/authStore';
import toast from 'react-hot-toast';

const DEMO = [
    { role: 'Admin',   email: 'admin@klinik.id',   color: 'text-rose-600' },
    { role: 'Dokter',  email: 'dokter@klinik.id',  color: 'text-brand-600' },
    { role: 'Perawat', email: 'perawat@klinik.id', color: 'text-sky-600' },
    { role: 'Pasien',  email: 'pasien@klinik.id',  color: 'text-violet-600' },
];

export default function LoginPage() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [showPw, setShowPw] = useState(false);
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            await login(data);
            toast.success('Selamat datang!');
            nav('/dashboard');
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Email atau password salah');
        }
    };

    return (
        <div>
            <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900">Masuk ke Akun</h2>
                <p className="text-sm text-slate-500 mt-1">Masukkan email dan password Anda</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input label="Email" type="email" placeholder="nama@kliniksehat.id"
                    icon={EnvelopeIcon} error={errors.email?.message}
                    {...register('email', { required: 'Email wajib diisi', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' } })} />

                <div>
                    <label className="field-label">Password</label>
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                            className={`input input-icon pr-10 ${errors.password ? 'input-error' : ''}`}
                            {...register('password', { required: 'Password wajib diisi', minLength: { value: 8, message: 'Min. 8 karakter' } })} />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="field-error">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                        Ingat saya
                    </label>
                    <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Lupa password?</Link>
                </div>

                <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-1">
                    Masuk
                </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
                Belum punya akun?{' '}
                <Link to="/register" className="text-brand-600 font-semibold hover:underline">Daftar</Link>
            </p>

            {/* Demo accounts */}
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-3.5 bg-slate-50/80">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Demo — password: <span className="font-mono">password</span></p>
                <div className="grid grid-cols-2 gap-1.5">
                    {DEMO.map(d => (
                        <button key={d.role} type="button" onClick={() => { setValue('email', d.email); setValue('password', 'password'); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left">
                            <span className={`text-xs font-bold ${d.color}`}>{d.role}</span>
                            <span className="text-xs text-slate-400 truncate">{d.email}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
