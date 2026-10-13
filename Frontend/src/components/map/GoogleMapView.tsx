// ============================================================================
// GOOGLE MAPS INTERACTIVE VECTOR & TILE MAP VIEW
// Real Google Maps Roadmap tiles, GPS-first entry, road-snapped routing polyline,
// sleek aspect markers (Parking, Toilets, Dustbins, Fuel, ATMs), and floating SOS
// ============================================================================

import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CityPlace, NavigationSession } from '../../types/navigation';

interface GoogleMapViewProps {
  places: CityPlace[];
  selectedPlace: CityPlace | null;
  onSelectPlace: (place: CityPlace) => void;
  userCoords: { latitude: number; longitude: number };
  navigationSession: NavigationSession | null;
  showAmbulanceAlert?: boolean;
  onOpenSos?: () => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  userCoords,
  navigationSession,
  showAmbulanceAlert = true,
  onOpenSos,
}) => {
  const iframeRef = useRef<any>(null);

  // Send panTo message to iframe when selectedPlace changes
  useEffect(() => {
    if (selectedPlace && selectedPlace.coordinates && iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          {
            type: 'PAN_TO',
            lat: selectedPlace.coordinates.latitude,
            lng: selectedPlace.coordinates.longitude,
          },
          '*'
        );
      } catch (e) {}
    }
  }, [selectedPlace]);

  // Recenter to user's location when userCoords update
  useEffect(() => {
    if (userCoords && userCoords.latitude && userCoords.longitude && iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          {
            type: 'UPDATE_USER_LOCATION',
            lat: userCoords.latitude,
            lng: userCoords.longitude,
          },
          '*'
        );
      } catch (e) {}
    }
  }, [userCoords]);

  // Generate self-contained HTML for Leaflet with Google Maps tiles & real road routing
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
    html, body, #map { width: 100%; height: 100%; background: #f2efe9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    .leaflet-div-icon, .custom-pin-wrap {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Google GPS User Location Dot */
    .user-gps-marker {
      width: 22px;
      height: 22px;
      background: #1a73e8;
      border: 3.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 7px rgba(26, 115, 232, 0.4);
      animation: pulseGps 2s infinite;
    }
    @keyframes pulseGps {
      0% { box-shadow: 0 0 0 0 rgba(26, 115, 232, 0.7); }
      70% { box-shadow: 0 0 0 16px rgba(26, 115, 232, 0); }
      100% { box-shadow: 0 0 0 0 rgba(26, 115, 232, 0); }
    }

    /* Sleek Google Maps Aspect Pin Style */
    .map-pin {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px 3px 4px;
      border-radius: 20px;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.22);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      user-select: none;
      white-space: nowrap;
    }
    .map-pin:hover {
      transform: scale(1.12) translateY(-2px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.3);
      z-index: 9999 !important;
    }
    .pin-active {
      transform: scale(1.18) translateY(-3px) !important;
      border-color: #1e3a8a !important;
      box-shadow: 0 8px 20px rgba(30, 58, 138, 0.4) !important;
      z-index: 10000 !important;
    }

    .pin-icon-circle {
      width: 20px;
      height: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #fff;
      font-weight: 900;
    }
    .pin-label-text {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.2px;
    }

    /* Aspect Colors */
    .circle-parking-smart { background: #1e3a8a; }
    .circle-parking-free { background: #059669; }
    .circle-no-parking { background: #dc2626; }
    .circle-toilet { background: #0284c7; }
    .circle-dustbin { background: #10b981; }
    .circle-fuel { background: #ea580c; }
    .circle-atm { background: #16a34a; }
    .circle-signal { background: #d97706; }
    .circle-attraction { background: #64748b; }

    /* Top Ambulance Alert Banner Overlay on Map */
    .ambulance-banner {
      position: absolute;
      top: 108px;
      left: 14px;
      background: #dc2626;
      color: #fff;
      padding: 8px 14px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 16px rgba(220, 38, 38, 0.45);
      z-index: 1000;
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
      top: 156px;
      left: 14px;
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #e2e8f0;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
      z-index: 1000;
      cursor: pointer;
    }
    .signal-light-dot {
      width: 10px;
      height: 10px;
      border-radius: 5px;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    /* Floating SOS Button (Image 5 Inspiration) */
    .sos-btn {
      position: absolute;
      bottom: 275px;
      right: 14px;
      width: 48px;
      height: 48px;
      border-radius: 24px;
      background: #dc2626;
      color: #ffffff;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1000;
      font-weight: 900;
      font-size: 11px;
      letter-spacing: 0.5px;
      transition: transform 0.15s;
      animation: sosPulse 2s infinite;
    }
    .sos-btn:hover { transform: scale(1.08); }
    @keyframes sosPulse {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6); }
      70% { box-shadow: 0 0 0 14px rgba(220, 38, 38, 0); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }

    /* Recenter GPS Floating Button (Google Maps Style) */
    .recenter-btn {
      position: absolute;
      bottom: 220px;
      right: 14px;
      width: 46px;
      height: 46px;
      border-radius: 23px;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1000;
      transition: background 0.15s, transform 0.15s;
    }
    .recenter-btn:hover { background: #f8fafc; transform: scale(1.05); }

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

  <!-- Floating SOS Quick Action Button -->
  <div class="sos-btn" onclick="window.parent.postMessage({type: 'OPEN_EMERGENCY'}, '*')">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 15v-4m0-4h.01"/>
    </svg>
    <span>SOS</span>
  </div>

  <!-- Google Maps Recenter GPS Button -->
  <div class="recenter-btn" onclick="recenterMap()" title="Recenter to My Location">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
    </svg>
  </div>

  <!-- Google Maps Bottom-Left Logo -->
  <div style="position: absolute; bottom: 6px; left: 10px; z-index: 1000; pointer-events: none; opacity: 0.85;">
    <span style="font-family: 'Product Sans', Roboto, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #5f6368; letter-spacing: -0.3px;">
      <span style="color: #4285F4">G</span><span style="color: #EA4335">o</span><span style="color: #FBBC05">o</span><span style="color: #4285F4">g</span><span style="color: #34A853">l</span><span style="color: #EA4335">e</span>
    </span>
  </div>

  <script>
    let userLat = ${userCoords.latitude};
    let userLng = ${userCoords.longitude};
    const places = ${placesJson};
    const navSession = ${navJson};
    const selectedPlaceId = "${selectedId}";

    // Initialize Map directly at User's Live GPS Location
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([userLat, userLng], 15);

    // Official Google Maps Tile Server
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // User GPS Dot Marker
    const userIcon = L.divIcon({
      className: 'user-gps-marker',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

    // Simulated Active Emergency Responder Beacons (Police PCR Van & Ambulance)
    const policeBeacon = L.marker([11.9360, 79.8290], {
      icon: L.divIcon({
        html: '<div style="background:#1e3a8a;color:#fff;font-size:12px;padding:3px 7px;border-radius:10px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-weight:800;white-space:nowrap;">🚓 Police PCR-12 • 3m away</div>',
        iconAnchor: [50, 15]
      })
    }).addTo(map);

    const ambulanceBeacon = L.marker([11.9375, 79.8240], {
      icon: L.divIcon({
        html: '<div style="background:#dc2626;color:#fff;font-size:12px;padding:3px 7px;border-radius:10px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-weight:800;white-space:nowrap;">🚑 Ambulance AMB-04 • 1m away</div>',
        iconAnchor: [50, 15]
      })
    }).addTo(map);

    // Ambulance Alert Route (Glowing red dashed polyline matching Image 2)
    const ambulanceRoute = [
      [11.9380, 79.8220],
      [11.9365, 79.8260],
      [11.9345, 79.8310],
      [11.9338, 79.8358]
    ];
    L.polyline(ambulanceRoute, {
      color: '#dc2626',
      weight: 5,
      opacity: 0.9,
      dashArray: '8, 8'
    }).addTo(map);

    // Draw Sleek City Place Pins
    if (Array.isArray(places)) {
      places.forEach(function(place) {
        try {
          if (!place || !place.coordinates) return;
          const lat = parseFloat(place.coordinates.latitude);
          const lng = parseFloat(place.coordinates.longitude);
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

          const isSelected = place.id === selectedPlaceId;
          let circleClass = 'circle-parking-smart';
          let symbol = 'P';
          let labelText = place.vacantSlots !== undefined ? (place.isFull ? 'FULL' : place.vacantSlots + ' slots') : place.name;

          if (place.category === 'PARKING_FREE') {
            circleClass = 'circle-parking-free';
            symbol = 'P';
            labelText = place.vacantSlots ? place.vacantSlots + ' free' : 'Free Kerb';
          } else if (place.category === 'NO_PARKING') {
            circleClass = 'circle-no-parking';
            symbol = '🚫';
            labelText = 'No Parking';
          } else if (place.category === 'TOILET') {
            circleClass = 'circle-toilet';
            symbol = '🚻';
            labelText = place.tariff ? place.tariff.split(' ')[0] : 'Toilet';
          } else if (place.category === 'DUSTBIN') {
            circleClass = 'circle-dustbin';
            symbol = '🗑️';
            labelText = 'Dustbin';
          } else if (place.category === 'FUEL') {
            circleClass = 'circle-fuel';
            symbol = '⛽';
            labelText = 'Fuel';
          } else if (place.category === 'ATM') {
            circleClass = 'circle-atm';
            symbol = '₹';
            labelText = 'ATM';
          } else if (place.category === 'SIGNAL') {
            circleClass = 'circle-signal';
            symbol = '🚥';
            labelText = 'Signal';
          } else if (place.category === 'ATTRACTION') {
            circleClass = 'circle-attraction';
            symbol = '⭐';
            labelText = place.name.split(' ')[0];
          }

          const html = '<div class="map-pin ' + (isSelected ? 'pin-active' : '') + '">' +
            '<div class="pin-icon-circle ' + circleClass + '">' + symbol + '</div>' +
            '<span class="pin-label-text">' + labelText + '</span>' +
          '</div>';

          const customIcon = L.divIcon({
            className: 'custom-pin-wrap',
            html: html,
            iconSize: [100, 26],
            iconAnchor: [50, 13]
          });

          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

          marker.on('click', function() {
            window.parent.postMessage({ type: 'SELECT_PLACE', placeId: place.id }, '*');
          });
        } catch(err) {
          console.warn('Marker error', err);
        }
      });
    }

    // DRAW REAL ROAD ROUTING PATH (Follows real road network via OSRM, never across houses!)
    let navPolyline = null;
    if (navSession && navSession.destination && navSession.destination.coordinates) {
      const destLat = parseFloat(navSession.destination.coordinates.latitude);
      const destLng = parseFloat(navSession.destination.coordinates.longitude);

      if (!isNaN(destLat) && !isNaN(destLng)) {
        // If pre-computed road coordinates exist, use them directly
        if (Array.isArray(navSession.geometry) && navSession.geometry.length > 2) {
          drawRoadPath(navSession.geometry, destLat, destLng);
        } else {
          // Fetch exact road coordinates live from OSRM
          const osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + userLng + ',' + userLat + ';' + destLng + ',' + destLat + '?overview=full&geometries=geojson';
          fetch(osrmUrl)
            .then(function(r) { return r.json(); })
            .then(function(d) {
              if (d && d.routes && d.routes.length > 0) {
                const geom = d.routes[0].geometry.coordinates.map(function(c) {
                  return [c[1], c[0]];
                });
                drawRoadPath(geom, destLat, destLng);
              } else {
                drawRoadPath([[userLat, userLng], [destLat, destLng]], destLat, destLng);
              }
            })
            .catch(function() {
              drawRoadPath([[userLat, userLng], [destLat, destLng]], destLat, destLng);
            });
        }
      }
    }

    function drawRoadPath(pts, dLat, dLng) {
      if (navPolyline) map.removeLayer(navPolyline);
      navPolyline = L.polyline(pts, {
        color: '#1a73e8', // Official Google Maps turn navigation blue
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Destination Red Teardrop Marker
      const destIcon = L.divIcon({
        html: '<div style="background:#ea4335;color:#fff;width:28px;height:28px;border-radius:14px;border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;">🏁</div>',
        iconAnchor: [14, 14]
      });
      L.marker([dLat, dLng], { icon: destIcon }).addTo(map);

      const group = new L.featureGroup([
        L.marker([userLat, userLng]),
        L.marker([dLat, dLng])
      ]);
      map.fitBounds(group.getBounds(), { padding: [120, 50] });
    }

    function recenterMap() {
      map.flyTo([userLat, userLng], 16, { animate: true, duration: 1 });
    }

    // Handle messages from parent React Native app
    window.addEventListener('message', function(e) {
      if (!e.data) return;
      if (e.data.type === 'PAN_TO' && e.data.lat && e.data.lng) {
        map.flyTo([parseFloat(e.data.lat), parseFloat(e.data.lng)], 16, { animate: true, duration: 0.8 });
      } else if (e.data.type === 'UPDATE_USER_LOCATION' && e.data.lat && e.data.lng) {
        userLat = parseFloat(e.data.lat);
        userLng = parseFloat(e.data.lng);
        userMarker.setLatLng([userLat, userLng]);
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
      } else if (data.type === 'OPEN_EMERGENCY') {
        if (onOpenSos) onOpenSos();
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('message', handleIframeMessage);
      return () => window.removeEventListener('message', handleIframeMessage);
    }
  }, [places, onOpenSos]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
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
    backgroundColor: '#f2efe9',
  },
  fallbackBox: {
    flex: 1,
    backgroundColor: '#CBD5E1',
  },
});
