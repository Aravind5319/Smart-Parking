// ============================================================================
// PROFILE & CIVIC KARMA SCREEN (TAB 3)
// User profile, Civic Karma, Track Complaints, Advisories, Emergency & Settings
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { ViolationReport } from '../../types/navigation';
import {
  TrophyIcon,
  PoliceShieldIcon,
  CarIcon,
  MotorcycleIcon,
  PhoneCallIcon,
  AmbulanceIcon,
  CheckCircleIcon,
  CameraIcon,
  ArrowRightIcon,
  ShieldLockIcon,
} from '../../components/common/Icons';
import { TicketIcon, BellIcon } from '../../components/common/TabIcons';
import { TrackComplaintsScreen } from '../reporting/TrackComplaintsScreen';
import { AdvisoriesScreen } from '../alerts/AdvisoriesScreen';

interface ProfileScreenProps {
  karmaPoints: number;
  tickets: ViolationReport[];
  onNavigateToReport: () => void;
  onOpenEmergency: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  karmaPoints,
  tickets,
  onNavigateToReport,
  onOpenEmergency,
}) => {
  const [activeSubView, setActiveSubView] = useState<'HOME' | 'COMPLAINTS' | 'ADVISORIES'>('HOME');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'BIKE'>('CAR');

  if (activeSubView === 'COMPLAINTS') {
    return (
      <View style={styles.subViewContainer}>
        <View style={styles.subViewHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setActiveSubView('HOME')}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>← Back to Profile</Text>
          </TouchableOpacity>
        </View>
        <TrackComplaintsScreen
          tickets={tickets}
          karmaPoints={karmaPoints}
          onNavigateToReport={onNavigateToReport}
        />
      </View>
    );
  }

  if (activeSubView === 'ADVISORIES') {
    return (
      <View style={styles.subViewContainer}>
        <View style={styles.subViewHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setActiveSubView('HOME')}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>← Back to Profile</Text>
          </TouchableOpacity>
        </View>
        <AdvisoriesScreen
          tickets={tickets}
          onNavigateToReport={onNavigateToReport}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Profile Header Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.profileTopRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>P</Text>
          </View>
          <View style={styles.profileTextCol}>
            <Text style={styles.profileName}>Puducherry Citizen</Text>
            <Text style={styles.profileSub}>Citizen ID: PUD-CITIZEN-9428</Text>
            <View style={styles.levelBadge}>
              <PoliceShieldIcon color="#F59E0B" size={12} />
              <Text style={styles.levelBadgeText}>Level 2: Traffic Sentinel</Text>
            </View>
          </View>
        </View>

        {/* Karma Score Banner */}
        <View style={styles.karmaBanner}>
          <View style={styles.karmaIconBox}>
            <TrophyIcon color="#F59E0B" size={24} />
          </View>
          <View style={styles.karmaTextCol}>
            <Text style={styles.karmaScoreText}>{karmaPoints} Civic Karma Pts</Text>
            <Text style={styles.karmaSubText}>
              Earn points by authentic obstruction reports & safe parking
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Vehicle Preference Selector */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Default Vehicle Preference</Text>
        <View style={styles.vehicleRow}>
          <TouchableOpacity
            style={[styles.vehicleBtn, vehicleType === 'CAR' && styles.vehicleBtnActive]}
            onPress={() => setVehicleType('CAR')}
            activeOpacity={0.85}
          >
            <CarIcon color={vehicleType === 'CAR' ? '#FFFFFF' : '#1E3A8A'} size={20} />
            <Text style={[styles.vehicleBtnText, vehicleType === 'CAR' && styles.vehicleBtnTextActive]}>
              Car / 4-Wheeler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.vehicleBtn, vehicleType === 'BIKE' && styles.vehicleBtnActive]}
            onPress={() => setVehicleType('BIKE')}
            activeOpacity={0.85}
          >
            <MotorcycleIcon color={vehicleType === 'BIKE' ? '#FFFFFF' : '#1E3A8A'} size={20} />
            <Text style={[styles.vehicleBtnText, vehicleType === 'BIKE' && styles.vehicleBtnTextActive]}>
              Bike / 2-Wheeler
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Quick Navigation Hub */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Complaints & Advisories</Text>

        {/* Track Complaints Button */}
        <TouchableOpacity
          style={styles.navRowItem}
          onPress={() => setActiveSubView('COMPLAINTS')}
          activeOpacity={0.8}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#EFF6FF' }]}>
            <TicketIcon color="#1E3A8A" size={18} />
          </View>
          <View style={styles.navTextCol}>
            <Text style={styles.navItemTitle}>Track My Complaints</Text>
            <Text style={styles.navItemSub}>
              {tickets.length} submitted tickets & police actions
            </Text>
          </View>
          <ArrowRightIcon color="#64748B" size={16} />
        </TouchableOpacity>

        {/* Public Advisories Button */}
        <TouchableOpacity
          style={styles.navRowItem}
          onPress={() => setActiveSubView('ADVISORIES')}
          activeOpacity={0.8}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#FEF3C7' }]}>
            <BellIcon color="#B45309" size={18} />
          </View>
          <View style={styles.navTextCol}>
            <Text style={styles.navItemTitle}>Advisories & Found Belongings</Text>
            <Text style={styles.navItemSub}>
              Station lockers & public citizen bulletins
            </Text>
          </View>
          <ArrowRightIcon color="#64748B" size={16} />
        </TouchableOpacity>

        {/* Emergency Assistance Direct Dial */}
        <TouchableOpacity
          style={styles.navRowItem}
          onPress={onOpenEmergency}
          activeOpacity={0.8}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#FEF2F2' }]}>
            <AmbulanceIcon color="#DC2626" size={18} />
          </View>
          <View style={styles.navTextCol}>
            <Text style={[styles.navItemTitle, { color: '#DC2626' }]}>
              Emergency Assistance (108 / 100)
            </Text>
            <Text style={styles.navItemSub}>
              One-tap direct dial & live GPS location share
            </Text>
          </View>
          <ArrowRightIcon color="#DC2626" size={16} />
        </TouchableOpacity>
      </View>

      {/* 4. Police Command Helpline */}
      <View style={styles.helplineCard}>
        <View style={styles.helplineHeader}>
          <PoliceShieldIcon color="#1E3A8A" size={18} />
          <Text style={styles.helplineTitle}>Puducherry Traffic Police Desk</Text>
        </View>
        <Text style={styles.helplineText}>
          Toll-Free Control Room Helpline: 103 or 0413-2231300
        </Text>
        <Text style={styles.helplineSub}>
          Protecting with Pride • Smart City Enforcement Division
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  subViewContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  subViewHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    paddingVertical: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  karmaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  karmaIconBox: {
    marginRight: 10,
  },
  karmaTextCol: {
    flex: 1,
  },
  karmaScoreText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B45309',
  },
  karmaSubText: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  vehicleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  vehicleBtnActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  vehicleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  vehicleBtnTextActive: {
    color: '#FFFFFF',
  },
  navRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navTextCol: {
    flex: 1,
  },
  navItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  navItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  helplineCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 14,
  },
  helplineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  helplineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  helplineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  helplineSub: {
    fontSize: 10,
    color: '#60A5FA',
    marginTop: 4,
  },
});
