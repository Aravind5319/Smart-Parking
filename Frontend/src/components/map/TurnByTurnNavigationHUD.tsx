// ============================================================================
// GOOGLE MAPS TURN-BY-TURN NAVIGATION HUD
// Exact replica of Google Maps navigation mode (matching Screen 2 of Image 2)
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { NavigationSession } from '../../types/navigation';
import {
  DirectionsIcon,
  VolumeIcon,
  MicIcon,
  CheckmarkIcon,
} from '../common/Icons';

interface TurnByTurnNavigationHUDProps {
  session: NavigationSession | null;
  onEndNavigation: () => void;
}

export const TurnByTurnNavigationHUD: React.FC<TurnByTurnNavigationHUDProps> = ({
  session,
  onEndNavigation,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  if (!session) return null;

  const steps = session.steps;
  const currentStep = steps[stepIndex] || steps[0];
  const isFinalStep = stepIndex >= steps.length - 1;

  const handleNextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.hudOverlay} pointerEvents="box-none">
      {/* 1. Top Green Navigation Maneuver Banner */}
      <View style={styles.topGreenBanner}>
        {/* Turn Direction Icon */}
        <View style={styles.turnIconBox}>
          <DirectionsIcon color="#FFFFFF" size={28} strokeWidth={3} />
        </View>

        {/* Turn Text Details */}
        <View style={styles.turnTextCol}>
          <Text style={styles.distanceMetric}>{currentStep.distance}</Text>
          <Text style={styles.turnInstruction} numberOfLines={2}>
            {currentStep.instruction}
          </Text>
          <Text style={styles.thenText}>
            Towards {session.destination.name}
          </Text>
        </View>

        {/* Audio / Voice Prompt Action */}
        <View style={styles.topActionsCol}>
          <TouchableOpacity
            style={styles.circleIconBtn}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.8}
          >
            <VolumeIcon color={isMuted ? '#94A3B8' : '#FFFFFF'} size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleIconBtn} activeOpacity={0.8}>
            <MicIcon color="#FFFFFF" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Bottom Navigation Control Dock */}
      <View style={styles.bottomNavDock}>
        <View style={styles.bottomNavInner}>
          {/* Time & Distance */}
          <View style={styles.metricsCol}>
            <View style={styles.timeRow}>
              <Text style={styles.durationBig}>{session.etaMinutes} min</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.distanceSub}>{session.distanceKm} km</Text>
            </View>
            <Text style={styles.arrivalText}>
              Arrive by {session.arrivalTime} • Smooth Flow
            </Text>
          </View>

          {/* Advance Step Button */}
          {!isFinalStep ? (
            <TouchableOpacity
              style={styles.nextStepBtn}
              onPress={handleNextStep}
              activeOpacity={0.8}
            >
              <Text style={styles.nextStepBtnText}>Next Turn</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.arrivedBadge}>
              <CheckmarkIcon color="#10B981" size={14} />
              <Text style={styles.arrivedText}>Arrived</Text>
            </View>
          )}

          {/* End Navigation Red Button */}
          <TouchableOpacity
            style={styles.endBtn}
            onPress={onEndNavigation}
            activeOpacity={0.8}
          >
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 950,
    justifyContent: 'space-between',
  },
  topGreenBanner: {
    backgroundColor: '#047857', // Google Maps dark green navigation bar
    marginTop: Platform.OS === 'web' ? 12 : 44,
    marginHorizontal: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
      },
    }),
  },
  turnIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  turnTextCol: {
    flex: 1,
  },
  distanceMetric: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  turnInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  thenText: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
    fontWeight: '600',
  },
  topActionsCol: {
    gap: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  circleIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavDock: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: Platform.OS === 'web' ? 64 : 74,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
      },
    }),
  },
  bottomNavInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricsCol: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBig: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
  },
  dotSeparator: {
    fontSize: 16,
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  distanceSub: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  arrivalText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  nextStepBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 10,
  },
  nextStepBtnText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '800',
  },
  arrivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 10,
    gap: 4,
  },
  arrivedText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  endBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
