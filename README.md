# Timika Aman

Aplikasi pelaporan kejahatan real-time untuk warga Timika dan kepolisian. Warga mengirim laporan
lengkap dengan koordinat GPS, petugas menerima notifikasi seketika lewat WebSocket dan membalas
laporan; warga melihat balasannya tanpa perlu refresh.

MVP ini memakai **penyimpanan in-memory (mock database)** sehingga bisa dijalankan tanpa Firebase
atau layanan berbayar apa pun. Data hilang saat server dimatikan.

## Tumpukan teknologi

| Bagian    | Teknologi                                                        |
| --------- | ---------------------------------------------------------------- |
| Backend   | Node.js, Express, Socket.io, JWT (jsonwebtoken), express-validator |
| Frontend  | React 19, Vite, Axios, socket.io-client                            |
| Database  | In-memory store (`backend/src/data/store.js`)                      |

## Menjalankan secara lokal

Butuh Node.js 20+.

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Buka http://localhost:5173.

### Akun demo

Dibuat otomatis saat server start (matikan dengan `SEED_DEMO_USERS=false`):

| Peran  | Email             | Password    |
| ------ | ----------------- | ----------- |
| Warga  | warga@timika.id   | warga1234   |
| Polisi | polisi@timika.id  | polisi1234  |

Untuk mencoba alur real-time: login sebagai warga di satu browser, polisi di browser lain
(atau jendela incognito), lalu kirim laporan.

> GPS browser hanya aktif di `localhost` atau HTTPS. Jika izin lokasi ditolak, tombol
> "Ambil lokasi GPS" akan menampilkan pesan kesalahan.

## Perintah

```bash
cd backend  && npm test    # unit/integration test API (Jest + Supertest)
cd backend  && npm run lint
cd frontend && npm run lint
cd frontend && npm run build
```

## Struktur

```
timika-aman/
├── backend/
│   ├── server.js              # bootstrap HTTP + Socket.io
│   ├── src/app.js             # aplikasi Express (dipakai juga oleh test)
│   ├── src/socket.js          # autentikasi socket + room per user/peran
│   ├── src/routes/            # auth.js, reports.js
│   ├── src/middleware/        # auth.js (JWT + role), validate.js
│   ├── src/data/store.js      # mock database in-memory
│   └── tests/api.test.js
├── frontend/
│   └── src/
│       ├── components/        # LoginPage, ReportForm, ReportCard, dashboard warga & polisi
│       ├── context/           # AuthContext
│       ├── hooks/             # useReportSocket
│       └── services/          # api.js, socket.js, gps.js
└── docs/API.md
```

## Alur data

1. Warga menekan "Ambil lokasi GPS" → `navigator.geolocation` mengembalikan koordinat.
2. Form dikirim ke `POST /api/reports` dengan header `Authorization: Bearer <token>`.
3. Backend memvalidasi input, menyimpan laporan, lalu `io.to('polisi').emit('newReport', report)`.
4. Dashboard kepolisian menambahkan laporan baru tanpa refresh.
5. Petugas membalas via `PUT /api/reports/:id/respond`; backend mengirim `reportUpdated`
   ke room `user:<pelapor>` sehingga warga langsung melihat status "Dikonfirmasi".

Detail endpoint ada di [docs/API.md](docs/API.md).

## Langkah lanjutan

- Ganti `src/data/store.js` dengan Firebase Firestore atau PostgreSQL (antarmuka fungsinya sudah
  dipisah agar mudah ditukar).
- Upload foto ke object storage, saat ini yang disimpan hanya tautan foto.
- Tampilkan laporan di peta (Google Maps / Leaflet) memakai koordinat yang sudah tersedia.
- Deploy: frontend ke Vercel, backend ke Render/Railway, set `VITE_API_URL` dan `CORS_ORIGIN`.
