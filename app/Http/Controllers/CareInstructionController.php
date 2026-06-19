<?php

namespace App\Http\Controllers;

use App\Models\CareInstruction;
use App\Models\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CareInstructionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $q = CareInstruction::with(['patient:id,name', 'doctor:id,user_id', 'doctor.user:id,name', 'assignedNurse:id,name']);

        // Dokter sees instructions they wrote; perawat sees ones assigned to all nurses (or themselves)
        if ($user->hasRole('dokter') && !$user->hasRole('admin')) {
            $q->where('doctor_id', $user->doctor?->id);
        }

        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('patient_id')) $q->where('patient_id', $request->patient_id);

        return response()->json(['data' => $q->orderByDesc('created_at')->paginate($request->get('per_page', 15))]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'medical_record_id' => 'required|exists:medical_records,id',
            'patient_id'         => 'required|exists:patients,id',
            'instruction'        => 'required|string|max:255',
            'notes'              => 'nullable|string',
        ]);

        $instruction = CareInstruction::create([
            ...$data,
            'doctor_id' => $user->doctor?->id,
            'status'    => 'pending',
        ]);

        // Notify all nurses that a new instruction is waiting
        AppNotification::notifyRole('perawat', 'care_instruction_new',
            'Instruksi perawatan baru',
            $data['instruction'],
            '/care-instructions');

        return response()->json(['message' => 'Instruksi berhasil dikirim ke perawat', 'data' => $instruction->load(['patient','doctor.user'])], 201);
    }

    public function complete(Request $request, CareInstruction $careInstruction): JsonResponse
    {
        $data = $request->validate([
            'completion_notes' => 'nullable|string',
        ]);

        $careInstruction->update([
            'status'           => 'done',
            'completed_by'     => $request->user()->id,
            'completion_notes' => $data['completion_notes'] ?? null,
            'completed_at'     => now(),
        ]);

        // Notify the doctor that their instruction was carried out
        if ($careInstruction->doctor?->user_id) {
            AppNotification::notify(
                $careInstruction->doctor->user_id,
                'care_instruction_done',
                'Instruksi perawatan selesai dilaksanakan',
                $careInstruction->instruction,
                '/care-instructions'
            );
        }

        return response()->json(['message' => 'Instruksi ditandai selesai', 'data' => $careInstruction]);
    }

    public function claim(Request $request, CareInstruction $careInstruction): JsonResponse
    {
        $careInstruction->update([
            'assigned_nurse_id' => $request->user()->id,
            'status'            => 'in_progress',
        ]);

        return response()->json(['message' => 'Instruksi diambil', 'data' => $careInstruction]);
    }

    public function destroy(CareInstruction $careInstruction): JsonResponse
    {
        $careInstruction->logDeletion();
        $careInstruction->delete();
        return response()->json(['message' => 'Instruksi dihapus']);
    }
}
