<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $role = $request->input('role', 'pasien');
        if (!in_array($role, ['pasien', 'dokter', 'perawat'])) {
            $role = 'pasien';
        }

        $rules = [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'required|string|max:20',
        ];

        if ($role === 'dokter') {
            $rules['specialization'] = 'required|string|max:255';
            $rules['license_number'] = 'required|string|max:255|unique:doctors';
        }

        $data = $request->validate($rules);

        // Pasien accounts are usable immediately. Dokter/perawat accounts can log in,
        // but write actions (input rekam medis, etc.) are blocked until an admin approves them.
        $approvalStatus = $role === 'pasien' ? 'approved' : 'pending';

        $user = User::create([
            'name'            => $data['name'],
            'email'           => $data['email'],
            'password'        => $data['password'],
            'phone'           => $data['phone'],
            'approval_status' => $approvalStatus,
        ]);
        $user->assignRole($role);

        if ($role === 'dokter') {
            $user->doctor()->create([
                'specialization' => $data['specialization'],
                'license_number' => $data['license_number'],
                'is_active'      => false, // activated by admin upon approval
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load('roles', 'doctor');

        if ($approvalStatus === 'pending') {
            \App\Models\AppNotification::notifyRole('admin', 'account_pending',
                'Akun baru menunggu persetujuan',
                "{$user->name} mendaftar sebagai " . ucfirst($role) . ' dan menunggu persetujuan.',
                '/admin/users?filter=pending');
        }

        return response()->json([
            'message' => $approvalStatus === 'pending'
                ? 'Registrasi berhasil. Akun Anda menunggu persetujuan admin sebelum dapat menginput data.'
                : 'Registrasi berhasil',
            'data' => compact('user', 'token'),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Email atau password salah.']);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages(['email' => 'Akun Anda tidak aktif.']);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load('roles', 'doctor', 'patient');

        return response()->json(['message' => 'Login berhasil', 'data' => compact('user', 'token')]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->load('roles', 'doctor', 'patient')]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);
        $user->update($data);
        return response()->json(['message' => 'Profil diperbarui', 'data' => $user]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user = $request->user();

        if ($user->avatar) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json(['message' => 'Foto profil diperbarui', 'data' => $user->fresh()]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|string|min:8|confirmed',
        ]);
        $user = $request->user();
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'Password saat ini salah.']);
        }
        $user->update(['password' => $request->password]);
        return response()->json(['message' => 'Password berhasil diubah']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        Password::sendResetLink($request->only('email'));
        return response()->json(['message' => 'Link reset password dikirim ke email']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
                $user->tokens()->delete();
            }
        );
        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password berhasil direset']);
        }
        throw ValidationException::withMessages(['email' => __($status)]);
    }
}
