import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CameraIcon, ClockIcon, ExclamationTriangleIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { Card, Button, Input, Avatar, Textarea, SectionHeader } from '../../components/ui';
import useAuth from '../../stores/authStore';

export default function ProfilePage() {
    const { user, setUser, hasRole } = useAuth();
    const roleName = user?.roles?.[0]?.name ?? 'user';
    const isPasien = hasRole('pasien');
    const fileRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);

    const profileForm = useForm({
        defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
    });

    const passwordForm = useForm();

    const historyForm = useForm({
        defaultValues: {
            allergies: user?.patient?.allergies ?? '',
            chronic_diseases: user?.patient?.chronic_diseases ?? '',
            medical_history: user?.patient?.medical_history ?? '',
        },
    });

    const onAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('avatar', file);
        setUploading(true);
        try {
            const res = await axios.post('/api/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUser({ ...user, ...res.data.data });
            toast.success('Foto profil diperbarui');
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal mengunggah foto');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const onSaveProfile = async (data) => {
        try {
            const res = await axios.put('/api/auth/profile', data);
            setUser({ ...user, ...res.data.data });
            toast.success('Profil berhasil diperbarui');
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal memperbarui profil');
        }
    };

    const onChangePassword = async (data) => {
        try {
            await axios.put('/api/auth/change-password', data);
            toast.success('Password berhasil diubah');
            passwordForm.reset();
        } catch (e) {
            const msg = e.response?.data?.errors
                ? Object.values(e.response.data.errors).flat().join(', ')
                : (e.response?.data?.message ?? 'Gagal mengubah password');
            toast.error(msg);
        }
    };

    const onSaveHistory = async (data) => {
        try {
            const res = await axios.put('/api/patients/me', data);
            setUser({ ...user, patient: { ...user.patient, ...res.data.data } });
            toast.success('Riwayat kesehatan diperbarui');
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal memperbarui riwayat kesehatan');
        }
    };

    const isPendingStaff = (roleName === 'dokter' || roleName === 'perawat') && user?.approval_status !== 'approved';

    return (
        <div className="max-w-2xl space-y-5 animate-slide-up">
            <SectionHeader title="Profil Saya" subtitle="Kelola informasi akun dan keamanan Anda" />

            {/* Approval status banner for dokter/perawat */}
            {isPendingStaff && (
                <Card className={`p-4 border ${user.approval_status === 'rejected' ? 'border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20' : 'border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20'}`}>
                    <div className="flex items-start gap-3">
                        {user.approval_status === 'rejected'
                            ? <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                            : <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
                        <div>
                            <p className={`text-sm font-semibold ${user.approval_status === 'rejected' ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                {user.approval_status === 'rejected' ? 'Akun Anda ditolak' : 'Menunggu persetujuan admin'}
                            </p>
                            <p className={`text-xs mt-1 ${user.approval_status === 'rejected' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {user.approval_status === 'rejected'
                                    ? 'Hubungi administrator klinik untuk informasi lebih lanjut.'
                                    : 'Anda dapat masuk dan melihat data, tetapi belum dapat menambah atau mengubah data (misalnya rekam medis atau data pasien) sampai admin menyetujui akun Anda.'}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="p-5 flex items-center gap-4">
                <div className="relative group shrink-0">
                    <Avatar name={user?.name} src={user?.avatar_url} size="lg" />
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-card hover:bg-brand-700 transition-colors disabled:opacity-50">
                        <CameraIcon className="w-3.5 h-3.5" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onAvatarChange} />
                </div>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-slate-400 capitalize">Role: {roleName}</span>
                        {roleName !== 'pasien' && (
                            user?.approval_status === 'approved'
                                ? <span className="badge badge-success text-[10px]"><CheckBadgeIcon className="w-3 h-3" />Disetujui</span>
                                : <span className="badge badge-warning text-[10px]">Menunggu Persetujuan</span>
                        )}
                    </div>
                    {uploading && <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">Mengunggah foto...</p>}
                </div>
            </Card>

            <Card className="p-5">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Informasi Akun</p>
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                    <Input label="Nama Lengkap" error={profileForm.formState.errors.name?.message}
                        {...profileForm.register('name', { required: 'Wajib diisi' })} />
                    <Input label="Email" value={user?.email ?? ''} disabled />
                    <Input label="No. Telepon" type="tel" placeholder="08xx" error={profileForm.formState.errors.phone?.message}
                        {...profileForm.register('phone', {
                            pattern: { value: /^[0-9]*$/, message: 'Hanya boleh angka' },
                            maxLength: { value: 15, message: 'Maks. 15 digit' },
                        })} />
                    <div className="flex justify-end">
                        <Button type="submit" variant="primary" size="sm" loading={profileForm.formState.isSubmitting}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Self-reported medical history (patients only) */}
            {isPasien && user?.patient && (
                <Card className="p-5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Riwayat Kesehatan</p>
                    <p className="text-xs text-slate-400 mb-4">Informasi ini akan dilihat dokter sebelum atau saat konsultasi untuk membantu analisa.</p>
                    <form onSubmit={historyForm.handleSubmit(onSaveHistory)} className="space-y-4">
                        <Textarea label="Alergi" placeholder="Contoh: alergi penisilin, seafood..." rows={2}
                            {...historyForm.register('allergies')} />
                        <Textarea label="Penyakit Kronis / Bawaan" placeholder="Contoh: diabetes, hipertensi, asma..." rows={2}
                            {...historyForm.register('chronic_diseases')} />
                        <Textarea label="Riwayat Kesehatan Lain" placeholder="Riwayat operasi, rawat inap, kondisi medis lain yang relevan..." rows={3}
                            {...historyForm.register('medical_history')} />
                        <div className="flex justify-end">
                            <Button type="submit" variant="primary" size="sm" loading={historyForm.formState.isSubmitting}>
                                Simpan Riwayat
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {isPasien && !user?.patient && (
                <Card className="p-5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Riwayat Kesehatan</p>
                    <p className="text-xs text-slate-400">Lengkapi data riwayat kesehatan setelah Anda membuat janji temu pertama.</p>
                </Card>
            )}

            <Card className="p-5">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Ubah Password</p>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                    <Input label="Password Saat Ini" type="password" error={passwordForm.formState.errors.current_password?.message}
                        {...passwordForm.register('current_password', { required: 'Wajib diisi' })} />
                    <Input label="Password Baru" type="password" error={passwordForm.formState.errors.password?.message}
                        {...passwordForm.register('password', { required: 'Wajib diisi', minLength: { value: 8, message: 'Min. 8 karakter' } })} />
                    <Input label="Konfirmasi Password Baru" type="password" error={passwordForm.formState.errors.password_confirmation?.message}
                        {...passwordForm.register('password_confirmation', { required: 'Wajib diisi' })} />
                    <div className="flex justify-end">
                        <Button type="submit" variant="primary" size="sm" loading={passwordForm.formState.isSubmitting}>
                            Ubah Password
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
