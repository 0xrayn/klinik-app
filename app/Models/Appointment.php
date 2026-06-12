<?php namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;
    protected $fillable = [
        'patient_id','doctor_id','appointment_date','appointment_time',
        'queue_number','complaint','notes','status','created_by',
    ];
    protected $casts = ['appointment_date'=>'date'];
    const STATUSES = ['pending','confirmed','in_progress','done','cancelled'];

    public function patient()      { return $this->belongsTo(Patient::class); }
    public function doctor()       { return $this->belongsTo(Doctor::class); }
    public function medicalRecord(){ return $this->hasOne(MedicalRecord::class); }
    public function createdBy()    { return $this->belongsTo(User::class,'created_by'); }
}
