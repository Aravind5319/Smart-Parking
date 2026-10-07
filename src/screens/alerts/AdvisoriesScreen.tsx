// ============================================================================
// MEMBER 3 WORKSPACE: TRAFFIC ADVISORIES & EMERGENCY CORRIDOR ALERTS
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import { MOCK_ADVISORIES } from '../../data/mockData';
import { SirenIcon } from '../../components/common/Icons';

export const AdvisoriesScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>


      <Text style={styles.pageTitle}>Puducherry Traffic Bulletins</Text>
      <Text style={styles.pageSub}>
        Live advisories issued by Puducherry Traffic Police HQ & Predictive Intelligence.
      </Text>

      {/* Advisory Cards */}
      {MOCK_ADVISORIES.map((adv) => {
        const isEmergency = adv.severity === 'EMERGENCY';
        const isHigh = adv.severity === 'HIGH';

        return (
          <View
            key={adv.id}
            style={[
              styles.advisoryCard,
              isEmergency && styles.advisoryCardEmergency,
              isHigh && styles.advisoryCardHigh,
            ]}
          >
            <View style={styles.advisoryHeaderRow}>
              <View
                style={[
                  styles.severityPill,
                  isEmergency ? styles.pillEmergency : isHigh ? styles.pillHigh : styles.pillMedium,
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isEmergency && (
                    <View style={{ marginRight: 4 }}>
                      <SirenIcon color={Colors.noParkingRedBorder} size={11} />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.severityPillText,
                      isEmergency
                        ? styles.textEmergency
                        : isHigh
                        ? styles.textHigh
                        : styles.textMedium,
                    ]}
                  >
                    {adv.severity === 'EMERGENCY' ? 'EMERGENCY CORRIDOR' : `${adv.severity} ALERT`}
                  </Text>
                </View>
              </View>
              <Text style={styles.timeTag}>{adv.activeTime}</Text>
            </View>

            <Text style={styles.advisoryTitle}>{adv.title}</Text>
            <Text style={styles.advisoryDescription}>{adv.description}</Text>

            <View style={styles.affectedBox}>
              <Text style={styles.affectedLabel}>Affected Corridors:</Text>
              <Text style={styles.affectedRoads}>{adv.affectedRoads}</Text>
            </View>
          </View>
        );
      })}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  teamNotice: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  teamNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pageSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 16,
  },
  advisoryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.03)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
    }),
    elevation: 2,
  },
  advisoryCardEmergency: {
    borderColor: Colors.noParkingRed,
    backgroundColor: '#FFF5F5',
  },
  advisoryCardHigh: {
    borderColor: '#F59E0B',
  },
  advisoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  pillEmergency: {
    backgroundColor: '#FEE2E2',
  },
  pillHigh: {
    backgroundColor: '#FEF3C7',
  },
  pillMedium: {
    backgroundColor: '#EFF6FF',
  },
  severityPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textEmergency: {
    color: Colors.noParkingRedBorder,
  },
  textHigh: {
    color: '#B45309',
  },
  textMedium: {
    color: '#1D4ED8',
  },
  timeTag: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  advisoryDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  affectedBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 6,
    padding: 8,
  },
  affectedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  affectedRoads: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  memberHookNote: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  memberHookTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  memberHookBody: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
});
