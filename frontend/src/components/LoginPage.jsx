import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../services/api';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'warga' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
    } catch (err) {
      setError(apiError(err, 'Gagal masuk'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Timika Aman</h1>
        <p className="muted">Pelaporan kejahatan real-time untuk warga dan kepolisian.</p>

        <div className="tabs">
          <button
            type="button"
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => setMode('login')}
          >
            Masuk
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => setMode('register')}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Nama lengkap
              <input value={form.name} onChange={update('name')} required minLength={3} />
            </label>
          )}

          <label>
            Email
            <input type="email" value={form.email} onChange={update('email')} required />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
            />
          </label>

          {mode === 'register' && (
            <label>
              Daftar sebagai
              <select value={form.role} onChange={update('role')}>
                <option value="warga">Warga</option>
                <option value="polisi">Petugas kepolisian</option>
              </select>
            </label>
          )}

          {error && <p className="error">{error}</p>}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <div className="demo-box">
          <strong>Akun demo</strong>
          <span>warga@timika.id / warga1234</span>
          <span>polisi@timika.id / polisi1234</span>
        </div>
      </div>
    </div>
  );
}
