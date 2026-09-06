================================================================================
PRODUCT REQUIREMENT DOCUMENT (PRD) v2.0
Personal Daily & Gym Companion (Markdown-Driven PWA)
================================================================================

1. EXECUTIVE SUMMARY & GOALS

---

Aplikasi PWA ini dirancang sebagai all-in-one daily dashboard pribadi untuk
meningkatkan produktivitas, menjaga konsistensi absen kerja, mempermudah
pencatatan sesi gym di lapangan, serta memantau kebiasaan dan pengeluaran harian.

Sistem menggunakan pendekatan "Markdown-as-a-Database" di mana seluruh log
harian disimpan dalam bentuk file .md terstruktur.

Key Success Metrics:

- Zero Database Maintenance: Tidak membutuhkan database SQL/NoSQL terpisah.
- Portable & Future-Proof: Data tersimpan dalam format .md yang dapat dibuka
  di Obsidian, Logseq, atau VS Code.
- Speed & Offline-First: Akses instan via LocalStorage/IndexedDB dengan sync
  otomatis ke GitHub Repository.

2. TECHNICAL STACK DEFINITION

---

- Frontend Framework : Next.js (App Router) / React (Vite)
- Styling & UI : Tailwind CSS + shadcn/ui (Mobile-first layout)
- PWA Engine : Service Worker (@ducanh2912/next-pwa / @vite-pwa)
- Data Parser : gray-matter (untuk parsing YAML frontmatter .md)
- Storage & Sync : LocalStorage / IndexedDB + GitHub REST API (Octokit)
- Deployment Target : Vercel Hosting Platform

3. CORE FEATURE SPECIFICATIONS

---

[ Module 1: Work Attendance Tracker (Absen Kerja) ]

- FR-1.1: Halaman utama menampilkan kartu status absen hari ini
  (Belum Absen, Sudah Masuk, Sudah Pulang).
- FR-1.2: Tombol One-Tap Action untuk "Absen Masuk" dan "Absen Pulang"
  yang merekam timestamp langsung ke dalam frontmatter file .md.
- FR-1.3: Kalender rekap bulanan yang membaca histori dari kumpulan file .md.

[ Module 2: Personal Gym Tracker ]

- FR-2.1: Logging latihan berbasis kategori (Push, Pull, Legs, Custom).
- FR-2.2: Input log set latihan (Beban kg x Reps) disajikan dalam struktur
  Markdown list/table.
- FR-2.3: Rest Timer interaktif (penghitung mundur istirahat).
- FR-2.4: Fitur auto-lookup untuk menampilkan catatan beban terakhir dari file
  .md sebelumnya.

[ Module 3: Daily Habits & Suplementasi ]

- FR-3.1: Checklist harian otomatis untuk suplemen & rutinitas (Creatine, Air,
  Grooming) yang disimpan sebagai boolean atribut YAML.

[ Module 4: Quick Finance & Developer Notes ]

- FR-4.1: Catatan pengeluaran harian singkat (Quick Expense) dimasukkan ke
  bagian frontmatter.
- FR-4.2: Free-form text section di bagian isi Markdown untuk catatan bebas,
  bug log, atau snippet materi harian.

4. MARKDOWN FILE STRUCTURE & SCHEMA DESIGN

---

Data harian disimpan dengan struktur nama file: `content/daily/YYYY-MM-DD.md`

Contoh Isi File Markdown (`content/daily/2026-09-06.md`):

---

date: 2026-09-06
attendance:
check_in: "07:55:00"
check_out: "17:02:00"
habits:
creatine_taken: true
water_intake_ml: 3000
grooming_done: true
gym_session:
routine: "Push Day A"
exercises: - name: "Bench Press"
sets: - { weight_kg: 60, reps: 8 } - { weight_kg: 65, reps: 8 } - { weight_kg: 70, reps: 6 } - name: "Incline Dumbbell Press"
sets: - { weight_kg: 22, reps: 10 } - { weight_kg: 24, reps: 8 }
expenses:

- { amount: 25000, category: "Kopi", note: "Moka pot beans" }
- { amount: 15000, category: "Makan", note: "Warung nasi" }

---

# Catatan Harian & Dev Notes

- Berhasil menyelesaikan integrasi Service Worker PWA.
- Catatan tambahan untuk latihan: Incline Dumbbell Press terasa lebih ringan hari ini.

5. DATA PERSISTENCE & SYNC ARCHITECTURE

---

┌──────────────────────────────────────────────────────────┐
│ PWA MOBILE APPLICATION │
└────────────┬─────────────────────────────────┬───────────┘
│ │
▼ (Fast Local Write) ▼ (Auto / Manual Sync)
┌───────────────────┐ ┌───────────────────┐
│ IndexedDB / Local │ │ GitHub REST API │
│ (Offline Storage) │ │ (Octokit Integration)
└───────────────────┘ └─────────┬─────────┘
│
▼ (Commit .md)
┌───────────────────┐
│ Private GitHub Repo│
│ (Permanent Storage)│
└───────────────────┘

1. Local Write First: Saat pengguna menekan tombol "Absen" atau "Simpan Gym",
   data diperbarui secara instan di LocalStorage / IndexedDB.
2. Background / Manual Sync: PWA memanggil GitHub API untuk meng-commit atau
   memperbarui file `content/daily/YYYY-MM-DD.md` di repository GitHub pribadi.
3. Cold Start Restore: Jika PWA dibuka di perangkat baru, aplikasi menarik
   kumpulan file .md dari GitHub untuk mengisi ulang penyimpanan lokal.

4. INFORMATION ARCHITECTURE & NAVIGATION STRUCTURE

---

Navigasi disusun menggunakan Bottom Navigation Bar 4 Tab Utama:

[ TAB 1: HOME ]
├── Status & Quick Button Absen Kerja
└── Checklist Creatine & Habit Harian

[ TAB 2: GYM LOG ]
├── Pilih Routine (Push / Pull / Legs)
├── Input Beban & Reps (Set Logger)
└── Rest Timer Pop-up

[ TAB 3: QUICK LOGS & NOTES ]
├── Quick Expense Form
└── Markdown Text Area (Daily Journal / Snippet / Bug Log)

[ TAB 4: REKAP / STATS ]
├── Viewer Kalender Absen Bulanan (Parsed dari Frontmatter .md)
└── Stat Tracker Progress Beban Gym

7. NON-FUNCTIONAL REQUIREMENTS & PWA CHECKLIST

---

- Mobile-First Layout: Ukuran tombol minimal 48px x 48px untuk kemudahan touch.
- Fast Parsing: Menggunakan library JS parsing ringan untuk membaca puluhan file .md
  secara sekaligus tanpa merusak performa UI.
- Web App Manifest (manifest.json):
  - display: "standalone" (tanpa address bar browser)
  - orientation: "portrait"
- Export & Backup: Tombol "Download All as ZIP" untuk mengunduh seluruh file .md
  secara lokal kapan saja tanpa bergantung pada cloud.
  ================================================================================
