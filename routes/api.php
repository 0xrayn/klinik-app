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
        Route::put('/change-password',   [AuthController::class, 'changePassword']);
    });

    // ── Dashboard ─────────────────────────────────────────────
    Route::get('/dashboard/stats',   [DashboardController::class, 'stats']);

    // ── Appointments ──────────────────────────────────────────
    Route::apiResource('appointments', AppointmentController::class);
    Route::put('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);

    // ── Doctors (public read) ─────────────────────────────────
    Route::get('doctors',                          [DoctorController::class, 'index']);
    Route::get('doctors/{doctor}',                 [DoctorController::class, 'show']);
    Route::get('doctors/{doctor}/schedules',       [DoctorController::class, 'schedules']);
    Route::get('doctors/{doctor}/available-slots', [DoctorController::class, 'availableSlots']);

    // ── Schedules ─────────────────────────────────────────────
    Route::get('schedules',          [ScheduleController::class, 'index']);
    Route::get('schedules/{schedule}',[ScheduleController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::post('schedules',              [ScheduleController::class, 'store']);
        Route::put('schedules/{schedule}',    [ScheduleController::class, 'update']);
        Route::delete('schedules/{schedule}', [ScheduleController::class, 'destroy']);
    });

    // ── Patients ──────────────────────────────────────────────
    Route::middleware('role:admin|dokter|perawat')->group(function () {
        Route::apiResource('patients', PatientController::class);
    });

    // ── Medical Records ───────────────────────────────────────
    Route::middleware('role:admin|dokter|perawat')->group(function () {
        Route::apiResource('medical-records', MedicalRecordController::class);
    });

    // ── Admin: User Management ────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::put('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::put('users/{user}/assign-role',   [UserController::class, 'assignRole']);
    });
});
