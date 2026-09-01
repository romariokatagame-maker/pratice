import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import CitizenDashboard from './components/CitizenDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function Shell() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p className="muted center">Memuat...</p>;
  if (!user) return <LoginPage />;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <strong>Timika Aman</strong>
          <span className="muted"> — {user.role === 'polisi' ? 'Kepolisian' : 'Warga'}</span>
        </div>
        <div className="row">
          <span>{user.name}</span>
          <button type="button" className="secondary" onClick={logout}>
            Keluar
          </button>
        </div>
      </header>

      <main>{user.role === 'polisi' ? <AdminDashboard /> : <CitizenDashboard />}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
