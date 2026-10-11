import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../theme/colors';

const MapView = forwardRef((props: any, ref) => {
  const [mapMode, setMapMode] = useState<'hybrid' | 'cad'>('hybrid');

  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
  }));

  // Puducherry Bounding Coordinates
  const osmUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=79.820%2C11.924%2C79.840%2C11.944&layer=mapnik&marker=11.9338%2C79.8310';

  return (
    <View style={[styles.mapContainer, props.style]}>
      {/* Real Map Layer (OSM Embedded Map Tile Frame) */}
      {mapMode === 'hybrid' ? (
        <View style={styles.iframeWrapper}>
          {React.createElement('iframe', {
            src: osmUrl,
            title: 'Puducherry Smart Parking Map',
            style: {
              width: '100%',
              height: '100%',
              border: 'none',
              filter: 'contrast(1.02) saturate(1.05)',
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
          {/* Coastal Boulevard Goubert Avenue */}
          <View style={styles.goubertAve} />
          {/* Main Heritage East-West Corridors */}
          <View style={[styles.roadHorizontal, { top: '28%' }]} />
          <View style={[styles.roadHorizontal, { top: '52%' }]} />
          <View style={[styles.roadHorizontal, { top: '74%' }]} />
          {/* North-South Canals & Mission Street */}
          <View style={[styles.roadVertical, { left: '32%' }]} />
          <View style={[styles.roadVertical, { left: '56%' }]} />
        </View>
      )}

      {/* Interactive Geo-Markers Overlay Layer */}
      <View style={styles.markersOverlay} pointerEvents="box-none">
        {props.children}
      </View>

      {/* Police Command HUD Top Bar */}
      <View style={styles.hudTopBar}>
        <View style={styles.hudBadge}>
          <View style={styles.radarPulseDot} />
          <Text style={styles.hudBadgeText}>TRAFFIC RADAR • PUDUCHERRY BOULEVARD</Text>
        </View>

        {/* Map View Toggle Button */}
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setMapMode(prev => prev === 'hybrid' ? 'cad' : 'hybrid')}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleBtnText}>
            {mapMode === 'hybrid' ? '🛰️ CAD View' : '🗺️ City Map'}
          </Text>
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

  // Normalized percentages
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
        <Text style={styles.markerIconText}>{isRed ? '⛔' : 'P'}</Text>
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
    height: 320,
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
    backgroundColor: 'rgba(11, 37, 89, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    paddingVertical: 4.5,
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
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
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
