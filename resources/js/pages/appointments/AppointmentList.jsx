import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    PlusIcon, MagnifyingGlassIcon, EyeIcon, TrashIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar, EmptyState, ConfirmModal, SectionHeader } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUS = {
    pending:     { label:'Pending',        v:'neutral' },
    confirmed:   { label:'Terkonfirmasi',  v:'info' },
    in_progress: { label:'Berlangsung',    v:'warning' },
    done:        { label:'Selesai',        v:'success' },
    cancelled:   { label:'Dibatalkan',     v:'danger' },
};

const MOCK = [
    { id:1, queue:'A001', patient:{name:'Ahmad Fauzi',   phone:'081234567890'}, doctor:{name:'dr. Siti Rahayu',   spec:'Umum'},    date:'2024-12-15', time:'08:00', complaint:'Demam & batuk',          status:'done' },
    { id:2, queue:'B002', patient:{name:'Dewi Sartika',  phone:'082345678901'}, doctor:{name:'dr. Budi Prakoso', spec:'Gigi'},    date:'2024-12-15', time:'08:30', complaint:'Sakit gigi geraham',     status:'in_progress' },
    { id:3, queue:'A003', patient:{name:'Rudi Hermawan', phone:'083456789012'}, doctor:{name:'dr. Siti Rahayu',   spec:'Umum'},    date:'2024-12-15', time:'09:00', complaint:'Kontrol hipertensi',     status:'confirmed' },
    { id:4, queue:'C004', patient:{name:'Sari Indah',    phone:'084567890123'}, doctor:{name:'dr. Yuni Astuti',   spec:'Anak'},    date:'2024-12-15', time:'09:30', complaint:'Imunisasi anak',         status:'confirmed' },
    { id:5, queue:'B005', patient:{name:'Budi Santoso',  phone:'085678901234'}, doctor:{name:'dr. Budi Prakoso', spec:'Gigi'},    date:'2024-12-15', time:'10:00', complaint:'Cabut gigi',             status:'cancelled' },
    { id:6, queue:'D006', patient:{name:'Rina Wulandari',phone:'086789012345'}, doctor:{name:'dr. Hendra Wijaya',spec:'Jantung'}, date:'2024-12-16', time:'13:00', complaint:'Sesak napas',            status:'pending' },
    { id:7, queue:'A007', patient:{name:'Teguh Prasetyo',phone:'087890123456'}, doctor:{name:'dr. Siti Rahayu',   spec:'Umum'},    date:'2024-12-16', time:'08:00', complaint:'Flu & pilek',            status:'confirmed' },
];

export default function AppointmentList() {
    const [data, setData]         = useState(MOCK);
    const [search, setSearch]     = useState('');
    const [statusF, setStatusF]   = useState('');
    const [delModal, setDelModal] = useState({ open:false, id:null });

    const filtered = data.filter(a => {
        const q = search.toLowerCase();
        const matchS = !search || a.patient.name.toLowerCase().includes(q) || a.doctor.name.toLowerCase().includes(q) || a.queue.toLowerCase().includes(q);
        const matchSt = !statusF || a.status === statusF;
        return matchS && matchSt;
    });

    const handleDelete = () => {
        setData(prev => prev.filter(a => a.id !== delModal.id));
        setDelModal({ open:false, id:null });
        toast.success('Janji temu dihapus');
    };

    const changeStatus = (id, val) => {
        setData(prev => prev.map(a => a.id === id ? { ...a, status: val } : a));
        toast.success('Status diperbarui');
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader
                title="Janji Temu"
                subtitle="Kelola semua jadwal janji temu pasien"
                action={
                    <Link to="/appointments/create">
                        <Button variant="primary" size="sm"><PlusIcon className="w-4 h-4" />Buat Janji</Button>
                    </Link>
                }
            />

            {/* Filter bar */}
            <Card className="p-3.5 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input input-icon text-sm" placeholder="Cari pasien, dokter, no. antrian…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input text-sm sm:w-48" value={statusF} onChange={e => setStatusF(e.target.value)}>
                    <option value="">Semua Status</option>
                    {Object.entries(STATUS).map(([v,{label}]) => <option key={v} value={v}>{label}</option>)}
                </select>
            </Card>

            {/* Status chips */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS).map(([val,{label,v}]) => {
                    const cnt = data.filter(a => a.status === val).length;
                    return (
                        <button key={val} onClick={() => setStatusF(statusF === val ? '' : val)}
                            className={`transition-all ${statusF === val ? 'ring-2 ring-offset-1 ring-brand-500 rounded-full' : ''}`}>
                            <Badge variant={v}>{label} · {cnt}</Badge>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <Card>
                {!filtered.length
                    ? <EmptyState icon={CalendarDaysIcon} title="Tidak ada janji temu" desc="Ubah filter atau buat janji temu baru"
                        action={<Link to="/appointments/create"><Button variant="primary" size="sm"><PlusIcon className="w-4 h-4"/>Buat Janji</Button></Link>} />
                    : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr>
                                    {['No.Antrian','Pasien','Dokter / Poli','Tanggal & Jam','Keluhan','Status','Aksi'].map(h=>(
                                        <th key={h} className="tbl-head">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {filtered.map(a => {
                                        const s = STATUS[a.status];
                                        return (
                                            <tr key={a.id} className="tbl-row">
                                                <td className="tbl-cell">
                                                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">{a.queue}</span>
                                                </td>
                                                <td className="tbl-cell">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar name={a.patient.name} size="sm" />
                                                        <div>
                                                            <p className="font-semibold text-slate-800 text-sm leading-tight">{a.patient.name}</p>
                                                            <p className="text-xs text-slate-400">{a.patient.phone}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="tbl-cell">
                                                    <p className="text-sm font-medium text-slate-700 leading-tight">{a.doctor.name}</p>
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{a.doctor.spec}</span>
                                                </td>
                                                <td className="tbl-cell">
                                                    <p className="text-sm text-slate-700">{a.date}</p>
                                                    <p className="text-xs font-mono font-semibold text-slate-500">{a.time}</p>
                                                </td>
                                                <td className="tbl-cell max-w-[160px]">
                                                    <p className="text-xs text-slate-500 truncate">{a.complaint}</p>
                                                </td>
                                                <td className="tbl-cell">
                                                    <select value={a.status} onChange={e => changeStatus(a.id, e.target.value)}
                                                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer">
                                                        {Object.entries(STATUS).map(([v,{label}]) => <option key={v} value={v}>{label}</option>)}
                                                    </select>
                                                </td>
                                                <td className="tbl-cell">
                                                    <div className="flex items-center gap-1">
                                                        <Link to={`/appointments/${a.id}`}>
                                                            <button className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                                                                <EyeIcon className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                        <button onClick={() => setDelModal({ open:true, id:a.id })}
                                                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </Card>

            <ConfirmModal open={delModal.open} onClose={() => setDelModal({ open:false, id:null })}
                title="Hapus Janji Temu" message="Yakin ingin menghapus janji temu ini? Tindakan tidak dapat dibatalkan."
                onConfirm={handleDelete} />
        </div>
    );
}
