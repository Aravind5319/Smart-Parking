// ============================================================================
// PARKPUDUVAI - SMART PARKING AVAILABILITY SYSTEM
// Dual-Approach Optical AI: Gate Entrance ANPR Counter (Default) & Fence Space Sensing
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ParkingZone } from '../../services/parkingService';
import { NavigationIcon, CheckmarkIcon, CameraIcon, CarIcon } from '../common/Icons';

interface GateRecord {
  id: string;
  filename: string;
  imageUrl: string;
  vehicleName: string;
  vehicleType: string;
  plateNumber: string;
  direction: 'IN' | 'OUT';
  timestamp: string;
  date: string;
}

interface ParkingCameraModalProps {
  visible: boolean;
  zone: ParkingZone | null;
  onClose: () => void;
  onNavigateToBay?: (zone: ParkingZone) => void;
}

export const ParkingCameraModal: React.FC<ParkingCameraModalProps> = ({
  visible,
  zone,
  onClose,
  onNavigateToBay,
}) => {
  // Operational Approach: DEFAULT IS 'gate' (Gate Entrance ANPR Counter) as requested by user
  const [approach, setApproach] = useState<'gate' | 'fence'>('gate');
  const [streamKey, setStreamKey] = useState(Date.now());
  const [isLiveCamera, setIsLiveCamera] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [triggeringCapture, setTriggeringCapture] = useState(false);

  // Approach 1: Longitudinal Fence Space Sensing Metrics
  const [fenceStats, setFenceStats] = useState({
    totalSections: 4,
    availableCarSpaces: 3,
    availableBikeSpaces: 8,
    occupiedSections: 1,
    statusText: 'Space Available along Fence',
    fps: 26.0,
  });

  // Approach 2: Gate Entrance / Exit Counter Metrics (Default)
  const [gateStats, setGateStats] = useState({
    totalCapacity: 100,
    enteredToday: 43,
    exitedToday: 26,
    currentlyInside: 17,
    availableSpots: 83,
  });

  // Today's Gate Vehicle Records
  const [gateRecords, setGateRecords] = useState<GateRecord[]>([]);

  const localBridgeBase = 'http://localhost:5001';
  const videoStreamUrl = `${localBridgeBase}/video_feed?mode=${approach}&t=${streamKey}`;

  // Poll detection status & gate log every 1.2 seconds
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${localBridgeBase}/status?mode=${approach}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsLiveCamera(Boolean(data.is_real_camera));
            setStreamError(false);

            if (data.fence_stats) {
              setFenceStats({
                totalSections: data.fence_stats.total_sections || 4,
                availableCarSpaces: data.fence_stats.available_car_spaces || 3,
                availableBikeSpaces: data.fence_stats.available_bike_spaces || 8,
                occupiedSections: data.fence_stats.occupied_sections || 1,
                statusText: data.fence_stats.status_text || 'Space Available along Fence',
                fps: data.fps || 25.0,
              });
            }

            if (data.gate_stats) {
              setGateStats({
                totalCapacity: data.gate_stats.total_capacity || 100,
                enteredToday: data.gate_stats.entered_today || 0,
                exitedToday: data.gate_stats.exited_today || 0,
                currentlyInside: data.gate_stats.currently_inside || 0,
                availableSpots: data.gate_stats.available_spots || 0,
              });
            }
          }
        }
      } catch (e) {
        // Bridge momentarily busy
      }
    };

    const fetchGateLog = async () => {
      try {
        const res = await fetch(`${localBridgeBase}/gate_log`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.records) {
            setGateRecords(data.records);
          }
        }
      } catch (e) {}
    };

    fetchStats();
    fetchGateLog();

    const interval = setInterval(() => {
      fetchStats();
      fetchGateLog();
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [visible, approach]);

  // Switch Approach mode
  const handleSelectApproach = (mode: 'gate' | 'fence') => {
    setApproach(mode);
    setStreamKey(Date.now());
    setStreamError(false);
  };

  // Test vehicle crossing trigger
  const handleTriggerGateTest = async (dir: 'IN' | 'OUT') => {
    try {
      setTriggeringCapture(true);
      const res = await fetch(`${localBridgeBase}/gate_trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: dir }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setGateRecords((prev) => [data.record, ...prev]);
        }
        if (data.stats) {
          setGateStats({
            totalCapacity: data.stats.total_capacity,
            enteredToday: data.stats.entered_today,
            exitedToday: data.stats.exited_today,
            currentlyInside: data.stats.currently_inside,
            availableSpots: data.stats.available_spots,
          });
        }
      }
    } catch (e) {
    } finally {
      setTriggeringCapture(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Soft Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: isLiveCamera ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.liveText}>{isLiveCamera ? 'LIVE OPTICAL SENSOR' : 'CCTV STANDBY'}</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Smart Parking Availability
            </Text>
            <Text style={styles.headerSubtitle}>Real-Time Optical Space Sensing</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Dual-Approach Soft Toggle Pill (Default is Gate Entrance & ANPR) */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, approach === 'gate' && styles.toggleBtnActive]}
              onPress={() => handleSelectApproach('gate')}
              activeOpacity={0.85}
            >
              <Text style={[styles.toggleText, approach === 'gate' && styles.toggleTextActive]}>
                Gate Entrance & ANPR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, approach === 'fence' && styles.toggleBtnActive]}
              onPress={() => handleSelectApproach('fence')}
              activeOpacity={0.85}
            >
              <Text style={[styles.toggleText, approach === 'fence' && styles.toggleTextActive]}>
                Fence Space Sensing
              </Text>
            </TouchableOpacity>
          </View>

          {/* 16:9 Responsive Video Monitor Card */}
          <View style={styles.videoCard}>
            {Platform.OS === 'web' && !streamError ? (
              <img
                key={`stream-${approach}-${streamKey}`}
                src={videoStreamUrl}
                alt="Parking AI Video Stream"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#000000',
                  display: 'block',
                }}
                onError={() => setStreamError(true)}
              />
            ) : (
              <View style={styles.fallbackBox}>
                <Text style={styles.fallbackText}>Camera Stream Loading...</Text>
              </View>
            )}
          </View>

          {/* APPROACH 2: GATE ENTRANCE & ANPR COUNTER (DEFAULT) */}
          {approach === 'gate' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Facility Capacity & Vehicle Flow</Text>
                <View style={styles.statusPill}>
                  <CameraIcon size={13} color="#059669" />
                  <Text style={styles.statusPillText}>Auto-Capture Active</Text>
                </View>
              </View>

              {/* Hero Available Spots Banner */}
              <View style={styles.heroCapacityBanner}>
                <View style={styles.heroCapLeft}>
                  <Text style={styles.heroCapNumber}>{gateStats.availableSpots}</Text>
                  <View>
                    <Text style={styles.heroCapTitle}>Spots Available to Park</Text>
                    <Text style={styles.heroCapSubtitle}>
                      Out of {gateStats.totalCapacity} Total Facility Capacity
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.round((gateStats.currentlyInside / gateStats.totalCapacity) * 100)
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressNote}>
                  {gateStats.currentlyInside} vehicles currently inside • {gateStats.availableSpots} spots free
                </Text>
              </View>

              {/* 3-Column Summary Cards */}
              <View style={styles.gateSummaryRow}>
                <View style={styles.gateSummaryBox}>
                  <Text style={styles.gateSummaryValGreen}>{gateStats.enteredToday}</Text>
                  <Text style={styles.gateSummaryLabel}>Vehicles In</Text>
                  <Text style={styles.gateSummarySub}>Today's Entries</Text>
                </View>

                <View style={styles.gateSummaryBox}>
                  <Text style={styles.gateSummaryValOrange}>{gateStats.exitedToday}</Text>
                  <Text style={styles.gateSummaryLabel}>Vehicles Out</Text>
                  <Text style={styles.gateSummarySub}>Today's Exits</Text>
                </View>

                <View style={styles.gateSummaryBox}>
                  <Text style={styles.gateSummaryValSlate}>{gateStats.currentlyInside}</Text>
                  <Text style={styles.gateSummaryLabel}>Inside Now</Text>
                  <Text style={styles.gateSummarySub}>Parked</Text>
                </View>
              </View>

              {/* Automatic Camera Shutter Banner */}
              <View style={styles.autoTriggerBanner}>
                <View style={styles.autoTriggerDot} />
                <Text style={styles.autoTriggerText}>
                  Automatic Shutter Active: When a car or bike passes through the entrance tripwire, the camera automatically takes a screenshot, logs the license plate, and saves it below.
                </Text>
              </View>

              {/* Today's Gate Crossings & Snapshot Log */}
              <View style={styles.logHeader}>
                <Text style={styles.logTitle}>Today's Crossed Vehicles & Photos</Text>
                <Text style={styles.logCount}>{gateRecords.length} Saved in DB</Text>
              </View>

              <View style={styles.recordsList}>
                {gateRecords.map((item) => (
                  <View key={item.id} style={styles.recordItem}>
                    {/* Snapshot Photo Thumbnail (clickable) */}
                    <TouchableOpacity
                      onPress={() => setSelectedPhoto(item.imageUrl)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: item.imageUrl }} style={styles.recordThumb} />
                    </TouchableOpacity>

                    {/* Vehicle Details */}
                    <View style={styles.recordInfo}>
                      <View style={styles.recordTopLine}>
                        <View style={styles.plateBadge}>
                          <Text style={styles.plateText}>{item.plateNumber}</Text>
                        </View>
                        <View
                          style={[
                            styles.dirBadge,
                            item.direction === 'IN' ? styles.dirBadgeIn : styles.dirBadgeOut,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dirText,
                              item.direction === 'IN' ? styles.dirTextIn : styles.dirTextOut,
                            ]}
                          >
                            {item.direction === 'IN' ? 'ENTRY' : 'EXIT'} • {item.timestamp}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.recordVehicleName}>{item.vehicleName}</Text>
                      <Text style={styles.recordVehicleType}>{item.vehicleType}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* APPROACH 1: LONGITUDINAL FENCE CORRIDOR SPACE SENSING */}
          {approach === 'fence' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Fence Boundary Space Sensing</Text>
                <View style={styles.statusPill}>
                  <CheckmarkIcon size={12} color="#059669" />
                  <Text style={styles.statusPillText}>Full Fence Line Active</Text>
                </View>
              </View>

              <View style={styles.fenceInfoBanner}>
                <Text style={styles.fenceInfoTitle}>
                  Longitudinal Fence Corridor (Corner to Boundary)
                </Text>
                <Text style={styles.fenceInfoDesc}>
                  The camera monitors the entire fence line from one corner to the far end. It calculates total continuous open space along the fence and displays how many vehicles can fit.
                </Text>
              </View>

              {/* 2x2 Clean Metrics Grid */}
              <View style={styles.statsRow}>
                <View style={[styles.statBox, styles.statBoxVacant]}>
                  <Text style={styles.statNumVacant}>{fenceStats.availableCarSpaces}</Text>
                  <Text style={styles.statLabel}>Cars Space</Text>
                  <Text style={styles.statNote}>Available along Fence</Text>
                </View>

                <View style={[styles.statBox, styles.statBoxVacant]}>
                  <Text style={styles.statNumVacant}>{fenceStats.availableBikeSpaces}</Text>
                  <Text style={styles.statLabel}>Bikes Space</Text>
                  <Text style={styles.statNote}>Available along Fence</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statBox, styles.statBoxOccupied]}>
                  <Text style={styles.statNumOccupied}>{fenceStats.occupiedSections}</Text>
                  <Text style={styles.statLabel}>Occupied Sections</Text>
                  <Text style={styles.statNote}>Parked Vehicles</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumBlue}>{fenceStats.totalSections}</Text>
                  <Text style={styles.statLabel}>Monitored Span</Text>
                  <Text style={styles.statNote}>Near to Far Fence</Text>
                </View>
              </View>

              {/* Navigation Action Button */}
              {onNavigateToBay && zone && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    onClose();
                    onNavigateToBay(zone);
                  }}
                  activeOpacity={0.85}
                >
                  <NavigationIcon color="#FFFFFF" size={17} />
                  <Text style={styles.actionBtnText}>Navigate to Fence Parking Area</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Modal to view full-size snapshot photo */}
        {selectedPhoto && (
          <Modal transparent={true} visible={true} onRequestClose={() => setSelectedPhoto(null)}>
            <View style={styles.photoModalOverlay}>
              <View style={styles.photoModalContent}>
                <Image
                  source={{ uri: selectedPhoto }}
                  style={styles.photoModalImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.photoModalClose}
                  onPress={() => setSelectedPhoto(null)}
                >
                  <Text style={styles.photoModalCloseText}>Close Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#091326',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#172544',
    backgroundColor: '#0D1B36',
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  liveText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#111F38',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E2D4A',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  videoCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    maxHeight: 330,
    backgroundColor: '#000000',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E2D4A',
    marginBottom: 14,
  },
  fallbackBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07101E',
  },
  fallbackText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 6,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  heroCapacityBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  heroCapLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  heroCapNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#059669',
  },
  heroCapTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  heroCapSubtitle: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  progressBarBg: {
    height: 7,
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  progressNote: {
    fontSize: 10.5,
    color: '#047857',
    marginTop: 6,
    fontWeight: '600',
  },
  gateSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  gateSummaryBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gateSummaryValGreen: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
  },
  gateSummaryValOrange: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D97706',
  },
  gateSummaryValSlate: {
    fontSize: 20,
    fontWeight: '800',
    color: '#334155',
  },
  gateSummaryLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },
  gateSummarySub: {
    fontSize: 9,
    color: '#94A3B8',
  },
  autoTriggerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  autoTriggerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  autoTriggerText: {
    flex: 1,
    fontSize: 10.5,
    color: '#065F46',
    fontWeight: '600',
    lineHeight: 14,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  logCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  recordsList: {
    gap: 8,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  recordThumb: {
    width: 54,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  recordInfo: {
    flex: 1,
  },
  recordTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  plateBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plateText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dirBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dirBadgeIn: {
    backgroundColor: '#ECFDF5',
  },
  dirBadgeOut: {
    backgroundColor: '#EFF6FF',
  },
  dirText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  dirTextIn: {
    color: '#059669',
  },
  dirTextOut: {
    color: '#2563EB',
  },
  recordVehicleName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  recordVehicleType: {
    fontSize: 10,
    color: '#64748B',
  },
  fenceInfoBanner: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  fenceInfoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 3,
  },
  fenceInfoDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBoxVacant: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statBoxOccupied: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statNumVacant: {
    fontSize: 28,
    fontWeight: '800',
    color: '#059669',
  },
  statNumOccupied: {
    fontSize: 28,
    fontWeight: '800',
    color: '#DC2626',
  },
  statNumBlue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  statNote: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 13,
    borderRadius: 11,
    marginTop: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  photoModalContent: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  photoModalImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  photoModalClose: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  photoModalCloseText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
});
