// ============================================================================
// NEARBY SLIDE-UP BOTTOM SHEET (MATCHING IMAGE 3 & 4)
// Collapsed state: "Explore Puducherry" + quick horizontal cards
// Expanded state: Full slide-up "Nearby" directory with search bar, category pills,
// vertical facility list, open status, and direct circular blue navigation arrow buttons
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { CityPlace } from '../../types/navigation';
import { CategoryFilterType } from './GoogleSearchHeader';
import {
  SearchIcon,
  MicIcon,
  DirectionsIcon,
  RestroomIcon,
  DustbinIcon,
  FuelIcon,
  AtmIcon,
  CameraIcon,
  StarIcon,
  ChevronDownIcon,
  CheckmarkIcon,
} from '../common/Icons';
import { ParkingIcon } from '../common/TabIcons';

interface NearbySlideUpSheetProps {
  places: CityPlace[];
  selectedPlaceId?: string;
  onSelectPlace: (place: CityPlace) => void;
  onStartDirections: (place: CityPlace) => void;
  onOpenCam: (place: CityPlace) => void;
  onOpenDetails: (place: CityPlace) => void;
  selectedCategory: CategoryFilterType;
  onSelectCategory: (cat: CategoryFilterType) => void;
}

export const NearbySlideUpSheet: React.FC<NearbySlideUpSheetProps> = ({
  places,
  selectedPlaceId,
  onSelectPlace,
  onStartDirections,
  onOpenCam,
  onOpenDetails,
  selectedCategory,
  onSelectCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category filter pills for the slide-up sheet (Matching Image 3)
  const categoryPills: { key: CategoryFilterType; label: string; color: string }[] = [
    { key: 'ALL', label: 'All', color: '#1E3A8A' },
    { key: 'PARKING_SMART', label: 'Parking', color: '#1E3A8A' },
    { key: 'TOILET', label: 'Toilets', color: '#0284C7' },
    { key: 'FUEL', label: 'Fuel', color: '#EA580C' },
    { key: 'DUSTBIN', label: 'Dustbins', color: '#059669' },
    { key: 'ATM', label: 'ATMs', color: '#16A34A' },
  ];

  // Filter list based on search and category
  const filteredList = useMemo(() => {
    return places.filter((p) => {
      if (selectedCategory !== 'ALL' && selectedCategory !== 'EMERGENCY') {
        if (p.category !== selectedCategory) return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const mName = p.name.toLowerCase().includes(q);
        const mStreet = p.streetName.toLowerCase().includes(q);
        const mArea = p.area.toLowerCase().includes(q);
        if (!mName && !mStreet && !mArea) return false;
      }
      return true;
    });
  }, [places, selectedCategory, searchQuery]);

  return (
    <View style={[styles.sheetContainer, isExpanded ? styles.sheetExpanded : styles.sheetCollapsed]}>
      {/* 1. Drag Handle Header (Tapping toggles expand/collapse) */}
      <TouchableOpacity
        style={styles.dragHandleBox}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.dragHandleBar} />
      </TouchableOpacity>

      {/* ==================================================================== */}
      {/* EXPANDED VIEW: Full "Nearby" Directory (Matching Image 3 right) */}
      {/* ==================================================================== */}
      {isExpanded ? (
        <View style={styles.expandedContent}>
          {/* Header Row: "Nearby" title & minimize arrow */}
          <View style={styles.expandedHeaderRow}>
            <Text style={styles.expandedTitle}>Nearby</Text>
            <TouchableOpacity
              style={styles.collapseBtn}
              onPress={() => setIsExpanded(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.collapseBtnText}>⌄ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Search Box: "Q Search nearby..." (Matching Image 3) */}
          <View style={styles.searchBoxCard}>
            <SearchIcon color="#94A3B8" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search nearby places, toilets, parking..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity activeOpacity={0.7}>
              <MicIcon color="#2563EB" size={18} />
            </TouchableOpacity>
          </View>

          {/* Category Filter Pills (Matching Image 3) */}
          <View style={styles.categoryPillsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsRow}>
              {categoryPills.map((pill) => {
                const isActive = selectedCategory === pill.key;
                return (
                  <TouchableOpacity
                    key={pill.key}
                    style={[
                      styles.categoryPill,
                      isActive && { backgroundColor: pill.color, borderColor: pill.color },
                    ]}
                    onPress={() => onSelectCategory(pill.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                      {pill.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Vertical List of Nearby Items (Matching Image 3 right) */}
          <ScrollView style={styles.nearbyVerticalList} showsVerticalScrollIndicator={false}>
            {filteredList.map((place, idx) => {
              const isSelected = selectedPlaceId === place.id;
              const isFirst = idx === 0;

              return (
                <TouchableOpacity
                  key={place.id}
                  style={[styles.nearbyListItem, isSelected && styles.nearbyListItemSelected]}
                  onPress={() => {
                    onSelectPlace(place);
                    onOpenDetails(place);
                  }}
                  activeOpacity={0.85}
                >
                  {/* Left Aspect Thumbnail or Icon Box */}
                  <View style={styles.listItemLeading}>
                    {place.imageUrl ? (
                      <Image source={{ uri: place.imageUrl }} style={styles.leadingThumb} resizeMode="cover" />
                    ) : (
                      <View
                        style={[
                          styles.leadingIconBox,
                          place.category === 'TOILET' && { backgroundColor: '#E0F2FE' },
                          place.category === 'PARKING_SMART' && { backgroundColor: '#DBEAFE' },
                          place.category === 'PARKING_FREE' && { backgroundColor: '#D1FAE5' },
                          place.category === 'DUSTBIN' && { backgroundColor: '#ECFDF5' },
                          place.category === 'FUEL' && { backgroundColor: '#FFEDD5' },
                        ]}
                      >
                        {place.category === 'TOILET' ? (
                          <RestroomIcon color="#0284C7" size={20} />
                        ) : place.category === 'DUSTBIN' ? (
                          <DustbinIcon color="#059669" size={20} />
                        ) : place.category === 'FUEL' ? (
                          <FuelIcon color="#EA580C" size={20} />
                        ) : (
                          <Text style={styles.leadingPText}>P</Text>
                        )}
                      </View>
                    )}

                    {/* Nearest Star Badge */}
                    {isFirst && (
                      <View style={styles.nearestBadgeMini}>
                        <Text style={styles.nearestBadgeMiniText}>⭐</Text>
                      </View>
                    )}
                  </View>

                  {/* Middle Info Column */}
                  <View style={styles.listItemMiddle}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>
                      {place.name}
                    </Text>

                    {/* Distance & Duration */}
                    <Text style={styles.listItemSubtitle}>
                      {place.distanceKm} km • {place.drivingTimeMin || 4} min driving
                    </Text>

                    {/* Open Hours Status Badge */}
                    <View style={styles.openStatusRow}>
                      <View style={styles.greenOpenDot} />
                      <Text style={styles.openStatusText}>
                        {place.openHours ? `Open • ${place.openHours}` : 'Open • 24/7'}
                      </Text>
                      {place.tariff && (
                        <>
                          <Text style={styles.statusDotSep}>•</Text>
                          <Text style={styles.tariffTagText}>{place.tariff}</Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Right Navigation Arrow Button (Matching Image 3) */}
                  <View style={styles.listItemTrailing}>
                    <TouchableOpacity
                      style={styles.circleNavBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        onStartDirections(place);
                      }}
                      activeOpacity={0.8}
                    >
                      <DirectionsIcon color="#FFFFFF" size={16} strokeWidth={2.5} />
                    </TouchableOpacity>

                    {/* Live Cam Button if available */}
                    {place.cameraEnabled && (
                      <TouchableOpacity
                        style={styles.miniCamBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          onOpenCam(place);
                        }}
                        activeOpacity={0.8}
                      >
                        <CameraIcon color="#1E3A8A" size={14} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      ) : (
        /* ==================================================================== */
        /* COLLAPSED VIEW: "Explore Puducherry" Peek Header (Matching Image 4) */
        /* ==================================================================== */
        <View style={styles.collapsedContent}>
          {/* Header Row: "Explore Puducherry" and "See All" */}
          <View style={styles.collapsedHeaderRow}>
            <Text style={styles.collapsedTitle}>Explore Puducherry</Text>
            <TouchableOpacity
              style={styles.seeAllPill}
              onPress={() => setIsExpanded(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See All ⌃</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Quick Facility Cards (Matching Image 4 bottom) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCardsScroll}>
            {places.slice(0, 8).map((place, idx) => {
              const isSelected = selectedPlaceId === place.id;
              const isNearest = idx === 0;

              return (
                <TouchableOpacity
                  key={place.id}
                  style={[styles.quickCard, isSelected && styles.quickCardSelected]}
                  onPress={() => {
                    onSelectPlace(place);
                    onOpenDetails(place);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.quickCardPhotoWrapper}>
                    {place.imageUrl ? (
                      <Image source={{ uri: place.imageUrl }} style={styles.quickCardImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.quickCardImgPlaceholder}>
                        <Text style={styles.pCardText}>P</Text>
                      </View>
                    )}

                    {isNearest && (
                      <View style={styles.nearestCardBadge}>
                        <Text style={styles.nearestCardBadgeText}>⭐ NEAREST</Text>
                      </View>
                    )}

                    {/* Quick Direct Arrow */}
                    <TouchableOpacity
                      style={styles.quickNavCircle}
                      onPress={(e) => {
                        e.stopPropagation();
                        onStartDirections(place);
                      }}
                      activeOpacity={0.8}
                    >
                      <DirectionsIcon color="#FFFFFF" size={12} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.quickCardInfo}>
                    <Text style={styles.quickCardTitle} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={styles.quickCardSub}>
                      {place.distanceKm} km • {place.drivingTimeMin || 3} min
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60, // Docked right above the bottom tab bar
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 990,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px -6px 24px rgba(15, 23, 42, 0.15)',
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
  sheetCollapsed: {
    height: 195,
  },
  sheetExpanded: {
    height: '75%',
  },
  dragHandleBox: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  // Collapsed Peek Styles (Image 4)
  collapsedContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  collapsedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collapsedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  horizontalCardsScroll: {
    gap: 12,
    paddingRight: 16,
    paddingBottom: 8,
  },
  quickCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  quickCardSelected: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  quickCardPhotoWrapper: {
    width: '100%',
    height: 80,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  quickCardImg: {
    width: '100%',
    height: '100%',
  },
  quickCardImgPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pCardText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  nearestCardBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nearestCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  quickNavCircle: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardInfo: {
    padding: 8,
  },
  quickCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickCardSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  // Expanded Styles (Image 3)
  expandedContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  expandedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expandedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  collapseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  collapseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  searchBoxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  clearSearchText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryPillsWrapper: {
    marginBottom: 12,
  },
  categoryPillsRow: {
    gap: 8,
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  nearbyVerticalList: {
    flex: 1,
  },
  nearbyListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  nearbyListItemSelected: {
    backgroundColor: '#F8FAFC',
  },
  listItemLeading: {
    position: 'relative',
  },
  leadingThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  leadingIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadingPText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  nearestBadgeMini: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 1,
  },
  nearestBadgeMiniText: {
    fontSize: 10,
  },
  listItemMiddle: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  openStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  greenOpenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  openStatusText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  statusDotSep: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  tariffTagText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  listItemTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCamBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
