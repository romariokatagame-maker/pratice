import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { apiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useReportSocket } from '../hooks/useReportSocket';
import ReportCard from './ReportCard';
import { STATUS_LABEL } from '../constants';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

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

  const handleNewReport = useCallback((report) => {
    setReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
  }, []);

  const handleReportUpdated = useCallback((updated) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  useReportSocket(token, { onNewReport: handleNewReport, onReportUpdated: handleReportUpdated });

  const visible = useMemo(
    () => (filter ? reports.filter((r) => r.status === filter) : reports),
    [reports, filter]
  );

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  const submitReply = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await api.put(`/reports/${replyFor}/respond`, { message: replyText });
      handleReportUpdated(res.data.report);
      setReplyFor(null);
      setReplyText('');
    } catch (err) {
      setError(apiError(err, 'Gagal mengirim balasan'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card">
      <div className="dashboard-header">
        <h2>Dashboard kepolisian</h2>
        <div className="counters">
          <span className="badge pending">{pendingCount} menunggu</span>
          <span className="badge">{reports.length} total</span>
          <button type="button" className="secondary" onClick={fetchReports}>
            Muat ulang
          </button>
        </div>
      </div>

      <label className="filter">
        Filter status
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Semua</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}
      {visible.length === 0 && <p className="muted">Tidak ada laporan.</p>}

      <div className="report-list">
        {visible.map((report) => (
          <ReportCard key={report.id} report={report}>
            {replyFor === report.id ? (
              <form onSubmit={submitReply} className="reply-form">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Contoh: Tim sedang menuju lokasi"
                  minLength={5}
                  maxLength={500}
                  rows={3}
                  required
                />
                <div className="row">
                  <button className="primary" type="submit" disabled={sending}>
                    {sending ? 'Mengirim...' : 'Kirim balasan'}
                  </button>
                  <button type="button" className="secondary" onClick={() => setReplyFor(null)}>
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="primary"
                onClick={() => {
                  setReplyFor(report.id);
                  setReplyText('');
                }}
              >
                {report.policeReply ? 'Perbarui balasan' : 'Konfirmasi & balas'}
              </button>
            )}
          </ReportCard>
        ))}
      </div>
    </div>
  );
}
