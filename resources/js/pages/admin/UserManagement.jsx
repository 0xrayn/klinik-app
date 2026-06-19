import React, { useEffect, useState } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, ShieldCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar, Modal, ConfirmModal, EmptyState, TableSkeleton, Pagination, SectionHeader } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';

const ROLE_STYLES = {
    admin:   { v:'danger',  label:'Admin' },
    dokter:  { v:'info',    label:'Dokter' },
    perawat: { v:'purple',  label:'Perawat' },
    pasien:  { v:'neutral', label:'Pasien' },
};

export default function UserManagement() {
    const [users, setUsers]   = useState([]);
    const [meta, setMeta]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage]     = useState(1);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all | pending
    const [addOpen, setAdd]   = useState(false);
    const [editUser, setEdit] = useState(null);
    const [del, setDel]       = useState({ open: false, id: null });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const load = async (p = page, q = search, f = filter) => {
        setLoading(true);
        try {
            const params = { page: p, search: q || undefined, per_page: 10 };
            if (f === 'pending') params.approval_status = 'pending';
            const res = await axios.get('/api/admin/users', { params });
            setUsers(res.data.data.data);
            setMeta(res.data.data);
        } catch (e) {
            toast.error('Gagal memuat data user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(page, search, filter); }, [page, filter]);

    const handleApproval = async (id, status) => {
        try {
            await axios.put(`/api/admin/users/${id}/approval`, { approval_status: status });
            toast.success(status === 'approved' ? 'Akun disetujui' : 'Akun ditolak');
            load();
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal memperbarui status');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load(1, search, filter);
    };

    const onSubmit = async (data) => {
        try {
            if (editUser) {
                await axios.put(`/api/admin/users/${editUser.id}`, data);
                toast.success('User diperbarui');
                setEdit(null);
            } else {
                await axios.post('/api/admin/users', data);
                toast.success('User berhasil ditambahkan');
                setAdd(false);
            }
            reset();
            load();
        } catch (e) {
            const msg = e.response?.data?.errors
                ? Object.values(e.response.data.errors).flat().join(', ')
                : (e.response?.data?.message ?? 'Terjadi kesalahan');
            toast.error(msg);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/admin/users/${del.id}`);
            toast.success('User dihapus');
            load();
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'Gagal menghapus user');
        } finally {
            setDel({ open: false, id: null });
        }
    };

    const toggleStatus = async (id) => {
        try {
            await axios.put(`/api/admin/users/${id}/toggle-status`);
            load();
        } catch (e) {
            toast.error('Gagal mengubah status');
        }
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Manajemen User" subtitle="Kelola akun dan hak akses pengguna"
                action={
                    <Button variant="primary" size="sm" onClick={() => { reset({}); setAdd(true); }}>
                        <PlusIcon className="w-4 h-4" />Tambah User
                    </Button>
                }
            />

            {/* Filter tabs */}
            <div className="tab-bar w-fit">
                <button onClick={() => { setFilter('all'); setPage(1); }} className={filter === 'all' ? 'tab-active' : 'tab-item'}>
                    Semua User
                </button>
                <button onClick={() => { setFilter('pending'); setPage(1); }} className={filter === 'pending' ? 'tab-active' : 'tab-item'}>
                    Menunggu Persetujuan
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama atau email…" className="input input-icon" />
                </div>
                <Button type="submit" variant="outline" size="sm">Cari</Button>
            </form>

            {/* Table */}
            <Card>
                {loading ? (
                    <div className="p-5"><TableSkeleton rows={6} cols={6} /></div>
                ) : users.length === 0 ? (
                    <EmptyState icon={ShieldCheckIcon} title="Tidak ada user" desc="Coba ubah kata kunci pencarian" />
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                {['Pengguna', 'Email', 'Role', 'Status', 'Persetujuan', 'Bergabung', 'Aksi'].map(h => (
                                    <th key={h} className="tbl-head">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const roleName = u.roles?.[0]?.name ?? 'pasien';
                                const r = ROLE_STYLES[roleName] || { v: 'neutral', label: roleName };
                                return (
                                    <tr key={u.id} className="tbl-row">
                                        <td className="tbl-cell">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={u.name} size="sm"
                                                    color={roleName === 'dokter' ? 'bg-violet-100 text-violet-700' : undefined} />
                                                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="tbl-cell text-xs text-slate-500">{u.email}</td>
                                        <td className="tbl-cell">
                                            <Badge variant={r.v}>{r.label}</Badge>
                                        </td>
                                        <td className="tbl-cell">
                                            <button onClick={() => toggleStatus(u.id)} title="Klik untuk toggle status">
                                                <Badge variant={u.is_active ? 'success' : 'neutral'}
                                                    pulse={u.is_active}>
                                                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </button>
                                        </td>
                                        <td className="tbl-cell">
                                            {roleName === 'pasien' ? (
                                                <span className="text-xs text-slate-300">-</span>
                                            ) : u.approval_status === 'approved' ? (
                                                <Badge variant="success">Disetujui</Badge>
                                            ) : u.approval_status === 'rejected' ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="danger">Ditolak</Badge>
                                                    <button onClick={() => handleApproval(u.id, 'approved')} className="text-[11px] font-semibold text-brand-600 hover:underline">Setujui</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="warning">Menunggu</Badge>
                                                    <button onClick={() => handleApproval(u.id, 'approved')} className="text-[11px] font-semibold text-brand-600 hover:underline">Setujui</button>
                                                    <button onClick={() => handleApproval(u.id, 'rejected')} className="text-[11px] font-semibold text-rose-600 hover:underline">Tolak</button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="tbl-cell text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="tbl-cell">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => { setEdit(u); reset({ name: u.name, email: u.email, phone: u.phone ?? '', role: roleName }); }}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDel({ open: true, id: u.id })}
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
                )}
                <Pagination meta={meta} onChange={setPage} />
            </Card>

            {/* Add / Edit Modal */}
            <Modal
                open={addOpen || !!editUser}
                onClose={() => { setAdd(false); setEdit(null); reset(); }}
                title={editUser ? 'Edit User' : 'Tambah User Baru'}
                size="md"
                icon={<ShieldCheckIcon className="w-4 h-4 text-slate-500" />}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="field-label">Nama Lengkap</label>
                        <input className="input" placeholder="Nama pengguna"
                            {...register('name', { required: 'Wajib diisi' })} />
                        {errors.name && <p className="field-error">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="field-label">Email</label>
                        <input type="email" className="input" placeholder="email@klinik.id"
                            {...register('email', { required: 'Wajib diisi' })} />
                        {errors.email && <p className="field-error">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="field-label">No. Telepon</label>
                        <input type="tel" className="input" placeholder="08xx"
                            {...register('phone', { pattern: { value: /^[0-9]*$/, message: 'Hanya boleh angka' }, maxLength: { value: 15, message: 'Maks. 15 digit' } })} />
                        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
                    </div>
                    <div>
                        <label className="field-label">Role</label>
                        <select className="input" {...register('role', { required: 'Wajib dipilih' })}>
                            <option value="">-- Pilih Role --</option>
                            <option value="admin">Admin</option>
                            <option value="dokter">Dokter</option>
                            <option value="perawat">Perawat</option>
                            <option value="pasien">Pasien</option>
                        </select>
                        {errors.role && <p className="field-error">{errors.role.message}</p>}
                    </div>
                    {!editUser && (
                        <div>
                            <label className="field-label">Password</label>
                            <input type="password" className="input" placeholder="Min. 8 karakter"
                                {...register('password', { required: 'Wajib diisi', minLength: { value: 8, message: 'Min. 8 karakter' } })} />
                            {errors.password && <p className="field-error">{errors.password.message}</p>}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" size="sm"
                            onClick={() => { setAdd(false); setEdit(null); reset(); }}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                            {editUser ? 'Simpan Perubahan' : 'Tambah User'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                open={del.open}
                onClose={() => setDel({ open: false, id: null })}
                title="Hapus User"
                message="Yakin ingin menghapus user ini? Data akan dipindahkan ke Log Aktivitas dan bisa dikembalikan."
                onConfirm={handleDelete}
            />
        </div>
    );
}
