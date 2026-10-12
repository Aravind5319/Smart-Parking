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
import { ChevronDownIcon, PurseIcon, CarIcon, SearchIcon, PhoneIcon } from '../../components/common/Icons';

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

  const getStatusBadge = (
    status: ViolationReport['status'],
    isFound: boolean,
    isLost: boolean
  ) => {
    switch (status) {
      case 'SUBMITTED':
        return { label: 'Submitted', bg: Colors.badgeSubmitted, text: Colors.badgeSubmittedText };
      case 'UNDER_REVIEW':
        return {
          label: isFound ? 'Verifying Desk' : isLost ? 'Active Search' : 'Reviewing',
          bg: Colors.badgeReview,
          text: Colors.badgeReviewText,
        };
      case 'CHALLAN_ISSUED':
        return {
          label: isFound ? 'In Safe Custody' : isLost ? 'Potential Match' : 'Challan Issued',
          bg: Colors.badgeVerified,
          text: Colors.badgeVerifiedText,
        };
      case 'ENFORCEMENT_COMPLETE':
        return {
          label: isFound ? 'Claimed by Owner' : isLost ? 'Reunited / Safe' : 'Cleared',
          bg: Colors.badgeVerified,
          text: Colors.badgeVerifiedText,
        };
      case 'REJECTED':
        return { label: 'Dismissed', bg: Colors.badgeRejected, text: Colors.badgeRejectedText };
      default:
        return { label: 'Submitted', bg: Colors.badgeSubmitted, text: Colors.badgeSubmittedText };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Quick Access Action Button at the top */}
      <TouchableOpacity style={styles.newReportBtnTop} onPress={onNavigateToReport} activeOpacity={0.8}>
        <Text style={styles.newReportBtnText}>+ Report Traffic Violation or Lost/Found Item</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Your Submitted Complaints ({tickets.length})</Text>

      {/* Vertical list of complaints, one after another */}
      {tickets.map((ticket) => {
        const isExpanded = !!expandedTickets[ticket.id];
        const isCivic =
          ticket.reportDomain === 'CIVIC_LOST_FOUND' ||
          ticket.id === 'rep-003' ||
          ticket.id === 'rep-004' ||
          ticket.referenceNo.includes('CIV') ||
          ticket.referenceNo.includes('FND') ||
          ticket.referenceNo.includes('LST') ||
          ticket.violationType === 'FOUND_PURSE_VALUABLE' ||
          ticket.violationType === 'FOUND_DOCUMENTS' ||
          ticket.violationType === 'LOST_PROPERTY' ||
          ticket.violationType === 'ROAD_HAZARD' ||
          ticket.violationType === 'UNATTENDED_OBJECT';

        const isLost =
          isCivic &&
          (ticket.civicFlowType === 'LOST' ||
            ticket.referenceNo.includes('LST') ||
            ticket.id === 'rep-004' ||
            ticket.violationType === 'LOST_PROPERTY');

        const isFound = isCivic && !isLost;

        const badge = getStatusBadge(ticket.status, isFound, isLost);

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
                  <View style={styles.ticketIdRow}>
                    <Text style={styles.ticketIdLabel}>
                      {isFound
                        ? 'GOOD SAMARITAN REPORT'
                        : isLost
                        ? 'CITIZEN LOSS REPORT'
                        : 'TRAFFIC TICKET'}
                    </Text>
                    <View
                      style={
                        isFound
                          ? styles.foundMiniTag
                          : isLost
                          ? styles.lostMiniTag
                          : styles.trafficMiniTag
                      }
                    >
                      {isFound ? (
                        <PurseIcon color="#059669" size={10} />
                      ) : isLost ? (
                        <SearchIcon color="#D97706" size={10} />
                      ) : (
                        <CarIcon color={Colors.policeNavy} size={10} />
                      )}
                      <Text
                        style={
                          isFound
                            ? styles.foundMiniTagText
                            : isLost
                            ? styles.lostMiniTagText
                            : styles.trafficMiniTagText
                        }
                      >
                        {isFound
                          ? 'FOUND ITEM (+60 PTS)'
                          : isLost
                          ? 'LOST PROPERTY (+25 PTS)'
                          : 'TRAFFIC'}
                      </Text>
                    </View>
                  </View>
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

              {/* Vehicle / Item & Location summary preview */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>
                    {isFound
                      ? 'DISCOVERED ITEM'
                      : isLost
                      ? 'MY MISSING ITEM'
                      : 'VEHICLE PLATE'}
                  </Text>
                  <Text style={styles.summaryValBold}>{ticket.vehicleNumber}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>
                    {isFound
                      ? 'FOUND CATEGORY'
                      : isLost
                      ? 'LOST CATEGORY'
                      : 'OFFENCE TYPE'}
                  </Text>
                  <Text style={styles.summaryVal}>{ticket.violationType.replace(/_/g, ' ')}</Text>
                </View>
                <View style={styles.summaryItemFull}>
                  <Text style={styles.summaryLabel}>
                    {isFound
                      ? 'FOUND LOCATION ON STREET'
                      : isLost
                      ? 'LAST SEEN LOCATION'
                      : 'LANDMARK / STREET'}
                  </Text>
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

            {/* Dropdown Section: Complaint Progress Timeline */}
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
                    <Text style={styles.summaryLabel}>
                      {isLost ? 'CONFIDENTIAL PROOF OF OWNERSHIP' : 'CITIZEN NOTE'}
                    </Text>
                    <Text style={styles.descriptionVal}>{ticket.otherDescription}</Text>
                  </View>
                ) : null}

                {/* Owner Callback Phone for Lost item reports */}
                {ticket.ownerContact ? (
                  <View style={styles.ownerContactBox}>
                    <PhoneIcon color="#D97706" size={13} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ownerContactLabel}>OWNER CALLBACK PHONE FOR CLAIM ALERTS:</Text>
                      <Text style={styles.ownerContactVal}>{ticket.ownerContact}</Text>
                    </View>
                  </View>
                ) : null}

                {/* 4-Step Vertical Progress Timeline */}
                <Text style={styles.timelineTitle}>
                  {isFound
                    ? 'Police Safe Custody & Handover Timeline'
                    : isLost
                    ? 'Police Missing Property Search & Recovery Timeline'
                    : 'Enforcement Progress Timeline'}
                </Text>
                <View style={styles.timelineContainer}>
                  {/* Step 1 */}
                  <View style={styles.stepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View style={[styles.stepDot, styles.stepDotCompleted]} />
                      <View style={[styles.stepLine, styles.stepLineCompleted]} />
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>
                        {isFound
                          ? 'Found Item Registered'
                          : isLost
                          ? 'Loss Complaint Registered'
                          : 'Violation Submitted'}
                      </Text>
                      <Text style={styles.stepMeta}>
                        {isFound
                          ? `${ticket.timestamp} • Uploaded via live camera with verified GPS`
                          : isLost
                          ? `${ticket.timestamp} • Logged with Puducherry Police Missing Desk`
                          : `${ticket.timestamp} • Uploaded via live camera`}
                      </Text>
                    </View>
                  </View>

                  {/* Step 2 */}
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
                      <Text style={styles.stepTitle}>
                        {isFound
                          ? 'Police Station Custody Verification'
                          : isLost
                          ? 'Active Station Cross-Matching'
                          : 'Under Police Review'}
                      </Text>
                      <Text style={styles.stepMeta}>
                        {ticket.policeNote ||
                          (isFound
                            ? 'Received at Police Station Lost Property Desk.'
                            : isLost
                            ? 'Cross-referencing with station found lockers & beat patrols.'
                            : 'Assigned to Traffic Police Control Room for verification.')}
                      </Text>
                    </View>
                  </View>

                  {/* Step 3 */}
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
                      <Text style={styles.stepTitle}>
                        {isFound
                          ? 'Safe Custody & Public Notice'
                          : isLost
                          ? 'Match with Deposited Property'
                          : 'e-Challan Issuance'}
                      </Text>
                      <Text style={styles.stepMeta}>
                        {isFound
                          ? ticket.challanNumber
                            ? `Station Locker Log #${ticket.challanNumber} • Public notice published`
                            : 'Secured in station locker awaiting claimant'
                          : isLost
                          ? ticket.challanNumber
                            ? `Matched with Good Samaritan Deposit #${ticket.challanNumber}`
                            : 'Searching across Puducherry station lockers & public bulletins'
                          : ticket.challanNumber
                          ? `Challan #${ticket.challanNumber} (MVA Sec 122)`
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
                          ticket.status === 'ENFORCEMENT_COMPLETE' ? styles.stepDotCompleted : styles.stepDotPending,
                        ]}
                      />
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>
                        {isFound
                          ? 'Claimed & Handed Over'
                          : isLost
                          ? 'Reunited with Owner'
                          : 'Enforcement Complete'}
                      </Text>
                      <Text style={styles.stepMeta}>
                        {isFound
                          ? ticket.status === 'ENFORCEMENT_COMPLETE'
                            ? 'Owner verified via ID & item handed over with receipt'
                            : 'Pending owner verification & handover'
                          : isLost
                          ? ticket.status === 'ENFORCEMENT_COMPLETE'
                            ? 'Owner verified via private marks & retrieved from station'
                            : 'Pending deposit match & station verification'
                          : ticket.status === 'ENFORCEMENT_COMPLETE'
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
  ticketIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  civicMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 5,
    gap: 3,
  },
  civicMiniTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.4,
  },
  foundMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 5,
    gap: 3,
  },
  foundMiniTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  lostMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 5,
    gap: 3,
  },
  lostMiniTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.4,
  },
  trafficMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 5,
    gap: 3,
  },
  trafficMiniTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.policeNavy,
    letterSpacing: 0.4,
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
  ownerContactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  ownerContactLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.4,
  },
  ownerContactVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 1,
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
