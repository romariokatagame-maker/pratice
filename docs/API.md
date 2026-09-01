# API Timika Aman

Base URL lokal: `http://localhost:5000/api`

Semua endpoint laporan butuh header `Authorization: Bearer <token>` yang didapat dari
`/auth/login` atau `/auth/register`.

## Auth

### POST /auth/register

```json
{ "name": "Joni Warga", "email": "joni@timika.id", "password": "rahasia123", "role": "warga" }
```

`role` opsional: `warga` (default) atau `polisi`. Respons `201`:

```json
{ "token": "<jwt>", "user": { "id": "user_1", "name": "Joni Warga", "email": "joni@timika.id", "role": "warga" } }
```

Kesalahan: `400` validasi, `409` email sudah terdaftar.

### POST /auth/login

```json
{ "email": "warga@timika.id", "password": "warga1234" }
```

Respons sama seperti register. Kesalahan `401` bila kredensial salah.

### GET /auth/me

Mengembalikan `{ "user": { ... } }` untuk token saat ini.

## Laporan

### POST /reports

Dibatasi 10 laporan per 15 menit per IP.

```json
{
  "crimeType": "jambret",
  "description": "Tas merah dijambret di depan mall",
  "latitude": -4.5427,
  "longitude": 136.8867,
  "address": "Jl. Cenderawasih",
  "photoURL": "https://contoh.com/foto.jpg"
}
```

`crimeType` harus salah satu dari: `jambret`, `maling`, `pembunuhan`, `pelecehan`, `kekerasan`,
`tawuran`. `description` 10–500 karakter. `address` dan `photoURL` opsional.

Respons `201`:

```json
{ "success": true, "reportId": "report_1", "message": "Laporan berhasil dikirim ke kepolisian", "report": { ... } }
```

Efek samping: event socket `newReport` dikirim ke room `polisi`.

### GET /reports?status=pending

Warga hanya menerima laporannya sendiri; petugas menerima semua laporan. Diurutkan dari yang
terbaru. `status` opsional: `pending`, `confirmed`, `responded`, `resolved`.

### GET /reports/:id

`404` bila tidak ada, `403` bila warga mengakses laporan orang lain.

### PUT /reports/:id/respond

Hanya untuk peran `polisi`.

```json
{ "message": "Tim sedang menuju lokasi", "status": "confirmed" }
```

`status` opsional (`confirmed` default, bisa `responded` atau `resolved`). Respons `200` berisi
laporan terbaru dan mengirim event socket `reportUpdated` ke pelapor serta seluruh petugas.

Kesalahan: `403` bukan petugas, `404` laporan tidak ditemukan.

## Endpoint lain

- `GET /health` → `{ "status": "ok" }`
- `GET /crime-types` → daftar jenis kejahatan yang valid

## Socket.io

Klien wajib mengirim token saat handshake:

```js
io('http://localhost:5000', { auth: { token } });
```

Setiap koneksi otomatis masuk room `user:<userId>`; petugas juga masuk room `polisi`.

| Event           | Diterima oleh          | Isi                     |
| --------------- | ---------------------- | ----------------------- |
| `newReport`     | room `polisi`          | objek laporan baru      |
| `reportUpdated` | pelapor + room `polisi`| objek laporan terbaru   |

## Format laporan

```json
{
  "id": "report_1",
  "userId": "user_1",
  "crimeType": "jambret",
  "description": "Tas merah dijambret di depan mall",
  "location": { "latitude": -4.5427, "longitude": 136.8867, "address": "Jl. Cenderawasih" },
  "photoURL": null,
  "status": "pending",
  "createdAt": "2026-09-01T07:30:00.000Z",
  "policeReply": {
    "officerId": "user_2",
    "message": "Tim sedang menuju lokasi",
    "confirmTime": "2026-09-01T07:32:00.000Z"
  }
}
```
