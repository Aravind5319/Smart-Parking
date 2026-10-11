import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import { LayersIcon, MapIcon, ProhibitedIcon } from './Icons';

const MapView = forwardRef((props: any, ref) => {
  const [mapMode, setMapMode] = useState<'city' | 'cad'>('city');

  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
  }));

  // Extract markers passed as children
  const markerList = useMemo(() => {
    const list: any[] = [];
    React.Children.forEach(props.children, (child: any) => {
      if (child && child.props && child.props.coordinate) {
        const isRed =
          child.props.pinColor === Colors.policeRed ||
          child.props.pinColor === Colors.noParkingRed ||
          child.props.pinColor === '#DC2626';

        list.push({
          id: child.key || child.props.title,
          title: child.props.title,
          lat: child.props.coordinate.latitude,
          lng: child.props.coordinate.longitude,
          color: isRed ? '#D31826' : (child.props.pinColor || '#059669'),
          isRed,
        });
      }
    });
    return list;
  }, [props.children]);

  // Self-contained Leaflet HTML locked strictly to Puducherry Boulevard
  const leafletHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .custom-div-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: #ffffff;
      font-weight: 900;
      font-size: 11px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      border: 2px solid #ffffff;
      transition: transform 0.15s ease;
      cursor: pointer;
    }
    .custom-div-pin:hover {
      transform: scale(1.15);
      z-index: 1000 !important;
    }
    .pin-label-box {
      background: rgba(11, 37, 89, 0.92);
      color: #fff;
      padding: 3px 7px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      margin-top: 2px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      padding: 4px 6px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.25);
      border: 1px solid #cbd5e1;
    }
    .popup-title { font-size: 13px; font-weight: 800; color: #0b2559; margin-bottom: 2px; }
    .popup-sub { font-size: 11px; color: #64748b; margin-bottom: 6px; }
    .popup-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; }
    .badge-auth { background: #ecfdf5; color: #059669; }
    .badge-tow { background: #fef2f2; color: #dc2626; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Initialize strictly locked to Puducherry Boulevard (Rock Beach & White Town)
    var map = L.map('map', {
      center: [11.9338, 79.8310],
      zoom: 15,
      minZoom: 13,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: false
    });

    // High definition crisp city map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Strict No-Parking Tow-Away Zone Polygons (Goubert Promenade waterfront & Raj Nivas)
    var promenadeRed = L.circle([11.9330, 79.8358], {
      color: '#dc2626',
      fillColor: '#ef4444',
      fillOpacity: 0.22,
      radius: 220,
      weight: 2
    }).addTo(map);
    promenadeRed.bindPopup('<b style="color:#dc2626">Rock Beach Goubert Promenade</b><br><span style="font-size:11px;">Zero Tolerance Tow-Away Corridor (5 PM - 6 AM)</span>');

    var rajNivasRed = L.circle([11.9320, 79.8348], {
      color: '#dc2626',
      fillColor: '#ef4444',
      fillOpacity: 0.22,
      radius: 140,
      weight: 2
    }).addTo(map);
    rajNivasRed.bindPopup('<b style="color:#dc2626">Raj Nivas High Security Enclave</b><br><span style="font-size:11px;">VVIP Perimeter - Automated Crane Towing</span>');

    // Plot all Puducherry parking & tow-away markers
    var markers = ${JSON.stringify(markerList)};
    markers.forEach(function(m) {
      var iconHtml = '<div class="custom-div-pin" style="width:26px;height:26px;background:' + m.color + ';">' + (m.isRed ? '!' : 'P') + '</div>';
      var customIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14]
      });

      var marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);
      var popupContent = '<div class="popup-title">' + m.title + '</div>' +
        '<div class="popup-sub">Puducherry Traffic Police Monitored Kerb</div>' +
        '<div class="popup-badge ' + (m.isRed ? 'badge-tow' : 'badge-auth') + '">' +
        (m.isRed ? 'TOW-AWAY RESTRICTION' : 'AUTHORIZED PARKING') + '</div>';
      marker.bindPopup(popupContent);
    });
  </script>
