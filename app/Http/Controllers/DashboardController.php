<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        try {
            $today = now()->toDateString();
            $user  = $request->user();

            if ($user->hasRole('pasien')) {
                return response()->json(['data' => $this->patientStats($user, $today)]);
            }

            if ($user->hasRole('dokter') && !$user->hasRole('admin')) {
                return response()->json(['data' => $this->doctorStats($user, $today)]);
            }

            if ($user->hasRole('perawat') && !$user->hasRole('admin')) {
                return response()->json(['data' => $this->nurseStats($today)]);
            }

            return response()->json(['data' => $this->adminStats($today)]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Dashboard stats error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Gagal memuat data dashboard',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    private function adminStats(string $today): array
    {
        return [
            'role' => 'admin',
            'appointments_today'   => Appointment::whereDate('appointment_date', $today)->count(),
            'appointments_waiting' => Appointment::whereDate('appointment_date', $today)->where('status', 'pending')->count(),
            'appointments_done'    => Appointment::whereDate('appointment_date', $today)->where('status', 'done')->count(),
            'appointments_in_progress' => Appointment::whereDate('appointment_date', $today)->where('status', 'in_progress')->count(),
            'total_patients'       => Patient::count(),
            'total_doctors'        => Doctor::where('is_active', true)->count(),

            'weekly_trend'  => $this->weeklyTrend(),
            'monthly_trend' => $this->monthlyTrend(),

            'recent_appointments' => Appointment::with([
                    'patient:id,name,phone',
                    'doctor:id,user_id,specialization',
                    'doctor.user:id,name',
                ])
                ->select('id','patient_id','doctor_id','appointment_date','appointment_time','queue_number','complaint','status')
                ->whereDate('appointment_date', $today)
                ->orderBy('appointment_time')
                ->limit(10)
                ->get(),
        ];
    }

    private function nurseStats(string $today): array
    {
        return [
            'role' => 'perawat',
            'appointments_today'   => Appointment::whereDate('appointment_date', $today)->count(),
            'appointments_waiting' => Appointment::whereDate('appointment_date', $today)->where('status', 'pending')->count(),
            'appointments_in_progress' => Appointment::whereDate('appointment_date', $today)->where('status', 'in_progress')->count(),
            'total_patients'       => Patient::count(),

            'instructions_pending' => \App\Models\CareInstruction::where('status', 'pending')->count(),
            'instructions_done_today' => \App\Models\CareInstruction::where('status', 'done')->whereDate('completed_at', $today)->count(),

            'pending_instructions' => \App\Models\CareInstruction::with(['patient:id,name', 'doctor:id,user_id', 'doctor.user:id,name'])
                ->whereIn('status', ['pending', 'in_progress'])
                ->orderByDesc('created_at')
                ->limit(8)
                ->get(),

            'recent_appointments' => Appointment::with([
                    'patient:id,name,phone',
                    'doctor:id,user_id,specialization',
                    'doctor.user:id,name',
                ])
                ->select('id','patient_id','doctor_id','appointment_date','appointment_time','queue_number','complaint','status')
                ->whereDate('appointment_date', $today)
                ->orderBy('appointment_time')
                ->limit(10)
                ->get(),
        ];
    }

    private function doctorStats($user, string $today): array
    {
        $doctorId = $user->doctor?->id;

        $base = Appointment::where('doctor_id', $doctorId);

        return [
            'role' => 'dokter',
            'appointments_today'      => (clone $base)->whereDate('appointment_date', $today)->count(),
            'appointments_waiting'    => (clone $base)->whereDate('appointment_date', $today)->where('status', 'pending')->count(),
            'appointments_done'       => (clone $base)->whereDate('appointment_date', $today)->where('status', 'done')->count(),
            'appointments_in_progress'=> (clone $base)->whereDate('appointment_date', $today)->where('status', 'in_progress')->count(),
            'total_patients_handled'  => (clone $base)->distinct('patient_id')->count('patient_id'),

            'weekly_trend' => collect(range(6, 0))->map(function ($daysAgo) use ($doctorId) {
                $date = now()->subDays($daysAgo);
                return [
                    'day'   => self::DAY_ABBR[$date->dayOfWeek],
                    'date'  => $date->toDateString(),
                    'count' => Appointment::where('doctor_id', $doctorId)->whereDate('appointment_date', $date->toDateString())->count(),
                ];
            })->values(),

            'today_queue' => (clone $base)->with([
                'patient:id,name,phone',
            ])
            ->select('id','patient_id','doctor_id','appointment_date','appointment_time','queue_number','appointment_time','status')
                ->whereDate('appointment_date', $today)
                ->orderBy('appointment_time')
                ->limit(10)
                ->get(),
        ];
    }

    private function patientStats($user, string $today): array
    {
        $patientId = $user->patient?->id;

        $upcoming = Appointment::with('doctor.user')
            ->where('patient_id', $patientId)
            ->where('appointment_date', '>=', $today)
            ->whereNotIn('status', ['cancelled', 'done'])
            ->orderBy('appointment_date')->orderBy('appointment_time')
            ->limit(5)
            ->get();

        $history = Appointment::with('doctor.user')
            ->where('patient_id', $patientId)
            ->where('status', 'done')
            ->orderByDesc('appointment_date')
            ->limit(5)
            ->get();

        return [
            'role' => 'pasien',
            'upcoming_appointments' => $upcoming,
            'total_visits'          => Appointment::where('patient_id', $patientId)->where('status', 'done')->count(),
            'recent_history'        => $history,
            'medical_records_count' => \App\Models\MedicalRecord::where('patient_id', $patientId)->count(),
        ];
    }

    private const DAY_ABBR = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    private const MONTH_ABBR = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    private function weeklyTrend()
    {
        return collect(range(6, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo);
            return [
                'day'   => self::DAY_ABBR[$date->dayOfWeek],
                'date'  => $date->toDateString(),
                'count' => Appointment::whereDate('appointment_date', $date->toDateString())->count(),
            ];
        })->values();
    }

    private function monthlyTrend()
    {
        return collect(range(5, 0))->map(function ($monthsAgo) {
            $date = now()->subMonths($monthsAgo);
            return [
                'month'   => self::MONTH_ABBR[$date->month - 1],
                'patients' => Appointment::whereYear('appointment_date', $date->year)
                    ->whereMonth('appointment_date', $date->month)
                    ->distinct('patient_id')->count('patient_id'),
            ];
        })->values();
    }
}
