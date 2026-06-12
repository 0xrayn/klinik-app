import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '../../components/ui';
import useAuth from '../../stores/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [showPw, setShowPw] = useState(false);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/api/auth/register', data);
            await login({ email: data.email, password: data.password });
            toast.success('Akun berhasil dibuat!');
            nav('/dashboard');
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Registrasi gagal');
        }
    };

    return (
        <div>
            <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900">Buat Akun Baru</h2>
                <p className="text-sm text-slate-500 mt-1">Daftar sebagai pasien klinik</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input label="Nama Lengkap" placeholder="Nama sesuai KTP" error={errors.name?.message}
                    {...register('name', { required: 'Wajib diisi', minLength: { value: 3, message: 'Min. 3 karakter' } })} />
                <Input label="Email" type="email" placeholder="email@contoh.com" error={errors.email?.message}
                    {...register('email', { required: 'Wajib diisi', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format tidak valid' } })} />
                <Input label="No. Telepon" type="tel" placeholder="08xxxxxxxxxx" error={errors.phone?.message}
                    {...register('phone', { required: 'Wajib diisi' })} />

                <div>
                    <label className="field-label">Password</label>
                    <div className="relative">
                        <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 karakter"
                            className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                            {...register('password', { required: 'Wajib diisi', minLength: { value: 8, message: 'Min. 8 karakter' } })} />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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

            <p className="text-center text-sm text-slate-500 mt-5">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-brand-600 font-semibold hover:underline">Masuk</Link>
            </p>
        </div>
    );
}
