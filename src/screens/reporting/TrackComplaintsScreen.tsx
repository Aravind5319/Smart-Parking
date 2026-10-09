// ============================================================================
// MEMBER 1 WORKSPACE: TICKET TRACKING & CIVIC ENFORCEMENT TIMELINE
// - Vertical Complaints List (one after another)
// - Expandable Accordion Dropdown revealing the 4-step progress timeline
// - Zero Emojis (Pure SVG Icons)
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { ViolationReport } from '../../types/navigation';
import { ChevronDownIcon } from '../../components/common/Icons';

interface TrackComplaintsScreenProps {
  tickets: ViolationReport[];
  karmaPoints?: number;
  onNavigateToReport: () => void;
}

export const TrackComplaintsScreen: React.FC<TrackComplaintsScreenProps> = ({
  tickets,
  onNavigateToReport,
}) => {
  // Store which ticket IDs are expanded in the dropdown accordion
  // Default the first ticket (most recent) to expanded so progress is immediately visible
  const [expandedTickets, setExpandedTickets] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (tickets.length > 0) {
      initial[tickets[0].id] = true;
    }
    return initial;
  });

  const toggleTicket = (ticketId: string) => {
    setExpandedTickets((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
  };

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
      {/* Quick Access Action Button at the top */}
      <TouchableOpacity style={styles.newReportBtnTop} onPress={onNavigateToReport} activeOpacity={0.8}>
        <Text style={styles.newReportBtnText}>+ Report Another Violation</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Your Submitted Complaints ({tickets.length})</Text>

      {/* Vertical list of complaints, one after another */}
      {tickets.map((ticket) => {
        const isExpanded = !!expandedTickets[ticket.id];
        const badge = getStatusBadge(ticket.status);

        return (
          <View key={ticket.id} style={styles.complaintCard}>
            {/* Clickable Card Header / Accordion Trigger */}
            <TouchableOpacity
              style={styles.cardHeaderTrigger}
              onPress={() => toggleTicket(ticket.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeaderTopRow}>
                <View>
                  <Text style={styles.ticketIdLabel}>SPECIFIC TICKET</Text>
                  <Text style={styles.ticketIdValue}>{ticket.referenceNo}</Text>
                </View>

                <View style={styles.statusAndDropdownCol}>
                  <View style={styles.statusCol}>
                    <Text style={styles.ticketStatusHeaderLabel}>CURRENT STATUS</Text>
                    <View style={[styles.statusTag, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusTagText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.chevronBox, isExpanded && styles.chevronRotated]}>
                    <ChevronDownIcon color="#64748B" size={18} strokeWidth={2.5} />
                  </View>
                </View>
              </View>

              {/* Vehicle & Location summary preview */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>VEHICLE PLATE</Text>
                  <Text style={styles.summaryValBold}>{ticket.vehicleNumber}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>OFFENCE TYPE</Text>
                  <Text style={styles.summaryVal}>{ticket.violationType.replace(/_/g, ' ')}</Text>
                </View>
                <View style={styles.summaryItemFull}>
                  <Text style={styles.summaryLabel}>LANDMARK / STREET</Text>
                  <Text style={styles.summaryVal}>{ticket.location.landmark}</Text>
                </View>
              </View>

              {/* Expand/Collapse footer hint bar */}
              <View style={styles.expandHintBar}>
                <Text style={styles.expandHintText}>
                  {isExpanded ? 'Tap to hide timeline progress' : 'Tap to view timeline progress'}
                </Text>
                <View style={[styles.miniChevron, isExpanded && styles.chevronRotated]}>
                  <ChevronDownIcon color={Colors.policeNavy} size={14} strokeWidth={2.5} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Dropdown Section: Complaint Progress Timeline (Second Image) */}
            {isExpanded && (
              <View style={styles.dropdownContent}>
                <View style={styles.dropdownDivider} />

                {/* Evidence Photo if present */}
                {ticket.photoUri && (
                  <View style={styles.evidencePhotoCard}>
                    <Text style={styles.evidencePhotoLabel}>TAMPER-PROOF EVIDENCE PHOTO</Text>
                    <Image
                      source={{ uri: ticket.photoUri }}
                      style={styles.evidencePhotoImage}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* Optional Description */}
                {ticket.otherDescription ? (
                  <View style={styles.descriptionBox}>
                    <Text style={styles.summaryLabel}>CITIZEN NOTE</Text>
                    <Text style={styles.descriptionVal}>{ticket.otherDescription}</Text>
                  </View>
                ) : null}

                {/* 4-Step Vertical Progress Timeline (from second image) */}
                <Text style={styles.timelineTitle}>Enforcement Progress Timeline</Text>
                <View style={styles.timelineContainer}>
                  {/* Step 1: Violation Submitted */}
                  <View style={styles.stepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View style={[styles.stepDot, styles.stepDotCompleted]} />
                      <View style={[styles.stepLine, styles.stepLineCompleted]} />
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Violation Submitted</Text>
                      <Text style={styles.stepMeta}>{ticket.timestamp} • Uploaded via live camera</Text>
                    </View>
                  </View>

                  {/* Step 2: Under Police Review */}
                  <View style={styles.stepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View
                        style={[
                          styles.stepDot,
                          ticket.status !== 'SUBMITTED' ? styles.stepDotActive : styles.stepDotPending,
                        ]}
                      />
                      <View
                        style={[
                          styles.stepLine,
                          ticket.status === 'CHALLAN_ISSUED' || ticket.status === 'ENFORCEMENT_COMPLETE'
                            ? styles.stepLineCompleted
                            : styles.stepLinePending,
                        ]}
                      />
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Under Police Review</Text>
                      <Text style={styles.stepMeta}>
                        {ticket.policeNote || 'Assigned to Traffic Police Control Room for verification.'}
                      </Text>
                    </View>
                  </View>

                  {/* Step 3: e-Challan Issuance */}
                  <View style={styles.stepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View
                        style={[
                          styles.stepDot,
                          ticket.status === 'CHALLAN_ISSUED' || ticket.status === 'ENFORCEMENT_COMPLETE'
                            ? styles.stepDotCompleted
                            : styles.stepDotPending,
                        ]}
                      />
                      <View
                        style={[
                          styles.stepLine,
                          ticket.status === 'ENFORCEMENT_COMPLETE'
                            ? styles.stepLineCompleted
                            : styles.stepLinePending,
                        ]}
                      />
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>e-Challan Issuance</Text>
                      <Text style={styles.stepMeta}>
                        {ticket.challanNumber
                          ? `Challan #${ticket.challanNumber} (MVA Sec 122)`
                          : 'Pending police officer confirmation'}
                      </Text>
                    </View>
                  </View>

                  {/* Step 4: Enforcement Complete */}
                  <View style={styles.stepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View
                        style={[
                          styles.stepDot,
                          ticket.status === 'ENFORCEMENT_COMPLETE' ? styles.stepDotCompleted : styles.stepDotPending,
                        ]}
                      />
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Enforcement Complete</Text>
                      <Text style={styles.stepMeta}>
                        {ticket.status === 'ENFORCEMENT_COMPLETE'
                          ? 'Obstruction cleared by towing crane'
                          : 'Pending vehicle removal / fine payment'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
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
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  complaintCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.04)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  cardHeaderTrigger: {
    padding: 16,
  },
  cardHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketIdLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  ticketIdValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusAndDropdownCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  ticketStatusHeaderLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  statusTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  chevronBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  summaryBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryItem: {
    width: '46%',
  },
  summaryItemFull: {
    width: '100%',
    marginTop: 2,
  },
  summaryLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  summaryValBold: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.policeNavy,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  expandHintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  expandHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.policeNavy,
  },
  miniChevron: {
    marginLeft: 4,
  },
  dropdownContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginBottom: 14,
  },
  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionVal: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  newReportBtnTop: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.04)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      },
    }),
  },
  newReportBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.policeNavy,
    letterSpacing: 0.3,
  },
});
