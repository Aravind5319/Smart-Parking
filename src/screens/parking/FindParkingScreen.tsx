// ============================================================================
// MEMBER 2 WORKSPACE: SMART PARKING MAP & DYNAMIC REDIRECTION
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { PUDUCHERRY_KERB_ZONES } from '../../data/mockData';
import { KerbParkingZone } from '../../types/navigation';
import { SearchIcon, MapIcon, RefreshIcon } from '../../components/common/Icons';

export const FindParkingScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zones, setZones] = useState<KerbParkingZone[]>(PUDUCHERRY_KERB_ZONES);
  const [selectedZone, setSelectedZone] = useState<KerbParkingZone>(PUDUCHERRY_KERB_ZONES[0]);
  const [showAutoRedirect, setShowAutoRedirect] = useState(false);

  const handleSelectZone = (zone: KerbParkingZone) => {
    setSelectedZone(zone);
    if (zone.isFull) {
      setShowAutoRedirect(true);
    } else {
      setShowAutoRedirect(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <View style={{ marginRight: 8 }}>
          <SearchIcon color="#64748B" size={16} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search near Rock Beach, White Town..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Map View Canvas / Graphic Placeholder */}
      <View style={styles.mapContainer}>
        {/* Map UI simulation header */}
        <View style={styles.mapHeaderBadge}>
          <MapIcon color="#475569" size={13} />
          <Text style={styles.mapBadgeText}>PUDUCHERRY SMART KERB MAP</Text>
        </View>

        {/* Visual Map Representation of Dual Kerb Colors */}
        <View style={styles.mapRoadIllustration}>
          <Text style={styles.roadNameLabel}>{selectedZone.streetName}</Text>

          <View style={styles.dualRoadBox}>
            {/* Side A: Green Parking Kerb */}
            <View style={styles.kerbSideGreen}>
              <View style={styles.kerbColorPillGreen}>
                <Text style={styles.kerbSideTitle}>SIDE A: PARKING</Text>
                <Text style={styles.kerbSlots}>
                  {selectedZone.sideA_Available} / {selectedZone.sideA_Total} VACANT
                </Text>
              </View>
              <Text style={styles.kerbDesc}>Authorized on-street bays</Text>
            </View>

            {/* Road Divider */}
            <View style={styles.roadDivider}>
              <View style={styles.dashLine} />
              <View style={styles.dashLine} />
              <View style={styles.dashLine} />
            </View>

            {/* Side B: Red Strict No-Parking Kerb */}
            <View style={styles.kerbSideRed}>
              <View style={styles.kerbColorPillRed}>
                <Text style={styles.kerbSideTitleRed}>SIDE B: NO PARKING</Text>
                <Text style={styles.kerbStrictText}>ZERO TOLERANCE</Text>
              </View>
              <Text style={styles.kerbDescRed}>Strict Tow-Away Corridor</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.parkingGreen }]} />
            <Text style={styles.legendText}>Green = Authorized Parking</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.noParkingRed }]} />
            <Text style={styles.legendText}>Red = No-Parking / Tow-Away</Text>
          </View>
        </View>
      </View>

      {/* Auto-Redirect Alert Banner (Triggered when full) */}
      {showAutoRedirect && (
        <View style={styles.redirectBanner}>
          <View style={styles.redirectHeader}>
            <View style={{ marginRight: 10, marginTop: 2 }}>
              <RefreshIcon color="#1E3A8A" size={18} />
            </View>
            <View style={styles.redirectTextCol}>
              <Text style={styles.redirectTitle}>Auto-Redirecting to Nearest Parking!</Text>
              <Text style={styles.redirectSub}>
                Selected lot at capacity (100% full). Diverted to:
              </Text>
              <Text style={styles.redirectDestination}>
                Old Court Parking Ground (280m away • 14 spots open)
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Available Puducherry Kerb & Lot Zones */}
      <Text style={styles.sectionTitle}>Puducherry Street Kerb Status</Text>
      {zones.map((zone) => {
        const isSelected = zone.id === selectedZone.id;
        return (
          <TouchableOpacity
            key={zone.id}
            style={[styles.zoneCard, isSelected && styles.zoneCardSelected]}
            onPress={() => handleSelectZone(zone)}
            activeOpacity={0.7}
          >
            <View style={styles.zoneCardHeader}>
              <Text style={styles.zoneName}>{zone.streetName}</Text>
              <View
                style={[
                  styles.zoneStatusPill,
                  zone.isFull ? styles.statusPillFull : styles.statusPillAvailable,
                ]}
              >
                <Text
                  style={[
                    styles.zoneStatusText,
                    zone.isFull ? styles.statusTextFull : styles.statusTextAvailable,
                  ]}
                >
                  {zone.isFull ? 'FULL' : `${zone.sideA_Available} SPOTS LEFT`}
                </Text>
              </View>
            </View>

            <View style={styles.zoneMetaRow}>
              <Text style={styles.zoneRate}>Tariff: {zone.hourlyRate}</Text>
              <Text style={styles.zoneTapPrompt}>
                {isSelected ? '● Currently Viewing' : 'Tap to View on Map'}
              </Text>
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  teamNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  mapContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 16,
  },
  mapHeaderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  mapBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  mapRoadIllustration: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  roadNameLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  dualRoadBox: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  kerbSideGreen: {
    flex: 1,
    alignItems: 'center',
  },
  kerbColorPillGreen: {
    backgroundColor: Colors.parkingGreen,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%',
  },
  kerbSideTitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  kerbSlots: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  kerbDesc: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  roadDivider: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 50,
  },
  dashLine: {
    width: 2,
    height: 8,
    backgroundColor: '#FBBF24',
  },
  kerbSideRed: {
    flex: 1,
    alignItems: 'center',
  },
  kerbColorPillRed: {
    backgroundColor: Colors.noParkingRed,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%',
  },
  kerbSideTitleRed: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  kerbStrictText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  kerbDescRed: {
    color: '#F87171',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  redirectBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  redirectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  redirectIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  redirectTextCol: {
    flex: 1,
  },
  redirectTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  redirectSub: {
    fontSize: 11,
    color: '#1E40AF',
    marginTop: 2,
  },
  redirectDestination: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  zoneCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
  },
  zoneCardSelected: {
    borderColor: Colors.policeNavy,
    backgroundColor: '#F8FAFC',
  },
  zoneCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  zoneStatusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusPillAvailable: {
    backgroundColor: Colors.parkingGreenLight,
  },
  statusPillFull: {
    backgroundColor: Colors.noParkingRedLight,
  },
  zoneStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextAvailable: {
    color: Colors.parkingGreenBorder,
  },
  statusTextFull: {
    color: Colors.noParkingRedBorder,
  },
  zoneMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  zoneRate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  zoneTapPrompt: {
    fontSize: 11,
    color: Colors.policeNavy,
    fontWeight: '600',
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
