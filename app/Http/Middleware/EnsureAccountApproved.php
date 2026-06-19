<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAccountApproved
{
    /**
     * Allow read-only (GET) requests through regardless of approval status,
     * but block write actions (POST/PUT/PATCH/DELETE) for dokter/perawat
     * accounts that are still pending or rejected by an admin.
     */
    public function handle(Request $request, Closure $next)
    {
        // Cheap check first: only GET/HEAD requests are exempt, so skip the
        // role lookup entirely for read requests (the common case).
        if ($request->isMethod('GET') || $request->isMethod('HEAD')) {
            return $next($request);
        }

        $user = $request->user();

        if ($user && $user->needsApproval()) {
            return response()->json([
                'message' => $user->approval_status === 'rejected'
                    ? 'Akun Anda ditolak oleh admin. Hubungi administrator klinik.'
                    : 'Akun Anda masih menunggu persetujuan admin. Anda belum dapat melakukan aksi ini.',
                'approval_status' => $user->approval_status,
            ], 403);
        }

        return $next($request);
    }
}
