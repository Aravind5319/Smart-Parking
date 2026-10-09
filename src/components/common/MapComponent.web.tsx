import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MapView = forwardRef((props: any, ref) => {
  useImperativeHandle(ref, () => ({
    animateToRegion: () => {}, // Mock implementation
  }));

  return (
    <View style={[{ flex: 1, backgroundColor: '#F1F5F9', position: 'relative', overflow: 'hidden' }, props.style]}>
      {/* Schematic Grid Map for Web Fallback */}
      <View style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: 30, backgroundColor: '#CBD5E1' }} />
      <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 30, backgroundColor: '#CBD5E1' }} />
      {props.children}
      <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.8)', padding: 4, borderRadius: 4 }}>
        <Text style={{ fontSize: 10, color: '#475569', fontWeight: 'bold' }}>Schematic Web View</Text>
        <Text style={{ fontSize: 9, color: '#64748B' }}>(Open native app for Google Maps)</Text>
      </View>
    </View>
  );
});

export const Marker = ({ coordinate, title, pinColor, onPress }: any) => {
  // Approximate projection for Puducherry bounding box to percentage
  const minLat = 11.91;
  const maxLat = 11.95;
  const minLon = 79.81;
  const maxLon = 79.84;
  
  const top = `${100 - ((coordinate.latitude - minLat) / (maxLat - minLat)) * 100}%`;
  const left = `${((coordinate.longitude - minLon) / (maxLon - minLon)) * 100}%`;

  return (
    <TouchableOpacity 
      style={[styles.mapMarker, { top, left } as any]}
      onPress={onPress}
    >
      <View style={[styles.markerPin, { backgroundColor: pinColor }]} />
      <Text style={styles.markerLabel}>{title}</Text>
    </TouchableOpacity>
  );
};

export const Circle = () => null;
export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  markerPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFF',
    elevation: 3,
  },
  markerLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    color: '#1E293B',
  },
});

export { MapView };
export default MapView;
