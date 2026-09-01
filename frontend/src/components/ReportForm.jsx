import { useState } from 'react';
import api, { apiError } from '../services/api';
import { getCurrentLocation } from '../services/gps';
import { CRIME_OPTIONS } from '../constants';

const EMPTY = { crimeType: '', description: '', address: '', photoURL: '' };

export default function ReportForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleLocate = async () => {
    setLocating(true);
    setStatus({ type: '', message: '' });
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      setStatus({ type: 'error', message: 'Ambil lokasi GPS terlebih dahulu' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await api.post('/reports', {
        ...form,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setStatus({
        type: 'success',
        message: `Laporan terkirim ke kepolisian. Nomor laporan: ${res.data.reportId}`,
      });
      setForm(EMPTY);
      setLocation(null);
      onCreated?.(res.data.report);
    } catch (err) {
      setStatus({ type: 'error', message: apiError(err, 'Gagal mengirim laporan') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Lapor kejahatan</h2>

      <form onSubmit={handleSubmit}>
        <button type="button" className="secondary" onClick={handleLocate} disabled={locating}>
          {locating ? 'Mencari lokasi...' : 'Ambil lokasi GPS'}
        </button>

        {location && (
          <p className="success">
            Lokasi: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            {location.accuracy ? ` (±${Math.round(location.accuracy)} m)` : ''}
          </p>
        )}

        <label>
          Jenis kejahatan
          <select value={form.crimeType} onChange={update('crimeType')} required>
            <option value="">-- Pilih --</option>
            {CRIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Deskripsi kejadian
          <textarea
            value={form.description}
            onChange={update('description')}
            placeholder="Apa yang terjadi, ciri pelaku, waktu kejadian"
            minLength={10}
            maxLength={500}
            rows={4}
            required
          />
        </label>

        <label>
          Patokan alamat (opsional)
          <input
            value={form.address}
            onChange={update('address')}
            placeholder="Jl. Cenderawasih, depan pasar"
          />
        </label>

        <label>
          Tautan foto bukti (opsional)
          <input
            value={form.photoURL}
            onChange={update('photoURL')}
            placeholder="https://..."
            type="url"
          />
        </label>

        {status.message && <p className={status.type}>{status.message}</p>}

        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim laporan'}
        </button>
      </form>
    </div>
  );
}
