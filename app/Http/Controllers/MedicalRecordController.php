<?php namespace App\Http\Controllers;
use App\Models\{MedicalRecord,Appointment}; use Illuminate\Http\{Request,JsonResponse};

class MedicalRecordController extends Controller {
    public function index(Request $r): JsonResponse {
        $user = $r->user();
        $q = MedicalRecord::with(['patient:id,name','doctor:id,user_id','doctor.user:id,name'])
            ->select('id','patient_id','doctor_id','diagnosis','icd_code','examination_date','status')
            ->orderByDesc('examination_date');

        // Dokter can only see records they personally wrote
        if ($user->hasRole('dokter') && !$user->hasRole('admin')) {
            $q->where('doctor_id', $user->doctor?->id);
        }

        if ($r->filled('patient_id')) $q->where('patient_id', $r->patient_id);
        if ($r->filled('search')) {
            $s = $r->search;
            $q->where(fn($x) => $x->where('diagnosis','like',"%$s%")
                ->orWhere('icd_code','like',"%$s%")
                ->orWhereHas('patient', fn($y) => $y->where('name','like',"%$s%")));
        }
        return response()->json(['data' => $q->paginate($r->get('per_page',15))]);
    }
    public function store(Request $r): JsonResponse {
        $user = $r->user();
        $data = $r->validate([
            'patient_id'      => 'required|exists:patients,id',
            'appointment_id'  => 'nullable|exists:appointments,id',
            'diagnosis'       => 'required|string',
            'icd_code'        => 'required|string|max:10',
            'prescription'    => 'nullable|string',
            'treatment'       => 'nullable|string',
            'notes'           => 'nullable|string',
            'examination_date'=> 'required|date',
            'status'          => 'required|in:draft,final',
        ]);

        // Dokter can only write records for patients that have an appointment with them
        if ($user->hasRole('dokter') && !$user->hasRole('admin')) {
            $doctorId = $user->doctor?->id;
            $hasAppt = \App\Models\Appointment::where('patient_id', $data['patient_id'])
                ->where('doctor_id', $doctorId)
                ->exists();
            if (!$hasAppt) {
                return response()->json(['message' => 'Anda hanya dapat membuat rekam medis untuk pasien yang terdaftar di antrian Anda.'], 403);
            }
            $data['doctor_id'] = $doctorId;
        } else {
            $data['doctor_id'] = $user->doctor?->id ?? null;
        }

        $rec = MedicalRecord::create($data);
        if (!empty($data['appointment_id']) && $data['status'] === 'final') {
            Appointment::find($data['appointment_id'])?->update(['status' => 'done']);
        }
        return response()->json(['message' => 'Rekam medis disimpan', 'data' => $rec->load(['patient:id,name','doctor.user:id,name'])], 201);
    }

    public function show(MedicalRecord $medicalRecord): JsonResponse {
        return response()->json(['data' => $medicalRecord->load(['patient','doctor.user','appointment'])]);
    }

    public function update(Request $r, MedicalRecord $medicalRecord): JsonResponse {
        // Dokter can only edit their own records
        $user = $r->user();
        if ($user->hasRole('dokter') && !$user->hasRole('admin')) {
            if ($medicalRecord->doctor_id !== $user->doctor?->id) {
                return response()->json(['message' => 'Anda hanya dapat mengedit rekam medis yang Anda buat sendiri.'], 403);
            }
        }
        $data = $r->validate([
            'diagnosis'   => 'sometimes|string',
            'icd_code'    => 'sometimes|string|max:10',
            'prescription'=> 'nullable|string',
            'treatment'   => 'nullable|string',
            'notes'       => 'nullable|string',
            'status'      => 'sometimes|in:draft,final',
        ]);
        $medicalRecord->update($data);
        return response()->json(['message' => 'Rekam medis diperbarui', 'data' => $medicalRecord->fresh(['patient:id,name','doctor.user:id,name'])]);
    }

    public function destroy(MedicalRecord $medicalRecord): JsonResponse {
        $medicalRecord->logDeletion();
        $medicalRecord->delete();
        return response()->json(['message' => 'Rekam medis dihapus']);
    }
}
