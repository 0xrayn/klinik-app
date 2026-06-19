<?php namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\LogsDeletion;

class MedicalRecord extends Model
{
    use HasFactory, SoftDeletes, LogsDeletion;
    protected $fillable = [
        'patient_id','doctor_id','appointment_id','diagnosis',
        'icd_code','prescription','treatment','notes','examination_date','status',
    ];
    protected $casts = ['examination_date'=>'date:Y-m-d'];

    public function activityLabel(): string
    {
        return 'Rekam Medis: ' . $this->diagnosis;
    }

    public function patient()    { return $this->belongsTo(Patient::class); }
    public function doctor()     { return $this->belongsTo(Doctor::class); }
    public function appointment(){ return $this->belongsTo(Appointment::class); }
}
