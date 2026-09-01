export const CRIME_OPTIONS = [
  { value: 'jambret', label: 'Jambret' },
  { value: 'maling', label: 'Maling' },
  { value: 'pembunuhan', label: 'Pembunuhan' },
  { value: 'pelecehan', label: 'Pelecehan' },
  { value: 'kekerasan', label: 'Kekerasan' },
  { value: 'tawuran', label: 'Tawuran' },
];

export const STATUS_LABEL = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  responded: 'Ditangani',
  resolved: 'Selesai',
};

export function formatDateTime(value) {
  return new Date(value).toLocaleString('id-ID');
}

export function mapsLink(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
