// PatientForm.jsx
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card, Button, Input, Select, Textarea, SectionHeader } from '../../components/ui';
import toast from 'react-hot-toast';

export default function PatientForm() {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        await new Promise(r => setTimeout(r, 700));
        toast.success(isEdit ? 'Data pasien diperbarui!' : 'Pasien berhasil ditambahkan!');
        nav('/patients');
    };

    return (
        <div className="max-w-2xl space-y-5 animate-slide-up">
            <div className="flex items-center gap-3">
                <Link to="/patients">
                    <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                </Link>
                <SectionHeader title={isEdit ? 'Edit Data Pasien' : 'Tambah Pasien Baru'} subtitle="Lengkapi data identitas pasien" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Card className="p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-4">Identitas Diri</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Input label="Nama Lengkap" placeholder="Nama sesuai KTP" error={errors.name?.message}
                                {...register('name', { required:'Wajib diisi', minLength:{value:3,message:'Min. 3 karakter'} })} />
                        </div>
                        <Input label="NIK" placeholder="16 digit NIK" error={errors.nik?.message}
                            {...register('nik', { required:'Wajib diisi', minLength:{value:16,message:'16 digit'}, maxLength:{value:16,message:'16 digit'} })} />
                        <Input label="No. BPJS (opsional)" placeholder="13 digit" {...register('bpjs')} />
                        <Input label="Tanggal Lahir" type="date" error={errors.birth_date?.message}
                            {...register('birth_date', { required:'Wajib diisi' })} />
                        <Select label="Jenis Kelamin" error={errors.gender?.message} {...register('gender', { required:'Wajib dipilih' })}>
                            <option value="">-- Pilih --</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </Select>
                        <Select label="Golongan Darah" {...register('blood_type')}>
                            <option value="">-- Pilih --</option>
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                        </Select>
                        <Input label="No. Telepon" type="tel" placeholder="08xx" error={errors.phone?.message}
                            {...register('phone', { required:'Wajib diisi' })} />
                        <div className="sm:col-span-2">
                            <Textarea label="Alamat Lengkap" placeholder="Jl. nama, nomor, kelurahan, kecamatan, kota" rows={2}
                                error={errors.address?.message} {...register('address', { required:'Wajib diisi' })} />
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <p className="text-sm font-semibold text-slate-800 mb-4">Riwayat Medis</p>
                    <div className="space-y-4">
                        <Textarea label="Alergi (opsional)" placeholder="Alergi obat, makanan, atau bahan tertentu…" rows={2} {...register('allergies')} />
                        <Textarea label="Penyakit Bawaan (opsional)" placeholder="Diabetes, hipertensi, asma, dll…" rows={2} {...register('chronic_diseases')} />
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
