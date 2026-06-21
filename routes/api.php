<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CareInstructionController;

/*
|──────────────────────────────────────────────────────────────
| Public Auth Routes
|──────────────────────────────────────────────────────────────
*/
Route::prefix('auth')->group(function () {
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
});

/*
|──────────────────────────────────────────────────────────────
| Protected Routes
|──────────────────────────────────────────────────────────────
*/
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ──────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::get('/me',                [AuthController::class, 'me']);
        Route::post('/logout',           [AuthController::class, 'logout']);
        Route::put('/profile',           [AuthController::class, 'updateProfile']);
        Route::post('/avatar',           [AuthController::class, 'uploadAvatar']);
        Route::put('/change-password',   [AuthController::class, 'changePassword']);
    });

    // ── Dashboard ─────────────────────────────────────────────
    Route::get('/dashboard/stats',   [DashboardController::class, 'stats']);

    // ── Notifications ─────────────────────────────────────────
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all',     [NotificationController::class, 'markAllRead']);

    // ── Appointments ──────────────────────────────────────────
    // Booking is handled by admin (front-desk) or the patient themselves.
    // Dokter and perawat assist with care but do not manage the appointment
    // queue itself.
    Route::middleware('role:admin|pasien')->group(function () {
        Route::apiResource('appointments', AppointmentController::class)->except(['index','show'])->middleware('approved');
    });

    // All authenticated roles that interact with appointments can read them
    // (filtered server-side: dokter sees only their own, pasien sees only theirs)
    Route::middleware('role:admin|perawat|pasien|dokter')->group(function () {
        Route::get('appointments', [AppointmentController::class, 'index']);
        Route::get('appointments/{appointment}', [AppointmentController::class, 'show']);
    });

    // Only dokter (own appointments) and admin can update appointment status.
    Route::middleware('role:admin|dokter')->group(function () {
        Route::put('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->middleware('approved');
    });

    // ── Doctors (public read) ─────────────────────────────────
    Route::get('doctors',                          [DoctorController::class, 'index']);
    Route::get('doctors/{doctor}',                 [DoctorController::class, 'show']);
    Route::get('doctors/{doctor}/schedules',       [DoctorController::class, 'schedules']);
    Route::get('doctors/{doctor}/available-slots', [DoctorController::class, 'availableSlots']);

    // ── Schedules ─────────────────────────────────────────────
    Route::get('schedules',          [ScheduleController::class, 'index']);
    Route::get('schedules/occupancy',[ScheduleController::class, 'occupancy']);
    Route::get('schedules/{schedule}',[ScheduleController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::post('schedules',              [ScheduleController::class, 'store']);
        Route::put('schedules/{schedule}',    [ScheduleController::class, 'update']);
        Route::delete('schedules/{schedule}', [ScheduleController::class, 'destroy']);
    });

    // ── Patient self-service (pasien role) ─────────────────────
    Route::get('/patients/me',  [PatientController::class, 'me']);
    Route::put('/patients/me',  [PatientController::class, 'updateMe']);

    // ── Patients ──────────────────────────────────────────────
    // Only admin manually registers a patient (e.g. walk-ins who can't self-register).
    Route::middleware('role:admin')->group(function () {
        Route::post('patients', [PatientController::class, 'store'])->middleware('approved');
        Route::delete('patients/{patient}', [PatientController::class, 'destroy'])->middleware('approved');
    });
    // Admin and perawat can update patient clinical notes (blood_type, allergies, etc).
    // Dokter is READ-ONLY for patient records -- they write to medical_records instead.
    Route::middleware('role:admin|perawat')->group(function () {
        Route::put('patients/{patient}', [PatientController::class, 'update'])->middleware('approved');
    });
    // All clinical roles can view patient list/detail.
    Route::middleware('role:admin|dokter|perawat')->group(function () {
        Route::get('patients', [PatientController::class, 'index']);
        Route::get('patients/{patient}', [PatientController::class, 'show']);
    });

    // ── Medical Records ───────────────────────────────────────
    // Diagnosis/prescription is a doctor's responsibility; perawat can only view.
    Route::middleware('role:admin|dokter')->group(function () {
        Route::apiResource('medical-records', MedicalRecordController::class)->except(['index','show'])->middleware('approved');
    });
    Route::middleware('role:admin|dokter|perawat')->group(function () {
        Route::get('medical-records', [MedicalRecordController::class, 'index']);
        Route::get('medical-records/{medicalRecord}', [MedicalRecordController::class, 'show']);
    });

    // ── Care Instructions (dokter -> perawat) ───────────────────
    // Dokter writes instructions tied to a medical record; perawat executes them.
    Route::middleware('role:admin|dokter|perawat')->group(function () {
        Route::get('care-instructions', [CareInstructionController::class, 'index']);
    });
    Route::middleware('role:admin|dokter')->group(function () {
        Route::post('care-instructions', [CareInstructionController::class, 'store'])->middleware('approved');
        Route::delete('care-instructions/{careInstruction}', [CareInstructionController::class, 'destroy'])->middleware('approved');
    });
    Route::middleware('role:admin|perawat')->group(function () {
        Route::put('care-instructions/{careInstruction}/claim',    [CareInstructionController::class, 'claim'])->middleware('approved');
        Route::put('care-instructions/{careInstruction}/complete', [CareInstructionController::class, 'complete'])->middleware('approved');
    });

    // ── Admin: User Management ────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::put('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::put('users/{user}/assign-role',   [UserController::class, 'assignRole']);
        Route::put('users/{user}/approval',      [UserController::class, 'setApproval']);

        Route::get('activity-logs',                  [\App\Http\Controllers\ActivityLogController::class, 'index']);
        Route::post('activity-logs/{activityLog}/restore', [\App\Http\Controllers\ActivityLogController::class, 'restore']);
    });
});
