<?php namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\LogsDeletion;

class Appointment extends Model
{
    use HasFactory, SoftDeletes, LogsDeletion;
    protected $fillable = [
        'patient_id','doctor_id','appointment_date','appointment_time',
        'queue_number','complaint','notes','status','created_by',
    ];
    protected $casts = ['appointment_date'=>'date:Y-m-d'];
    const STATUSES = ['pending','confirmed','in_progress','done','cancelled'];

    public function activityLabel(): string
    {
        return 'Janji Temu #' . $this->queue_number;
    }

    public function patient()      { return $this->belongsTo(Patient::class); }
    public function doctor()       { return $this->belongsTo(Doctor::class); }
    public function medicalRecord(){ return $this->hasOne(MedicalRecord::class); }
    public function createdBy()    { return $this->belongsTo(User::class,'created_by'); }
}