</body>
</html>`;
  }, [markerList]);

  return (
    <View style={[styles.mapContainer, props.style]}>
      {/* Real Map Layer (Leaflet locked to Puducherry) */}
      {mapMode === 'city' ? (
        <View style={styles.iframeWrapper}>
          {React.createElement('iframe', {
            srcDoc: leafletHtml,
            title: 'Puducherry Police Smart Kerb Radar',
            style: {
              width: '100%',
              height: '100%',
              border: 'none',
            },
          })}
        </View>
      ) : (
        /* Tactical Police CAD Grid View */
        <View style={styles.tacticalGrid}>
          {/* Bay of Bengal Ocean Coast on East (Right) */}
          <View style={styles.oceanCoast}>
            <Text style={styles.oceanText}>BAY OF BENGAL (ROCK BEACH COAST)</Text>
          </View>
          <View style={styles.goubertAve} />
          <View style={[styles.roadHorizontal, { top: '28%' }]} />
          <View style={[styles.roadHorizontal, { top: '52%' }]} />
          <View style={[styles.roadHorizontal, { top: '74%' }]} />
          <View style={[styles.roadVertical, { left: '32%' }]} />
          <View style={[styles.roadVertical, { left: '56%' }]} />
          <View style={styles.markersOverlay} pointerEvents="box-none">
            {props.children}
          </View>
        </View>
      )}

      {/* Police Command HUD Top Bar */}
      <View style={styles.hudTopBar}>
        <View style={styles.hudBadge}>
          <View style={styles.radarPulseDot} />
          <Text style={styles.hudBadgeText}>PUDUCHERRY TRAFFIC POLICE • SMART KERB RADAR</Text>
        </View>

        {/* Map View Toggle Button */}
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setMapMode(prev => prev === 'city' ? 'cad' : 'city')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {mapMode === 'city' ? (
              <LayersIcon color={Colors.policeNavy} size={11} />
            ) : (
              <MapIcon color={Colors.policeNavy} size={11} />
            )}
            <Text style={styles.toggleBtnText}>
              {mapMode === 'city' ? 'CAD Grid' : 'City Map'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Police Map Legend Bar */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.parkingGreen }]} />
          <Text style={styles.legendText}>Available (≤70%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Filling Fast</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.policeRed }]} />
          <Text style={styles.legendText}>Full</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#7F1D1D', borderColor: '#FCA5A5', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Tow-Away</Text>
        </View>
      </View>
    </View>
  );
});

export const Marker = ({ coordinate, title, pinColor, onPress }: any) => {
  // Bounding box for Puducherry Heritage Area
  const minLat = 11.922;
  const maxLat = 11.944;
  const minLon = 79.820;
  const maxLon = 79.840;

  const rawTop = 100 - ((coordinate.latitude - minLat) / (maxLat - minLat)) * 100;
  const rawLeft = ((coordinate.longitude - minLon) / (maxLon - minLon)) * 100;

  const top = `${Math.min(88, Math.max(12, rawTop))}%`;
  const left = `${Math.min(88, Math.max(8, rawLeft))}%`;

  const isRed = pinColor === Colors.noParkingRed || pinColor === Colors.policeRed || pinColor === '#DC2626';

  return (
    <TouchableOpacity
      style={[styles.mapMarker, { top, left } as any]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.markerPin, { backgroundColor: pinColor, borderColor: isRed ? '#FCA5A5' : '#FFFFFF' }]}>
        {isRed ? (
          <ProhibitedIcon color="#FFFFFF" size={13} strokeWidth={2.5} />
        ) : (
          <Text style={styles.markerIconText}>P</Text>
        )}
      </View>
      <View style={[styles.markerLabel, isRed ? styles.markerLabelRed : styles.markerLabelGreen]}>
        <Text style={[styles.markerLabelText, isRed ? styles.textRed : styles.textNavy]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const Circle = () => null;
export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  mapContainer: {
    height: 380,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.policeNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  iframeWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E5E7EB',
  },
  tacticalGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
  },
  oceanCoast: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '24%',
    backgroundColor: '#0284C7',
    borderLeftWidth: 3,
    borderLeftColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  oceanText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 8.5,
    fontWeight: '800',
    transform: [{ rotate: '90deg' }],
    letterSpacing: 1,
    width: 180,
    textAlign: 'center',
  },
  goubertAve: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: '24%',
    width: 8,
    backgroundColor: '#CBD5E1',
    borderLeftWidth: 1,
    borderLeftColor: '#94A3B8',
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: '25%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#E2E8F0',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#CBD5E1',
  },
  markersOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  hudTopBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  hudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 37, 89, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  radarPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  hudBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  toggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.policeNavy,
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -16 }, { translateY: -28 }],
    zIndex: 15,
  },
  markerPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  markerIconText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  markerLabel: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    maxWidth: 130,
    borderWidth: 1,
  },
  markerLabelGreen: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#10B981',
  },
  markerLabelRed: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    borderColor: '#EF4444',
  },
  markerLabelText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textNavy: {
    color: Colors.policeNavy,
  },
  textRed: {
    color: '#991B1B',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#334155',
  },
});

export { MapView };
export default MapView;
