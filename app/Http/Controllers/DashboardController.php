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
        $today = now()->toDateString();

        $data = [
            'appointments_today'   => Appointment::whereDate('appointment_date', $today)->count(),
            'appointments_waiting' => Appointment::whereDate('appointment_date', $today)->where('status', 'pending')->count(),
            'appointments_done'    => Appointment::whereDate('appointment_date', $today)->where('status', 'done')->count(),
            'appointments_in_progress' => Appointment::whereDate('appointment_date', $today)->where('status', 'in_progress')->count(),
            'total_patients'       => Patient::count(),
            'total_doctors'        => Doctor::where('is_active', true)->count(),

            'weekly_trend' => collect(range(6, 0))->map(function ($daysAgo) {
                $date = now()->subDays($daysAgo);
                return [
                    'day'   => $date->locale('id')->isoFormat('ddd'),
                    'date'  => $date->toDateString(),
                    'count' => Appointment::whereDate('appointment_date', $date->toDateString())->count(),
                ];
            })->values(),

            'monthly_trend' => collect(range(5, 0))->map(function ($monthsAgo) {
                $date = now()->subMonths($monthsAgo);
                return [
                    'month'   => $date->locale('id')->isoFormat('MMM'),
                    'patients' => Appointment::whereYear('appointment_date', $date->year)
                        ->whereMonth('appointment_date', $date->month)
                        ->distinct('patient_id')->count('patient_id'),
                ];
            })->values(),

            'recent_appointments' => Appointment::with(['patient', 'doctor.user'])
                ->whereDate('appointment_date', $today)
                ->orderBy('appointment_time')
                ->limit(10)
                ->get(),
        ];

        return response()->json(['data' => $data]);
    }
}
