<?php namespace App\Http\Controllers;
use App\Models\Schedule; use Illuminate\Http\{Request,JsonResponse};

class ScheduleController extends Controller {
    public function index(Request $r): JsonResponse {
        $q = Schedule::with('doctor.user')->where('is_active',true)->orderBy('day_of_week')->orderBy('start_time');
        if ($r->filled('doctor_id')) $q->where('doctor_id',$r->doctor_id);
        return response()->json(['data'=>$q->get()]);
    }
    public function show(Schedule $schedule): JsonResponse {
        return response()->json(['data'=>$schedule->load('doctor.user')]);
    }
    public function store(Request $r): JsonResponse {
        $data=$r->validate(['doctor_id'=>'required|exists:doctors,id','day_of_week'=>'required|integer|min:0|max:6','start_time'=>'required|date_format:H:i','end_time'=>'required|date_format:H:i|after:start_time','quota'=>'required|integer|min:1|max:50']);
        $sch = Schedule::create($data+['is_active'=>true]);
        return response()->json(['message'=>'Jadwal ditambahkan','data'=>$sch->load('doctor.user')],201);
    }
    public function update(Request $r, Schedule $schedule): JsonResponse {
        $data=$r->validate(['day_of_week'=>'sometimes|integer|min:0|max:6','start_time'=>'sometimes|date_format:H:i','end_time'=>'sometimes|date_format:H:i','quota'=>'sometimes|integer|min:1|max:50','is_active'=>'sometimes|boolean']);
        $schedule->update($data);
        return response()->json(['message'=>'Jadwal diperbarui','data'=>$schedule]);
    }
    public function destroy(Schedule $schedule): JsonResponse {
        $schedule->update(['is_active'=>false]);
        return response()->json(['message'=>'Jadwal dinonaktifkan']);
    }
}
