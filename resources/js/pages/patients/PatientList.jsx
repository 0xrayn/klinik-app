import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilSquareIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar, EmptyState, TableSkeleton, ConfirmModal, Pagination, SectionHeader } from '../../components/ui';
import toast from 'react-hot-toast';
import axios from 'axios';
import useAuth from '../../stores/authStore';

function age(dob) {
    if (!dob) return '-';
    const b = new Date(dob), t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
    return a;
}

export default function PatientList() {
    const { hasRole } = useAuth();
    const canDelete = hasRole('admin');
    const canCreate = hasRole('admin');
    const canEdit   = hasRole('admin') || hasRole('perawat');

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [del, setDel] = useState({ open: false, id: null });

    const load = async (p = page, q = search) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/patients', { params: { page: p, search: q || undefined, per_page: 10 } });
            setData(res.data.data.data);
            setMeta(res.data.data);
        } catch (e) {
            toast.error('Gagal memuat data pasien');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page, search); }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load(1, search);
    };

    const handleDel = async () => {
        try {
            await axios.delete(`/api/patients/${del.id}`);
            toast.success('Data pasien dihapus');
            load();
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal menghapus data');
        } finally {
            setDel({ open: false, id: null });
        }
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Data Pasien" subtitle={`${meta?.total ?? 0} pasien terdaftar`}
                action={canCreate && <Link to="/patients/create"><Button variant="primary" size="sm"><PlusIcon className="w-4 h-4"/>Tambah Pasien</Button></Link>} />

            <Card className="p-3.5">
                <form onSubmit={handleSearch} className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input input-icon text-sm" placeholder="Cari nama, NIK, atau telepon…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </form>
            </Card>

            <Card>
                {loading ? (
                    <div className="p-5"><TableSkeleton rows={6} cols={7} /></div>
                ) : !data.length
                    ? <EmptyState icon={UsersIcon} title="Pasien tidak ditemukan" desc="Coba ubah kata kunci pencarian" />
                    : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr>
                                    {['Pasien','NIK','Usia / Gol.Darah','Alamat','Status','Aksi'].map(h=>(
                                        <th key={h} className="tbl-head">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {data.map(p => (
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
                                                <p className="text-sm">{age(p.birth_date)} thn · {p.gender === 'L' ? 'L' : 'P'}</p>
                                                {p.blood_type && <Badge variant="info">Gol. {p.blood_type}</Badge>}
                                            </td>
                                            <td className="tbl-cell text-sm text-slate-500 max-w-xs truncate">{p.address}</td>
                                            <td className="tbl-cell">
                                                <Badge variant={p.is_active ? 'success' : 'neutral'} pulse={p.is_active}>
                                                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="tbl-cell">
                                                <div className="flex items-center gap-1">
                                                    <Link to={`/patients/${p.id}`}>
                                                        <button className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors"><EyeIcon className="w-4 h-4"/></button>
                                                    </Link>
                                                    {canEdit && (
                                                    <Link to={`/patients/${p.id}/edit`}>
                                                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><PencilSquareIcon className="w-4 h-4"/></button>
                                                    </Link>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => setDel({ open:true, id:p.id })}
                                                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
                <Pagination meta={meta} onChange={setPage} />
            </Card>

            <ConfirmModal open={del.open} onClose={() => setDel({ open:false, id:null })}
                title="Hapus Pasien" message="Data pasien akan dipindahkan ke Log Aktivitas dan dapat dikembalikan oleh admin."
                onConfirm={handleDel} />
        </div>
    );
}
