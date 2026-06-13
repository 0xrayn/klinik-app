<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\LogsDeletion;

class Doctor extends Model
{
    use HasFactory, SoftDeletes, LogsDeletion;

    protected $fillable = [
        'user_id', 'specialization', 'license_number', 'education',
        'bio', 'photo_url', 'experience_years', 'consultation_fee', 'rating',
        'total_reviews', 'is_active',
    ];

    public function activityLabel(): string
    {
        return $this->user?->name ?? ('Dokter #' . $this->id);
    }

    protected $casts = [
        'education'        => 'array',
        'is_active'        => 'boolean',
        'consultation_fee' => 'decimal:2',
        'rating'           => 'decimal:1',
        'total_reviews'    => 'integer',
        'experience_years' => 'integer',
    ];

    public function user()       { return $this->belongsTo(User::class); }
    public function schedules()  { return $this->hasMany(Schedule::class); }
    public function appointments(){ return $this->hasMany(Appointment::class); }
    public function medicalRecords(){ return $this->hasMany(MedicalRecord::class); }
}
