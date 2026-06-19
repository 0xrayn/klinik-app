<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\LogsDeletion;

class CareInstruction extends Model
{
    use HasFactory, SoftDeletes, LogsDeletion;

    protected $fillable = [
        'medical_record_id', 'patient_id', 'doctor_id', 'assigned_nurse_id',
        'instruction', 'notes', 'status',
        'completed_by', 'completion_notes', 'completed_at',
    ];

    protected $casts = ['completed_at' => 'datetime'];

    public function medicalRecord() { return $this->belongsTo(MedicalRecord::class); }
    public function patient()       { return $this->belongsTo(Patient::class); }
    public function doctor()        { return $this->belongsTo(Doctor::class); }
    public function assignedNurse() { return $this->belongsTo(User::class, 'assigned_nurse_id'); }
    public function completer()     { return $this->belongsTo(User::class, 'completed_by'); }

    public function activityLabel(): string
    {
        return $this->instruction ?? ('#' . $this->getKey());
    }
}
