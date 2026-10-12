// ============================================================================
// TRAFFIC ADVISORIES & PUBLIC LOST & FOUND COMMUNITY BULLETINS
// - Live advisories from Puducherry Traffic Police HQ
// - Public Lost Property Bulletins with Police Station Safe Custody Claim Desk
// - Zero Emojis (Pure Vector SVG Icons)
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { MOCK_ADVISORIES, MOCK_TICKETS } from '../../data/mockData';
import { ViolationReport, TrafficAdvisory } from '../../types/navigation';
import {
  SirenIcon,
  PurseIcon,
  KeyIcon,
  LocationPinIcon,
  ShieldLockIcon,
  PhoneIcon,
  CheckmarkIcon,
  SearchIcon,
} from '../../components/common/Icons';

interface AdvisoriesScreenProps {
  tickets?: ViolationReport[];
  onNavigateToReport?: () => void;
}

export const AdvisoriesScreen: React.FC<AdvisoriesScreenProps> = ({
  tickets = MOCK_TICKETS,
  onNavigateToReport,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'LOST_FOUND' | 'TRAFFIC'>('ALL');
  const [civicSubTab, setCivicSubTab] = useState<'ALL' | 'FOUND' | 'LOST'>('ALL');

  // Filter out community lost & found items
  const lostFoundItems = tickets.filter(
    (t) =>
      t.reportDomain === 'CIVIC_LOST_FOUND' ||
      t.id === 'rep-003' ||
      t.id === 'rep-004' ||
      t.referenceNo.includes('CIV') ||
      t.referenceNo.includes('FND') ||
      t.referenceNo.includes('LST') ||
      t.violationType === 'FOUND_PURSE_VALUABLE' ||
      t.violationType === 'FOUND_DOCUMENTS' ||
      t.violationType === 'LOST_PROPERTY' ||
      t.violationType === 'ROAD_HAZARD' ||
      t.violationType === 'UNATTENDED_OBJECT'
  );

  const getStationInfo = (landmark: string) => {
    const l = landmark.toLowerCase();
    if (l.includes('beach') || l.includes('goubert') || l.includes('promenade')) {
      return {
        station: 'Grand Bazaar Police Station (Beach Patrol Desk)',
        address: 'Rue De Bussy / Ambour Salai, Boulevard, Puducherry - 605001',
        phone: '0413-2224000',
        lockerRef: 'Locker #BP-42',
      };
    } else if (l.includes('mvit') || l.includes('madagadipet') || l.includes('villianur')) {
      return {
        station: 'Villianur Police Station (Community Desk)',
        address: 'Villianur Main Road, Puducherry - 605110',
        phone: '0413-2666100',
        lockerRef: 'Locker #VL-19',
      };
    }
    return {
      station: 'Central Traffic Control Room / Lost Property Desk',
      address: 'Police Headquarters, Goubert Avenue, Puducherry - 605001',
      phone: '0413-2334000',
      lockerRef: 'Locker #HQ-08',
    };
  };

  const handleClaimItemAlert = (item: ViolationReport) => {
    const station = getStationInfo(item.location.landmark);
    Alert.alert(
      'Claim Found Item at Police Station',
      `Item: ${item.vehicleNumber}\n` +
      `Public Ticket Ref: ${item.referenceNo}\n` +
      `Current Status: In Safe Custody (${station.lockerRef})\n\n` +
      `🏢 Custody Location:\n${station.station}\n${station.address}\n\n` +
      `📞 Station Duty Phone: ${station.phone} (or dial 112)\n\n` +
      `📋 Owner Claim Checklist:\n` +
      `1. Present original Government Photo ID (Aadhaar / Voter ID / Driving License).\n` +
      `2. Verify unique marks or contents inside (e.g. brand, cards, keys).\n` +
      `3. Sign the Puducherry Police Lost Property Handover Register to retrieve.`
    );
  };

  const handleReportFoundClaimAlert = (item: ViolationReport) => {
    const station = getStationInfo(item.location.landmark);
    Alert.alert(
      'Found This Missing Property?',
      `Missing Item: ${item.vehicleNumber}\n` +
      `Police Missing Ref: ${item.referenceNo}\n\n` +
      `🏢 Handover Police Station:\n${station.station}\n${station.address}\n\n` +
      `📞 Station Desk Phone: ${station.phone} (or dial 112)\n` +
      (item.ownerContact ? `📱 Owner Callback Phone: ${item.ownerContact}\n\n` : '\n') +
      `Thank you Good Samaritan! Please drop this item off at the nearest police station or notify the owner so they can be reunited.`
    );
  };

  const handleCallStationAlert = (item: ViolationReport) => {
    const station = getStationInfo(item.location.landmark);
    Alert.alert(
      'Police Station Contact',
      `Police Station: ${station.station}\n` +
      `Helpline: ${station.phone}\n` +
      `Emergency: 112\n\n` +
      `Quote Ticket Reference "${item.referenceNo}" when inquiring with the duty officer.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageTitle}>Public Advisories & Lost Property</Text>
      <Text style={styles.pageSub}>
        Live bulletins from Puducherry Police HQ & Public Lost & Found Community Register.
      </Text>

      {/* Segmented Filter Pills */}
      <View style={styles.filterPillBar}>
        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'ALL' && styles.filterPillActive]}
          onPress={() => setFilterTab('ALL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, filterTab === 'ALL' && styles.filterPillTextActive]}>
            All Bulletins ({MOCK_ADVISORIES.length + lostFoundItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'LOST_FOUND' && styles.filterPillActive]}
          onPress={() => setFilterTab('LOST_FOUND')}
          activeOpacity={0.8}
        >
          <PurseIcon color={filterTab === 'LOST_FOUND' ? '#FFFFFF' : '#0284C7'} size={12} />
          <Text style={[styles.filterPillText, filterTab === 'LOST_FOUND' && styles.filterPillTextActive]}>
            Lost & Found ({lostFoundItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'TRAFFIC' && styles.filterPillActive]}
          onPress={() => setFilterTab('TRAFFIC')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, filterTab === 'TRAFFIC' && styles.filterPillTextActive]}>
            Traffic Alerts ({MOCK_ADVISORIES.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Community Lost & Found Public Bulletins Section */}
      {(filterTab === 'ALL' || filterTab === 'LOST_FOUND') && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <PurseIcon color={Colors.policeNavy} size={15} />
              <Text style={styles.sectionHeading}>Public Road Belongings & Lost Items</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveBadgeDot} />
              <Text style={styles.liveBadgeText}>PUBLIC BULLETIN</Text>
            </View>
          </View>

          <Text style={styles.sectionSub}>
            Items found on public roads and deposited at local police stations. Owners can verify and collect in person.
          </Text>

          {/* Civic Sub-Filter Chips */}
          <View style={styles.civicSubChipRow}>
            <TouchableOpacity
              style={[styles.civicSubChip, civicSubTab === 'ALL' && styles.civicSubChipActive]}
              onPress={() => setCivicSubTab('ALL')}
              activeOpacity={0.8}
            >
              <Text style={[styles.civicSubChipText, civicSubTab === 'ALL' && styles.civicSubChipTextActive]}>
                All Belongings ({lostFoundItems.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.civicSubChip, civicSubTab === 'FOUND' && styles.civicSubChipFoundActive]}
              onPress={() => setCivicSubTab('FOUND')}
              activeOpacity={0.8}
            >
              <PurseIcon color={civicSubTab === 'FOUND' ? '#FFFFFF' : '#059669'} size={11} />
              <Text style={[styles.civicSubChipText, civicSubTab === 'FOUND' && styles.civicSubChipTextFoundActive]}>
                Found Items ({lostFoundItems.filter((i) => i.civicFlowType !== 'LOST' && !i.referenceNo.includes('LST') && i.violationType !== 'LOST_PROPERTY').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.civicSubChip, civicSubTab === 'LOST' && styles.civicSubChipLostActive]}
              onPress={() => setCivicSubTab('LOST')}
              activeOpacity={0.8}
            >
              <SearchIcon color={civicSubTab === 'LOST' ? '#FFFFFF' : '#D97706'} size={11} />
              <Text style={[styles.civicSubChipText, civicSubTab === 'LOST' && styles.civicSubChipTextLostActive]}>
                Lost Reports ({lostFoundItems.filter((i) => i.civicFlowType === 'LOST' || i.referenceNo.includes('LST') || i.violationType === 'LOST_PROPERTY').length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Action to Report Item */}
          {onNavigateToReport && (
            <TouchableOpacity
              style={styles.reportFoundItemBtn}
              onPress={onNavigateToReport}
              activeOpacity={0.8}
            >
              <Text style={styles.reportFoundItemBtnText}>
                + Found an Item on Road or Misplaced a Belonging? Report Here
              </Text>
            </TouchableOpacity>
          )}

          {lostFoundItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTitle}>No Lost Belongings Reported</Text>
              <Text style={styles.emptyCardSub}>
                All reported items have been reunited with their owners or none are active.
              </Text>
            </View>
          ) : (
            lostFoundItems
              .filter((item) => {
                const isLost =
                  item.civicFlowType === 'LOST' ||
                  item.referenceNo.includes('LST') ||
                  item.violationType === 'LOST_PROPERTY';
                if (civicSubTab === 'FOUND') return !isLost;
                if (civicSubTab === 'LOST') return isLost;
                return true;
              })
              .map((item) => {
                const station = getStationInfo(item.location.landmark);
                const isLost =
                  item.civicFlowType === 'LOST' ||
                  item.referenceNo.includes('LST') ||
                  item.violationType === 'LOST_PROPERTY';

                return (
                  <View
                    key={item.id}
                    style={[styles.lostItemCard, isLost && styles.lostItemCardReport]}
                  >
                    {/* Top Notice Bar */}
                    <View style={styles.lostItemTopRow}>
                      <View style={isLost ? styles.noticeTagLost : styles.noticeTagFound}>
                        {isLost ? (
                          <SearchIcon color="#D97706" size={12} />
                        ) : (
                          <ShieldLockIcon color="#059669" size={12} />
                        )}
                        <Text style={isLost ? styles.noticeTagTextLost : styles.noticeTagTextFound}>
                          {isLost ? 'CITIZEN LOSS BULLETIN (SEARCH ACTIVE)' : 'POLICE SAFE CUSTODY (FOUND ITEM)'}
                        </Text>
                      </View>
                      <Text style={styles.lostItemTime}>{item.timestamp}</Text>
                    </View>

                    {/* Item Title & Ref */}
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.vehicleNumber}</Text>
                    </View>

                    <View style={styles.refRow}>
                      <Text style={styles.refCodeLabel}>
                        {isLost ? 'POLICE LOSS COMPLAINT REF:' : 'POLICE CUSTODY TOKEN REF:'}
                      </Text>
                      <Text style={styles.refCodeVal}>{item.referenceNo}</Text>
                    </View>

                    {/* Photo Evidence if Present */}
                    {item.photoUri && (
                      <View style={styles.photoContainer}>
                        <Image
                          source={{ uri: item.photoUri }}
                          style={styles.photoImage}
                          resizeMode="cover"
                        />
                        <View style={styles.photoOverlay}>
                          <CheckmarkIcon color="#FFFFFF" size={10} strokeWidth={3} />
                          <Text style={styles.photoOverlayText}>GPS-VERIFIED FIELD EVIDENCE</Text>
                        </View>
                      </View>
                    )}

                    {/* Citizen Description / Particulars */}
                    {item.otherDescription ? (
                      <View style={styles.itemParticularsBox}>
                        <Text style={styles.itemParticularsLabel}>
                          {isLost ? 'IDENTIFYING MARKS / CONTENT PROOF:' : 'IDENTIFYING MARKS / CONTENTS:'}
                        </Text>
                        <Text style={styles.itemParticularsText}>{item.otherDescription}</Text>
                      </View>
                    ) : null}

                    {/* Location Discovered / Last seen */}
                    <View style={[styles.locationBox, isLost && styles.locationBoxLost]}>
                      <LocationPinIcon
                        color={isLost ? '#D97706' : Colors.parkingGreenBorder}
                        size={14}
                      />
                      <View style={{ flex: 1, marginLeft: 6 }}>
                        <Text style={[styles.locationTitle, isLost && styles.locationTitleLost]}>
                          {isLost ? 'Last Seen / Misplaced Near:' : 'Found Location on Street:'}
                        </Text>
                        <Text style={[styles.locationValue, isLost && styles.locationValueLost]}>
                          {item.location.landmark}
                        </Text>
                      </View>
                    </View>

                    {/* Police Station Custody / Search Desk Box */}
                    <View style={[styles.policeCustodyBox, isLost && styles.policeCustodyBoxLost]}>
                      <View style={styles.custodyTitleRow}>
                        <Text style={styles.custodyStationName}>{station.station}</Text>
                        <View style={[styles.lockerPill, isLost && styles.lockerPillLost]}>
                          <Text style={[styles.lockerPillText, isLost && styles.lockerPillTextLost]}>
                            {isLost ? 'Missing Desk' : station.lockerRef}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.custodyAddress}>{station.address}</Text>
                      <Text style={styles.custodyPhone}>Desk Phone: {station.phone} • Emergency: 112</Text>
                      {isLost && item.ownerContact ? (
                        <View style={styles.ownerContactCallout}>
                          <PhoneIcon color="#92400E" size={12} />
                          <Text style={styles.ownerContactCalloutText}>
                            Owner Callback Phone: {item.ownerContact}
                          </Text>
                        </View>
                      ) : null}
                      <Text style={styles.custodyInstruction}>
                        {isLost
                          ? 'Reported missing by owner. If you found this item, please hand it over at this police station.'
                          : 'Held in station locker. The owner can collect with valid Photo ID & verification of contents.'}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.cardActionRow}>
                      <TouchableOpacity
                        style={[styles.claimButton, isLost && styles.claimButtonLost]}
                        onPress={() => (isLost ? handleReportFoundClaimAlert(item) : handleClaimItemAlert(item))}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.claimButtonText}>
                          {isLost ? 'I Found This Item (Guide)' : 'How to Claim at Station'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.phoneButton}
                        onPress={() => handleCallStationAlert(item)}
                        activeOpacity={0.8}
                      >
                        <PhoneIcon color={Colors.policeNavy} size={14} />
                        <Text style={styles.phoneButtonText}>
                          {isLost ? 'Police Desk' : 'Station Info'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
          )}
        </View>
      )}

      {/* Traffic Advisories Section */}
      {(filterTab === 'ALL' || filterTab === 'TRAFFIC') && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SirenIcon color={Colors.noParkingRedBorder} size={15} />
              <Text style={styles.sectionHeading}>Traffic Police HQ Alerts & Diversions</Text>
            </View>
            <Text style={styles.trafficCountBadge}>{MOCK_ADVISORIES.length} ACTIVE</Text>
          </View>

          <Text style={styles.sectionSub}>
            Live corridor closures, one-way regulations, and emergency vehicle routes in Puducherry.
          </Text>

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
        </View>
      )}
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
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pageSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
  },

  // Segmented Filter Pills
  filterPillBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: Colors.policeNavy,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)',
      },
      default: {
        shadowColor: Colors.policeNavy,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // Section Blocks
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.policeNavy,
    letterSpacing: 0.2,
  },
  sectionSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 15,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 4,
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  liveBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.4,
  },
  trafficCountBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.noParkingRedBorder,
    backgroundColor: '#FEE2E2',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },

  civicSubChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  civicSubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  civicSubChipActive: {
    backgroundColor: Colors.policeNavy,
    borderColor: Colors.policeNavy,
  },
  civicSubChipFoundActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  civicSubChipLostActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  civicSubChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  civicSubChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  civicSubChipTextFoundActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  civicSubChipTextLostActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  reportFoundItemBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  reportFoundItemBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },

  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyCardSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },

  // Lost Item Cards
  lostItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginBottom: 14,
    ...Platform.select({
      web: {
        boxShadow: '0px 3px 8px rgba(2, 132, 199, 0.08)',
      },
      default: {
        shadowColor: '#0284C7',
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
    }),
    elevation: 2,
  },
  lostItemCardReport: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF7',
  },
  lostItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noticeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 4,
  },
  noticeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.3,
  },
  noticeTagFound: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 4,
  },
  noticeTagTextFound: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  noticeTagLost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 4,
  },
  noticeTagTextLost: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.3,
  },
  lostItemTime: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  itemTitleRow: {
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  refCodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  refCodeVal: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.policeNavy,
    letterSpacing: 0.5,
  },

  photoContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginBottom: 10,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 4,
  },
  photoOverlayText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  itemParticularsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemParticularsLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  itemParticularsText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },

  locationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  locationBoxLost: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  locationTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
  },
  locationTitleLost: {
    color: '#92400E',
  },
  locationValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#14532D',
    marginTop: 1,
  },
  locationValueLost: {
    color: '#B45309',
  },

  policeCustodyBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  policeCustodyBoxLost: {
    backgroundColor: '#FFFDF7',
    borderColor: '#FDE68A',
  },
  custodyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  custodyStationName: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.policeNavy,
    flex: 1,
  },
  lockerPill: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  lockerPillLost: {
    backgroundColor: '#FEF3C7',
  },
  lockerPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1E40AF',
  },
  lockerPillTextLost: {
    color: '#B45309',
  },
  custodyAddress: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  custodyPhone: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
    marginTop: 2,
  },
  ownerContactCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  ownerContactCalloutText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  custodyInstruction: {
    fontSize: 10,
    color: '#334155',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 14,
  },

  cardActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  claimButton: {
    flex: 1,
    backgroundColor: Colors.policeNavy,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonLost: {
    backgroundColor: '#D97706',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.policeNavy,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  phoneButtonText: {
    color: Colors.policeNavy,
    fontSize: 11,
    fontWeight: '800',
  },

  // Advisory Cards
  advisoryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
    ...Platform.select({
      web: {
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
    marginBottom: 6,
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
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  advisoryDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  affectedBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 6,
    padding: 8,
  },
  affectedLabel: {
    fontSize: 9,
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
});
