<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = ActivityLog::with('user')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'restored') {
                $q->whereNotNull('restored_at');
            } elseif ($status === 'deleted') {
                $q->whereNull('restored_at');
            }
        }

        return response()->json(['data' => $q->paginate($request->get('per_page', 20))]);
    }

    public function restore(ActivityLog $activityLog): JsonResponse
    {
        if ($activityLog->restored_at) {
            return response()->json(['message' => 'Data ini sudah dikembalikan sebelumnya'], 422);
        }

        $modelClass = $activityLog->subject_type;
        if (!class_exists($modelClass)) {
            return response()->json(['message' => 'Tipe data tidak dikenali'], 422);
        }

        $record = $modelClass::withTrashed()->find($activityLog->subject_id);
        if (!$record) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $record->restore();
        $activityLog->update(['restored_at' => now()]);

        return response()->json(['message' => 'Data berhasil dikembalikan']);
    }
}
