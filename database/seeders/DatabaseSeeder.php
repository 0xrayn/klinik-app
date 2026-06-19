<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Roles ──────────────────────────────────────────────────────────
        $this->command->info('Membuat roles...');
        foreach (['admin', 'dokter', 'perawat', 'pasien'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // ── 2. Admin ──────────────────────────────────────────────────────────
        $this->command->info('Membuat admin...');
        $admin = User::create([
            'name'     => 'Admin Klinik',
            'email'    => 'admin@klinik.id',
            'password' => 'password',
            'phone'    => '081200000001',
        ]);
        $admin->assignRole('admin');

        // ── 3. Perawat ────────────────────────────────────────────────────────
        User::create([
            'name'     => 'Perawat Ana',
            'email'    => 'perawat@klinik.id',
            'password' => 'password',
            'phone'    => '081200000002',
        ])->assignRole('perawat');

        // ── 4. Doctors ────────────────────────────────────────────────────────
        $this->command->info('Membuat dokter...');
        $doctorsData = [
            [
                'user'   => ['name' => 'dr. Siti Rahayu, Sp.PD',   'email' => 'dokter@klinik.id',    'phone' => '081200000010'],
                'doctor' => ['specialization' => 'Penyakit Dalam', 'license_number' => 'SIP-001/2020', 'photo_url' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces', 'experience_years' => 12, 'consultation_fee' => 150000, 'rating' => 4.8, 'total_reviews' => 234,
                             'bio' => 'Spesialis penyakit dalam dengan fokus pada diabetes, hipertensi, dan penyakit ginjal.',
                             'education' => ['FK Universitas Airlangga (2005)', 'Sp.PD Universitas Indonesia (2012)', 'Fellowship Nefrologi RSCM (2015)']],
                'schedule_days' => [1, 2, 3, 4, 5], 'start' => '08:00', 'end' => '14:00',
            ],
            [
                'user'   => ['name' => 'dr. Budi Prakoso, drg',    'email' => 'drg.budi@klinik.id',   'phone' => '081200000011'],
                'doctor' => ['specialization' => 'Gigi & Mulut',   'license_number' => 'SIP-002/2020', 'photo_url' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=faces', 'experience_years' => 8,  'consultation_fee' => 120000, 'rating' => 4.7, 'total_reviews' => 189,
                             'bio' => 'Dokter gigi berpengalaman dengan keahlian perawatan gigi anak dan dewasa.',
                             'education' => ['drg Universitas Airlangga (2009)', 'Pelatihan Ortodonti (2014)']],
                'schedule_days' => [1, 2, 3, 4, 5, 6], 'start' => '09:00', 'end' => '15:00',
            ],
            [
                'user'   => ['name' => 'dr. Yuni Astuti, Sp.A',    'email' => 'dr.yuni@klinik.id',    'phone' => '081200000012'],
                'doctor' => ['specialization' => 'Anak',           'license_number' => 'SIP-003/2020', 'photo_url' => 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces', 'experience_years' => 15, 'consultation_fee' => 175000, 'rating' => 4.9, 'total_reviews' => 312,
                             'bio' => 'Spesialis anak berfokus pada tumbuh kembang, nutrisi, dan imunisasi.',
                             'education' => ['FK Universitas Brawijaya (2002)', 'Sp.A Universitas Indonesia (2008)']],
                'schedule_days' => [2, 3, 4, 5, 6], 'start' => '08:00', 'end' => '13:00',
            ],
            [
                'user'   => ['name' => 'dr. Hendra Wijaya, Sp.JP', 'email' => 'dr.hendra@klinik.id',  'phone' => '081200000013'],
                'doctor' => ['specialization' => 'Jantung',        'license_number' => 'SIP-004/2020', 'photo_url' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces', 'experience_years' => 20, 'consultation_fee' => 250000, 'rating' => 4.6, 'total_reviews' => 156,
                             'bio' => 'Kardiolog senior dengan pengalaman lebih dari 20 tahun dalam penanganan penyakit jantung koroner.',
                             'education' => ['FK Universitas Gadjah Mada (1998)', 'Sp.JP Universitas Indonesia (2005)', 'Fellowship Interventional Cardiology (2009)']],
                'schedule_days' => [1, 2, 3, 4], 'start' => '13:00', 'end' => '18:00',
            ],
            [
                'user'   => ['name' => 'dr. Maya Kusuma, Sp.M',    'email' => 'dr.maya@klinik.id',    'phone' => '081200000014'],
                'doctor' => ['specialization' => 'Mata',           'license_number' => 'SIP-005/2020', 'photo_url' => 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&crop=faces', 'experience_years' => 10, 'consultation_fee' => 140000, 'rating' => 4.8, 'total_reviews' => 201,
                             'bio' => 'Spesialis mata dengan keahlian bedah katarak dan terapi laser.',
                             'education' => ['FK Universitas Diponegoro (2007)', 'Sp.M Universitas Airlangga (2013)']],
                'schedule_days' => [3, 4, 5, 6, 0], 'start' => '08:00', 'end' => '14:00',
            ],
        ];

        $doctors = [];
        foreach ($doctorsData as $d) {
            $user = User::create([
                'name'     => $d['user']['name'],
                'email'    => $d['user']['email'],
                'password' => 'password',
                'phone'    => $d['user']['phone'],
            ]);
            $user->assignRole('dokter');

            $doctor = Doctor::create(array_merge($d['doctor'], [
                'user_id'   => $user->id,
                'is_active' => true,
            ]));

            foreach ($d['schedule_days'] as $day) {
                Schedule::create([
                    'doctor_id'   => $doctor->id,
                    'day_of_week' => $day,
                    'start_time'  => $d['start'],
                    'end_time'    => $d['end'],
                    'quota'       => 10,
                    'is_active'   => true,
                ]);
            }

            $doctors[] = $doctor;
        }

        // ── 5. Patients ───────────────────────────────────────────────────────
        $this->command->info('Membuat pasien...');
        $patientsRaw = [
            ['name' => 'Ahmad Fauzi',      'nik' => '3578012345678901', 'phone' => '081234567890', 'birth_date' => '1990-05-15', 'gender' => 'L', 'blood_type' => 'O+',  'address' => 'Jl. Mawar No. 12, Bangil, Pasuruan',    'allergies' => 'Penisilin',    'chronic' => 'Hipertensi',      'email' => 'pasien@klinik.id'],
            ['name' => 'Dewi Sartika',     'nik' => '3578012345678902', 'phone' => '082345678901', 'birth_date' => '1985-08-22', 'gender' => 'P', 'blood_type' => 'A+',  'address' => 'Jl. Kenanga No. 5, Surabaya',           'allergies' => null,           'chronic' => null,              'email' => null],
            ['name' => 'Rudi Hermawan',    'nik' => '3578012345678903', 'phone' => '083456789012', 'birth_date' => '1978-03-11', 'gender' => 'L', 'blood_type' => 'B-',  'address' => 'Jl. Flamboyan No. 8, Malang',           'allergies' => 'Sulfa',        'chronic' => 'Diabetes Tipe 2', 'email' => null],
            ['name' => 'Sari Indah',       'nik' => '3578012345678904', 'phone' => '084567890123', 'birth_date' => '2019-07-04', 'gender' => 'P', 'blood_type' => 'AB+', 'address' => 'Jl. Melati No. 3, Probolinggo',         'allergies' => null,           'chronic' => null,              'email' => null],
            ['name' => 'Budi Santoso',     'nik' => '3578012345678905', 'phone' => '085678901234', 'birth_date' => '1965-12-01', 'gender' => 'L', 'blood_type' => 'O-',  'address' => 'Jl. Anggrek No. 17, Pasuruan',          'allergies' => null,           'chronic' => 'Jantung Koroner', 'email' => null],
            ['name' => 'Rina Wulandari',   'nik' => '3578012345678906', 'phone' => '086789012345', 'birth_date' => '1995-04-18', 'gender' => 'P', 'blood_type' => 'A-',  'address' => 'Jl. Dahlia No. 22, Surabaya',           'allergies' => null,           'chronic' => null,              'email' => null],
            ['name' => 'Teguh Prasetyo',   'nik' => '3578012345678907', 'phone' => '087890123456', 'birth_date' => '1982-09-30', 'gender' => 'L', 'blood_type' => 'B+',  'address' => 'Jl. Cempaka No. 11, Malang',            'allergies' => 'Aspirin',      'chronic' => 'Asma',            'email' => null],
            ['name' => 'Lina Susanti',     'nik' => '3578012345678908', 'phone' => '088901234567', 'birth_date' => '1998-11-12', 'gender' => 'P', 'blood_type' => 'O+',  'address' => 'Jl. Teratai No. 9, Probolinggo',        'allergies' => null,           'chronic' => null,              'email' => null],
        ];

        // Pasien user untuk akun demo
        $pasienUser = User::create([
            'name'     => 'Ahmad Fauzi',
            'email'    => 'pasien@klinik.id',
            'password' => 'password',
            'phone'    => '081234567890',
        ]);
        $pasienUser->assignRole('pasien');

        $patients = [];
        foreach ($patientsRaw as $i => $p) {
            $patients[] = Patient::create([
                'name'             => $p['name'],
                'nik'              => $p['nik'],
                'phone'            => $p['phone'],
                'birth_date'       => $p['birth_date'],
                'gender'           => $p['gender'],
                'blood_type'       => $p['blood_type'],
                'address'          => $p['address'],
                'allergies'        => $p['allergies'],
                'chronic_diseases' => $p['chronic'],
                'is_active'        => true,
                'user_id'          => ($i === 0) ? $pasienUser->id : null,
            ]);
        }

        // ── 6. Appointments ───────────────────────────────────────────────────
        $this->command->info('Membuat jadwal janji temu...');
        $statuses  = ['confirmed', 'done', 'done', 'cancelled', 'pending', 'in_progress', 'done', 'confirmed'];
        $today     = now()->toDateString();

        $appointmentsData = [
            ['patient' => 0, 'doctor' => 0, 'date' => $today,                               'time' => '08:00', 'complaint' => 'Demam 3 hari, batuk kering dan sakit kepala.'],
            ['patient' => 1, 'doctor' => 1, 'date' => $today,                               'time' => '09:00', 'complaint' => 'Sakit gigi geraham kiri bawah.'],
            ['patient' => 2, 'doctor' => 0, 'date' => $today,                               'time' => '09:30', 'complaint' => 'Kontrol rutin gula darah.'],
            ['patient' => 3, 'doctor' => 2, 'date' => $today,                               'time' => '10:00', 'complaint' => 'Imunisasi DPT lanjutan.'],
            ['patient' => 4, 'doctor' => 3, 'date' => $today,                               'time' => '13:00', 'complaint' => 'Sesak napas dan nyeri dada saat aktivitas.'],
            ['patient' => 5, 'doctor' => 4, 'date' => now()->addDay()->toDateString(),      'time' => '08:00', 'complaint' => 'Mata merah dan berair sejak kemarin.'],
            ['patient' => 6, 'doctor' => 0, 'date' => now()->addDay()->toDateString(),      'time' => '08:30', 'complaint' => 'Sesak napas kambuhan, asma.'],
            ['patient' => 7, 'doctor' => 1, 'date' => now()->subDay()->toDateString(),      'time' => '09:00', 'complaint' => 'Pembersihan karang gigi.'],
            ['patient' => 0, 'doctor' => 0, 'date' => now()->subDays(5)->toDateString(),    'time' => '08:00', 'complaint' => 'Kontrol tekanan darah.'],
            ['patient' => 2, 'doctor' => 0, 'date' => now()->subDays(10)->toDateString(),   'time' => '09:00', 'complaint' => 'Cek HbA1c dan konsultasi obat.'],
        ];

        foreach ($appointmentsData as $i => $a) {
            $count = Appointment::whereDate('appointment_date', $a['date'])->where('doctor_id', $doctors[$a['doctor']]->id)->count() + 1;
            $queue = 'A' . str_pad($count, 3, '0', STR_PAD_LEFT);

            Appointment::create([
                'patient_id'       => $patients[$a['patient']]->id,
                'doctor_id'        => $doctors[$a['doctor']]->id,
                'appointment_date' => $a['date'],
                'appointment_time' => $a['time'],
                'queue_number'     => $queue,
                'complaint'        => $a['complaint'],
                'status'           => $statuses[$i % count($statuses)],
                'created_by'       => $admin->id,
            ]);
        }

        // ── 7. Medical Records ────────────────────────────────────────────────
        $this->command->info('Membuat rekam medis...');
        $records = [
            [
                'patient' => 0, 'doctor' => 0,
                'date' => now()->subDays(5)->toDateString(),
                'diagnosis' => 'Hipertensi Esensial Derajat 1',
                'icd' => 'I10', 'status' => 'final',
                'prescription' => "Amlodipine 5mg 1x1 pagi\nCaptopril 12.5mg 2x1 pagi & malam",
                'treatment'    => 'Monitor tekanan darah setiap hari',
                'notes'        => 'TD 150/95 mmHg. Target < 130/80. Kontrol 1 bulan. Diet rendah garam & olahraga ringan.',
            ],
            [
                'patient' => 2, 'doctor' => 0,
                'date' => now()->subDays(10)->toDateString(),
                'diagnosis' => 'Diabetes Mellitus Tipe 2 Tidak Terkontrol',
                'icd' => 'E11', 'status' => 'final',
                'prescription' => "Metformin 500mg 2x1 setelah makan\nGlibenclamide 5mg 1x1 pagi sebelum makan",
                'treatment'    => 'Monitoring gula darah mandiri 2x/hari',
                'notes'        => 'GDS 280 mg/dL, HbA1c 8.2%. Target HbA1c < 7%. Edukasi diet DM.',
            ],
            [
                'patient' => 7, 'doctor' => 1,
                'date' => now()->subDay()->toDateString(),
                'diagnosis' => 'Kalkulus Dentis',
                'icd' => 'K03.6', 'status' => 'final',
                'prescription' => "Chlorhexidine 0.2% mouthwash 2x/hari\nParacetamol 500mg jika nyeri",
                'treatment'    => 'Scaling dan polishing selesai dilakukan',
                'notes'        => 'Kebersihan mulut perlu ditingkatkan. Sikat gigi 2x/hari. Kontrol 6 bulan.',
            ],
            [
                'patient' => 4, 'doctor' => 3,
                'date' => now()->subDays(3)->toDateString(),
                'diagnosis' => 'Angina Pektoris Stabil',
                'icd' => 'I20.9', 'status' => 'final',
                'prescription' => "Isosorbide dinitrate 5mg sublingual jika nyeri\nAspirin 80mg 1x1\nAtorvastatin 20mg 1x1 malam",
                'treatment'    => 'EKG, foto thoraks, dan echocardiografi',
                'notes'        => 'Hindari aktivitas berat. Jadwal treadmill test minggu depan.',
            ],
            [
                'patient' => 0, 'doctor' => 0,
                'date' => now()->subDays(35)->toDateString(),
                'diagnosis' => 'ISPA (Infeksi Saluran Pernapasan Atas)',
                'icd' => 'J06.9', 'status' => 'final',
                'prescription' => "Amoxicillin 500mg 3x1 selama 5 hari\nParacetamol 500mg 3x1 jika demam\nGG 100mg 3x1",
                'treatment'    => 'Istirahat cukup dan banyak minum air putih',
                'notes'        => 'Demam sudah turun. Batuk masih ada. Minum antibiotik sampai habis.',
            ],
        ];

        foreach ($records as $rec) {
            MedicalRecord::create([
                'patient_id'       => $patients[$rec['patient']]->id,
                'doctor_id'        => $doctors[$rec['doctor']]->id,
                'examination_date' => $rec['date'],
                'diagnosis'        => $rec['diagnosis'],
                'icd_code'         => $rec['icd'],
                'prescription'     => $rec['prescription'],
                'treatment'        => $rec['treatment'],
                'notes'            => $rec['notes'],
                'status'           => $rec['status'],
            ]);
        }

        $this->command->newLine();
        $this->command->info('Seeder selesai! Database siap digunakan.');
        $this->command->newLine();
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin',   'admin@klinik.id',   'password'],
                ['Dokter',  'dokter@klinik.id',  'password'],
                ['Perawat', 'perawat@klinik.id', 'password'],
                ['Pasien',  'pasien@klinik.id',  'password'],
            ]
        );
    }
}
