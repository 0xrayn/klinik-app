<?php namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;
    protected $fillable = ['doctor_id','day_of_week','start_time','end_time','quota','is_active'];
    protected $casts    = ['is_active'=>'boolean','day_of_week'=>'integer','quota'=>'integer'];
    const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

    public function doctor() { return $this->belongsTo(Doctor::class); }
    public function getDayNameAttribute(): string { return self::DAYS[$this->day_of_week] ?? ''; }
}
