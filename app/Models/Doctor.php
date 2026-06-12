<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'specialization', 'license_number', 'education',
        'bio', 'experience_years', 'consultation_fee', 'rating',
        'total_reviews', 'is_active',
    ];

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
