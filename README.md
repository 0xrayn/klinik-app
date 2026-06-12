# 🏥 Klinik Sehat — Appointment Management System

> **Portfolio Project** · Laravel 11 + React 18 + Tailwind CSS 3

![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Sanctum](https://img.shields.io/badge/Sanctum-Token_Auth-FF2D20)
![Spatie](https://img.shields.io/badge/Spatie-RBAC-orange)

Sistem manajemen klinik lengkap dengan fitur booking janji temu, rekam medis digital, manajemen jadwal dokter, dan multi-role authentication.

---

## ✨ Fitur Lengkap

| Modul | Fitur |
|---|---|
| **Authentication** | Login, Register, Forgot Password, Token-based (Sanctum) |
| **Role-Based Access** | Admin, Dokter, Perawat, Pasien (Spatie Permission) |
| **Dashboard** | Stats real-time, Grafik tren harian & bulanan (Recharts) |
| **Janji Temu** | Wizard 3 langkah, CRUD, update status inline, auto queue number |
| **Dokter** | Profil lengkap, rating, jadwal praktek, slot tersedia |
| **Pasien** | Data lengkap, tab Informasi / Kunjungan / Rekam Medis |
| **Jadwal** | Kalender interaktif, kapasitas slot visual dengan progress bar |
| **Rekam Medis** | Diagnosa + ICD-10, resep, status draft/final |
| **Admin Panel** | Manajemen user, role assignment, toggle status |

---

## 🚀 Quick Start

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0

### Instalasi

```bash
# 1. Clone project
git clone https://github.com/username/klinik-sehat.git
cd klinik-sehat

# 2. Install dependencies
composer install
npm install

# 3. Setup environment
cp .env.example .env
php artisan key:generate
```

### Konfigurasi Database

Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=klinik_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

Buat database & jalankan migration + seeder:
```bash
mysql -u root -p -e "CREATE DATABASE klinik_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
```

### Jalankan Server

```bash
# Terminal 1 — Laravel backend
php artisan serve

# Terminal 2 — Vite dev server (React + Tailwind)
npm run dev
```

Buka **http://localhost:8000** 🎉

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@klinik.id | password |
| **Dokter** | dokter@klinik.id | password |
| **Perawat** | perawat@klinik.id | password |
| **Pasien** | pasien@klinik.id | password |

---

## 🗂️ Struktur Project

```
klinik-sehat/
├── app/
│   ├── Http/Controllers/        # 8 API Controllers
│   └── Models/                  # 6 Eloquent Models
├── database/
│   ├── migrations/              # 3 migration files
│   └── seeders/DatabaseSeeder   # Seed lengkap + demo data
├── resources/
│   ├── css/app.css              # Tailwind + custom design system
│   └── js/
│       ├── App.jsx              # SPA Router + Auth Guards
│       ├── layouts/             # AuthLayout, DashboardLayout
│       ├── pages/
│       │   ├── auth/            # Login, Register, ForgotPassword
│       │   ├── dashboard/       # Stats + Recharts
│       │   ├── appointments/    # List + Create (3-step wizard) + Detail
│       │   ├── doctors/         # List (card grid) + Detail (profil)
│       │   ├── patients/        # List + Form + Detail (tabs)
│       │   ├── schedules/       # Kalender interaktif + slot list
│       │   ├── medical-records/ # CRUD + ICD-10
│       │   └── admin/           # User management
│       ├── components/
│       │   ├── layout/          # Sidebar + Topbar
│       │   └── ui/              # Button, Input, Modal, Badge, dll.
│       └── stores/authStore.js  # Zustand state management
└── routes/
    ├── api.php                  # REST API + role middleware
    └── web.php                  # SPA catch-all
```

---

## 🛠️ Tech Stack

**Backend:**
- Laravel 11 (PHP 8.2)
- Laravel Sanctum (token-based API auth)
- Spatie Laravel Permission (RBAC)
- MySQL 8

**Frontend:**
- React 18 + React Router v6
- Tailwind CSS 3 + custom design system
- Headless UI (accessible modal, dropdown)
- Recharts (area chart, bar chart)
- Zustand (state management)
- React Hook Form (form validation)
- Heroicons

**Build Tools:**
- Vite 5 + laravel-vite-plugin

---

## 📡 API Endpoints

```
# Auth
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me              [auth]
POST   /api/auth/logout          [auth]

# Dashboard
GET    /api/dashboard/stats      [auth]

# Appointments
GET    /api/appointments         [auth]
POST   /api/appointments         [auth]
GET    /api/appointments/{id}    [auth]
PUT    /api/appointments/{id}    [auth]
DELETE /api/appointments/{id}    [auth]
PUT    /api/appointments/{id}/status [auth]

# Doctors
GET    /api/doctors              [auth]
GET    /api/doctors/{id}         [auth]
GET    /api/doctors/{id}/available-slots?date=YYYY-MM-DD [auth]

# Patients           [admin, dokter, perawat]
GET    /api/patients
POST   /api/patients
GET    /api/patients/{id}
PUT    /api/patients/{id}
DELETE /api/patients/{id}

# Medical Records    [admin, dokter, perawat]
GET    /api/medical-records
POST   /api/medical-records
GET    /api/medical-records/{id}
PUT    /api/medical-records/{id}
DELETE /api/medical-records/{id}

# Admin
GET    /api/admin/users          [admin]
POST   /api/admin/users          [admin]
PUT    /api/admin/users/{id}     [admin]
DELETE /api/admin/users/{id}     [admin]
```

---

Made with ❤️ — Portfolio Project · Probolinggo, Jawa Timur 🇮🇩
