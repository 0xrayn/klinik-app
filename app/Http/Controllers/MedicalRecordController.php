<?php namespace App\Http\Controllers;
use App\Models\{MedicalRecord,Appointment}; use Illuminate\Http\{Request,JsonResponse};

class MedicalRecordController extends Controller {
    public function index(Request $r): JsonResponse {
        $q = MedicalRecord::with(['patient','doctor.user'])->orderByDesc('examination_date');
        if ($r->filled('patient_id')) $q->where('patient_id',$r->patient_id);
        if ($r->filled('search')) { $s=$r->search; $q->where(fn($x)=>$x->where('diagnosis','like',"%$s%")->orWhere('icd_code','like',"%$s%")->orWhereHas('patient',fn($y)=>$y->where('name','like',"%$s%"))); }
        return response()->json(['data'=>$q->paginate($r->get('per_page',15))]);
    }
    public function store(Request $r): JsonResponse {
        $data=$r->validate(['patient_id'=>'required|exists:patients,id','appointment_id'=>'nullable|exists:appointments,id','diagnosis'=>'required|string','icd_code'=>'required|string|max:10','prescription'=>'nullable|string','treatment'=>'nullable|string','notes'=>'nullable|string','examination_date'=>'required|date','status'=>'required|in:draft,final']);
        $data['doctor_id']=$r->user()->doctor?->id;
        $rec=MedicalRecord::create($data);
        if (!empty($data['appointment_id']) && $data['status']==='final') {
            Appointment::find($data['appointment_id'])?->update(['status'=>'done']);
        }
        return response()->json(['message'=>'Rekam medis disimpan','data'=>$rec->load(['patient','doctor.user'])],201);
    }
    public function show(MedicalRecord $medicalRecord): JsonResponse {
        return response()->json(['data'=>$medicalRecord->load(['patient','doctor.user','appointment'])]);
    }
    public function update(Request $r, MedicalRecord $medicalRecord): JsonResponse {
        $data=$r->validate(['diagnosis'=>'sometimes|string','icd_code'=>'sometimes|string|max:10','prescription'=>'nullable|string','treatment'=>'nullable|string','notes'=>'nullable|string','status'=>'sometimes|in:draft,final']);
        $medicalRecord->update($data);
        return response()->json(['message'=>'Rekam medis diperbarui','data'=>$medicalRecord->fresh(['patient','doctor.user'])]);
    }
    public function destroy(MedicalRecord $medicalRecord): JsonResponse {
        $medicalRecord->delete();
        return response()->json(['message'=>'Rekam medis dihapus']);
    }
}
