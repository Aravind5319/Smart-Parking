// ============================================================================
// GOOGLE MAPS FLOATING SEARCH HEADER & HORIZONTAL CATEGORY PILLS
// Styled exactly like Google Maps & Smart Puducherry with smooth swipe pills
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { PlaceCategory } from '../../types/navigation';
import {
  SearchIcon,
  MicIcon,
  RestroomIcon,
  DustbinIcon,
  FuelIcon,
  AtmIcon,
  TrafficLightIcon,
  AmbulanceIcon,
  BeachIcon,
  ProhibitedIcon,
  PoliceShieldIcon,
} from '../common/Icons';
import { ParkingIcon } from '../common/TabIcons';

export type CategoryFilterType = 'ALL' | PlaceCategory | 'EMERGENCY';

interface GoogleSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryFilterType;
  onSelectCategory: (cat: CategoryFilterType) => void;
  onOpenEmergency: () => void;
  onOpenProfile?: () => void;
  weatherText?: string;
}

export const GoogleSearchHeader: React.FC<GoogleSearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenEmergency,
  onOpenProfile,
  weatherText = '28°C Good Air',
}) => {
  const categoryPills: {
    key: CategoryFilterType;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    color?: string;
  }[] = [
    {
      key: 'PARKING_SMART',
      label: 'Parking',
      icon: <ParkingIcon color={selectedCategory === 'PARKING_SMART' ? '#FFFFFF' : '#1E3A8A'} size={15} focused={true} />,
      color: '#1E3A8A',
    },
    {
      key: 'PARKING_FREE',
      label: 'Free Zones',
      icon: <View style={[styles.miniCircle, { backgroundColor: selectedCategory === 'PARKING_FREE' ? '#FFFFFF' : '#059669' }]} />,
      color: '#059669',
    },
    {
      key: 'TOILET',
      label: 'Toilets',
      icon: <RestroomIcon color={selectedCategory === 'TOILET' ? '#FFFFFF' : '#0284C7'} size={15} />,
      color: '#0284C7',
    },
    {
      key: 'DUSTBIN',
      label: 'Dustbins',
      icon: <DustbinIcon color={selectedCategory === 'DUSTBIN' ? '#FFFFFF' : '#059669'} size={15} />,
      color: '#059669',
    },
    {
      key: 'FUEL',
      label: 'Fuel',
      icon: <FuelIcon color={selectedCategory === 'FUEL' ? '#FFFFFF' : '#EA580C'} size={15} />,
      color: '#EA580C',
    },
    {
      key: 'ATM',
      label: 'ATMs',
      icon: <AtmIcon color={selectedCategory === 'ATM' ? '#FFFFFF' : '#16A34A'} size={15} />,
      color: '#16A34A',
    },
    {
      key: 'NO_PARKING',
      label: 'No Parking',
      icon: <ProhibitedIcon color={selectedCategory === 'NO_PARKING' ? '#FFFFFF' : '#DC2626'} size={14} />,
      color: '#DC2626',
    },
    {
      key: 'SIGNAL',
      label: 'Traffic Signals',
      icon: <TrafficLightIcon color={selectedCategory === 'SIGNAL' ? '#FFFFFF' : '#D97706'} size={15} />,
      color: '#D97706',
    },
    {
      key: 'EMERGENCY',
      label: 'Emergency (108)',
      icon: <AmbulanceIcon color={selectedCategory === 'EMERGENCY' ? '#FFFFFF' : '#DC2626'} size={15} />,
      color: '#DC2626',
    },
    {
      key: 'ATTRACTION',
      label: 'Attractions',
      icon: <BeachIcon color={selectedCategory === 'ATTRACTION' ? '#FFFFFF' : '#475569'} size={14} />,
      color: '#475569',
    },
  ];

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {/* 1. Google Maps Styled Search Bar */}
      <View style={styles.searchBarCard}>
        {/* Left Official Puducherry Police Emblem Logo */}
        <View style={styles.leftEmblem}>
          <Image
            source={require('../../../assets/police_logo.png')}
            style={styles.policeLogoImg}
            resizeMode="contain"
          />
        </View>

        {/* Search Input */}
        <TextInput
          style={styles.input}
          placeholder="Search places, parking, toilets, ATMs..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCorrect={false}
          returnKeyType="search"
        />

        {/* Clear Button */}
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        )}

        {/* Voice Mic Icon */}
        <TouchableOpacity style={styles.micBtn} activeOpacity={0.7}>
          <MicIcon color="#4285F4" size={18} />
        </TouchableOpacity>

        {/* Weather Indicator Pill */}
        <View style={styles.weatherPill}>
          <Text style={styles.weatherText}>{weatherText}</Text>
        </View>

        {/* User Profile / Notification Icon */}
        {onOpenProfile && (
          <TouchableOpacity style={styles.avatarBtn} onPress={onOpenProfile} activeOpacity={0.8}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>P</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Floating Horizontal Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsScrollContent}
        style={styles.pillsScrollView}
      >
        {categoryPills.map((pill) => {
          const isSelected = selectedCategory === pill.key;
          const activeBg = pill.color || '#1E3A8A';

          return (
            <TouchableOpacity
              key={pill.key}
              style={[
                styles.pillBtn,
                isSelected
                  ? [styles.pillBtnSelected, { backgroundColor: activeBg, borderColor: activeBg }]
                  : styles.pillBtnUnselected,
              ]}
              onPress={() => {
                if (pill.key === 'EMERGENCY') {
                  onOpenEmergency();
                } else if (isSelected) {
                  onSelectCategory('ALL');
                } else {
                  onSelectCategory(pill.key);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.pillIcon}>{pill.icon}</View>
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                ]}
              >
                {pill.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 12 : 44,
    left: 0,
    right: 0,
    zIndex: 900,
    paddingHorizontal: 12,
  },
  searchBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 3px 12px rgba(15, 23, 42, 0.12)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  leftEmblem: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  policeLogoImg: {
    width: 26,
    height: 26,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '600',
    lineHeight: 22,
  },
  micBtn: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  weatherText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  avatarBtn: {
    marginLeft: 2,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  pillsScrollView: {
    marginTop: 8,
  },
  pillsScrollContent: {
    paddingRight: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 2px 6px rgba(15, 23, 42, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  pillBtnUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  pillBtnSelected: {
    borderColor: '#1E3A8A',
  },
  pillIcon: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextUnselected: {
    color: '#334155',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  miniCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
