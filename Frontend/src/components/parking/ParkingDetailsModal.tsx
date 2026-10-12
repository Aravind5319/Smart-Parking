// ============================================================================
// PUDUCHERRY TRAFFIC POLICE - PARKING FACILITY DETAILS MODAL
// Detailed Vacancy, Real Photo, Hardware Telemetry, Navigation & CCTV Camera Trigger
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { ParkingZone } from '../../services/parkingService';
import {
  LocationPinIcon,
  WalkIcon,
  ClockIcon,
  NavigationIcon,
  CameraIcon,
  PoliceShieldIcon,
  CarIcon,
  MotorcycleIcon,
} from '../common/Icons';

interface ParkingDetailsModalProps {
  visible: boolean;
  zone: ParkingZone | null;
  onClose: () => void;
  onStartNavigation: (zone: ParkingZone) => void;
  onOpenCam: (zone: ParkingZone) => void;
}

export const ParkingDetailsModal: React.FC<ParkingDetailsModalProps> = ({
  visible,
  zone,
  onClose,
  onStartNavigation,
  onOpenCam,
}) => {
  if (!zone) return null;

  const total = zone.totalSlots || 30;
  const occupied = zone.occupiedSlots || 10;
  const vacant = Math.max(0, total - occupied);
  const occupancyPercent = Math.min(100, Math.round((occupied / total) * 100));

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerCategory}>
              {zone.category === 'FREE_CIVIC' ? '100% FREE CIVIC BAY' : 'GOVT MUNICIPAL LOT'}
            </Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{zone.name}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>X</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Facility Photo Header */}
          <View style={styles.photoContainer}>
            {zone.imageUrl ? (
              <Image source={{ uri: zone.imageUrl }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={[styles.photo, { backgroundColor: '#1E293B' }]} />
            )}
            <View style={styles.photoOverlay} />
            <View style={[styles.vacantBadge, zone.isFull ? styles.bgRed : styles.bgGreen]}>
              <Text style={styles.vacantBadgeText}>
                {zone.isFull ? 'CAPACITY FULL' : `${vacant} SPOTS LEFT`}
              </Text>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{zone.distanceKm || 0.4} km</Text>
              <Text style={styles.metricSub}>Distance</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{zone.walkingTimeMin || 2} min</Text>
              <Text style={styles.metricSub}>Walking Time</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#059669' }]}>
                {zone.hourlyRate || 'FREE'}
              </Text>
              <Text style={styles.metricSub}>Tariff</Text>
            </View>
          </View>

          {/* Real-time Occupancy Bar */}
          <View style={styles.sectionCard}>
            <View style={styles.occupancyHeaderRow}>
              <Text style={styles.cardHeading}>Live Bay Occupancy</Text>
              <Text style={styles.occupancyRatioText}>
                {occupied} of {total} slots occupied ({occupancyPercent}%)
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${occupancyPercent}%` },
                  occupancyPercent > 85 ? styles.fillRed : occupancyPercent > 60 ? styles.fillYellow : styles.fillGreen
                ]}
              />
            </View>
          </View>

          {/* Hardware & IoT Telemetry */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeading}>IoT Sensors & Monitoring</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Sensor Type:</Text>
              <Text style={styles.infoVal}>{zone.sensorType || 'ANPR Video Cam + Magnetometers'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Sensor Status:</Text>
              <Text style={[styles.infoVal, { color: '#059669', fontWeight: '800' }]}>
                {zone.sensorStatus || 'Active (99.8% precision)'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Traffic Flow:</Text>
              <Text style={[styles.infoVal, { color: zone.trafficLevel === 'CONGESTED' ? '#DC2626' : '#2563EB', fontWeight: '800' }]}>
                {zone.trafficLevel || 'SMOOTH'} (+{zone.trafficDelayMin || 0} min delay)
              </Text>
            </View>
          </View>

          {/* Location & Rules */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeading}>Location & Operating Rules</Text>
            <Text style={styles.addressText}>{zone.streetName}, {zone.area}, Puducherry</Text>
            <Text style={styles.rulesText}>
              • Monitored by Puducherry Traffic Police CCTV & ANPR network.{'\n'}
              • Strictly park between marked white kerb bay lines.{'\n'}
              • Unauthorized obstruction or double-parking triggers immediate crane tow-away.
            </Text>
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryNavBtn}
              onPress={() => {
                onClose();
                onStartNavigation(zone);
              }}
              activeOpacity={0.85}
            >
              <NavigationIcon color="#FFFFFF" size={18} />
              <Text style={styles.primaryNavBtnText}>START IN-APP NAVIGATION</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraLiveBtn}
              onPress={() => {
                onClose();
                onOpenCam(zone);
              }}
              activeOpacity={0.85}
            >
              <CameraIcon color="#FFFFFF" size={18} />
              <Text style={styles.cameraLiveBtnText}>VIEW LIVE SENSOR CAMERA</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#071630',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  headerCategory: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  photoContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  vacantBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bgGreen: {
    backgroundColor: '#059669',
  },
  bgRed: {
    backgroundColor: '#DC2626',
  },
  vacantBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0B2559',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  occupancyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  occupancyRatioText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  fillGreen: { backgroundColor: '#10B981' },
  fillYellow: { backgroundColor: '#F59E0B' },
  fillRed: { backgroundColor: '#EF4444' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  infoVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  addressText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  rulesText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 12,
  },
  primaryNavBtn: {
    backgroundColor: '#0B2559',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  primaryNavBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  cameraLiveBtn: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  cameraLiveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
