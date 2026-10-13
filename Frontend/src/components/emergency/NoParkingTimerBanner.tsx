// ============================================================================
// NO PARKING 5-MINUTE COUNTDOWN WARNING BANNER
// Alerts user if parked in a red zone, runs live 5-minute countdown,
// and provides 1-tap navigation to the nearest legal parking bay
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WarningIcon, DirectionsIcon, CheckmarkIcon } from '../common/Icons';
import { CityPlace } from '../../types/navigation';

interface NoParkingTimerBannerProps {
  visible: boolean;
  zoneName: string;
  onNavigateNearestParking: () => void;
  onDismiss: () => void;
}

export const NoParkingTimerBanner: React.FC<NoParkingTimerBannerProps> = ({
  visible,
  zoneName,
  onNavigateNearestParking,
  onDismiss,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes = 300 seconds

  useEffect(() => {
    if (!visible) {
      setSecondsRemaining(300);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = secondsRemaining === 0;

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerCard}>
        {/* Top Warning Title Row */}
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <WarningIcon color="#FFFFFF" size={18} strokeWidth={2.5} />
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.title}>
              {isExpired ? '🚨 TOW TRUCK & FINE DISPATCHED' : '⚠️ STRICT NO PARKING ZONE DETECTED'}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {zoneName || 'Red Kerb / Tow-Away Corridor'}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Big Countdown Box */}
        <View style={[styles.timerBox, isExpired && styles.timerBoxExpired]}>
          <Text style={styles.timerLabel}>
            {isExpired
              ? 'TIME EXPIRED • ₹1,500 e-Challan Penalty Incurred'
              : 'MOVE YOUR VEHICLE WITHIN'}
          </Text>
          <Text style={[styles.timerValue, isExpired && styles.timerValueExpired]}>
            {isExpired ? '00:00' : timeFormatted}
          </Text>
          <Text style={styles.timerSub}>
            {isExpired
              ? 'Puducherry Police Hydraulic Crane in Route'
              : 'Traffic Police automated camera is monitoring this spot'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.reRouteBtn}
            onPress={onNavigateNearestParking}
            activeOpacity={0.85}
          >
            <DirectionsIcon color="#FFFFFF" size={14} />
            <Text style={styles.reRouteBtnText}>Navigate to Legal Parking Bay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={onDismiss}
            activeOpacity={0.85}
          >
            <CheckmarkIcon color="#059669" size={14} />
            <Text style={styles.dismissBtnText}>I Moved Vehicle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 120 : 130,
    left: 12,
    right: 12,
    zIndex: 920,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DC2626',
    padding: 14,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 8px 24px rgba(220, 38, 38, 0.3)',
      },
      default: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '800',
  },
  timerBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  timerBoxExpired: {
    backgroundColor: '#450A0A',
    borderColor: '#991B1B',
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 1,
    marginVertical: 2,
  },
  timerValueExpired: {
    color: '#F87171',
  },
  timerSub: {
    fontSize: 10,
    color: '#7F1D1D',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reRouteBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  reRouteBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  dismissBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  dismissBtnText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
});
