// ============================================================================
// GOOGLE MAPS PLACE DETAILS BOTTOM SHEET / MODAL
// Matching Screen 3 of Image 2 (Beach Parking Lot / Amenities / Directions / Cam)
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { CityPlace } from '../../types/navigation';
import {
  DirectionsIcon,
  CameraIcon,
  PhoneIcon,
  ShareIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldLockIcon,
  RestroomIcon,
  EvIcon,
  ProhibitedIcon,
} from '../common/Icons';

interface PlaceDetailsModalProps {
  visible: boolean;
  place: CityPlace | null;
  onClose: () => void;
  onStartDirections: (place: CityPlace) => void;
  onOpenCam: (place: CityPlace) => void;
}

type TabMode = 'OVERVIEW' | 'PHOTOS' | 'REVIEWS' | 'NEARBY';

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  visible,
  place,
  onClose,
  onStartDirections,
  onOpenCam,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('OVERVIEW');

  if (!place) return null;

  const total = place.totalSlots || 40;
  const occ = place.occupiedSlots || 12;
  const vacant = place.vacantSlots !== undefined ? place.vacantSlots : Math.max(0, total - occ);
  const occupancyPercent = Math.min(100, Math.round((occ / total) * 100));

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: place.name,
        text: `${place.name} - ${place.badgeText} in Puducherry`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      Alert.alert('Share Place', `${place.name}\n${place.streetName}, ${place.area}\n${place.badgeText}`);
    }
  };

  const handleCall = () => {
    const num = place.phone || '103';
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Helpline', `Police Traffic Control: ${num}`);
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheetContainer}>
          {/* Grab Handle */}
          <View style={styles.dragHandle} />

          {/* Close X Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Top Photo Banner */}
            <View style={styles.photoContainer}>
              {place.imageUrl ? (
                <Image source={{ uri: place.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
              ) : (
                <View style={[styles.bannerImage, styles.placeholderBg]} />
              )}
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>1/5</Text>
              </View>
            </View>

            {/* Title & Metadata */}
            <View style={styles.headerBlock}>
              <Text style={styles.titleText}>{place.name}</Text>

              <View style={styles.ratingAndTypeRow}>
                {typeof place.rating === 'number' && (
                  <View style={styles.starRow}>
                    <StarIcon color="#F59E0B" size={13} />
                    <Text style={styles.ratingVal}>{place.rating}</Text>
                    <Text style={styles.reviewCount}>({place.reviewCount || 320} reviews)</Text>
                  </View>
                )}
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.categorySubText}>
                  {place.category === 'PARKING_SMART'
                    ? 'Public Smart Parking'
                    : place.category === 'PARKING_FREE'
                    ? 'Free Street Kerb'
                    : place.category === 'TOILET'
                    ? 'Sanitized Restroom'
                    : place.category === 'NO_PARKING'
                    ? 'Tow-Away Red Kerb'
                    : 'City Facility'}
                </Text>
              </View>

              <Text style={styles.locationSubText}>
                {place.distanceKm} km • {place.streetName}, {place.area}
              </Text>
            </View>

            {/* Vacancy Card (Matching Image 2 Screen 3) */}
            {place.category !== 'NO_PARKING' && place.totalSlots && (
              <View style={styles.vacancyCard}>
                <View style={styles.vacancyTopRow}>
                  <View style={styles.pCircle}>
                    <Text style={styles.pCircleText}>P</Text>
                  </View>
                  <View style={styles.vacancyInfoCol}>
                    <Text style={styles.vacancyTitle}>
                      {place.isFull ? 'CAPACITY FULL' : `Available ${vacant} / ${total} slots`}
                    </Text>
                    <Text style={styles.vacancyUpdateText}>
                      {place.statusText || 'Updated 2 min ago'}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${occupancyPercent}%` },
                      occupancyPercent > 85 ? styles.bgRed : styles.bgGreen,
                    ]}
                  />
                </View>
              </View>
            )}

            {/* 4 Action Buttons Row */}
            <View style={styles.actionRow}>
              {/* Directions Button */}
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => {
                  onClose();
                  onStartDirections(place);
                }}
                activeOpacity={0.85}
              >
                <DirectionsIcon color="#FFFFFF" size={16} />
                <Text style={styles.actionBtnPrimaryText}>Directions</Text>
              </TouchableOpacity>

              {/* Live Cam Button (if enabled) */}
              {place.cameraEnabled && (
                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => {
                    onClose();
                    onOpenCam(place);
                  }}
                  activeOpacity={0.85}
                >
                  <CameraIcon color="#1E3A8A" size={16} />
                  <Text style={styles.actionBtnSecondaryText}>Live Cam</Text>
                </TouchableOpacity>
              )}

              {/* Call Button */}
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleCall} activeOpacity={0.85}>
                <PhoneIcon color="#1E3A8A" size={16} />
                <Text style={styles.actionBtnSecondaryText}>Call</Text>
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleShare} activeOpacity={0.85}>
                <ShareIcon color="#1E3A8A" size={16} />
                <Text style={styles.actionBtnSecondaryText}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs: Overview, Photos, Reviews, Nearby */}
            <View style={styles.tabBar}>
              {(['OVERVIEW', 'PHOTOS', 'REVIEWS', 'NEARBY'] as TabMode[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabItem, activeTab === t && styles.tabItemActive]}
                  onPress={() => setActiveTab(t)}
                >
                  <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amenities Section */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Amenities & Features</Text>
              <View style={styles.amenitiesGrid}>
                <View style={styles.amenityItem}>
                  <ClockIcon color="#1E3A8A" size={18} />
                  <Text style={styles.amenityLabel}>24/7 Access</Text>
                </View>
                <View style={styles.amenityItem}>
                  <ShieldLockIcon color="#1E3A8A" size={18} />
                  <Text style={styles.amenityLabel}>CCTV Monitored</Text>
                </View>
                <View style={styles.amenityItem}>
                  <RestroomIcon color="#1E3A8A" size={18} />
                  <Text style={styles.amenityLabel}>Toilet Nearby</Text>
                </View>
                <View style={styles.amenityItem}>
                  <EvIcon color="#10B981" size={18} />
                  <Text style={styles.amenityLabel}>EV Charging</Text>
                </View>
              </View>
            </View>

            {/* Tariff / Rate Info */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tariff / Pricing:</Text>
              <Text style={styles.infoVal}>{place.tariff || 'FREE'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hours:</Text>
              <Text style={styles.infoVal}>{place.openHours || 'Open 24/7'}</Text>
            </View>

            {/* Enforcement Notice (if Red Zone) */}
            {place.enforcementNotice && (
              <View style={styles.enforcementNoticeBox}>
                <ProhibitedIcon color="#DC2626" size={18} />
                <Text style={styles.enforcementNoticeText}>
                  {place.enforcementNotice}
                </Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    position: 'relative',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px -6px 25px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
      },
    }),
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  scroll: {
    paddingHorizontal: 16,
  },
  photoContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBg: {
    backgroundColor: '#1E293B',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerBlock: {
    marginTop: 14,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  ratingAndTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewCount: {
    fontSize: 11,
    color: '#64748B',
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: '#94A3B8',
    fontSize: 12,
  },
  categorySubText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  locationSubText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },
  vacancyCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
  vacancyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pCircleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  vacancyInfoCol: {
    flex: 1,
  },
  vacancyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  vacancyUpdateText: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DCFCE7',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bgGreen: {
    backgroundColor: '#059669',
  },
  bgRed: {
    backgroundColor: '#DC2626',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  actionBtnPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 24,
    gap: 5,
  },
  actionBtnSecondaryText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: 16,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1E3A8A',
    fontWeight: '800',
  },
  sectionBox: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  amenityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  enforcementNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    gap: 10,
  },
  enforcementNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '700',
    lineHeight: 16,
  },
});
