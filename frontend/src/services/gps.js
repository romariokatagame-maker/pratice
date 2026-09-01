export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser tidak mendukung GPS'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => reject(new Error(gpsErrorMessage(error))),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

function gpsErrorMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Izin lokasi ditolak. Aktifkan GPS di pengaturan browser.';
    case error.POSITION_UNAVAILABLE:
      return 'Lokasi tidak tersedia. Coba di area terbuka.';
    case error.TIMEOUT:
      return 'Waktu pengambilan lokasi habis. Coba lagi.';
    default:
      return 'Gagal mengambil lokasi GPS.';
  }
}
