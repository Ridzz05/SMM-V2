  # Ringkasan Menyeluruh Project Loyal Fitness ERP

Dokumen ini merangkum kondisi project **Loyal Fitness ERP** di workspace saat ini. Tujuannya adalah membantu owner, developer, atau agent berikutnya memahami konteks bisnis, arsitektur teknis, modul utama, data flow, dan titik penting yang perlu dijaga saat melakukan perubahan.

> **Lingkup dokumen.** Seluruh isi berkas ini — termasuk bagian Tech Stack, arsitektur, dan struktur direktori — mendeskripsikan basis kode **FitDay** (Loyal Fitness ERP): PHP 8.3, Laravel 13, Inertia, React 19. Dokumen ini disimpan di repositori ini semata sebagai konteks bisnis dan rujukan angka untuk halaman muka. Stack repositori ini sendiri berbeda: **Go** (chi + GORM + SQLite) untuk API dan **Next.js 16 + React 19** untuk situs publik.

  ## 1. Gambaran Umum Project

  **Loyal Fitness ERP** adalah aplikasi manajemen operasional gym berbasis web. Aplikasi ini bukan hanya CRM leads atau dashboard admin, tetapi sistem ERP internal yang menghubungkan proses akuisisi member, front desk, personal training, POS, inventaris, kelas gym, attendance kiosk, laporan performa, dan fitur AI.

  Secara bisnis, aplikasi ini mengelola siklus lengkap operasional gym:

  - Prospek masuk sebagai `Lead`, dikelola oleh Membership Consultant (MC), lalu bergerak melalui funnel follow up, appointment, show, dan joined.
  - Lead yang sudah joined menjadi member operasional dan dapat punya akun `User` dengan role `member`.
  - Customer Service (CS) menangani registrasi membership, registrasi paket PT, pembayaran, sesi PT operasional, recap kelas, dan data member.
  - Personal Trainer (PT) menangani gym orientation, client journey, assessment, measurement, session logging, jadwal, posture scanner, dan AI workout/meal planner.
  - Admin/manager memantau dashboard, summary KPI, laporan fitness, revenue, attendance log, activity log, data master, package, program type, dan pengaturan aplikasi.
  - POS dan transaksi menjadi penghubung penting antara pembayaran, membership, paket PT, stok produk, sales attribution, dan laporan target.

  Entitas yang paling sentral adalah `Lead` dan `User`. `Lead` memulai hidup sebagai prospek CRM, tetapi tetap banyak dipakai sebagai profil member operasional setelah `is_joined = true`. `User` menyimpan akun login untuk staf dan member. Karena itu, hubungan `leads.user_id` ke `users.id` adalah bagian penting yang harus dijaga ketika mengubah modul member, POS, PT session, atau laporan.

  ## 2. Tech Stack

  Backend:

  - PHP `^8.3`
  - Laravel `^13.0`
  - Laravel Fortify untuk login, register, reset password, email verification, dan two-factor authentication.
  - Inertia Laravel `^2.0` sebagai bridge server route ke React SPA.
  - Maatwebsite Excel untuk import/export.
  - Intervention Image untuk pemrosesan gambar.
  - Panchodp Laravel Fingerprint dan native fingerprint bridge untuk akses biometrik.
  - PHPUnit `^12.5` untuk test.

  Frontend:

  - React `^19.2`
  - TypeScript `^5.7`
  - Inertia React `^2.3`
  - Vite `^8.0`
  - Tailwind CSS `^4`
  - Radix UI, shadcn-style UI primitives, Headless UI.
  - Phosphor Icons, Lucide, Heroicons, Tabler Icons.
  - Recharts untuk chart.
  - face-api.js untuk face recognition di browser.
  - html5-qrcode untuk QR/barcode attendance.
  - i18next dan react-i18next untuk multi-bahasa `en` dan `id`.
  - Framer Motion, GSAP, Three.js, dan React Three Fiber tersedia untuk pengalaman visual/interaktif.

  Tooling penting:

  ```bash
  composer run dev
  composer run dev:ssr
  composer test
  composer lint
  composer lint:check
  composer run ci:check
  npm run build
  npm run build:ssr
  npm run format
  npm run format:check
  npm run lint
  npm run lint:check
  npm run types:check
  ```

  Catatan instruksi workspace: command shell untuk agent harus diprefix dengan `rtk`, misalnya `rtk composer test` atau `rtk npm run build`.

  ## 3. Arsitektur Aplikasi

  Pola request utama:

  ```text
  Browser
    -> Laravel route
    -> middleware auth / role
    -> controller
    -> Eloquent model / query / service
    -> Inertia render props
    -> React page component
    -> layout, component UI, hook, dan browser render
  ```

  Routing dikelola Laravel, bukan React Router. React page berada di `resources/js/pages/**` dan dipanggil controller menggunakan nama Inertia, misalnya `inertia('pos/index', [...])`, `Inertia::render('dashboard', [...])`, atau `Route::inertia('pt/posture-scanner', 'pt-management/PostureScanner', [...])`.

  Entry frontend ada di `resources/js/app.tsx`. File ini:

  - Menginisialisasi Inertia app.
  - Resolve page dari `resources/js/pages/**/*.tsx`.
  - Membungkus aplikasi dengan `StrictMode`, `ErrorBoundary`, `TooltipProvider`, dan `Toaster`.
  - Menginisialisasi theme.
  - Mendaftarkan helper route global melalui `routeHelper`.

  Shared props global dikelola di `app/Http/Middleware/HandleInertiaRequests.php`, termasuk:

  - `flash.success` dan `flash.error`.
  - `auth.user`.
  - daftar MC aktif.
  - state sidebar.
  - appointment hari ini/besok.
  - unread message count.
  - app settings seperti nama aplikasi, logo, dan primary color.

  Vite dikonfigurasi dengan Laravel plugin, React compiler, Tailwind plugin, Wayfinder, SSR entry, polling watcher, dan manual chunking untuk vendor besar seperti React, Inertia, UI, icons, charts, face-api, Three.js, QR code, i18n, animation, dan markdown.

  ## 4. Struktur Direktori Penting

  ```text
  app/
    Console/Commands/      Command terjadwal, termasuk auto checkout sesi PT.
    Http/Controllers/      Controller per modul bisnis.
    Http/Middleware/       RoleCheck, Inertia shared data, appearance.
    Http/Requests/         Form request untuk settings/profile/security.
    Models/                Eloquent model domain utama.
    Services/              Business service seperti LeadConversionService dan FingerprintBridgeService.
    Traits/                GeneratesCustomId.

  config/
    services.php           OpenRouter dan service key lain.
    laravel_fingerprint.php

  database/
    migrations/            Skema modul CRM, member, POS, PT, class, attendance, AI, settings.
    seeders/               Seeder manager, admin, MC, CS, program type, package, lead.

  resources/
    css/app.css            CSS global.
    js/app.tsx             Entry Inertia React.
    js/ssr.tsx             Entry SSR.
    js/i18n.ts             Setup translation.
    js/components/         Komponen global dan domain.
    js/components/ui/      UI primitives.
    js/components/ui/modern/ Komponen UI modern.
    js/hooks/              Custom hooks kamera, posture, chat polling, appearance, clipboard, dsb.
    js/layouts/            Layout app, auth, kiosk, settings.
    js/lib/                Utility posture, wizard, attendance identifier, helper.
    js/locales/en|id/      Translation namespace.
    js/pages/              Halaman Inertia.

  routes/
    web.php                Route utama aplikasi.
    settings.php           Route profile, security, appearance.
    console.php            Schedule command.

  public/
    models/                Model face-api.js untuk face recognition.
    images/                Asset landing dan login.
    icon/                  Logo/icon Loyal Fitness.

  native/
    fingerprint_bridge.c   Source native bridge fingerprint.

  scripts/
    build-fingerprint-bridge.sh
  ```

  ## 5. Role dan Access Control

  Access control menggunakan middleware `RoleCheck` di `app/Http/Middleware/RoleCheck.php`. Middleware mengecek user login, mengambil role lowercase, lalu membandingkan dengan daftar role route. Jika role tidak sesuai, request dihentikan dengan `403`.

  Role utama:

  - `admin`: akses paling luas, termasuk data master, staff management, packages, products, program types, app settings, POS, CS operations, reports, PT tools, dan dashboard.
  - `manager`: akses manajemen dan monitoring, termasuk dashboard, summary, laporan, attendance, activity, member, MC/PT analytics, dan beberapa area operasional.
  - `mc`: area Membership Consultant, terutama CRM leads, funnel follow up/appointment/show/joined, member terkait, dan dashboard MC.
  - `cs`: area front desk/customer service, termasuk member registration, PT registration, payments, PT session operational tracking, class recap, POS, sales history, attendance, dan laporan tertentu.
  - `pt` / `trainer`: area personal training, termasuk gym orientation, active clients, assessment, schedule, posture scanner, AI planner, trainer performance, dan internal chat.
  - `member`: member portal dan class booking yang diperbolehkan.

  Route publik penting:

  - `/` untuk landing page.
  - `/kiosk/attendance` untuk attendance kiosk.
  - `/kiosk/checkout` untuk checkout kiosk.
  - `/kiosk/pt-session` untuk kiosk sesi PT.
  - `/kiosk/register-face` untuk registrasi wajah.
  - `/api/ai/analyze-posture` untuk AI posture analysis.

  ## 6. Modul Utama

  ### CRM & Leads Funnel

  Modul CRM berada terutama di `LeadController` dan halaman `resources/js/pages/leads/**`. Funnel utama:

  ```text
  Lead baru
    -> SIAP DI FOLLOW UP
    -> Appointment
    -> Show
    -> Joined
  ```

  Fitur penting:

  - Listing, filter, sorting, pagination leads.
  - Export leads via Excel.
  - Follow up dengan notes dan bukti chat.
  - Appointment dan reschedule.
  - Mark as show.
  - Join from show atau mark as joined.
  - Cancel/revert funnel.
  - Enrollment face, thumbprint, dan barcode/QR identifier.
  - Bulk delete.

  Ketika `Lead` berubah menjadi `is_joined = true`, model `Lead` otomatis membuat `GymOrientation` dengan status `Pending`. Side effect ini adalah jalur penting dari CRM ke workflow PT.

  ### Member Management

  Member masih sangat terkait dengan `Lead`, khususnya lead yang sudah `is_joined = true`. Modul member menyediakan:

  - Data member.
  - Export/import member.
  - Detail member.
  - QR code.
  - Print agreement, PAR-Q, official receipt.
  - Save PAR-Q.
  - Update data member.
  - Renew membership.
  - Apply/cancel leave.
  - Update transaction.
  - Convert to POS.

  Field membership penting di `Lead` meliputi `joined_at`, `membership_package`, `bonus`, `is_pos`, leave fields, body metrics, dan target body metrics.

  ### Customer Service Operations

  Area CS menangani workflow front desk:

  - Member registration.
  - PT registration.
  - Member payments.
  - PT session operational page.
  - Assign trainer.
  - Log session.
  - Checkout session.
  - Class recap.

  CS juga punya akses ke attendance log, activity log, beberapa report, POS, sales report, dan transaction history sesuai route.

  ### Personal Training Management

  Area PT mencakup:

  - `GymOrientation`: antrean orientasi member baru, assignment trainer, scheduling, completion, dan konversi ke PT package.
  - `PtClientController`: active PT clients, detail client, PAR-Q, assessment, session logs, measurements, achievements, targets.
  - `PtAppointmentController`: kalender/schedule PT.
  - `PTSessionOperationalController`: logging operasional sesi PT oleh CS/admin.
  - `PostureLogController` dan `PostureAssessmentController`: penyimpanan posture tracking.
  - `AiPlanController`: workout dan meal plan berbasis AI.

  Sesi PT direpresentasikan oleh `PtSession`, sedangkan pemakaian sesi direkam di `PtSessionLog`. Check-in/check-out sesi PT dapat mengurangi `remaining_sessions`; jika kuota habis, status session dapat menjadi `empty`.

  ### POS, Transactions, dan Inventory

  POS ada di `TransactionController` dan halaman `resources/js/pages/pos/index.tsx`.

  Jenis item penting:

  - `membership`: membuat record `Membership`.
  - `pt`: membuat record `PtSession`.
  - `other_product`: dapat membuat `Product` baru dari transaksi POS dan menyimpan metadata kategori/type/seller.

  Transaksi menyimpan:

  - `user_id` member.
  - `mc_id` untuk attribution MC.
  - `processed_by` staf yang memproses.
  - `total_amount`, `payment_method`, `status`, `notes`.
  - `duration_value` dan `duration_unit`.

  Inventory dan sales mencakup:

  - `Product`.
  - `Distributor`.
  - `Inbound`.
  - `InboundItem`.
  - Sales report.
  - Transaction history.

  Ada endpoint pencarian member `api/members/search` yang membatasi query minimal 2 karakter dan maksimal 20 hasil untuk menghindari beban dropdown member besar.

  ### Classes dan Booking

  Modul class menggunakan `GymClass` dan `ClassBooking`:

  - Class schedule.
  - Instructor.
  - Duration, max capacity, location, difficulty level.
  - Booking class oleh admin/CS/member.
  - Cancel booking.
  - Update status booking.
  - Duplicate class.
  - Class recap.
  - Class commission report.

  `GymClass` punya accessor untuk available slots dan status full berdasarkan booking aktif.

  ### Attendance dan Kiosk

  Attendance menggunakan `Visit` sebagai log kunjungan. Kiosk mendukung beberapa metode:

  - Face ID menggunakan face-api.js dan model di `public/models`.
  - Thumbprint/fingerprint.
  - QR code/barcode.
  - Manual identifier.

  Halaman kiosk utama:

  - `resources/js/pages/leads/kiosk.tsx` untuk attendance.
  - `resources/js/pages/leads/kiosk-checkout.tsx` untuk checkout.
  - `resources/js/pages/kiosk/pt-session.tsx` untuk check-in/check-out sesi PT.
  - `resources/js/pages/kiosk/register-face.tsx` untuk face enrollment.

  Attendance log menampilkan visit harian, filter guest/member, jam masuk, jam keluar jika ada, barcode, nama, MC, dan method.

  ### Reporting, Dashboard, dan Summary

  Dashboard role-aware berada di `DashboardController`:

  - CS melihat front desk metrics seperti total leads bulan ini, appointment hari ini, show hari ini, joined hari ini, dan total member.
  - PT diarahkan ke trainer performance dengan metrik GO.
  - MC melihat MC dashboard dengan funnel metrics, chart leads, source data, dan recent activity.
  - Admin/manager melihat dashboard gabungan MC dan PT analytics.

  Summary KPI berada di `SummaryController`. Modul ini menghitung:

  - Target dan actual MC.
  - Target POS MC.
  - PT sales.
  - PT session stats.
  - Running/conduct sessions dari `pt_session_logs`.
  - Other product revenue.
  - Membership revenue.
  - PT revenue.
  - Renewal performance.
  - Club KPIs untuk Membership, POS, PT Sales, Other Revenue, dan Conduct.

  Summary sengaja tetap menampilkan staf nonaktif jika masih punya target atau histori bulan terkait. Ini penting untuk laporan historis.

  ### Internal Chat dan AI Chat Widget

  Internal chat menggunakan `ChatController` dan `Message`. Shared props menghitung `unreadMessagesCount` untuk sidebar.

  Global AI assistant menggunakan `AiReferenceController`:

  - `api/ai-reference` untuk chat fitness/operational assistant.
  - `api/ai/measurement-insight` untuk insight singkat atas body measurement.

  Jawaban AI diarahkan memakai Bahasa Indonesia profesional.

  ### App Settings dan Profile/Security

  `AppSettingController` mengelola app name, logo, dan primary color. Settings profile/security menggunakan controller di `app/Http/Controllers/Settings/**`.

  Fortify digunakan untuk autentikasi, password update, email verification, dan two-factor authentication. Route settings/security dilindungi auth dan beberapa aksi membutuhkan verified/password confirmation sesuai konfigurasi.

  ## 7. Domain Data Penting

  ### Lead

  `Lead` adalah pusat CRM dan member-operational record.

  Field penting:

  - Identitas: `custom_id`, `barcode`, `name`, `phone_number`, `address`, `source`.
  - Funnel: `status`, `needs_follow_up`, `is_appointment`, `appointment_time`, `is_show`, `show_at`, `is_joined`, `joined_at`.
  - Membership: `membership_package`, `bonus`, `is_pos`, leave fields.
  - PT/body: `height`, `weight`, `pt_level`, `pt_achievements`, target body metrics, `parq_data`.
  - Biometrik: `face_photo_path`, `face_descriptor`, `thumbprint_identifier`, `qr_identifier`.
  - Audit: `created_by`, `updated_by`, soft delete.

  Relasi penting:

  - `visits()`
  - `gymOrientation()`
  - `package()`
  - `user()`
  - `ptAssessment()`
  - `ptSessionLogs()`
  - `clientMeasurements()`
  - `postureLogs()`
  - `postureAssessments()`

  ### User

  `User` menyimpan akun login staf/member. Role menentukan prefix custom ID:

  - `PT-`
  - `MC-`
  - `CS-`
  - `ADM-`
  - `MGR-`
  - default `USR-`

  Relasi penting:

  - `leads()`
  - `memberships()`
  - `transactions()`
  - `ownedPtSessions()`
  - `handledPtSessions()`
  - `gymOrientations()`
  - `trainerSessionLogs()`
  - `sentMessages()` dan `receivedMessages()`

  ### Transaction dan TransactionItem

  `Transaction` adalah header transaksi. `TransactionItem` menyimpan detail item. Transaksi terhubung ke member, MC, processed staff, membership, dan PT session.

  Perubahan pada transaksi perlu memperhatikan dampak ke:

  - `Membership`
  - `PtSession`
  - stok/produk jika item produk.
  - summary revenue.
  - sales report.
  - transaction history.

  ### Membership

  `Membership` menyimpan periode membership member:

  - `member_id`
  - `transaction_id`
  - `start_date`
  - `end_date`
  - `status`
  - `notes`

  ### PtSession dan PtSessionLog

  `PtSession` menyimpan paket sesi PT, kuota, trainer, sales trainer, expiry, dan status.

  `PtSessionLog` menyimpan penggunaan sesi:

  - `pt_session_id`
  - `lead_id`
  - `trainer_id`
  - `session_date`
  - `checked_in_at`
  - `checked_out_at`
  - `attendance_status`
  - `method`
  - `program_type`
  - `exercises_done`
  - `weight_reps_notes`
  - `energy_level`
  - `is_sick`
  - `sleep_quality`

  ### GymOrientation

  `GymOrientation` adalah antrean orientasi member baru ke PT:

  - `lead_id`
  - `trainer_id`
  - `schedule_date`
  - `go_status`
  - `completed_at`
  - `pt_converted`
  - `pt_package_id`
  - `follow_up_note`

  ### Package

  `Package` digunakan untuk membership dan PT:

  - `name`
  - `type`
  - `price`
  - `duration_days`
  - `sessions_count`
  - `is_active`

  ### Product, Inbound, dan Distributor

  `Product` menyimpan produk retail/POS. `Inbound` dan `InboundItem` mencatat barang masuk dan mutasi stok. `Distributor` menyimpan supplier.

  ### Visit

  `Visit` menyimpan log attendance dan checkout. Data ini dipakai attendance log dan kiosk workflow.

  ### ClientMeasurement dan PtAssessment

  `ClientMeasurement` mencatat progress tubuh berkala seperti body weight, body fat, visceral fat, BMR, BMI, FFM, circumference, muscle mass, metabolic age, dan trainer notes.

  `PtAssessment` mencatat assessment awal/lanjutan seperti age, height, weight, lifestyle, fitness goal, body composition, posture, functional metrics, dan PAR-Q image.

  ### PostureAssessment

  `PostureAssessment` menyimpan gambar posture multi-angle, score, analysis text, anomalies, anomalies data, recommendations, dan captured timestamp.

  ### AiPlan

  `AiPlan` menyimpan hasil AI workout dan meal plan untuk client, PT pembuat, profile input, workout plan, meal plan, dan raw response.

  ## 8. Workflow Inti

  ### Lead ke Member ke Gym Orientation

  ```text
  MC membuat / mengelola Lead
    -> status follow up
    -> appointment
    -> show
    -> joined
    -> Lead::saved mendeteksi is_joined true
    -> GymOrientation::firstOrCreate
    -> CS/PT menjadwalkan dan menyelesaikan orientasi
  ```

  Side effect auto-create `GymOrientation` wajib diperhatikan. Jika perubahan mem-bypass model event `Lead`, antrean GO bisa tidak terbentuk.

  ### POS Membership

  ```text
  CS/Admin membuka POS
    -> memilih member
    -> memilih package membership
    -> membuat Transaction + TransactionItem
    -> membuat Membership
    -> receipt / transaction detail
    -> summary dan sales report membaca actual revenue
  ```

  ### POS Paket PT

  ```text
  CS/Admin membuka POS atau PT registration
    -> memilih member
    -> memilih package PT
    -> menentukan seller/trainer attribution
    -> membuat Transaction + TransactionItem
    -> membuat PtSession
    -> remaining_sessions tersedia untuk attendance/logging
  ```

  ### Check-in / Check-out Sesi PT

  ```text
  Member scan face/thumbprint di kiosk PT session
    -> API mencari lead/member/session aktif
    -> check-in membuat atau membuka PtSessionLog
    -> checkout melengkapi log
    -> remaining_sessions dikurangi
    -> session menjadi empty jika kuota habis
  ```

  Ada command scheduled `pt-sessions:auto-checkout` yang berjalan harian jam 00:00 timezone `Asia/Jakarta`. Command ini menutup log sesi PT yang masih `checked_in` dari hari sebelumnya, mengurangi sesi jika valid, dan menandai session habis jika kuota sudah nol.

  ### Attendance Kiosk

  ```text
  Member/guest scan face, thumbprint, QR/barcode, atau manual identifier
    -> frontend kiosk mengirim payload
    -> backend log visit / checkout
    -> cooldown atau success state ditampilkan
    -> attendance log bisa difilter per tanggal dan type
  ```

  ### Summary KPI

  ```text
  User memilih bulan
    -> SummaryController mengambil UserTarget
    -> menghitung actual membership, POS, PT sales, other product
    -> menghitung running/conduct PT dari PtSessionLog
    -> menyusun MC performance, PT performance, club KPIs, renewal performance
    -> render Summary/Index
  ```

  Perhitungan summary memakai kombinasi `transactions`, `transaction_items`, `leads`, `users`, `pt_sessions`, `pt_session_logs`, dan `user_targets`.

  ## 9. Integrasi AI dan Biometrik

  ### OpenRouter AI

  Konfigurasi API key berada di `config/services.php` pada key `openrouter.key` dari env `OPENROUTER_API_KEY`.

  Penggunaan utama:

  - `AiPostureController`: analisis posture dari gambar front, side, back, bend/flexion menggunakan model `openai/gpt-4.1-nano`.
  - `AiReferenceController`: chat assistant dan measurement insight.
  - `AiPlanController`: generate workout plan dan meal plan 30 hari dalam format JSON.

  Risiko yang perlu dijaga:

  - Pastikan `OPENROUTER_API_KEY` tersedia di environment.
  - AI response bisa gagal parse atau tidak sesuai format; beberapa controller sudah punya fallback, tetapi validasi output tetap perlu diperhatikan saat memperluas fitur.
  - Prompt posture meminta output markdown dan juga score/grade JSON; implementasi fallback saat JSON parse gagal mengembalikan raw analysis dengan default score.

  ### Face Recognition

  Face recognition berjalan di browser menggunakan face-api.js:

  - Model berada di `public/models`.
  - Frontend memuat `ssdMobilenetv1`, `faceLandmark68Net`, dan `faceRecognitionNet`.
  - Backend menyediakan face descriptor dari leads.
  - Matching memakai threshold sekitar `0.45`.

  Data terkait ada pada `Lead`:

  - `face_photo_path`
  - `face_descriptor`

  ### Fingerprint Bridge

  `FingerprintBridgeService` menjalankan binary lokal `local-bin/fingerprint-bridge`. Jika binary belum tersedia atau tidak executable, service akan meminta menjalankan:

  ```bash
  ./scripts/build-fingerprint-bridge.sh
  ```

  Template fingerprint disimpan di:

  ```text
  storage/app/fingerprint-prints
  ```

  Bridge mendukung status, enroll, dan identify. Service menjalankan binary via `proc_open`, membaca JSON stdout, menangani timeout, dan menambahkan `LD_LIBRARY_PATH`.

  ### QR/Barcode

  Kiosk dan POS menggunakan barcode/QR identifier untuk pencarian dan attendance. Frontend memakai `html5-qrcode` dan utility `attendance-identifier` untuk normalisasi identifier.

  ## 10. Frontend dan UX

  Aplikasi menggunakan beberapa layout:

  - App layout dengan sidebar untuk dashboard internal.
  - Kiosk layout untuk attendance mandiri.
  - Auth layout untuk login/register/security flow.
  - Settings layout untuk profile/security/appearance.

  Sidebar di `resources/js/components/app-sidebar.tsx` membentuk navigasi berdasarkan role. Grup utama:

  - Platform: beranda, summary, internal chat.
  - Log & Reporting: attendance log, activity log, app settings.
  - Customer Service: data member, member registration, PT registration, payments, PT sessions, PT session kiosk, class recap.
  - Membership Consultant: dashboard, lead management, data member.
  - Personal Training: gym orientation, active PT clients, PT schedule, posture scanner, AI planner, trainer performance.
  - Fitness Reports.
  - Tools: classes, face registration, attendance kiosk, checkout kiosk.
  - Other: POS transaction, transaction history.
  - Data Master: staff, packages, program types.

  Translation berada di `resources/js/locales/en` dan `resources/js/locales/id`. Namespace yang aktif meliputi activity, attendance, auth, clients, common, dashboard, leads, mc, members, packages, pt, settings, sidebar, trainers, cs-management, chat, dan welcome.

  Design guideline project mengarah ke tampilan premium gym. README menyebut standard "Crimson & Slate", sedangkan beberapa komponen dan settings masih memakai primary color biru sebagai fallback. Jika mengubah UI, perlu konsisten dengan komponen pusat dan style terbaru yang benar-benar dipakai di repo.

  ## 11. Database dan Seeder

  Migrations mencakup modul:

  - Auth/session/cache/jobs.
  - Users, roles, username, active flag, avatar, 2FA.
  - Leads, funnel fields, audit, soft delete, appointment, show, join, biometrik, PAR-Q, leave, performance indexes.
  - Visits dan attendance method.
  - Marketing consultants, trainers, staff-related data.
  - Packages dan program types.
  - Gym orientations.
  - PT assessments, client measurements, PT session logs, PT sessions, PT appointments.
  - Transactions, transaction items, membership, POS metadata, duration fields, MC attribution.
  - Products, distributors, inbounds, inbound items.
  - Gym classes dan class bookings.
  - Messages.
  - App settings.
  - Posture logs dan posture assessments.
  - AI plans.
  - User targets.

  Seeder utama:

  - Manager default `test@example.com`.
  - MC default: Ayu, Poppy, Lenny, Indah.
  - CS default `cs@loyalfitness.com`.
  - AdminSeeder.
  - ProgramTypeSeeder.
  - PackageSeeder.
  - LeadSeeder.

  ## 12. Testing dan Quality Gates

  Test feature yang tersedia menunjukkan area penting yang sudah dianggap kritis:

  - Auth, login email, 2FA challenge, inactive user login prevention, rate limiting.
  - Profile/security settings.
  - Dashboard auth access.
  - Staff role access.
  - Staff management dan generated email/username.
  - Member renewal.
  - POS member search.
  - Other product POS.
  - PT session log linking dan decrement remaining sessions.
  - Operational registration notes.
  - Sales report print date range.
  - Summary historical staff dan renewal grouping.

  Command verifikasi yang relevan:

  ```bash
  composer test
  composer lint:check
  composer run ci:check
  npm run lint:check
  npm run types:check
  npm run build
  ```

  Untuk perubahan dokumentasi saja, full test suite tidak wajib. Pemeriksaan cukup memastikan Markdown terisi dan diff hanya menyentuh `SUMMARIZE.md`:

  ```bash
  rtk git diff -- SUMMARIZE.md
  ```

  ## 13. Catatan Teknis dan Risiko yang Perlu Dijaga

  - `Lead` dan `User` sama-sama penting untuk member. Banyak bug dapat muncul jika `leads.user_id` tidak terisi atau tidak sinkron dengan akun member.
  - Auto-create `GymOrientation` terjadi melalui event model `Lead::saved`. Update massal yang tidak memicu model event bisa melewati side effect ini.
  - POS adalah titik integrasi finansial. Perubahan pada `TransactionController::store` dapat berdampak ke membership, PT session, summary, sales report, dan receipt.
  - PT session decrement perlu hati-hati agar tidak double count saat check-in/check-out manual, kiosk, atau auto checkout.
  - Summary KPI memakai query agregasi lintas tabel. Perubahan notes transaksi, item type, status transaksi, atau attribution user dapat mengubah angka laporan.
  - Face recognition bergantung pada model file di `public/models`, izin kamera browser, dan format descriptor yang valid.
  - Fingerprint bergantung pada binary native lokal dan hardware/driver. Environment deployment perlu memastikan `local-bin/fingerprint-bridge` sudah dibuild dan executable.
  - OpenRouter AI bergantung pada `OPENROUTER_API_KEY`, konektivitas jaringan server, dan format response model.
  - Ada route development sementara `/dev/sync-go` di `routes/web.php` untuk sinkronisasi Gym Orientation retroaktif. Perlu diverifikasi apakah masih dibutuhkan sebelum production hardening.
  - README menyebut beberapa standar dan versi yang perlu dicocokkan dengan `composer.json` dan `package.json` jika dokumentasi publik akan dipakai sebagai sumber resmi.
  - File `OPTIMIZE.md` menunjukkan fokus performa pada lazy loading member POS, indexing leads, pembatasan rentang sales report, dan Vite chunking. Beberapa poin tampak sudah terimplementasi, tetapi tetap perlu diverifikasi sebelum dianggap selesai sepenuhnya.

  ## 14. Ringkasan Eksekutif

  Loyal Fitness ERP adalah sistem operasional gym terpadu dengan Laravel, Inertia, dan React. Kekuatan utamanya adalah integrasi end-to-end: lead funnel terhubung ke member, member terhubung ke gym orientation dan PT journey, POS membuat membership serta paket PT, attendance kiosk mencatat kunjungan dan sesi, lalu summary/reporting menarik performa finansial maupun operasional dari data yang sama.

  Saat mengembangkan project ini, fokus utama harus dijaga pada konsistensi data antar modul. Modul yang terlihat sederhana seperti perubahan transaksi, join member, atau check-out sesi PT punya efek downstream ke laporan, target, kuota sesi, dan pengalaman role lain. Pendekatan terbaik adalah membaca route, controller, model, dan test terkait sebelum mengubah workflow bisnis.

  ## 15. Latest Updates & Synchronizations (June 2026)

  ### Dashboard & Funnel Metrics Synchronization
  - **Git Merge Conflict Resolved**: Fixed a critical `ParseError` (syntax error, unexpected token "<<") in `DashboardController.php` caused by unresolved git merge markers during a `git pull`.
  - **Traceable Funnel Logic (Cohort Analysis)**: Updated Dashboard metrics (`Follow Up`, `Appointment`, `Show`) to filter by `created_at` rather than individual stage dates. This mathematically prevents anomalies (e.g., Show ratios exceeding Appointment ratios) and enables true cohort analysis based on the month a lead was generated.
  - **Data Archival (Soft Deletes)**: Re-implemented `router.delete` on the "Join (Success)" action in `leads/show.tsx` so that members are properly archived (soft-deleted) and removed from the active Show queue.
  - **Funnel Metric Integrity**: Reintroduced `withTrashed()` to Dashboard calculations (`$totalFollowUp`, `$totalAppointment`, `$totalShow`) so soft-deleted/archived leads still leave a trace in the funnel ratio, maintaining accurate performance metrics for MCs.
  - **Joined Members Sync**: 
    - Standardized the time-range filtering (`this_month`, `this_week`) for the `leads/joined` view to strictly use `joined_at`.
    - Added a backend rule in `LeadController@joinedLeads` to hide system-generated leads (`mc` is null/empty) when a specific time filter is applied, matching the exact behavior of the Dashboard.
    - Removed `withTrashed()` from `$totalJoinedQuery` in `DashboardController.php` so that the Dashboard "Total Joined" KPI matches the exact number of rows in the active `leads/joined` table. This ensures deleted/cancelled members are counted in "Show" but not in "Joined", preserving a realistic funnel drop-off.

  ### Frontend UI/UX Improvements
  - **TypeScript Fixes**: Resolved strict type errors in `leads/join.tsx` by adding `filter?: string` to the `Props` interface and specifying the generic `<{ mc: string; search: string; filter: string }>` for Inertia's `useForm`.
  - **Searchable AI Planner Combobox**: Upgraded the client selection dropdown in `pt-management/ai-planner/create.tsx` from a standard radix `<Select>` to a `@headlessui/react` `<Combobox>`. This enables realtime searching (type-to-filter) for easier client selection when dealing with large datasets.

  ### PT & Trainer Analytics Optimization
  - **Trainer Performance Date Filtering**: Added `join_month` filter support to `GymOrientationController@trainerPerformance`.
  - **Analytics UI Match**: Added an `<Input type="month">` component to `pt-management/trainer-performance.tsx` right next to the Trainer Select dropdown. "Total GO Assigned" and trainer leaderboards now accurately calculate and display data based on the selected month, defaulting to the current month to perfectly match the Gym Orientation module data.
  - **Sidebar Navigation Restructure**: Repositioned "Trainer Performance" to be the very first sub-menu item under "Personal Training" in `app-sidebar.tsx