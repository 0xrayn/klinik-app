<?php namespace App\Http\Controllers;
use App\Models\Doctor; use Illuminate\Http\{Request,JsonResponse}; use Carbon\Carbon;

class DoctorController extends Controller {
    public function index(Request $r): JsonResponse {
        $q = Doctor::with('user')->where('is_active',true);
        if ($r->filled('specialization')) $q->where('specialization',$r->specialization);
        if ($r->filled('search')) $q->whereHas('user',fn($x)=>$x->where('name','like','%'.$r->search.'%'));
        return response()->json(['data'=>$q->paginate($r->get('per_page',12))]);
    }
    public function show(Doctor $doctor): JsonResponse {
        return response()->json(['data'=>$doctor->load(['user','schedules'])]);
    }
    public function schedules(Doctor $doctor): JsonResponse {
        return response()->json(['data'=>$doctor->schedules()->where('is_active',true)->get()]);
    }
    public function availableSlots(Request $r, Doctor $doctor): JsonResponse {
        $r->validate(['date'=>'required|date|after_or_equal:today']);
        $day = Carbon::parse($r->date)->dayOfWeek;
        $sch = $doctor->schedules()->where('day_of_week',$day)->where('is_active',true)->first();
        if (!$sch) return response()->json(['data'=>[]]);
        $slots=[]; $s=Carbon::parse($sch->start_time); $e=Carbon::parse($sch->end_time);
        while($s<$e){
            $t=$s->format('H:i');
            $booked=\App\Models\Appointment::where('doctor_id',$doctor->id)->whereDate('appointment_date',$r->date)->where('appointment_time',$t)->whereNotIn('status',['cancelled'])->exists();
            $slots[]=['time'=>$t,'available'=>!$booked];
            $s->addMinutes(30);
        }
        return response()->json(['data'=>$slots]);
    }
}
