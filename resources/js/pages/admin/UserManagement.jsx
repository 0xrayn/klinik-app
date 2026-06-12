import React, { useState } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button, Avatar, Modal, ConfirmModal, SectionHeader } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const MOCK = [
    { id:1, name:'Admin Klinik',    email:'admin@klinik.id',   role:'admin',   status:'active',   created:'2024-01-01' },
    { id:2, name:'dr. Siti Rahayu', email:'dokter@klinik.id',  role:'dokter',  status:'active',   created:'2024-01-05' },
    { id:3, name:'Perawat Ana',     email:'perawat@klinik.id', role:'perawat', status:'active',   created:'2024-02-15' },
    { id:4, name:'Ahmad Fauzi',     email:'pasien@klinik.id',  role:'pasien',  status:'active',   created:'2024-06-10' },
    { id:5, name:'User Nonaktif',   email:'off@klinik.id',     role:'pasien',  status:'inactive', created:'2024-03-01' },
];

const ROLE_STYLES = {
    admin:   { v:'danger',  label:'Admin' },
    dokter:  { v:'info',    label:'Dokter' },
    perawat: { v:'purple',  label:'Perawat' },
    pasien:  { v:'neutral', label:'Pasien' },
};

export default function UserManagement() {
    const [users, setUsers] = useState(MOCK);
    const [addOpen, setAdd] = useState(false);
    const [editUser, setEdit] = useState(null);
    const [del, setDel]     = useState({ open: false, id: null });

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    // Stats
    const stats = Object.entries(ROLE_STYLES).map(([role, { v, label }]) => ({
        role, v, label, count: users.filter(u => u.role === role).length,
    }));

    const onSubmit = async (data) => {
        await new Promise(r => setTimeout(r, 600));
        if (editUser) {
            setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...data } : u));
            toast.success('User diperbarui');
            setEdit(null);
        } else {
            setUsers(prev => [...prev, { id: Date.now(), ...data, status: 'active', created: new Date().toISOString().split('T')[0] }]);
            toast.success('User berhasil ditambahkan');
            setAdd(false);
        }
        reset();
    };

    const handleDelete = () => {
        setUsers(prev => prev.filter(u => u.id !== del.id));
        setDel({ open: false, id: null });
        toast.success('User dihapus');
    };

    const toggleStatus = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
        toast.success('Status diperbarui');
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <SectionHeader title="Manajemen User" subtitle="Kelola akun dan hak akses pengguna"
                action={
                    <Button variant="primary" size="sm" onClick={() => { reset(); setAdd(true); }}>
                        <PlusIcon className="w-4 h-4" />Tambah User
                    </Button>
                }
            />

            {/* Role stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map(s => (
                    <Card key={s.role} className="p-4 flex items-center gap-3">
                        <div className="text-2xl font-bold text-slate-900">{s.count}</div>
                        <Badge variant={s.v}>{s.label}</Badge>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                {['Pengguna', 'Email', 'Role', 'Status', 'Bergabung', 'Aksi'].map(h => (
                                    <th key={h} className="tbl-head">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const r = ROLE_STYLES[u.role] || { v: 'neutral', label: u.role };
                                return (
                                    <tr key={u.id} className="tbl-row">
                                        <td className="tbl-cell">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={u.name} size="sm"
                                                    color={u.role === 'dokter' ? 'bg-violet-100 text-violet-700' : undefined} />
                                                <span className="font-semibold text-slate-800 text-sm">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="tbl-cell text-xs text-slate-500">{u.email}</td>
                                        <td className="tbl-cell">
                                            <Badge variant={r.v}>{r.label}</Badge>
                                        </td>
                                        <td className="tbl-cell">
                                            <button onClick={() => toggleStatus(u.id)} title="Klik untuk toggle status">
                                                <Badge variant={u.status === 'active' ? 'success' : 'neutral'}
                                                    pulse={u.status === 'active'}>
                                                    {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </button>
                                        </td>
                                        <td className="tbl-cell text-xs text-slate-400">{u.created}</td>
                                        <td className="tbl-cell">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => { setEdit(u); reset({ name: u.name, email: u.email, role: u.role }); }}
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
                    </div>
                    <div>
                        <label className="field-label">Email</label>
                        <input type="email" className="input" placeholder="email@klinik.id"
                            {...register('email', { required: 'Wajib diisi' })} />
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
                    </div>
                    {!editUser && (
                        <div>
                            <label className="field-label">Password</label>
                            <input type="password" className="input" placeholder="Min. 8 karakter"
                                {...register('password', { required: 'Wajib diisi', minLength: { value: 8, message: 'Min. 8 karakter' } })} />
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
                message="Yakin ingin menghapus user ini? Semua data terkait akan ikut terhapus."
                onConfirm={handleDelete}
            />
        </div>
    );
}
