<?php namespace App\Http\Controllers;
use App\Models\User; use Illuminate\Http\{Request,JsonResponse}; use Illuminate\Support\Facades\Hash;

class UserController extends Controller {
    public function index(Request $r): JsonResponse {
        $q=User::with(['roles', 'doctor:id,user_id,specialization,is_active'])->select('id','name','email','phone','avatar','approval_status','is_active','created_at')->orderByDesc('created_at');
        if ($r->filled('role')) $q->role($r->role);
        if ($r->filled('approval_status')) $q->where('approval_status', $r->approval_status);
        if ($r->filled('search')) { $s=$r->search; $q->where(fn($x)=>$x->where('name','like',"%$s%")->orWhere('email','like',"%$s%")); }
        return response()->json(['data'=>$q->paginate($r->get('per_page',20))]);
    }
    public function store(Request $r): JsonResponse {
        $data=$r->validate(['name'=>'required|string|max:255','email'=>'required|email|unique:users','password'=>'required|string|min:8','phone'=>'nullable|string|max:20','role'=>'required|exists:roles,name']);
        $user=User::create(['name'=>$data['name'],'email'=>$data['email'],'password'=>$data['password'],'phone'=>$data['phone']??null]);
        $user->assignRole($data['role']);
        return response()->json(['message'=>'User dibuat','data'=>$user->load('roles')],201);
    }
    public function show(User $user): JsonResponse { return response()->json(['data'=>$user->load('roles')]); }
    public function update(Request $r, User $user): JsonResponse {
        $data=$r->validate(['name'=>'sometimes|string|max:255','email'=>'sometimes|email|unique:users,email,'.$user->id,'phone'=>'nullable|string|max:20','role'=>'sometimes|exists:roles,name']);
        $role = $data['role'] ?? null;
        unset($data['role']);
        $user->update($data);
        if ($role) $user->syncRoles([$role]);
        return response()->json(['message'=>'User diperbarui','data'=>$user->fresh('roles')]);
    }
    public function destroy(User $user): JsonResponse {
        if ($user->id===auth()->id()) return response()->json(['message'=>'Tidak dapat hapus akun sendiri'],403);
        $user->logDeletion();
        $user->delete();
        return response()->json(['message'=>'User dihapus']);
    }
    public function toggleStatus(User $user): JsonResponse {
        $user->update(['is_active'=>!$user->is_active]);
        return response()->json(['message'=>'Status diubah','data'=>$user]);
    }
    public function assignRole(Request $r, User $user): JsonResponse {
        $r->validate(['role'=>'required|exists:roles,name']);
        $user->syncRoles([$r->role]);
        return response()->json(['message'=>'Role ditetapkan','data'=>$user->fresh('roles')]);
    }
    public function setApproval(Request $r, User $user): JsonResponse {
        $r->validate(['approval_status'=>'required|in:approved,rejected,pending']);
        $user->update(['approval_status'=>$r->approval_status]);

        // Activate / deactivate the linked doctor profile to match
        if ($user->doctor) {
            $user->doctor->update(['is_active' => $r->approval_status === 'approved']);
        }

        $messages = [
            'approved' => 'Akun disetujui',
            'rejected' => 'Akun ditolak',
            'pending'  => 'Status akun diubah menjadi menunggu persetujuan',
        ];

        if (in_array($r->approval_status, ['approved', 'rejected'])) {
            \App\Models\AppNotification::notify(
                $user->id,
                'account_' . $r->approval_status,
                $r->approval_status === 'approved' ? 'Akun Anda disetujui' : 'Akun Anda ditolak',
                $r->approval_status === 'approved'
                    ? 'Anda sekarang dapat menambah dan mengubah data di sistem.'
                    : 'Hubungi administrator klinik untuk informasi lebih lanjut.',
                '/profile'
            );
        }

        return response()->json(['message'=>$messages[$r->approval_status],'data'=>$user->fresh(['roles','doctor'])]);
    }
}
