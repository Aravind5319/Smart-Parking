// ============================================================================
// REAL GPS LOCATION & REVERSE GEOCODING SERVICE
// ============================================================================

export interface RealLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  landmark: string;
  timestamp: string;
}

export const requestRealLocation = async (): Promise<RealLocationResult> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device/browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 5);
        let landmark = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;

        try {
          // OpenStreetMap Free Reverse Geocoding API (Zero API Key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { headers: { Accept: 'application/json' } }
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.village || '';
            const city = addr.city || addr.town || addr.county || addr.state || '';

            if (road && city) {
              landmark = `${road}, ${city}`;
            } else if (road) {
              landmark = `${road}`;
            } else if (data.display_name) {
              landmark = data.display_name.split(',').slice(0, 3).join(',').trim();
            }
          }
        } catch (err) {
          console.warn('Reverse geocoding network error, fallback to coordinates', err);
        }

        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        resolve({
          latitude: lat,
          longitude: lon,
          accuracy,
          landmark,
          timestamp,
        });
      },
      (error) => {
        // User denied permission or position unavailable
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};
