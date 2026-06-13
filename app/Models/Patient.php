<?php namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\LogsDeletion;

class Patient extends Model
{
    use HasFactory, SoftDeletes, LogsDeletion;
    protected $fillable = [
        'user_id','name','nik','phone','birth_date','gender',
        'blood_type','address','bpjs','allergies','chronic_diseases','is_active',
    ];
    protected $casts = ['birth_date'=>'date','is_active'=>'boolean'];
    public function user()          { return $this->belongsTo(User::class); }
    public function appointments()  { return $this->hasMany(Appointment::class); }
    public function medicalRecords(){ return $this->hasMany(MedicalRecord::class); }
    public function getAgeAttribute(): int { return $this->birth_date?->age ?? 0; }
}
