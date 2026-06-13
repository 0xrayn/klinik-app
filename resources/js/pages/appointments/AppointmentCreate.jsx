import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Card, Button, Input, Select, Textarea } from '../../components/ui';
import toast from 'react-hot-toast';
import axios from 'axios';
import clsx from 'clsx';

const STEPS = ['Data Pasien','Pilih Dokter','Keluhan & Kirim'];

function StepBar({ current }) {
    return (
        <div className="flex items-center gap-0 mb-6">
            {STEPS.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={clsx('step-dot text-xs',
                                done   ? 'bg-brand-600 text-white' :
                                active ? 'bg-brand-600 text-white ring-4 ring-brand-600/20' :
                                         'bg-slate-200 text-slate-400')}>
                                {done ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
                            </div>
                            <span className={clsx('text-[11px] font-medium whitespace-nowrap hidden sm:block',
                                active ? 'text-brand-700' : done ? 'text-slate-500' : 'text-slate-400')}>
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={clsx('step-line mx-2 mb-4', done ? 'bg-brand-400' : 'bg-slate-200')} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export default function AppointmentCreate() {
    const nav = useNavigate();
    const [step, setStep]       = useState(0);
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots]     = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const { register, handleSubmit, watch, setValue, trigger, formState: { errors, isSubmitting } } = useForm();

    useEffect(() => {
        axios.get('/api/doctors', { params: { per_page: 100 } })
            .then(res => setDoctors(res.data.data.data))
            .catch(() => toast.error('Gagal memuat daftar dokter'));
    }, []);

    const goNext = async (fields) => {
        const ok = await trigger(fields);
        if (ok) setStep(s => s + 1);
    };

    const onSubmit = async (data) => {
        try {
            await axios.post('/api/appointments', {
                patient_name: data.patient_name,
                nik:          data.nik,
                phone:        data.phone,
                birth_date:   data.birth_date,
                address:      data.address,
                doctor_id:    data.doctor_id,
                appointment_date: data.date,
                appointment_time: data.time,
                complaint:    data.complaint,
                notes:        data.notes,
            });
            toast.success('Janji temu berhasil dibuat!');
            nav('/appointments');
        } catch (e) {
            const msg = e.response?.data?.errors
                ? Object.values(e.response.data.errors).flat().join(', ')
                : (e.response?.data?.message ?? 'Gagal membuat janji temu');
            toast.error(msg);
        }
    };

    const watchPoli   = watch('poli');
    const watchDocId  = watch('doctor_id');
    const watchDate   = watch('date');
    const watchSlot   = watch('time');

    const POLI = [...new Set(doctors.map(d => d.specialization))];
    const filteredDoc = watchPoli ? doctors.filter(d => d.specialization === watchPoli) : doctors;
    const selDoctor = doctors.find(d => String(d.id) === String(watchDocId));

    useEffect(() => {
        if (!watchDocId || !watchDate) { setSlots([]); return; }
        setSlotsLoading(true);
        axios.get(`/api/doctors/${watchDocId}/available-slots`, { params: { date: watchDate } })
            .then(res => setSlots(res.data.data))
            .catch(() => setSlots([]))
            .finally(() => setSlotsLoading(false));
    }, [watchDocId, watchDate]);

    return (
        <div className="max-w-2xl space-y-5 animate-slide-up">
            {/* Back */}
            <div className="flex items-center gap-3">
                <Link to="/appointments">
                    <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                </Link>
                <div>
                    <h1 className="page-title">Buat Janji Temu</h1>
                    <p className="page-subtitle">Langkah {step+1} dari {STEPS.length}</p>
                </div>
            </div>

            <StepBar current={step} />

            {/* Step 0 — Patient Data */}
            {step === 0 && (
                <Card className="p-6 space-y-4 animate-scale-in">
                    <p className="font-semibold text-slate-800 text-sm">Data Pasien</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Input label="Nama Lengkap" placeholder="Nama sesuai KTP" error={errors.patient_name?.message}
                                {...register('patient_name', { required:'Wajib diisi', minLength:{value:3,message:'Min 3 karakter'} })} />
                        </div>
                        <Input label="NIK (16 digit)" placeholder="3578xxxxxxxxxx" inputMode="numeric" error={errors.nik?.message}
                            {...register('nik', { required:'Wajib diisi', pattern:{value:/^[0-9]{16}$/,message:'NIK harus 16 digit angka'} })} />
                        <Input label="No. Telepon" type="tel" inputMode="numeric" placeholder="08xxxxxxxxxx" error={errors.phone?.message}
                            {...register('phone', { required:'Wajib diisi', pattern:{value:/^[0-9]{9,15}$/,message:'No. telepon harus 9-15 digit angka'} })} />
                        <Input label="Tanggal Lahir" type="date" error={errors.birth_date?.message}
                            {...register('birth_date', { required:'Wajib diisi' })} />
                        <Select label="Jenis Kelamin" error={errors.gender?.message}
                            {...register('gender', { required:'Wajib diisi' })}>
                            <option value="">-- Pilih --</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </Select>
                        <div className="sm:col-span-2">
                            <Textarea label="Alamat" placeholder="Alamat lengkap" rows={2} {...register('address')} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-1">
                        <Button variant="primary" size="sm" onClick={() => goNext(['patient_name','nik','phone','birth_date','gender'])}>
                            Lanjut →
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 1 — Doctor & Schedule */}
            {step === 1 && (
                <Card className="p-6 space-y-4 animate-scale-in">
                    <p className="font-semibold text-slate-800 text-sm">Pilih Dokter & Jadwal</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select label="Poli / Spesialisasi" {...register('poli')}
                            onChange={e => { setValue('poli', e.target.value); setValue('doctor_id',''); setValue('time',''); }}>
                            <option value="">-- Semua Poli --</option>
                            {POLI.map(p => <option key={p}>{p}</option>)}
                        </Select>

                        <Select label="Dokter" error={errors.doctor_id?.message}
                            {...register('doctor_id', { required:'Pilih dokter' })}
                            onChange={e => { setValue('doctor_id', e.target.value); setValue('time', ''); }}>
                            <option value="">-- Pilih Dokter --</option>
                            {filteredDoc.map(d => <option key={d.id} value={d.id}>{d.user?.name} — {d.specialization}</option>)}
                        </Select>

                        <Input label="Tanggal Kunjungan" type="date" error={errors.date?.message}
                            min={new Date().toISOString().split('T')[0]}
                            {...register('date', { required:'Wajib diisi' })}
                            onChange={e => { setValue('date', e.target.value); setValue('time', ''); }} />

                        <div>
                            <label className="field-label">Jam Tersedia</label>
                            {!watchDocId || !watchDate ? (
                                <p className="text-xs text-slate-400 mt-2 bg-slate-50 rounded-xl px-3 py-2.5">
                                    Pilih dokter dan tanggal untuk melihat jam tersedia
                                </p>
                            ) : slotsLoading ? (
                                <p className="text-xs text-slate-400 mt-2">Memuat jam tersedia…</p>
                            ) : slots.length === 0 ? (
                                <p className="text-xs text-slate-400 mt-2 bg-slate-50 rounded-xl px-3 py-2.5">
                                    Dokter tidak praktik pada tanggal ini
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {slots.map(s => (
                                        <label key={s.time} className={!s.available ? 'cursor-not-allowed' : ''}>
                                            <input type="radio" value={s.time} disabled={!s.available} className="sr-only" {...register('time', { required:'Pilih jam' })} />
                                            <span className={clsx(
                                                'inline-block px-3 py-1.5 rounded-xl border-2 text-xs font-semibold cursor-pointer transition-all',
                                                !s.available
                                                    ? 'border-slate-100 bg-slate-50 text-slate-300 line-through'
                                                    : watchSlot === s.time
                                                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                                                        : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50/50',
                                            )}>{s.time}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {errors.time && <p className="field-error">{errors.time.message}</p>}
                        </div>
                    </div>
                    <div className="flex justify-between pt-1">
                        <Button variant="ghost" size="sm" onClick={() => setStep(0)}>← Kembali</Button>
                        <Button variant="primary" size="sm" onClick={() => goNext(['doctor_id','date','time'])}>Lanjut →</Button>
                    </div>
                </Card>
            )}

            {/* Step 2 — Complaint + Summary */}
            {step === 2 && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card className="p-6 space-y-4 animate-scale-in">
                        <p className="font-semibold text-slate-800 text-sm">Keluhan & Konfirmasi</p>
                        <Textarea label="Keluhan Utama" placeholder="Ceritakan keluhan yang dirasakan…" rows={4}
                            error={errors.complaint?.message}
                            {...register('complaint', { required:'Keluhan wajib diisi' })} />
                        <Textarea label="Catatan Tambahan (opsional)" placeholder="Riwayat alergi, obat yang dikonsumsi, dll…" rows={2}
                            {...register('notes')} />

                        {/* Summary box */}
                        <div className="bg-slate-50 rounded-xl p-4 text-sm border border-slate-100">
                            <p className="font-semibold text-slate-700 mb-3">Ringkasan Janji Temu</p>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                {[
                                    ['Pasien', watch('patient_name')],
                                    ['Dokter', selDoctor?.user?.name],
                                    ['Poli',   selDoctor?.specialization],
                                    ['Tanggal',watch('date')],
                                    ['Jam',    watch('time')],
                                ].map(([k,v]) => (
                                    <React.Fragment key={k}>
                                        <dt className="text-slate-400 text-xs">{k}</dt>
                                        <dd className="font-medium text-slate-800 text-xs truncate">{v || '—'}</dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                        </div>

                        <div className="flex justify-between pt-1">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>← Kembali</Button>
                            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                                <CheckIcon className="w-4 h-4" /> Konfirmasi
                            </Button>
                        </div>
                    </Card>
                </form>
            )}
        </div>
    );
}
