// ============================================================================
// GOOGLE MAPS INTERACTIVE VECTOR & TILE MAP VIEW
// Renders responsive Leaflet map with custom SVG pins, ambulance route & navigation polyline
// ============================================================================

import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CityPlace, NavigationSession } from '../../types/navigation';

interface GoogleMapViewProps {
  places: CityPlace[];
  selectedPlace: CityPlace | null;
  onSelectPlace: (place: CityPlace) => void;
  userCoords: { latitude: number; longitude: number };
  navigationSession: NavigationSession | null;
  showAmbulanceAlert?: boolean;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  userCoords,
  navigationSession,
  showAmbulanceAlert = true,
}) => {
  // Generate self-contained HTML for Leaflet with Google Maps Carto styling
  const mapHtml = useMemo(() => {
    const placesJson = JSON.stringify(places);
    const navJson = JSON.stringify(navigationSession);
    const selectedId = selectedPlace?.id || '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #e5e3df; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    
    /* Google GPS User Location Dot */
    .user-gps-marker {
      width: 22px;
      height: 22px;
      background: #1a73e8;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(26, 115, 232, 0.35);
      animation: pulseGps 2s infinite;
    }
    @keyframes pulseGps {
      0% { box-shadow: 0 0 0 0 rgba(26, 115, 232, 0.7); }
      70% { box-shadow: 0 0 0 16px rgba(26, 115, 232, 0); }
      100% { box-shadow: 0 0 0 0 rgba(26, 115, 232, 0); }
    }

    /* Custom SVG Pin Styles */
    .map-pin {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .map-pin:hover {
      transform: scale(1.15) translateY(-2px);
      z-index: 9999 !important;
    }
    .pin-active {
      transform: scale(1.22) translateY(-4px) !important;
      z-index: 10000 !important;
    }

    .pin-badge {
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 3px 7px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 800;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
    .badge-parking-smart { background: #1e3a8a; border: 1.5px solid #fff; }
    .badge-parking-free { background: #059669; border: 1.5px solid #fff; }
    .badge-no-parking { background: #dc2626; border: 1.5px solid #fff; }
    .badge-toilet { background: #0284c7; border: 1.5px solid #fff; }
    .badge-fuel { background: #ea580c; border: 1.5px solid #fff; }
    .badge-atm { background: #16a34a; border: 1.5px solid #fff; }
    .badge-signal { background: #d97706; border: 1.5px solid #fff; }

    /* Ambulance Alert Banner Overlay on Map */
    .ambulance-banner {
      position: absolute;
      top: 105px;
      left: 14px;
      background: #dc2626;
      color: #fff;
      padding: 7px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
      z-index: 1000;
      pointer-events: auto;
      cursor: pointer;
      animation: alertPulse 1.8s infinite;
    }
    @keyframes alertPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }

    /* Rajiv Gandhi Signal Floating Tag */
    .signal-tag {
      position: absolute;
      top: 150px;
      left: 14px;
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      z-index: 1000;
    }
    .signal-light-dot {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    /* Map UI Controls */
    .recenter-btn {
      position: absolute;
      bottom: 220px;
      right: 14px;
      width: 44px;
      height: 44px;
      border-radius: 22px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1000;
      transition: background 0.15s;
    }
    .recenter-btn:hover { background: #f8fafc; }

    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- Live Ambulance Approaching Banner (Matching Screen 1 of Image 2) -->
  <div class="ambulance-banner" onclick="window.parent.postMessage({type: 'OPEN_EMERGENCY'}, '*')">
    <span>🚑</span>
    <span>Ambulance Approaching • ETA 1 min</span>
  </div>

  <!-- Rajiv Gandhi Signal Live Indicator (Matching Screen 1 of Image 2) -->
  <div class="signal-tag" onclick="window.parent.postMessage({type: 'SELECT_SIGNAL'}, '*')">
    <div class="signal-light-dot"></div>
    <span>Rajiv Gandhi Signal • Normal Flow</span>
  </div>

  <!-- Recenter GPS Button -->
  <div class="recenter-btn" onclick="recenterMap()">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
    </svg>
  </div>

  <script>
    const userLat = ${userCoords.latitude};
    const userLng = ${userCoords.longitude};
    const places = ${placesJson};
    const navSession = ${navJson};
    const selectedPlaceId = "${selectedId}";

    // Initialize Map with Google-styled Carto Voyager tiles
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([userLat, userLng], 15);

    // Google-style clean tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Pulsing User Location Marker
    const userIcon = L.divIcon({
      className: 'user-gps-marker',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

    // Ambulance Alert Route (Glowing red dashed polyline matching Image 2)
    const ambulanceRoute = [
      [11.9380, 79.8220], // Rajiv Gandhi Signal
      [11.9365, 79.8260],
      [11.9345, 79.8310],
      [11.9338, 79.8358]  // Beach Road
    ];
    L.polyline(ambulanceRoute, {
      color: '#dc2626',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(map);

    // Draw City Place Pins
    places.forEach(place => {
      const isSelected = place.id === selectedPlaceId;
      let badgeClass = 'badge-parking-smart';
      let iconSymbol = '🅿️';
      let text = place.vacantSlots !== undefined ? (place.isFull ? 'FULL' : place.vacantSlots + ' / ' + place.totalSlots) : place.name;

      if (place.category === 'PARKING_FREE') {
        badgeClass = 'badge-parking-free';
        iconSymbol = '🅿️ Free';
        text = place.vacantSlots ? place.vacantSlots + ' bays' : 'Free Kerb';
      } else if (place.category === 'NO_PARKING') {
        badgeClass = 'badge-no-parking';
        iconSymbol = '🚫';
        text = 'No Parking';
      } else if (place.category === 'TOILET') {
        badgeClass = 'badge-toilet';
        iconSymbol = '🚻';
        text = 'Toilet';
      } else if (place.category === 'FUEL') {
        badgeClass = 'badge-fuel';
        iconSymbol = '⛽';
        text = 'Fuel';
      } else if (place.category === 'ATM') {
        badgeClass = 'badge-atm';
        iconSymbol = '🏧';
        text = 'ATM';
      } else if (place.category === 'SIGNAL') {
        badgeClass = 'badge-signal';
        iconSymbol = '🚥';
        text = 'Signal';
      }

      const html = '<div class="map-pin ' + (isSelected ? 'pin-active' : '') + '">' +
        '<div class="pin-badge ' + badgeClass + '">' +
          '<span>' + iconSymbol + '</span> ' +
          '<span>' + text + '</span>' +
        '</div>' +
      '</div>';

      const customIcon = L.divIcon({
        className: 'custom-pin-wrap',
        html: html,
        iconSize: [80, 26],
        iconAnchor: [40, 13]
      });

      const marker = L.marker([place.coordinates.latitude, place.coordinates.longitude], {
        icon: customIcon
      }).addTo(map);

      marker.on('click', () => {
        window.parent.postMessage({ type: 'SELECT_PLACE', placeId: place.id }, '*');
      });
    });

    // Navigation Session Route Polyline (Google Maps vivid blue path)
    if (navSession && navSession.destination) {
      const destCoords = [navSession.destination.coordinates.latitude, navSession.destination.coordinates.longitude];
      const navPath = [
        [userLat, userLng],
        [userLat + 0.001, userLng + 0.0015],
        [destCoords[0] - 0.0005, destCoords[1] - 0.001],
        destCoords
      ];

      L.polyline(navPath, {
        color: '#1a73e8',
        weight: 6,
        opacity: 0.95
      }).addTo(map);

      // Fit bounds to show entire route with padding
      const group = new L.featureGroup([
        L.marker([userLat, userLng]),
        L.marker(destCoords)
      ]);
      map.fitBounds(group.getBounds(), { padding: [120, 40] });
    }

    function recenterMap() {
      map.flyTo([userLat, userLng], 16, { animate: true, duration: 1 });
    }

    // Handle messages from parent React Native app
    window.addEventListener('message', function(e) {
      if (!e.data) return;
      if (e.data.type === 'PAN_TO') {
        map.flyTo([e.data.lat, e.data.lng], 16, { animate: true, duration: 0.8 });
      }
    });
  </script>
</body>
</html>`;
  }, [places, selectedPlace, userCoords, navigationSession]);

  // Handle messages posted from iframe
  const handleIframeMessage = (e: any) => {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (!data) return;

      if (data.type === 'SELECT_PLACE' && data.placeId) {
        const found = places.find((p) => p.id === data.placeId);
        if (found) onSelectPlace(found);
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('message', handleIframeMessage);
      return () => window.removeEventListener('message', handleIframeMessage);
    }
  }, [places]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={mapHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Google Map Puducherry"
        />
      ) : (
        <View style={styles.fallbackBox} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e5e3df',
  },
  fallbackBox: {
    flex: 1,
    backgroundColor: '#CBD5E1',
  },
});
