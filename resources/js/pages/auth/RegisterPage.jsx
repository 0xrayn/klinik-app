import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button, Input, Select } from '../../components/ui';
import useAuth from '../../stores/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SPECIALIZATIONS = ['Penyakit Dalam', 'Anak', 'Gigi & Mulut', 'Mata', 'Jantung', 'Kulit & Kelamin', 'Saraf', 'Kandungan', 'Umum'];

const ROLES = [
    { value: 'pasien',  label: 'Pasien',  desc: 'Daftar untuk membuat janji temu dan melihat rekam medis Anda.' },
    { value: 'dokter',  label: 'Dokter',  desc: 'Akun memerlukan persetujuan admin sebelum dapat menginput rekam medis.' },
    { value: 'perawat', label: 'Perawat', desc: 'Akun memerlukan persetujuan admin sebelum dapat mengelola data pasien.' },
];

export default function RegisterPage() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [showPw, setShowPw] = useState(false);
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { role: 'pasien' },
    });

    const role = watch('role');

    const onSubmit = async (data) => {
        try {
            await axios.get('/sanctum/csrf-cookie');
            const res = await axios.post('/api/auth/register', data);
            await login({ email: data.email, password: data.password });

            if (res.data.data.user.approval_status === 'pending') {
                toast.success('Akun dibuat. Menunggu persetujuan admin untuk akses penuh.');
            } else {
                toast.success('Akun berhasil dibuat!');
            }
            nav('/dashboard');
        } catch (e) {
            const msg = e.response?.data?.errors
                ? Object.values(e.response.data.errors).flat().join(', ')
                : (e?.response?.data?.message ?? 'Registrasi gagal');
            toast.error(msg);
        }
    };

    return (
        <div>
            <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Buat Akun Baru</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pilih jenis akun sesuai peran Anda</p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setValue('role', r.value)}
                        className={clsx(
                            'rounded-xl border-2 px-2 py-2.5 text-center text-xs font-semibold transition-all duration-150',
                            role === r.value
                                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-200',
                        )}>
                        {r.label}
                    </button>
                ))}
            </div>

            {role !== 'pasien' && (
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-3.5 py-3 mb-5 text-xs text-amber-700 dark:text-amber-300">
                    <InformationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{ROLES.find(r => r.value === role)?.desc}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <input type="hidden" {...register('role')} />

                <Input label="Nama Lengkap" placeholder="Nama sesuai KTP" error={errors.name?.message}
                    {...register('name', { required: 'Wajib diisi', minLength: { value: 3, message: 'Min. 3 karakter' } })} />
                <Input label="Email" type="email" placeholder="email@contoh.com" error={errors.email?.message}
                    {...register('email', { required: 'Wajib diisi', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format tidak valid' } })} />
                <Input label="No. Telepon" type="tel" inputMode="numeric" placeholder="08xxxxxxxxxx" error={errors.phone?.message}
                    {...register('phone', { required: 'Wajib diisi', pattern: { value: /^[0-9]{9,15}$/, message: 'No. telepon harus 9-15 digit angka' } })} />

                {role === 'dokter' && (
                    <>
                        <Select label="Spesialisasi" error={errors.specialization?.message}
                            {...register('specialization', { required: 'Wajib dipilih' })}>
                            <option value="">-- Pilih Spesialisasi --</option>
                            {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                        </Select>
                        <Input label="Nomor Izin Praktik (STR/SIP)" placeholder="Contoh: STR.123456789" error={errors.license_number?.message}
                            {...register('license_number', { required: 'Wajib diisi' })} />
                    </>
                )}

                <div>
                    <label className="field-label">Password</label>
                    <div className="relative">
                        <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 karakter"
                            className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                            {...register('password', { required: 'Wajib diisi', minLength: { value: 8, message: 'Min. 8 karakter' } })} />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="field-error">{errors.password.message}</p>}
                </div>

                <Input label="Konfirmasi Password" type="password" placeholder="Ulangi password"
                    error={errors.password_confirmation?.message}
                    {...register('password_confirmation', {
                        required: 'Wajib diisi',
                        validate: v => v === watch('password') || 'Password tidak cocok',
                    })} />

                <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-1">
                    Buat Akun
                </Button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Masuk</Link>
            </p>
        </div>
    );
}
