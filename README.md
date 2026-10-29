# Duitku

REST API untuk aplikasi pencatat keuangan pribadi — catat pemasukan & pengeluaran, kelola dompet dan kategori, atur budget per bulan, dan pantau laporan keuangan kamu.

Dibangun dengan **Bun** + **Elysia**, **PostgreSQL**, dan **Drizzle ORM**.

## Tech Stack

| Komponen | Teknologi |
| --- | --- |
| Runtime | [Bun](https://bun.sh) |
| Framework | [Elysia](https://elysiajs.com) |
| Database | PostgreSQL |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Autentikasi | JWT (access + refresh token, httpOnly cookie) |
| Dokumentasi | OpenAPI (dihasilkan otomatis dari schema) |

## Fitur

- **Autentikasi lengkap** — register, login, refresh, dan logout dengan *refresh token rotation* + deteksi *token reuse* (seluruh keluarga token langsung dicabut bila token lama dipakai ulang).
- **Multi dompet (wallet)** — buat beberapa dompet dengan saldo awal masing-masing.
- **Kategori fleksibel** — kategori pemasukan/pengeluaran dengan warna, plus 12 kategori default yang otomatis dibuat saat register.
- **Transaksi** — CRUD transaksi dengan filter rentang tanggal, jenis, dompet, kategori, pencarian teks, dan pagination.
- **Budget per bulan** — atur batas pengeluaran per kategori (upsert per `YYYY-MM`).
- **Laporan** — ringkasan bulanan, pengeluaran per kategori, tren bulanan tahunan, dan saldo seluruh dompet.
- **Keamanan** — password di-hash dengan Argon2id, rate limiting pada login & register, dan format error yang seragam.

## Getting Started

### Prasyarat

- [Bun](https://bun.sh) v1.0 atau lebih baru
- PostgreSQL berjalan lokal atau remote

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/Onlyadmirer/API-Velow.git
cd API-Velow

# 2. Install dependencies
bun install

# 3. Salin file environment lalu isi nilainya
cp .env.example .env
```

### Variabel Environment

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL, contoh: `postgresql://user:password@localhost:5432/duitku` |
| `ACCESS_TOKEN_SECRET` | Secret untuk sign & verifikasi JWT access token (isi dengan string acak panjang) |
| `NODE_ENV` | `development` atau `production` — menentukan flag `secure` pada cookie |
| `CORS_ORIGIN` | Origin frontend yang diizinkan, pisahkan dengan koma — contoh: `http://localhost:5173,https://duitku.vercel.app` |

### Database

```bash
# Generate migrasi dari schema Drizzle
bun run db:generate

# Jalankan migrasi ke database
bun run db:migrate
```

Alternatif lain: `bun run db:push` untuk langsung menyinkronkan schema tanpa file migrasi, dan `bun run db:studio` untuk membuka Drizzle Studio (GUI browser).

### Menjalankan

```bash
# Mode development (auto-reload)
bun run dev

# Mode production
bun run start
```

Server berjalan di `http://localhost:3000` dengan prefix `/api`. Cek kesehatan server lewat `GET /api/cronjob`.

## Deploy ke Vercel

Project ini sudah disiapkan untuk deploy ke Vercel dengan **Bun runtime** (mendukung `Bun.password` / Argon2id).

Konfigurasi yang relevan:

- `src/index.ts` — mendefinisikan app Elysia dan melakukan `export default app` (entry yang dideteksi Vercel). **Tidak** memanggil `app.listen()`.
- `src/serve.ts` — entry untuk lokal/dev yang memanggil `app.listen()`.
- `vercel.json` — mengaktifkan Bun runtime lewat `bunVersion`.

### Variabel environment di Vercel

| Variabel | Nilai |
| --- | --- |
| `DATABASE_URL` | Connection string **pooled** dari Neon (host mengandung `-pooler`, `?sslmode=require`) |
| `ACCESS_TOKEN_SECRET` | String acak panjang, contoh: `openssl rand -hex 32` |
| `CORS_ORIGIN` | Origin frontend, contoh: `http://localhost:5173,https://duitku.vercel.app` |

`NODE_ENV` tidak perlu diset — Vercel otomatis menggunakan `production`.

### Langkah deploy

1. Push repository ke GitHub.
2. Import project di [Vercel](https://vercel.com/new) — framework Elysia akan terdeteksi otomatis, build command dan output directory dibiarkan default.
3. Tambahkan variabel environment di atas untuk environment **Production** dan **Preview**.
4. Jalankan migrasi ke database Neon dari lokal. Gunakan connection string **direct** (bukan `-pooler`) untuk migrasi:

   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/duitku?sslmode=require" bun run db:migrate
   ```

   Hindari `db:push` ke production tanpa backup.
5. Deploy, lalu verifikasi:
   - `GET https://<project>.vercel.app/api/cronjob` → `{ "status": "ok" }`
   - `GET https://<project>.vercel.app/api/openapi` → Swagger UI
   - Register → login → refresh untuk memastikan cookie berjalan.

### Catatan

- Bun runtime di Vercel masih berstatus **beta**. Bila bermasalah, alternatifnya pindah ke Node runtime dan mengganti `Bun.password` dengan library Argon2 yang kompatibel Node.
- `prepare: false` pada koneksi database diperlukan karena Neon menggunakan PgBouncer (transaction mode).
- Rate limiting (`elysia-rate-limit`) berjalan per-instance di serverless, sehingga tidak sepenuhnya global. Untuk kebutuhan produksi, pertimbangkan store eksternal seperti Upstash Redis.
- Bila frontend dan API berada di domain berbeda, cookie memakai `SameSite=None; Secure`. Safari/ITP dapat memblokir third-party cookie — paling aman menaruh frontend dan API pada satu site (mis. `app.domain.com` dan `api.domain.com`).

## Struktur Project

```
src/
├── index.ts            # Definisi app Elysia + default export (entry untuk Vercel)
├── serve.ts            # Menjalankan server lokal (app.listen)
├── db/
│   ├── index.ts        # Koneksi Drizzle + relasi
│   ├── schema.ts       # Seluruh tabel (users, wallets, transactions, ...)
│   ├── relations.ts    # Definisi relasi antar tabel
│   └── defaultCategories.ts  # 12 kategori default untuk user baru
├── lib/
│   ├── error.ts        # AppError (kode error + pesan seragam)
│   └── pgError.ts      # Helper pemetaan error PostgreSQL
├── plugin/
│   ├── jwt.ts          # Setup JWT access token (exp 15 menit)
│   ├── authGuard.ts    # Guard — verifikasi access token dari cookie
│   ├── limiter.ts      # Rate limiting login & register
│   └── errorHandler.ts # Handler global — format error seragam
├── modules/
│   ├── auth/           # Register, login, refresh, logout
│   ├── users/          # Profil user (/me)
│   ├── wallet/         # CRUD dompet
│   ├── category/       # CRUD kategori
│   ├── transaction/    # CRUD transaksi + filter
│   ├── budgets/        # Budget per kategori per bulan
│   └── reports/        # Laporan & ringkasan
└── utils/
    └── refreshToken.ts # Generate & hash refresh token
```

Pola tiap module: `index.ts` (route) → `service.ts` (logika bisnis) → `model.ts` (schema validasi TypeBox).

## API Reference

Semua endpoint berada di bawah prefix **`/api`**.

Kecuali dinyatakan lain, semua endpoint membutuhkan **autentikasi** (access token pada cookie `access_token`, otomatis terisi saat login).

### Auth — `/api/auth`

| Method | Endpoint | Autentikasi | Deskripsi |
| --- | --- | --- | --- |
| POST | `/auth/register` | ❌ | Register user baru — otomatis membuat dompet "Dompet Utama" + 12 kategori default |
| POST | `/auth/login` | ❌ | Login — mengisi cookie `access_token` (15 menit) & `refresh_token` (7 hari) |
| POST | `/auth/refresh` | ❌ | Rotasi token — mencabut refresh token lama, mengisi cookie token baru |
| POST | `/auth/logout` | ❌ | Mencabut refresh token & menghapus cookie |

Body `register`: `name`, `email`, `password` (min. 8 karakter).
Body `login`: `email`, `password`.

### User — `/api/me`

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/me` | Ambil data user yang sedang login |

### Wallet — `/api/wallets`

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/wallets` | Daftar semua dompet |
| POST | `/wallets` | Buat dompet baru — body: `name`, `initialBalance?` |
| PATCH | `/wallets/:id` | Update dompet — body: `name?`, `initialBalance?` |
| DELETE | `/wallets/:id` | Hapus dompet |

### Category — `/api/categories`

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/categories` | Daftar kategori — query: `type?` (`income` \| `expense`) |
| GET | `/categories/:id` | Detail satu kategori |
| POST | `/categories` | Buat kategori — body: `name`, `type`, `color` |
| PATCH | `/categories/:id` | Update kategori — body: `name?`, `color?` (hex `#RRGGBB`) |
| DELETE | `/categories/:id` | Hapus kategori |

### Transaction — `/api/transactions`

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/transactions` | Daftar transaksi dengan filter & pagination |
| GET | `/transactions/:id` | Detail satu transaksi |
| POST | `/transactions` | Catat transaksi — body: `walletId`, `categoryId`, `amount`, `type`, `date`, `note?` |
| PATCH | `/transactions/:id` | Update transaksi — body: field apa pun (min. 1) |
| DELETE | `/transactions/:id` | Hapus transaksi |

Query `GET /transactions`:

| Param | Tipe | Keterangan |
| --- | --- | --- |
| `from`, `to` | `YYYY-MM-DD` | Rentang tanggal transaksi |
| `type` | `income` \| `expense` | Filter jenis |
| `walletId` | uuid | Filter dompet |
| `categoryId` | uuid | Filter kategori |
| `search` | string | Cari pada `note` |
| `page` | number | Halaman (default: 1) |
| `limit` | number | Per halaman (default: 20, maks: 100) |

> `amount` disimpan sebagai bilangan bulat (mis. Rupiah tanpa desimal).

### Budget — `/api/budgets`

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/budgets` | Daftar budget — query: `month` (`YYYY-MM`) |
| PUT | `/budgets` | Upsert budget — body: `categoryId`, `month`, `limitAmount` |
| DELETE | `/budgets/:id` | Hapus budget |

Satu budget unik per (user, kategori, bulan).

### Report — `/api/reports`

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/reports` | Ringkasan pemasukan & pengeluaran bulan berjalan — query: `month?` (`YYYY-MM`) |
| GET | `/reports/by-category` | Pengeluaran per kategori — query: `month?` |
| GET | `/reports/monthly-trend` | Tren pemasukan/pengeluaran 12 bulan — query: `year` (wajib, `YYYY`) |
| GET | `/reports/wallet-balances` | Saldo setiap dompet |

### Lainnya

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/api/cronjob` | Health check / endpoint untuk cron job |

## Format Response

Respons sukses umumnya berbentuk:

```json
{
  "success": true,
  "data": { }
}
```

Semua error dikembalikan dalam format seragam:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "fields": [
      { "path": "email", "message": "Format email tidak valid" }
    ]
  }
}
```

| Kode | Status | Keterangan |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Body/query/params tidak sesuai schema |
| `TOKEN_NOT_FOUND` / `TOKEN_INVALID` | 401 | Access token tidak ada atau tidak valid |
| `EMAIL_TAKEN` | 409 | Email sudah terdaftar |
| `NOT_FOUND` | 404 | Rute tidak ditemukan |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `INTERNAL_ERROR` | 500 | Kesalahan tak terduga di server |

## Keamanan

- **Access token** — JWT berumur 15 menit, disimpan sebagai cookie `httpOnly`.
- **Refresh token** — berumur 7 hari, disimpan sebagai cookie `httpOnly` dengan `path: /auth`. Hanya *hash*-nya (SHA-256) yang disimpan di database, dan menggunakan skema **rotasi**: setiap refresh menghasilkan token baru sekaligus mencabut yang lama. Bila token yang sudah dicabut dipakai ulang, seluruh keluarga token langsung dicabut (*reuse detection*).
- **Password** — di-hash dengan **Argon2id** via `Bun.password`.
- **Rate limiting** — login maks. 5 request/menit, register maks. 8 request/menit.
- **Cookie `secure`** — otomatis aktif saat `NODE_ENV=production`.

## OpenAPI Docs

Dokumentasi interaktif (Swagger UI) tersedia otomatis saat server berjalan:

```
http://localhost:3000/api/openapi
```

Schema diambil langsung dari validasi TypeBox di tiap route, sehingga selalu sinkron dengan kode.

## Lisensi

MIT
