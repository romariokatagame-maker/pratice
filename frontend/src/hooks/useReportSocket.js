import { useEffect } from 'react';
import { createSocket } from '../services/socket';

export function useReportSocket(token, { onNewReport, onReportUpdated }) {
  useEffect(() => {
    if (!token) return undefined;

    const socket = createSocket(token);
    if (onNewReport) socket.on('newReport', onNewReport);
    if (onReportUpdated) socket.on('reportUpdated', onReportUpdated);

    return () => {
      socket.disconnect();
    };
  }, [token, onNewReport, onReportUpdated]);
}
