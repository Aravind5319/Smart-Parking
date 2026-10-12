// ============================================================================
// PUDUCHERRY TRAFFIC POLICE - LIVE ANPR & PARKING SPACE CAMERA MODAL
// Real-time RTSP/MJPEG IP Camera Video Feed, Space Sensing & Violation AI
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
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { ParkingZone } from '../../services/parkingService';
import {
  CameraIcon,
  CheckCircleIcon,
  WarningIcon,
  NavigationIcon,
  ProhibitedIcon,
} from '../common/Icons';

interface ParkingCameraModalProps {
  visible: boolean;
  zone: ParkingZone | null;
  onClose: () => void;
  onNavigateToBay?: (zone: ParkingZone) => void;
  onReportViolation?: () => void;
}

export const ParkingCameraModal: React.FC<ParkingCameraModalProps> = ({
  visible,
  zone,
  onClose,
  onNavigateToBay,
  onReportViolation,
}) => {
  const [detectionMode, setDetectionMode] = useState<'SPACE' | 'VIOLATION'>('SPACE');
  const [isBridgeOnline, setIsBridgeOnline] = useState(true);
  const [isRealHardwareCam, setIsRealHardwareCam] = useState(false);
  const [activeStream, setActiveStream] = useState<'1' | '2'>('2');
  const [streamError, setStreamError] = useState(false);
  const [streamKey, setStreamKey] = useState(Date.now());
  const [measuredFps, setMeasuredFps] = useState(25.0);
  const [cameraIp, setCameraIp] = useState('192.168.0.100');

  // Check Python Bridge status periodically
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const checkBridgeStatus = async () => {
      try {
        const res = await fetch('http://localhost:5001/status');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsBridgeOnline(true);
            setIsRealHardwareCam(Boolean(data.is_real_camera));
            if (data.fps) setMeasuredFps(data.fps);
            if (data.camera_ip) setCameraIp(data.camera_ip);
            if (data.stream) setActiveStream(data.stream as '1' | '2');
            setStreamError(false);
          }
        } else {
          if (isMounted) setIsBridgeOnline(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsBridgeOnline(false);
          setIsRealHardwareCam(false);
        }
      }
    };

    checkBridgeStatus();
    const interval = setInterval(checkBridgeStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [visible]);

  // Handle stream switching (Stream 2 is low latency; Stream 1 is HD)
  const handleSwitchStream = async (targetStream: '1' | '2') => {
    setActiveStream(targetStream);
    setStreamError(false);
    setStreamKey(Date.now());
    try {
      await fetch(`http://localhost:5001/switch_stream?stream=${targetStream}`);
    } catch (e) {
      // Ignore switch error
    }
  };

  if (!zone) return null;

  const total = zone.totalSlots || 35;
  const occupied = zone.occupiedSlots || 14;
  const vacant = Math.max(0, total - occupied);

  const localStreamUrl = `http://localhost:5001/video_feed?stream=${activeStream}&t=${streamKey}`;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Police Command Ribbon */}
        <View style={styles.topHeader}>
          <View style={styles.headerTitleCol}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.livePulseDot,
                  { backgroundColor: isRealHardwareCam ? '#10B981' : isBridgeOnline ? '#F59E0B' : '#64748B' },
                ]}
              />
              <Text
                style={[
                  styles.liveBadgeText,
                  { color: isRealHardwareCam ? '#10B981' : isBridgeOnline ? '#F59E0B' : '#94A3B8' },
                ]}
              >
                {isRealHardwareCam
                  ? 'LIVE PHYSICAL CAM'
                  : isBridgeOnline
                  ? 'STANDBY SIMULATION'
                  : 'OFFLINE'}
              </Text>
              <Text style={styles.rtspTag}>RTSP: {cameraIp}:554</Text>
            </View>
            <Text style={styles.camName}>
              {zone.sensorType || 'ANPR Pole Cam 02 (Mission St Corridor)'}
            </Text>
            <Text style={styles.camLocation}>{zone.streetName} • {zone.area}</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Stream Quality Selector & Hardware State Alert */}
        <View style={styles.streamControlBar}>
          <View style={styles.streamTypePill}>
            <Text style={styles.streamStatusDetailText}>
              {isRealHardwareCam
                ? '🟢 Physical IP Camera Stream Active'
                : '🟡 Connect PC to Camera Wi-Fi for live stream'}
            </Text>
          </View>

          <View style={styles.streamToggleGroup}>
            <TouchableOpacity
              style={[styles.streamToggleBtn, activeStream === '2' && styles.streamToggleBtnActive]}
              onPress={() => handleSwitchStream('2')}
              activeOpacity={0.8}
            >
              <Text style={[styles.streamToggleText, activeStream === '2' && styles.streamToggleTextActive]}>
                ⚡ Smooth (Sub 2)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.streamToggleBtn, activeStream === '1' && styles.streamToggleBtnActive]}
              onPress={() => handleSwitchStream('1')}
              activeOpacity={0.8}
            >
              <Text style={[styles.streamToggleText, activeStream === '1' && styles.streamToggleTextActive]}>
                🎯 HD (Stream 1)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Monitor Frame */}
        <View style={styles.videoMonitorContainer}>
          {Platform.OS === 'web' && isBridgeOnline && !streamError ? (
            /* Live Stream Video Element from Python Bridge */
            <img
              key={`feed-${activeStream}-${streamKey}`}
              src={localStreamUrl}
              alt="Live Parking IP Camera Feed"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#0F172A',
                display: 'block',
              }}
              onError={() => {
                setStreamError(true);
              }}
            />
          ) : (
            /* Fallback Simulation View with Photographic Backing & AI Overlays */
            <View style={styles.simulatedFeedLayer}>
              {zone.imageUrl ? (
                <Image
                  source={{ uri: zone.imageUrl }}
                  style={styles.feedImage}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.feedDarkTint} />

              {/* OSD HUD Elements */}
              <View style={styles.osdTopBanner}>
                <View style={styles.osdLeft}>
                  <View style={styles.recDot} />
                  <Text style={styles.osdRecText}>SIMULATED • STANDBY CCTV</Text>
                </View>
                <Text style={styles.osdTime}>
                  {new Date().toLocaleTimeString()} • 25.0 FPS
                </Text>
              </View>

              {/* AI Bounding Boxes */}
              {detectionMode === 'SPACE' ? (
                <>
                  <View style={[styles.aiBox, styles.aiBoxVacant, { top: '38%', left: '18%', width: '28%', height: '36%' }]}>
                    <View style={[styles.aiBoxTag, styles.tagGreen]}>
                      <Text style={styles.aiBoxTagText}>VACANT SPOT #14</Text>
                    </View>
                  </View>

                  <View style={[styles.aiBox, styles.aiBoxVacant, { top: '38%', left: '52%', width: '28%', height: '36%' }]}>
                    <View style={[styles.aiBoxTag, styles.tagGreen]}>
                      <Text style={styles.aiBoxTagText}>VACANT SPOT #15</Text>
                    </View>
                  </View>

                  <View style={[styles.aiBox, styles.aiBoxOccupied, { top: '38%', left: '82%', width: '16%', height: '36%' }]}>
                    <View style={[styles.aiBoxTag, styles.tagRed]}>
                      <Text style={styles.aiBoxTagText}>OCCUPIED: PY-01</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={[styles.aiBox, styles.aiBoxViolation, { top: '44%', left: '26%', width: '48%', height: '32%' }]}>
                  <View style={[styles.aiBoxTag, styles.tagYellow]}>
                    <Text style={styles.aiBoxTagText}>OBSTRUCTION: NO-PARKING KERB DWELL</Text>
                  </View>
                </View>
              )}

              {/* OSD Bottom Diagnostics */}
              <View style={styles.osdBottomBanner}>
                <Text style={styles.osdDiagText}>
                  AI PRECISION: 99.8% | OCCUPIED: {occupied}/{total} | VACANT: {vacant}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Mode Selector Tabs */}
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            style={[styles.modeTab, detectionMode === 'SPACE' && styles.modeTabActive]}
            onPress={() => setDetectionMode('SPACE')}
            activeOpacity={0.8}
          >
            <CheckCircleIcon color={detectionMode === 'SPACE' ? '#FFFFFF' : '#059669'} size={16} />
            <Text style={[styles.modeTabText, detectionMode === 'SPACE' && styles.modeTabTextActive]}>
              Space Sensing (Vacancy AI)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, detectionMode === 'VIOLATION' && styles.modeTabViolationActive]}
            onPress={() => setDetectionMode('VIOLATION')}
            activeOpacity={0.8}
          >
            <WarningIcon color={detectionMode === 'VIOLATION' ? '#FFFFFF' : '#D97706'} size={16} />
            <Text style={[styles.modeTabText, detectionMode === 'VIOLATION' && styles.modeTabTextActive]}>
              Violation Sentinel (Kerb Monitoring)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Diagnostics & Action Card */}
        <View style={styles.diagCard}>
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#059669' }]}>{vacant}</Text>
              <Text style={styles.statLabel}>Vacant Bays</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#DC2626' }]}>{occupied}</Text>
              <Text style={styles.statLabel}>Occupied</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#0B2559' }]}>{total}</Text>
              <Text style={styles.statLabel}>Total Slots</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#2563EB' }]}>{measuredFps}</Text>
              <Text style={styles.statLabel}>Live FPS</Text>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.actionRow}>
            {onNavigateToBay && (
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => {
                  onClose();
                  onNavigateToBay(zone);
                }}
                activeOpacity={0.85}
              >
                <NavigationIcon color="#FFFFFF" size={16} />
                <Text style={styles.navBtnText}>Navigate to Vacant Bay</Text>
              </TouchableOpacity>
            )}

            {onReportViolation && (
              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => {
                  onClose();
                  onReportViolation();
                }}
                activeOpacity={0.85}
              >
                <ProhibitedIcon color="#FFFFFF" size={16} />
                <Text style={styles.reportBtnText}>Log Kerb Violation</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071630',
  },
  topHeader: {
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
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rtspTag: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  camName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  camLocation: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  streamControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0B2559',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  streamTypePill: {
    flex: 1,
    marginRight: 8,
  },
  streamStatusDetailText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  streamToggleGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  streamToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  streamToggleBtnActive: {
    backgroundColor: '#10B981',
  },
  streamToggleText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  streamToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  videoMonitorContainer: {
    width: '100%',
    height: 290,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
  },
  simulatedFeedLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  feedImage: {
    width: '100%',
    height: '100%',
  },
  feedDarkTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 22, 48, 0.45)',
  },
  osdTopBanner: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 37, 89, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  osdLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  osdRecText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  osdTime: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  aiBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
  },
  aiBoxVacant: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  aiBoxOccupied: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
  },
  aiBoxViolation: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  aiBoxTag: {
    position: 'absolute',
    top: -18,
    left: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  tagGreen: {
    backgroundColor: '#10B981',
  },
  tagRed: {
    backgroundColor: '#EF4444',
  },
  tagYellow: {
    backgroundColor: '#D97706',
  },
  aiBoxTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  osdBottomBanner: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  osdDiagText: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modeTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeTabActive: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  modeTabViolationActive: {
    backgroundColor: '#D97706',
    borderColor: '#F59E0B',
  },
  modeTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  diagCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  reportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
