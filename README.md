# Retail Intelligence OS — Luxury Fashion Retail

> **AI Retail Performance & Clienteling OS** dirancang khusus untuk brand luxury fashion retail (tas tangan kulit premium, alas kaki, dan aksesori mewah) dengan model multi-cabang.
> Membantu **Area Manager**, **Store Manager**, dan **Sales Associate (SA)** mengakselerasi pencapaian omzet melalui normalisasi Daily Sales Report (DSR), pemantauan KPI deterministik, AI Strategic Briefing berbasis bukti, serta CRM Clienteling mewah berbasis izin privasi (UU PDP & GDPR).

---

## 💎 Fitur Utama Berdasarkan Peran

### 1. Area Manager (`/area/dashboard`)
- **Konsolidasi Seluruh Gerai**: Agregasi omzet net sales MTD, target, sales gap, dan persentase achievement.
- **Perbandingan & Peringkat Cabang**: Evaluasi performa Plaza Indonesia, Pacific Place, dan Senayan City secara berdampingan.
- **Deteksi Cabang Perlu Perhatian**: Peringatan otomatis jika pencapaian cabang berada di bawah 85%.
- **Run-Rate Sales Forecasting**: Proyeksi penutupan akhir bulan berbasis run-rate harian aktual dengan disclaimer transparan.
- **AI Management Briefing**: Ringkasan strategis berbasis *evidence* aktual dengan verifikasi Zod.

### 2. Store Manager (`/store/dashboard`)
- **Fokus Butik Tunggal**: Pemantauan mendalam gerai yang ditugaskan (pencapaian, ATV, UPT).
- **Leaderboard Tim SA**: Evaluasi pencapaian individu dan tamu yang dikelola oleh masing-masing SA.
- **Coaching Tracker**: Form pencatatan sesi coaching manajerial berbasis KPI spesifik dan rencana aksi.
- **Agenda Salon Privat & Ulang Tahun**: Jadwal janji temu hari ini dan pengingat ulang tahun VIP bulan berjalan.

### 3. Sales Associate (`/sa/dashboard` & `/sa/customers`)
- **Workspace Pribadi**: Target penjualan personal, pencapaian MTD, dan rasio penyelesaian tugas.
- **Antrean Tugas Clienteling**: Tindak lanjut customer dengan prioritas *urgent*, *high*, dan *medium*.
- **AI WhatsApp Concierge Generator**: Pembuatan draft pesan personal, santun, dan elegan sesuai standar hospitality luxury.
- **Perlindungan Privasi Ketat**: Pemblokiran otomatis untuk pelanggan dengan status *Do Not Contact* atau *opted-out*.
- **Pencatatan Interaksi**: Catatan riwayat respon tamu langsung ke database CRM.

### 4. DSR Import Wizard (`/import`)
- **Multi-Format**: Mendukung `.xlsx`, `.xls`, dan `.csv`.
- **Deteksi Header Fleksibel**: Mampu mendeteksi header pada baris ke-1, 2, atau 3.
- **Parsing Khusus Indonesia**: Menangani format angka Rupiah (titik ribuan, koma desimal, prefix Rp) dan serial tanggal Excel.
- **Anti-Formula Injection**: Sanitasi karakter berbahaya (`=`, `+`, `-`, `@`) untuk melindungi ekspor CSV.
- **Deduplikasi Cerdas**: Mencegah duplikasi data penjualan per gerai dan per tanggal.
- **Laporan Error & Template Unduhan**: Ekspor baris yang bermasalah dalam format CSV dan template siap pakai.

---

## 🛠️ Tech Stack & Arsitektur

- **Framework**: Next.js 16 (App Router), React 19, TypeScript strict mode.
- **Styling**: Tailwind CSS v4 dengan palet luxury (ivory, charcoal, gold accents, typography bersih).
- **Database & Auth**: Supabase PostgreSQL dengan 15 tabel relasional & Row Level Security (RLS).
- **Validasi Data**: Zod schemas untuk evidence AI dan validasi impor.
- **Spreadsheet Engine**: XLSX (SheetJS) dengan parser angka dan tanggal khusus Indonesia.
- **Pengujian Otomatis**: Vitest untuk unit tests rumus KPI, parsing impor, sanitasi formula, dan isolasi keamanan RLS.

---

## 📁 Struktur Direktori

