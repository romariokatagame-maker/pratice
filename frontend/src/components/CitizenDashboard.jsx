import { useCallback, useEffect, useState } from 'react';
import api, { apiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useReportSocket } from '../hooks/useReportSocket';
import ReportForm from './ReportForm';
import ReportCard from './ReportCard';

export default function CitizenDashboard() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) {
      setError(apiError(err, 'Gagal memuat laporan'));
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleReportUpdated = useCallback((updated) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  useReportSocket(token, { onReportUpdated: handleReportUpdated });

  const handleCreated = useCallback((report) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  return (
    <div className="layout">
      <ReportForm onCreated={handleCreated} />

      <section className="card">
        <h2>Laporan saya ({reports.length})</h2>
        {error && <p className="error">{error}</p>}
        {reports.length === 0 && <p className="muted">Belum ada laporan.</p>}
        <div className="report-list">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>
    </div>
  );
}
