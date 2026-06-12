import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '../../components/ui';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm();

    const onSubmit = async (data) => {
        try {
            await axios.post('/api/auth/forgot-password', data);
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Gagal mengirim email');
            throw e;
        }
    };

    if (isSubmitSuccessful) return (
        <div className="text-center py-4">
            <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-7 h-7 text-brand-600" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg mb-2">Cek Email Anda</h2>
            <p className="text-sm text-slate-500 mb-6">Link reset password telah dikirim. Periksa inbox atau folder spam.</p>
            <Link to="/login" className="btn-primary btn-md">Kembali ke Login</Link>
        </div>
    );

    return (
        <div>
            <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900">Lupa Password</h2>
                <p className="text-sm text-slate-500 mt-1">Masukkan email untuk reset password</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email" type="email" placeholder="email@kliniksehat.id" error={errors.email?.message}
                    {...register('email', { required: 'Email wajib diisi', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format tidak valid' } })} />
                <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">Kirim Link Reset</Button>
            </form>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-5 transition-colors">
                <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Login
            </Link>
        </div>
    );
}