```text
├── src/
│   ├── app/
│   │   ├── area/dashboard/page.tsx     # Dashboard Area Manager
│   │   ├── store/dashboard/page.tsx    # Dashboard Store Manager
│   │   ├── sa/dashboard/page.tsx       # Workspace Sales Associate
│   │   ├── sa/customers/page.tsx       # CRM Tamu & Generator WhatsApp
│   │   ├── import/page.tsx             # DSR Data Import Wizard
│   │   ├── tasks/page.tsx              # Task & Coaching Management Hub
│   │   ├── settings/page.tsx           # Profil Organisasi, Cabang & Audit Trail
│   │   ├── unauthorized/page.tsx       # Halaman 403 Akses Ditolak
│   │   ├── layout.tsx                  # Root Layout dengan Providers
│   │   └── page.tsx                    # Landing Page & Portal Peran
│   ├── components/
│   │   ├── layout/                     # Sidebar, Header, AppLayout
│   │   └── ui/                         # KpiCard, AiBriefingCard
│   ├── lib/
│   │   ├── kpi.ts                      # Engine Perhitungan KPI & Format IDR
│   │   ├── import-engine.ts            # Parser Spreadsheet, Mapping & Validasi
│   │   ├── ai-engine.ts                # AI Evidence Builder & WhatsApp Generator
│   │   ├── data-store.ts               # Local Store Stateful & Kontrol Akses
│   │   ├── demo-data.ts                # Dataset Sintetis DEMO Luxury
│   │   ├── auth-context.tsx            # Context Autentikasi & Penggantian Peran
│   │   └── __tests__/                  # 40 Unit & Security Tests (Vitest)
│   └── types/                          # Definisi TypeScript Seluruh 15 Entitas
├── supabase/
│   ├── migrations/
│   │   ├── 20261013000000_init_schema.sql  # Skema 15 Tabel, Relasi & Indeks
│   │   └── 20261013000001_rls_policies.sql # Kebijakan RLS Isolasi Multi-Tenant
│   └── seed.sql                            # Data Seed Demonstrasi Terstruktur
├── .env.example
├── vitest.config.ts
└── package.json
```

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat Sistem
- Node.js versi 20+ (Direkomendasikan Node.js 22/24)
- npm versi 10+

### 2. Kloning & Instalasi Dependensi
```bash
# Instal seluruh paket dependensi
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi konfigurasi Supabase dan AI API Key (opsional — jika dikosongkan, aplikasi otomatis berjalan dalam **Mode Demo Deterministik** tanpa error).

### 4. Menjalankan Unit Tests (Vitest)
Jalankan pengujian otomatis untuk memverifikasi rumus KPI, parser impor, dan aturan keamanan:
```bash
npm run test
```
*Hasil: 40 tests berjalan sukses (100% lulus).*

### 5. Menjalankan Server Development
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Panduan Setup Supabase & Database Migrations

Aplikasi dirancang agar dapat dihubungkan ke proyek Supabase nyata secara langsung:

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor** pada dashboard Supabase.
3. Jalankan file migrasi secara berurutan:
   - `supabase/migrations/20261013000000_init_schema.sql` (Membuat seluruh 15 tabel, foreign keys, tipe ENUM, dan indeks performa).
   - `supabase/migrations/20261013000001_rls_policies.sql` (Mengaktifkan RLS dan menetapkan aturan akses multi-tenant, store isolation, dan customer isolation).
   - `supabase/seed.sql` (Memasukkan data demo: Maison de Luxe Group, 3 cabang butik, staf, customer master, dan DSR harian).
4. Ambil URL dan Anon Key dari menu **Project Settings > API**, lalu masukkan ke dalam `.env.local`.

---

## 🧪 Pengujian & Jaminan Kualitas (QA)

Rangkaian tes otomatis mencakup:
1. **KPI Engine (`src/lib/__tests__/kpi.test.ts`)**:
   - Sales achievement (penanganan denominator 0 tanpa hasil palsu).
   - Sales gap.
   - ATV (Average Transaction Value).
   - UPT (Units Per Transaction).
   - Average daily sales & run-rate projection.
   - Format mata uang IDR (`Rp 15.000.000`).
2. **Import Engine (`src/lib/__tests__/import-engine.test.ts`)**:
   - Parsing angka format Indonesia dan format barat.
   - Parsing tanggal fleksibel (serial Excel, YYYY-MM-DD, DD/MM/YYYY).
   - Sanitasi injeksi formula spreadsheet (`=`, `+`, `-`, `@`).
   - Deteksi baris duplikat berdasarkan kode toko dan tanggal.
3. **AI Engine (`src/lib/__tests__/ai-engine.test.ts`)**:
   - Pembuatan evidence terstruktur sesuai kontrak Zod.
   - Penegakan privasi (pemblokiran draf untuk status *opted-out* dan *do_not_contact*).
4. **Security & Role Scoping (`src/lib/__tests__/security.test.ts`)**:
   - Isolasi pelanggan Sales Associate (hanya melihat customer yang ditugaskan).
   - Isolasi toko Store Manager.
   - Hak lintas cabang Area Manager.

---

## 🌐 Panduan Deployment ke Vercel

1. Unggah repository ke GitHub/GitLab.
2. Masuk ke [Vercel](https://vercel.com) dan impor repository.
3. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_API_KEY` (opsional)
4. Klik **Deploy**.
5. Build Next.js 16 App Router akan berjalan dan menghasilkan static prerender untuk rute `/`, `/area/dashboard`, `/store/dashboard`, `/sa/dashboard`, `/sa/customers`, `/import`, `/tasks`, dan `/settings`.

---

## 🔒 Kebijakan Privasi Data & UU PDP

- Nomor kontak dan profil sensitif tamu dilindungi dengan otorisasi berbasis penugasan.
- Staf dilarang mengakses portofolio tamu milik staf lain tanpa penugasan resmi dari Store Manager.
- WhatsApp draft workflow tidak pernah mengirim pesan otomatis di latar belakang; staf wajib meninjau dan mengirim secara manual dari perangkat kerja resmi.
