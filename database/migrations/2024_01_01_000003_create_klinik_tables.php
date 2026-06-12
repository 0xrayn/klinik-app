<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('nik', 16)->unique();
            $table->string('phone', 20);
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['L', 'P'])->nullable();
            $table->enum('blood_type', ['A+','A-','B+','B-','AB+','AB-','O+','O-'])->nullable();
            $table->text('address')->nullable();
            $table->string('bpjs', 20)->nullable();
            $table->text('allergies')->nullable();
            $table->text('chronic_diseases')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('day_of_week')->comment('0=Minggu … 6=Sabtu');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('quota')->default(10);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['doctor_id', 'day_of_week', 'is_active']);
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('queue_number', 10);
            $table->text('complaint');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending','confirmed','in_progress','done','cancelled'])->default('pending');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['appointment_date', 'doctor_id']);
            $table->index(['patient_id', 'appointment_date']);
            $table->index('status');
        });

        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->date('examination_date');
            $table->string('diagnosis');
            $table->string('icd_code', 10);
            $table->text('prescription')->nullable();
            $table->text('treatment')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['draft', 'final'])->default('draft');
            $table->timestamps();

            $table->index(['patient_id', 'examination_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('patients');
    }
};
