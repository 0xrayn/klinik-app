<?php namespace App\Http\Controllers;
use App\Models\Patient; use Illuminate\Http\{Request,JsonResponse};

class PatientController extends Controller {
    public function index(Request $r): JsonResponse {
        $q = Patient::with('user')->orderByDesc('created_at');
        if ($r->filled('search')) {
            $s=$r->search;
            $q->where(fn($x)=>$x->where('name','like',"%$s%")->orWhere('nik','like',"%$s%")->orWhere('phone','like',"%$s%"));
        }
        return response()->json(['data'=>$q->paginate($r->get('per_page',15))]);
    }
    public function store(Request $r): JsonResponse {
        $data=$r->validate([
            'name'=>'required|string|max:255','nik'=>'required|digits:16|unique:patients',
            'phone'=>'required|digits_between:9,15','birth_date'=>'required|date',
            'gender'=>'required|in:L,P','blood_type'=>'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'address'=>'required|string','bpjs'=>'nullable|string|max:20',
            'allergies'=>'nullable|string','chronic_diseases'=>'nullable|string',
        ]);
        return response()->json(['message'=>'Pasien ditambahkan','data'=>Patient::create($data)],201);
    }
    public function show(Patient $patient): JsonResponse {
        return response()->json(['data'=>$patient->load(['appointments.doctor.user','medicalRecords.doctor.user'])]);
    }
    public function update(Request $r, Patient $patient): JsonResponse {
        $user = $r->user();

        if ($user->hasRole('admin')) {
            // Admin can edit everything, including identity data
            $data = $r->validate([
                'name'=>'sometimes|string','phone'=>'sometimes|digits_between:9,15','birth_date'=>'sometimes|date',
                'gender'=>'sometimes|in:L,P','blood_type'=>'nullable','address'=>'sometimes|string',
                'bpjs'=>'nullable|string|max:20','allergies'=>'nullable|string','chronic_diseases'=>'nullable|string',
                'is_active'=>'sometimes|boolean',
            ]);
        } else {
            // Dokter/perawat may only add clinical notes, not edit patient identity (NIK, name, phone, address, etc.)
            $data = $r->validate([
                'blood_type'=>'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'allergies'=>'nullable|string','chronic_diseases'=>'nullable|string',
            ]);
        }

        $patient->update($data);
        return response()->json(['message'=>'Pasien diperbarui','data'=>$patient]);
    }
    public function destroy(Patient $patient): JsonResponse {
        $patient->logDeletion();
        $patient->delete();
        return response()->json(['message'=>'Pasien dihapus']);
    }

    /**
     * Returns the patient record linked to the currently logged-in user,
     * creating an empty shell record on first access so a pasien account
     * always has somewhere to store their self-reported health info.
     */
    public function me(Request $r): JsonResponse {
        $user = $r->user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => $patient]);
    }

    /**
     * Lets a pasien update their own self-reported health info
     * (allergies, chronic diseases, other medical history). They cannot
     * edit identity fields (NIK, name, etc.) here.
     */
    public function updateMe(Request $r): JsonResponse {
        $user = $r->user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['message' => 'Profil pasien belum tersedia. Lengkapi data melalui janji temu pertama Anda.'], 404);
        }

        $data = $r->validate([
            'allergies'        => 'nullable|string',
            'chronic_diseases' => 'nullable|string',
            'medical_history'  => 'nullable|string',
        ]);

        $patient->update($data);
        return response()->json(['message' => 'Riwayat kesehatan diperbarui', 'data' => $patient]);
    }
}
