<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('doctors', function (Blueprint $table) {
            $table->softDeletes();
            $table->string('photo_url')->nullable()->after('bio');
        });
        Schema::table('appointments', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('medical_records', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('subject_type');
            $table->unsignedBigInteger('subject_id');
            $table->string('subject_label')->nullable();
            $table->json('data')->nullable();
            $table->timestamp('restored_at')->nullable();
            $table->timestamps();

            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::table('patients', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('doctors', function (Blueprint $t) {
            $t->dropSoftDeletes();
            $t->dropColumn('photo_url');
        });
        Schema::table('appointments', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('medical_records', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('users', fn (Blueprint $t) => $t->dropSoftDeletes());
    }
};
