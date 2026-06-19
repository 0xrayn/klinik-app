import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Card, Button, Input, Select, Textarea, SectionHeader } from '../../components/ui';
import toast from 'react-hot-toast';
import axios from 'axios';
import useAuth from '../../stores/authStore';

export default function PatientForm() {
    const nav = useNavigate();
    const { id } = useParams();
    const { hasRole } = useAuth();
    const isAdmin = hasRole('admin');
    const isEdit = !!id;
    // Only admin may create new patients or edit identity fields (NIK, name, address, etc).
    // Dokter/perawat editing an existing patient may only add clinical notes.
    const canEditIdentity = isAdmin;

    const [loading, setLoading] = useState(isEdit);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    useEffect(() => {
        if (!isEdit) return;
        axios.get(`/api/patients/${id}`).then(res => {
            const p = res.data.data;
            reset({
                name: p.name, nik: p.nik, phone: p.phone, bpjs: p.bpjs ?? '',
                birth_date: p.birth_date, gender: p.gender, blood_type: p.blood_type ?? '',
                address: p.address, allergies: p.allergies ?? '', chronic_diseases: p.chronic_diseases ?? '',
            });
        }).catch(() => toast.error('Gagal memuat data pasien'))
          .finally(() => setLoading(false));
    }, [id]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                // Non-admin: only send clinical fields, identity fields are locked anyway
                const payload = canEditIdentity ? data : {
                    blood_type: data.blood_type, allergies: data.allergies, chronic_diseases: data.chronic_diseases,
                };
                await axios.put(`/api/patients/${id}`, payload);
                toast.success('Data pasien diperbarui!');
            } else {
                await axios.post('/api/patients', data);
                toast.success('Pasien berhasil ditambahkan!');
            }
            nav('/patients');
        } catch (e) {
            const msg = e.response?.data?.errors
                ? Object.values(e.response.data.errors).flat().join(', ')
                : (e.response?.data?.message ?? 'Terjadi kesalahan');
            toast.error(msg);
        }
    };

    if (loading) {
        return <p className="text-sm text-slate-400">Memuat data...</p>;
    }

    const identityLocked = isEdit && !canEditIdentity;

    return (
        <div className="max-w-2xl space-y-5 animate-slide-up">
            <div className="flex items-center gap-3">
                <Link to="/patients">
                    <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                </Link>
                <SectionHeader title={isEdit ? 'Edit Data Pasien' : 'Tambah Pasien Baru'} subtitle="Lengkapi data identitas pasien" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Identitas Diri</p>
                        {identityLocked && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <LockClosedIcon className="w-3.5 h-3.5" /> Hanya admin yang dapat mengubah
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Input label="Nama Lengkap" placeholder="Nama sesuai KTP" disabled={identityLocked} error={errors.name?.message}
                                {...register('name', { required:'Wajib diisi', minLength:{value:3,message:'Min. 3 karakter'} })} />
                        </div>
                        <Input label="NIK" placeholder="16 digit NIK" inputMode="numeric" disabled={isEdit} error={errors.nik?.message}
                            {...register('nik', {
                                required: 'Wajib diisi',
                                pattern: { value: /^[0-9]{16}$/, message: 'NIK harus 16 digit angka' },
                            })} />
                        <Input label="No. BPJS (opsional)" placeholder="13 digit" inputMode="numeric" disabled={identityLocked} error={errors.bpjs?.message}
                            {...register('bpjs', { pattern: { value: /^[0-9]*$/, message: 'Hanya boleh angka' } })} />
                        <Input label="Tanggal Lahir" type="date" disabled={identityLocked} error={errors.birth_date?.message}
                            {...register('birth_date', { required:'Wajib diisi' })} />
                        <Select label="Jenis Kelamin" disabled={identityLocked} error={errors.gender?.message} {...register('gender', { required:'Wajib dipilih' })}>
                            <option value="">-- Pilih --</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </Select>
                        <Select label="Golongan Darah" {...register('blood_type')}>
                            <option value="">-- Pilih --</option>
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                        </Select>
                        <Input label="No. Telepon" type="tel" inputMode="numeric" placeholder="08xxxxxxxxxx" disabled={identityLocked} error={errors.phone?.message}
                            {...register('phone', {
                                required:'Wajib diisi',
                                pattern: { value: /^[0-9]{9,15}$/, message: 'No. telepon harus 9-15 digit angka' },
                            })} />
                        <div className="sm:col-span-2">
                            <Textarea label="Alamat Lengkap" placeholder="Jl. nama, nomor, kelurahan, kecamatan, kota" rows={2} disabled={identityLocked}
                                error={errors.address?.message} {...register('address', { required:'Wajib diisi' })} />
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Riwayat Medis</p>
                    <p className="text-xs text-slate-400 mb-4">Golongan darah, alergi, dan penyakit bawaan dapat diisi oleh dokter maupun perawat.</p>
                    <div className="space-y-4">
                        <Textarea label="Alergi (opsional)" placeholder="Alergi obat, makanan, atau bahan tertentu..." rows={2} {...register('allergies')} />
                        <Textarea label="Penyakit Bawaan (opsional)" placeholder="Diabetes, hipertensi, asma, dll..." rows={2} {...register('chronic_diseases')} />
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Link to="/patients"><Button variant="outline" size="sm">Batal</Button></Link>
                    <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Pasien'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
