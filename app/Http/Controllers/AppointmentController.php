<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $order = $request->get('order', 'desc');
        $q = Appointment::with([
                'patient:id,name,phone',
                'doctor:id,user_id,specialization',
                'doctor.user:id,name',
            ])
            ->select('id','patient_id','doctor_id','appointment_date','appointment_time','queue_number','complaint','status','created_by')
            ->orderBy('appointment_date', $order)
            ->orderBy('appointment_time', $order);

        if ($request->filled('status'))    $q->where('status', $request->status);
        if ($request->filled('date'))      $q->whereDate('appointment_date', $request->date);
        if ($request->filled('date_from')) $q->whereDate('appointment_date', '>=', $request->date_from);
        if ($request->filled('doctor_id')) $q->where('doctor_id', $request->doctor_id);

        $user = $request->user();
        if ($user->hasRole('pasien') && $user->patient) {
            $q->where('patient_id', $user->patient->id);
        } elseif ($user->hasRole('dokter') && $user->doctor && !$user->hasRole('admin')) {
            $q->where('doctor_id', $user->doctor->id);
        }

        return response()->json(['data' => $q->paginate($request->get('per_page', 15))]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'patient_name'     => 'required_without:patient_id|string|max:255',
            'patient_id'       => 'nullable|exists:patients,id',
            'nik'              => 'required_without:patient_id|digits:16',
            'phone'            => 'required_without:patient_id|digits_between:9,15',
            'birth_date'       => 'nullable|date',
            'address'          => 'nullable|string',
            'doctor_id'        => 'required|exists:doctors,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'complaint'        => 'required|string',
            'notes'            => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data, $request) {
            if (empty($data['patient_id'])) {
                $patient = Patient::create([
                    'name'       => $data['patient_name'],
                    'nik'        => $data['nik'],
                    'phone'      => $data['phone'],
                    'birth_date' => $data['birth_date'] ?? null,
                    'address'    => $data['address'] ?? null,
                    'user_id'    => $request->user()->id,
                ]);
                $data['patient_id'] = $patient->id;
            }

            $count   = Appointment::whereDate('appointment_date', $data['appointment_date'])->count() + 1;
            $queue   = strtoupper(substr($data['appointment_date'], 5, 2)) . str_pad($count, 3, '0', STR_PAD_LEFT);

            $appt = Appointment::create([
                'patient_id'       => $data['patient_id'],
                'doctor_id'        => $data['doctor_id'],
                'appointment_date' => $data['appointment_date'],
                'appointment_time' => $data['appointment_time'],
                'complaint'        => $data['complaint'],
                'notes'            => $data['notes'] ?? null,
                'status'           => 'pending',
                'queue_number'     => $queue,
                'created_by'       => $request->user()->id,
            ]);

            $appt->load(['patient', 'doctor.user']);

            if ($appt->doctor?->user_id) {
                \App\Models\AppNotification::notify(
                    $appt->doctor->user_id,
                    'appointment_new',
                    'Janji temu baru',
                    "{$appt->patient->name} - {$appt->appointment_date} pukul " . substr($appt->appointment_time, 0, 5),
                    '/appointments'
                );
            }

            return response()->json([
                'message' => 'Janji temu berhasil dibuat',
                'data'    => $appt,
            ], 201);
        });
    }

    public function show(Appointment $appointment): JsonResponse
    {
        return response()->json(['data' => $appointment->load(['patient', 'doctor.user', 'medicalRecord'])]);
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $request->validate([
            'appointment_date' => 'sometimes|date|after_or_equal:today',
            'appointment_time' => 'sometimes|date_format:H:i',
            'complaint'        => 'sometimes|string',
            'notes'            => 'nullable|string',
            'status'           => 'sometimes|in:pending,confirmed,in_progress,done,cancelled',
        ]);
        $appointment->update($data);
        return response()->json(['message' => 'Janji temu diperbarui', 'data' => $appointment->fresh(['patient', 'doctor.user'])]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->logDeletion();
        $appointment->delete();
        return response()->json(['message' => 'Janji temu dihapus']);
    }

    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate(['status' => 'required|in:pending,confirmed,in_progress,done,cancelled']);

        $user = $request->user();
        if ($user->hasRole('dokter') && !$user->hasRole('admin')) {
            if (!$user->doctor || $appointment->doctor_id !== $user->doctor->id) {
                return response()->json(['message' => 'Anda hanya dapat mengubah status janji temu Anda sendiri'], 403);
            }
        }

        $appointment->update(['status' => $request->status]);
        return response()->json(['message' => 'Status diperbarui', 'data' => $appointment]);
    }
}
