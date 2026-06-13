import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CameraIcon } from '@heroicons/react/24/outline';
import { Card, Button, Input, Avatar, SectionHeader } from '../../components/ui';
import useAuth from '../../stores/authStore';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const roleName = user?.roles?.[0]?.name ?? 'user';
    const fileRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);

    const profileForm = useForm({
        defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
    });

    const passwordForm = useForm();

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

    return (
        <div className="max-w-2xl space-y-5 animate-slide-up">
            <SectionHeader title="Profil Saya" subtitle="Kelola informasi akun dan keamanan Anda" />

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
                    <p className="font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">Role: {roleName}</p>
                    {uploading && <p className="text-xs text-brand-600 mt-1">Mengunggah foto…</p>}
                </div>
            </Card>

            <Card className="p-5">
                <p className="text-sm font-semibold text-slate-800 mb-4">Informasi Akun</p>
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

            <Card className="p-5">
                <p className="text-sm font-semibold text-slate-800 mb-4">Ubah Password</p>
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
