// ============================================================================
// MEMBER 1 WORKSPACE: TICKET TRACKING & CIVIC KARMA STATUS
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { ViolationReport } from '../../types/navigation';

interface TrackComplaintsScreenProps {
  tickets: ViolationReport[];
  karmaPoints: number;
  onNavigateToReport: () => void;
}

export const TrackComplaintsScreen: React.FC<TrackComplaintsScreenProps> = ({
  tickets,
  karmaPoints,
  onNavigateToReport,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    tickets.length > 0 ? tickets[0].id : ''
  );

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const getStatusBadge = (status: ViolationReport['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return { label: 'Submitted', bg: Colors.badgeSubmitted, text: Colors.badgeSubmittedText };
      case 'UNDER_REVIEW':
        return { label: 'Reviewing', bg: Colors.badgeReview, text: Colors.badgeReviewText };
      case 'CHALLAN_ISSUED':
        return { label: 'Challan Issued', bg: Colors.badgeVerified, text: Colors.badgeVerifiedText };
      case 'ENFORCEMENT_COMPLETE':
        return { label: 'Cleared', bg: Colors.badgeVerified, text: Colors.badgeVerifiedText };
      case 'REJECTED':
        return { label: 'Dismissed', bg: Colors.badgeRejected, text: Colors.badgeRejectedText };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      {/* Civic Karma Summary Card */}
      <View style={styles.karmaCard}>
        <View style={styles.karmaRow}>
          <View>
            <Text style={styles.karmaTitle}>Civic Karma Balance</Text>
            <Text style={styles.karmaLevel}>Level 2: Traffic Sentinel</Text>
          </View>
          <View style={styles.karmaScoreBox}>
            <Text style={styles.karmaScore}>{karmaPoints}</Text>
            <Text style={styles.karmaPts}>POINTS</Text>
          </View>
        </View>
        <Text style={styles.karmaDescription}>
          Every verified report adds +50 Karma points. High karma unlocks priority review in police triage.
        </Text>
      </View>

      {/* Ticket Selector Horizontal Pills */}
      <Text style={styles.sectionHeader}>Your Submitted Reports ({tickets.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ticketScroll}>
        {tickets.map((t) => {
          const isSelected = t.id === activeTicket?.id;
          const badge = getStatusBadge(t.status);
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.ticketPill, isSelected && styles.ticketPillActive]}
              onPress={() => setSelectedTicketId(t.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.ticketRef, isSelected && styles.ticketRefActive]}>
                {t.referenceNo}
              </Text>
              <View style={[styles.pillBadge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.pillBadgeText, { color: badge.text }]}>{badge.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {activeTicket && (
        <View style={styles.detailCard}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <View>
              <Text style={styles.detailRefLabel}>Specific Ticket</Text>
              <Text style={styles.detailRefVal}>{activeTicket.referenceNo}</Text>
            </View>
            <View>
              <Text style={styles.detailRefLabel}>Current Status</Text>
              <View style={[styles.statusTag, { backgroundColor: getStatusBadge(activeTicket.status).bg }]}>
                <Text style={[styles.statusTagText, { color: getStatusBadge(activeTicket.status).text }]}>
                  {getStatusBadge(activeTicket.status).label}
                </Text>
              </View>
            </View>
          </View>

          {/* Vehicle & Location summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Vehicle Plate</Text>
              <Text style={styles.summaryVal}>{activeTicket.vehicleNumber}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Offence Type</Text>
              <Text style={styles.summaryVal}>{activeTicket.violationType.replace(/_/g, ' ')}</Text>
            </View>
            <View style={styles.summaryItemFull}>
              <Text style={styles.summaryLabel}>Landmark / Street</Text>
              <Text style={styles.summaryVal}>{activeTicket.location.landmark}</Text>
            </View>
            {activeTicket.otherDescription ? (
              <View style={styles.summaryItemFull}>
                <Text style={styles.summaryLabel}>Description Note</Text>
                <Text style={styles.summaryVal}>{activeTicket.otherDescription}</Text>
              </View>
            ) : null}
          </View>

          {/* Captured Evidence Photo if available */}
          {activeTicket.photoUri && (
            <View style={styles.evidencePhotoCard}>
              <Text style={styles.evidencePhotoLabel}>TAMPER-PROOF EVIDENCE PHOTO</Text>
              <Image
                source={{ uri: activeTicket.photoUri }}
                style={styles.evidencePhotoImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* 4-Step Vertical Progress Timeline */}
          <Text style={styles.timelineTitle}>Enforcement Progress Timeline</Text>
          <View style={styles.timelineContainer}>
            {/* Step 1 */}
            <View style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={[styles.stepDot, styles.stepDotCompleted]} />
                <View style={[styles.stepLine, styles.stepLineCompleted]} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Violation Submitted</Text>
                <Text style={styles.stepMeta}>{activeTicket.timestamp} • Uploaded via live camera</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepDot,
                    activeTicket.status !== 'SUBMITTED' ? styles.stepDotActive : styles.stepDotPending,
                  ]}
                />
                <View
                  style={[
                    styles.stepLine,
                    activeTicket.status === 'CHALLAN_ISSUED' || activeTicket.status === 'ENFORCEMENT_COMPLETE'
                      ? styles.stepLineCompleted
                      : styles.stepLinePending,
                  ]}
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Under Police Review</Text>
                <Text style={styles.stepMeta}>
                  {activeTicket.policeNote || 'Assigned to Traffic Police Control Room for verification'}
                </Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepDot,
                    activeTicket.status === 'CHALLAN_ISSUED' || activeTicket.status === 'ENFORCEMENT_COMPLETE'
                      ? styles.stepDotCompleted
                      : styles.stepDotPending,
                  ]}
                />
                <View
                  style={[
                    styles.stepLine,
                    activeTicket.status === 'ENFORCEMENT_COMPLETE'
                      ? styles.stepLineCompleted
                      : styles.stepLinePending,
                  ]}
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>e-Challan Issuance</Text>
                <Text style={styles.stepMeta}>
                  {activeTicket.challanNumber
                    ? `Challan #${activeTicket.challanNumber} (MVA Sec 122)`
                    : 'Pending police officer confirmation'}
                </Text>
              </View>
            </View>

            {/* Step 4 */}
            <View style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepDot,
                    activeTicket.status === 'ENFORCEMENT_COMPLETE' ? styles.stepDotCompleted : styles.stepDotPending,
                  ]}
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Enforcement Complete</Text>
                <Text style={styles.stepMeta}>
                  {activeTicket.status === 'ENFORCEMENT_COMPLETE'
                    ? 'Obstruction cleared by towing crane'
                    : 'Pending vehicle removal / fine payment'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* New Report Call to Action */}
      <TouchableOpacity style={styles.newReportBtn} onPress={onNavigateToReport} activeOpacity={0.8}>
        <Text style={styles.newReportBtnText}>+ Report Another Violation</Text>
      </TouchableOpacity>
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
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  teamNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  karmaCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 18,
  },
  karmaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  karmaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  karmaLevel: {
    fontSize: 12,
    color: Colors.policeNavy,
    fontWeight: '600',
    marginTop: 2,
  },
  karmaScoreBox: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  karmaScore: {
    fontSize: 20,
    fontWeight: '800',
    color: '#B45309',
  },
  karmaPts: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  karmaDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 10,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ticketScroll: {
    marginBottom: 16,
  },
  ticketPill: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketPillActive: {
    borderColor: Colors.policeNavy,
    backgroundColor: '#EFF6FF',
  },
  ticketRef: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginRight: 8,
  },
  ticketRefActive: {
    color: Colors.policeNavy,
  },
  pillBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  detailRefLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailRefVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 2,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginVertical: 14,
    gap: 10,
  },
  summaryItem: {
    width: '45%',
  },
  summaryItemFull: {
    width: '100%',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  timelineContainer: {
    paddingLeft: 6,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepDotCompleted: {
    backgroundColor: Colors.parkingGreen,
  },
  stepDotActive: {
    backgroundColor: Colors.policeNavyLight,
    borderWidth: 3,
    borderColor: '#93C5FD',
  },
  stepDotPending: {
    backgroundColor: '#CBD5E1',
  },
  stepLine: {
    width: 2,
    height: 38,
  },
  stepLineCompleted: {
    backgroundColor: Colors.parkingGreen,
  },
  stepLinePending: {
    backgroundColor: '#E2E8F0',
  },
  stepContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  evidencePhotoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  evidencePhotoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  evidencePhotoImage: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  newReportBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  newReportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
