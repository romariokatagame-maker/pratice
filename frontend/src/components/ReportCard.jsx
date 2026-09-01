import { CRIME_OPTIONS, STATUS_LABEL, formatDateTime, mapsLink } from '../constants';

export default function ReportCard({ report, children }) {
  const crime = CRIME_OPTIONS.find((c) => c.value === report.crimeType);
  const { latitude, longitude, address } = report.location;

  return (
    <article className={`report status-${report.status}`}>
      <header>
        <h3>{crime ? crime.label : report.crimeType}</h3>
        <span className={`badge ${report.status}`}>{STATUS_LABEL[report.status]}</span>
      </header>

      <p>{report.description}</p>

      <dl>
        <div>
          <dt>Lokasi</dt>
          <dd>
            <a href={mapsLink(latitude, longitude)} target="_blank" rel="noreferrer">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </a>
            {address ? ` — ${address}` : ''}
          </dd>
        </div>
        <div>
          <dt>Waktu</dt>
          <dd>{formatDateTime(report.createdAt)}</dd>
        </div>
        <div>
          <dt>Nomor</dt>
          <dd>{report.id}</dd>
        </div>
      </dl>

      {report.photoURL && (
        <a href={report.photoURL} target="_blank" rel="noreferrer">
          Lihat foto bukti
        </a>
      )}

      {report.policeReply && (
        <div className="police-reply">
          <strong>Balasan kepolisian</strong>
          <p>{report.policeReply.message}</p>
          <small>{formatDateTime(report.policeReply.confirmTime)}</small>
        </div>
      )}

      {children}
    </article>
  );
}
