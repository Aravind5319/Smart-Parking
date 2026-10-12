// ============================================================================
// PARKPUDUVAI - SMART PARKING AVAILABILITY SYSTEM
// Dual-Approach Optical AI with Global Cloudflare Tunneling for Standalone APK
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ParkingZone } from '../../services/parkingService';
import { NavigationIcon, CheckmarkIcon, CameraIcon, CarIcon, RefreshIcon } from '../common/Icons';

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

const DEFAULT_CLOUDFLARE_URL = 'https://determination-kyle-drag-compatibility.trycloudflare.com';

export const ParkingCameraModal: React.FC<ParkingCameraModalProps> = ({
  visible,
  zone,
  onClose,
  onNavigateToBay,
}) => {
  // Operational Approach: 'gate' (Default) | 'fence'
  const [approach, setApproach] = useState<'gate' | 'fence'>('gate');
  const [streamKey, setStreamKey] = useState(Date.now());
  const [isLiveCamera, setIsLiveCamera] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Cloudflare Tunnel State (for standalone APK mobile access outside router Wi-Fi)
  const [tunnelUrl, setTunnelUrl] = useState<string>(DEFAULT_CLOUDFLARE_URL);
  const [inputTunnelUrl, setInputTunnelUrl] = useState<string>(DEFAULT_CLOUDFLARE_URL);
  const [isEditingTunnel, setIsEditingTunnel] = useState<boolean>(false);
  const [isTunnelConnected, setIsTunnelConnected] = useState<boolean>(true);

  // Approach 1: Longitudinal Fence Space Sensing Metrics
  const [fenceStats, setFenceStats] = useState({
    totalSections: 4,
    availableCarSpaces: 3,
    availableBikeSpaces: 8,
    occupiedSections: 1,
    statusText: 'Space Available along Fence',
    fps: 26.0,
  });

  // Approach 2: Facility Capacity Metrics (Requested: Total Cap, Filled, Empty Space)
  const [gateStats, setGateStats] = useState({
    totalCapacity: 100,      // Total Cap
    currentlyFilled: 40,     // How many are filled
    emptySpace: 60,          // How much empty space is there
    enteredToday: 66,
    exitedToday: 26,
  });

  // Today's Gate Vehicle Records
  const [gateRecords, setGateRecords] = useState<GateRecord[]>([]);

  // Load saved Cloudflare Tunnel URL on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('PARKPUDUVAI_CLOUDFLARE_TUNNEL');
        if (saved && saved.trim()) {
          setTunnelUrl(saved.trim());
          setInputTunnelUrl(saved.trim());
        }
      }
    } catch (e) {}
  }, []);

  // Compute Active Streaming Base URL (Cloudflare Tunnel if configured, else localhost)
  const activeBaseUrl = (tunnelUrl && tunnelUrl.trim())
    ? tunnelUrl.trim().replace(/\/$/, '')
    : 'http://localhost:5001';

  const videoStreamUrl = `${activeBaseUrl}/video_feed?mode=${approach}&t=${streamKey}`;

  // Poll detection status & gate log
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${activeBaseUrl}/status?mode=${approach}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsLiveCamera(Boolean(data.is_real_camera));
            setIsTunnelConnected(true);
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
              const total = data.gate_stats.total_capacity || 100;
              const filled = data.gate_stats.currently_inside || 0;
              const empty = Math.max(0, total - filled);

              setGateStats({
                totalCapacity: total,
                currentlyFilled: filled,
                emptySpace: empty,
                enteredToday: data.gate_stats.entered_today || 0,
                exitedToday: data.gate_stats.exited_today || 0,
              });
            }
          }
        } else {
          if (isMounted) setIsTunnelConnected(false);
        }
      } catch (e) {
        if (isMounted) {
          // If public tunnel fails, try local fallback if not already using it
          if (activeBaseUrl !== 'http://localhost:5001') {
            setIsTunnelConnected(false);
          }
        }
      }
    };

    const fetchGateLog = async () => {
      try {
        const res = await fetch(`${activeBaseUrl}/gate_log`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.records) {
            // Fix thumbnail image URLs to use activeBaseUrl
            const formatted = data.records.map((r: GateRecord) => ({
              ...r,
              imageUrl: r.filename
                ? `${activeBaseUrl}/gate_captures/${r.filename}`
                : r.imageUrl,
            }));
            setGateRecords(formatted);
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
  }, [visible, approach, activeBaseUrl]);

  // Switch Approach mode
  const handleSelectApproach = (mode: 'gate' | 'fence') => {
    setApproach(mode);
    setStreamKey(Date.now());
    setStreamError(false);
  };

  // Save updated Cloudflare Tunnel URL
  const handleSaveTunnelUrl = () => {
    const cleanUrl = inputTunnelUrl.trim().replace(/\/$/, '');
    setTunnelUrl(cleanUrl);
    setIsEditingTunnel(false);
    setStreamKey(Date.now());
    setStreamError(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('PARKPUDUVAI_CLOUDFLARE_TUNNEL', cleanUrl);
      }
    } catch (e) {}
  };

  if (!visible) return null;

  const fillPercentage = Math.min(
    100,
    Math.round((gateStats.currentlyFilled / gateStats.totalCapacity) * 100)
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Soft Modern Police Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: isLiveCamera ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.liveText}>
                {isLiveCamera ? 'LIVE OPTICAL SENSOR' : 'CCTV STANDBY'}
              </Text>
              <View style={styles.tunnelPill}>
                <Text style={styles.tunnelPillText}>
                  {activeBaseUrl.includes('trycloudflare.com') ? 'Cloudflare Tunnel' : 'Local Wi-Fi'}
                </Text>
              </View>
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
          {/* Dual-Approach Soft Toggle Pill (Default: Gate Entrance & ANPR) */}
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
                alt="Live Parking Video Feed"
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
                <Text style={styles.fallbackTitle}>Camera Stream Connecting...</Text>
                <Text style={styles.fallbackSub}>Connecting to Cloudflare Gateway</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    setStreamError(false);
                    setStreamKey(Date.now());
                  }}
                >
                  <Text style={styles.retryBtnText}>Retry Stream</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Cloudflare Tunnel Remote Stream Configuration Card (For APK Mobile Use) */}
          <View style={styles.tunnelCard}>
            <View style={styles.tunnelCardHeader}>
              <View style={styles.tunnelTitleRow}>
                <View style={[styles.tunnelStatusDot, { backgroundColor: isTunnelConnected ? '#10B981' : '#F59E0B' }]} />
                <Text style={styles.tunnelCardTitle}>Remote Cloudflare Gateway (APK Mobile Access)</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditingTunnel(!isEditingTunnel)}
                style={styles.tunnelEditToggle}
              >
                <Text style={styles.tunnelEditToggleText}>
                  {isEditingTunnel ? 'Cancel' : 'Edit Link'}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditingTunnel ? (
              <View style={styles.tunnelEditBox}>
                <Text style={styles.tunnelInputLabel}>Enter Cloudflare Tunnel Public HTTPS URL:</Text>
                <TextInput
                  style={styles.tunnelInput}
                  value={inputTunnelUrl}
                  onChangeText={setInputTunnelUrl}
                  placeholder="https://your-tunnel.trycloudflare.com"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.tunnelActionRow}>
                  <TouchableOpacity
                    style={styles.tunnelSaveBtn}
                    onPress={handleSaveTunnelUrl}
                  >
                    <Text style={styles.tunnelSaveBtnText}>Save & Connect Stream</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.tunnelLocalBtn}
                    onPress={() => {
                      setInputTunnelUrl('http://localhost:5001');
                      setTunnelUrl('http://localhost:5001');
                      setIsEditingTunnel(false);
                      setStreamKey(Date.now());
                    }}
                  >
                    <Text style={styles.tunnelLocalBtnText}>Use Localhost</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.tunnelDisplayRow}>
                <Text style={styles.tunnelUrlText} numberOfLines={1}>
                  {tunnelUrl || 'http://localhost:5001'}
                </Text>
                <View style={styles.tunnelLiveBadge}>
                  <Text style={styles.tunnelLiveBadgeText}>Global 4G/5G Ready</Text>
                </View>
              </View>
            )}
          </View>

          {/* APPROACH 2: GATE ENTRANCE & CAPACITY BREAKDOWN (DEFAULT) */}
          {approach === 'gate' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Parking Space Capacity Breakdown</Text>
                <View style={styles.statusPill}>
                  <CameraIcon size={12} color="#059669" />
                  <Text style={styles.statusPillText}>Auto-Shutter Active</Text>
                </View>
              </View>

              {/* Central 3-Metric Cards: Total Cap • How Many Filled • Empty Space */}
              <View style={styles.metricsTripleRow}>
                {/* 1. Empty Space Available */}
                <View style={[styles.metricBox, styles.metricBoxEmpty]}>
                  <Text style={styles.metricNumEmpty}>{gateStats.emptySpace}</Text>
                  <Text style={styles.metricTitle}>Empty Space</Text>
                  <Text style={styles.metricSubtitle}>Available to Park</Text>
                </View>

                {/* 2. Currently Filled */}
                <View style={[styles.metricBox, styles.metricBoxFilled]}>
                  <Text style={styles.metricNumFilled}>{gateStats.currentlyFilled}</Text>
                  <Text style={styles.metricTitle}>Filled Spots</Text>
                  <Text style={styles.metricSubtitle}>Vehicles Inside</Text>
                </View>

                {/* 3. Total Capacity */}
                <View style={[styles.metricBox, styles.metricBoxTotal]}>
                  <Text style={styles.metricNumTotal}>{gateStats.totalCapacity}</Text>
                  <Text style={styles.metricTitle}>Total Capacity</Text>
                  <Text style={styles.metricSubtitle}>Parking Facility</Text>
                </View>
              </View>

              {/* Soft Visual Fill Bar */}
              <View style={styles.fillBarContainer}>
                <View style={styles.fillBarHeader}>
                  <Text style={styles.fillBarLabel}>Facility Occupancy</Text>
                  <Text style={styles.fillBarPercent}>{fillPercentage}% Filled</Text>
                </View>
                <View style={styles.fillBarTrack}>
                  <View style={[styles.fillBarThumb, { width: `${fillPercentage}%` }]} />
                </View>
                <Text style={styles.fillBarNote}>
                  {gateStats.emptySpace} empty spots remaining out of {gateStats.totalCapacity} total spaces
                </Text>
              </View>

              {/* Secondary Flow Movement Banner */}
              <View style={styles.movementBanner}>
                <View style={styles.movementItem}>
                  <Text style={styles.movementLabel}>Today's Entries:</Text>
                  <Text style={styles.movementValueGreen}>{gateStats.enteredToday} Vehicles In</Text>
                </View>
                <View style={styles.movementDivider} />
                <View style={styles.movementItem}>
                  <Text style={styles.movementLabel}>Today's Exits:</Text>
                  <Text style={styles.movementValueOrange}>{gateStats.exitedToday} Vehicles Out</Text>
                </View>
              </View>

              {/* Automatic Camera Shutter Note */}
              <View style={styles.autoTriggerBanner}>
                <View style={styles.autoTriggerDot} />
                <Text style={styles.autoTriggerText}>
                  Automatic Optical Shutter Active: When a car or bike passes through the entrance tripwire, the camera automatically takes a screenshot, logs the license plate, and records it below.
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
                  Longitudinal Fence Corridor (Corner to Far End)
                </Text>
                <Text style={styles.fenceInfoDesc}>
                  The camera monitors the entire fence line from one corner to the far end. It calculates continuous open space along the fence and displays how many vehicles can fit.
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
    flexWrap: 'wrap',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  liveText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  tunnelPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tunnelPillText: {
    color: '#34D399',
    fontSize: 9.5,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
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
    marginBottom: 10,
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
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    marginBottom: 10,
  },
  fallbackBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07101E',
    padding: 16,
  },
  fallbackTitle: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  fallbackSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tunnelCard: {
    backgroundColor: '#0F1E38',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E3258',
    marginBottom: 12,
  },
  tunnelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tunnelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  tunnelStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  tunnelCardTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  tunnelEditToggle: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
  },
  tunnelEditToggleText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  tunnelDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  tunnelUrlText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  tunnelLiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tunnelLiveBadgeText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '700',
  },
  tunnelEditBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E3258',
  },
  tunnelInputLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginBottom: 5,
  },
  tunnelInput: {
    backgroundColor: '#07101E',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#F8FAFC',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  tunnelActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tunnelSaveBtn: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tunnelSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  tunnelLocalBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tunnelLocalBtnText: {
    color: '#94A3B8',
    fontSize: 11,
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
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  metricsTripleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricBoxEmpty: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  metricBoxFilled: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  metricBoxTotal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  metricNumEmpty: {
    fontSize: 30,
    fontWeight: '800',
    color: '#059669',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  metricNumFilled: {
    fontSize: 30,
    fontWeight: '800',
    color: '#DC2626',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  metricNumTotal: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  metricSubtitle: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  fillBarContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  fillBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fillBarLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  fillBarPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  fillBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillBarThumb: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  fillBarNote: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  movementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  movementLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  movementValueGreen: {
    fontSize: 11.5,
    color: '#059669',
    fontWeight: '700',
  },
  movementValueOrange: {
    fontSize: 11.5,
    color: '#D97706',
    fontWeight: '700',
  },
  movementDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  autoTriggerText: {
    flex: 1,
    fontSize: 10.5,
    color: '#065F46',
    fontWeight: '500',
    lineHeight: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  logCount: {
    fontSize: 11,
    fontWeight: '500',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  dirTextIn: {
    color: '#059669',
  },
  dirTextOut: {
    color: '#2563EB',
  },
  recordVehicleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  recordVehicleType: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  fenceInfoDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statNumOccupied: {
    fontSize: 28,
    fontWeight: '800',
    color: '#DC2626',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statNumBlue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statNote: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontWeight: '600',
    fontSize: 13,
  },
});
