// PatientList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilSquareIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar, EmptyState, ConfirmModal, SectionHeader } from '../../components/ui';
import toast from 'react-hot-toast';

const MOCK = [
    { id:1, name:'Ahmad Fauzi',    nik:'3578012345678901', phone:'081234567890', dob:'1990-05-15', gender:'L', blood:'O+', last:'2024-12-10', visits:12, status:'active' },
    { id:2, name:'Dewi Sartika',   nik:'3578012345678902', phone:'082345678901', dob:'1985-08-22', gender:'P', blood:'A+', last:'2024-12-08', visits:5,  status:'active' },
    { id:3, name:'Rudi Hermawan',  nik:'3578012345678903', phone:'083456789012', dob:'1978-03-11', gender:'L', blood:'B-', last:'2024-11-30', visits:28, status:'active' },
    { id:4, name:'Sari Indah',     nik:'3578012345678904', phone:'084567890123', dob:'2019-07-04', gender:'P', blood:'AB+',last:'2024-12-12', visits:3,  status:'active' },
    { id:5, name:'Budi Santoso',   nik:'3578012345678905', phone:'085678901234', dob:'1965-12-01', gender:'L', blood:'O-', last:'2024-10-15', visits:47, status:'inactive' },
];

function age(dob) {
    const b = new Date(dob), t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
    return a;
}

export default function PatientList() {
    const [data, setData]   = useState(MOCK);
    const [search, setSearch] = useState('');
    const [del, setDel]     = useState({ open:false, id:null });

    const filtered = data.filter(p => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.nik.includes(q) || p.phone.includes(q);
    });

    const handleDel = () => {
        setData(prev => prev.filter(p => p.id !== del.id));
        setDel({ open:false, id:null });
        toast.success('Data pasien dihapus');
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Data Pasien" subtitle={`${data.length} pasien terdaftar`}
                action={<Link to="/patients/create"><Button variant="primary" size="sm"><PlusIcon className="w-4 h-4"/>Tambah Pasien</Button></Link>} />

            <Card className="p-3.5">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input input-icon text-sm" placeholder="Cari nama, NIK, atau telepon…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </Card>

            <Card>
                {!filtered.length
                    ? <EmptyState icon={UsersIcon} title="Pasien tidak ditemukan" desc="Coba ubah kata kunci pencarian" />
                    : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr>
                                    {['Pasien','NIK','Usia / Gol.Darah','Kunjungan Terakhir','Total Kunjungan','Status','Aksi'].map(h=>(
                                        <th key={h} className="tbl-head">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {filtered.map(p => (
                                        <tr key={p.id} className="tbl-row">
                                            <td className="tbl-cell">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar name={p.name} size="sm" />
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                                                        <p className="text-xs text-slate-400">{p.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="tbl-cell font-mono text-xs">{p.nik}</td>
                                            <td className="tbl-cell">
                                                <p className="text-sm">{age(p.dob)} thn · {p.gender === 'L' ? 'L' : 'P'}</p>
                                                <Badge variant="info">Gol. {p.blood}</Badge>
                                            </td>
                                            <td className="tbl-cell text-sm text-slate-500">{p.last}</td>
                                            <td className="tbl-cell">
                                                <span className="font-bold text-slate-800">{p.visits}</span>
                                                <span className="text-xs text-slate-400 ml-1">kali</span>
                                            </td>
                                            <td className="tbl-cell">
                                                <Badge variant={p.status === 'active' ? 'success' : 'neutral'} pulse={p.status === 'active'}>
                                                    {p.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="tbl-cell">
                                                <div className="flex items-center gap-1">
                                                    <Link to={`/patients/${p.id}`}>
                                                        <button className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors"><EyeIcon className="w-4 h-4"/></button>
                                                    </Link>
                                                    <Link to={`/patients/${p.id}/edit`}>
                                                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><PencilSquareIcon className="w-4 h-4"/></button>
                                                    </Link>
                                                    <button onClick={() => setDel({ open:true, id:p.id })}
                                                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </Card>

            <ConfirmModal open={del.open} onClose={() => setDel({ open:false, id:null })}
                title="Hapus Pasien" message="Semua data pasien termasuk rekam medis akan terhapus permanen."
                onConfirm={handleDel} />
        </div>
    );
}
