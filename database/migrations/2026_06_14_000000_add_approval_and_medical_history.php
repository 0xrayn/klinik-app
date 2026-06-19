<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // pending = awaiting admin approval, approved = can use full features, rejected = denied
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('approved')->after('is_active');
        });

        Schema::table('patients', function (Blueprint $table) {
            // self-reported history (filled by the patient, e.g. previous illnesses) so doctors can review it
            $table->text('medical_history')->nullable()->after('chronic_diseases');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('approval_status'));
        Schema::table('patients', fn (Blueprint $t) => $t->dropColumn('medical_history'));
    }
};
