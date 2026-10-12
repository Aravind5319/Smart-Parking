// ============================================================================
// EMERGENCY ASSISTANCE MODAL
// Matching Screen 6 of Image 2 (Ambulance 108, Police 100, Fire 101, Share Location)
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import {
  AmbulanceIcon,
  PoliceShieldIcon,
  WarningIcon,
  LocationPinIcon,
  ShareIcon,
  CheckmarkIcon,
} from '../common/Icons';

interface EmergencyAssistanceModalProps {
  visible: boolean;
  onClose: () => void;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const EmergencyAssistanceModal: React.FC<EmergencyAssistanceModalProps> = ({
  visible,
  onClose,
  userCoords = { latitude: 11.9340, longitude: 79.8303 },
}) => {
  const [copied, setCopied] = useState(false);

  const coords = userCoords || { latitude: 11.9340, longitude: 79.8303 };

  const handleCall = (num: string) => {
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Emergency Helpline', `Call ${num} directly from your phone.`);
    });
  };

  const handleShareLocation = () => {
    const locText = `EMERGENCY ALERT: I am in Puducherry at Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)} (Near Rock Beach, White Town). Need immediate assistance. Maps: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Emergency Live Location',
        text: locText,
      }).catch(() => {});
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(locText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
      Alert.alert(
        'Location Copied',
        `GPS Coordinates copied to clipboard:\nLat: ${coords.latitude}, Lng: ${coords.longitude}`
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <View style={styles.redDot} />
              <Text style={styles.title}>Emergency Assistance</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Get immediate emergency response in Puducherry</Text>

          {/* 3 Large Action Cards: Ambulance 108, Police 100, Fire 101 */}
          <View style={styles.emergencyGrid}>
            <TouchableOpacity
              style={[styles.emergencyBox, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
              onPress={() => handleCall('108')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <AmbulanceIcon color="#DC2626" size={24} />
              </View>
              <Text style={styles.serviceName}>Ambulance</Text>
              <Text style={[styles.dialNum, { color: '#DC2626' }]}>108</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyBox, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}
              onPress={() => handleCall('100')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                <PoliceShieldIcon color="#1E3A8A" size={24} />
              </View>
              <Text style={styles.serviceName}>Police</Text>
              <Text style={[styles.dialNum, { color: '#1E3A8A' }]}>100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyBox, { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' }]}
              onPress={() => handleCall('101')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FFEDD5' }]}>
                <WarningIcon color="#EA580C" size={24} />
              </View>
              <Text style={styles.serviceName}>Fire</Text>
              <Text style={[styles.dialNum, { color: '#EA580C' }]}>101</Text>
            </TouchableOpacity>
          </View>

          {/* Share My Live Location Banner */}
          <TouchableOpacity
            style={styles.shareBanner}
            onPress={handleShareLocation}
            activeOpacity={0.85}
          >
            <View style={styles.shareIconBox}>
              <LocationPinIcon color="#DC2626" size={20} />
            </View>
            <View style={styles.shareTextCol}>
              <Text style={styles.shareTitle}>Share My Live Location</Text>
              <Text style={styles.shareSub}>Send instant GPS pin to family & emergency services</Text>
            </View>
            <ShareIcon color="#1E3A8A" size={18} />
          </TouchableOpacity>

          {/* Current Location Badge */}
          <View style={styles.locationBadgeBox}>
            <Text style={styles.locBadgeTitle}>My Current GPS Fix:</Text>
            <Text style={styles.locBadgeVal}>
              Goubert Avenue, Puducherry • Lat: {coords.latitude.toFixed(4)}, Lng: {coords.longitude.toFixed(4)}
            </Text>
            {copied && (
              <View style={styles.copiedRow}>
                <CheckmarkIcon color="#10B981" size={12} />
                <Text style={styles.copiedText}>Coordinates copied to clipboard!</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px -4px 25px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  emergencyGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  emergencyBox: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  dialNum: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  shareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  shareIconBox: {
    marginRight: 10,
  },
  shareTextCol: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  shareSub: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 1,
  },
  locationBadgeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locBadgeTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  locBadgeVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  copiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  copiedText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
});
