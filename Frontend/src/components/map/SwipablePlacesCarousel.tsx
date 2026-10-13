// ============================================================================
// SWIPABLE PLACES CAROUSEL (GOOGLE MAPS CARD TABS)
// Horizontal swipe card carousel anchored at bottom above docked tabs
// ============================================================================

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { CityPlace } from '../../types/navigation';
import {
  DirectionsIcon,
  CameraIcon,
  StarIcon,
  RestroomIcon,
  DustbinIcon,
  FuelIcon,
  AtmIcon,
  TrafficLightIcon,
  ProhibitedIcon,
} from '../common/Icons';

interface SwipablePlacesCarouselProps {
  places: CityPlace[];
  selectedPlaceId?: string;
  onSelectPlace: (place: CityPlace) => void;
  onStartDirections: (place: CityPlace) => void;
  onOpenCam: (place: CityPlace) => void;
  onOpenDetails: (place: CityPlace) => void;
}

const CARD_WIDTH = Math.min(340, Dimensions.get('window').width - 48);

export const SwipablePlacesCarousel: React.FC<SwipablePlacesCarouselProps> = ({
  places,
  selectedPlaceId,
  onSelectPlace,
  onStartDirections,
  onOpenCam,
  onOpenDetails,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  if (!places || places.length === 0) return null;

  return (
    <View style={styles.carouselContainer} pointerEvents="box-none">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 14}
        decelerationRate="fast"
      >
        {places.map((place, index) => {
          const isSelected = selectedPlaceId === place.id;
          const isNoParking = place.category === 'NO_PARKING';
          const isToilet = place.category === 'TOILET';
          const isDustbin = place.category === 'DUSTBIN';
          const isFuel = place.category === 'FUEL';
          const isNearest = index === 0;

          return (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.card,
                { width: CARD_WIDTH },
                isSelected && styles.cardSelected,
              ]}
              onPress={() => {
                onSelectPlace(place);
                onOpenDetails(place);
              }}
              activeOpacity={0.9}
            >
              <View style={styles.cardInner}>
                {/* Photo or Category Graphic */}
                <View style={styles.imageBox}>
                  {place.imageUrl ? (
                    <Image
                      source={{ uri: place.imageUrl }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.cardImage, styles.placeholderImage]}>
                      {isNoParking ? (
                        <ProhibitedIcon color="#DC2626" size={28} />
                      ) : isToilet ? (
                        <RestroomIcon color="#0284C7" size={28} />
                      ) : isDustbin ? (
                        <DustbinIcon color="#059669" size={28} />
                      ) : (
                        <FuelIcon color="#EA580C" size={28} />
                      )}
                    </View>
                  )}

                  {/* Badge on photo */}
                  <View
                    style={[
                      styles.photoBadge,
                      isNearest
                        ? styles.bgNearest
                        : isNoParking
                        ? styles.bgRed
                        : place.category === 'PARKING_FREE' || isDustbin
                        ? styles.bgGreen
                        : styles.bgNavy,
                    ]}
                  >
                    <Text style={styles.photoBadgeText}>
                      {isNearest
                        ? `⭐ NEAREST (${place.distanceKm} km)`
                        : place.isFull
                        ? 'FULL'
                        : place.badgeText}
                    </Text>
                  </View>
                </View>

                {/* Right Details Column */}
                <View style={styles.detailsCol}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {place.name}
                  </Text>
                  <Text style={styles.placeArea} numberOfLines={1}>
                    {place.area}
                  </Text>

                  {/* Rating & Distance */}
                  <View style={styles.metaRow}>
                    {isNearest && (
                      <View style={styles.nearestTag}>
                        <Text style={styles.nearestTagText}>NEAREST</Text>
                      </View>
                    )}
                    {typeof place.rating === 'number' && (
                      <View style={styles.ratingBadge}>
                        <StarIcon color="#F59E0B" size={11} />
                        <Text style={styles.ratingText}>{place.rating}</Text>
                        <Text style={styles.reviewText}>({place.reviewCount || 100})</Text>
                      </View>
                    )}
                    <Text style={styles.distanceText}>
                      • {place.distanceKm} km ({place.drivingTimeMin || Math.max(2, Math.round(place.distanceKm * 3))} min drive)
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsRow}>
                    {/* Directions Button */}
                    <TouchableOpacity
                      style={styles.directionsBtn}
                      onPress={(e) => {
                        // @ts-ignore
                        e.stopPropagation && e.stopPropagation();
                        onStartDirections(place);
                      }}
                      activeOpacity={0.8}
                    >
                      <DirectionsIcon color="#FFFFFF" size={14} />
                      <Text style={styles.directionsBtnText}>Directions</Text>
                    </TouchableOpacity>

                    {/* Live Cam Button (if enabled) */}
                    {place.cameraEnabled && (
                      <TouchableOpacity
                        style={styles.camBtn}
                        onPress={(e) => {
                          // @ts-ignore
                          e.stopPropagation && e.stopPropagation();
                          onOpenCam(place);
                        }}
                        activeOpacity={0.8}
                      >
                        <CameraIcon color="#1E3A8A" size={14} />
                        <Text style={styles.camBtnText}>Live Cam</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 70 : 80,
    left: 0,
    right: 0,
    zIndex: 850,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 12,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.16)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  cardSelected: {
    borderColor: '#1E3A8A',
    borderWidth: 2,
  },
  cardInner: {
    flexDirection: 'row',
    padding: 10,
  },
  imageBox: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  photoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  bgNavy: {
    backgroundColor: '#0F172A',
  },
  bgGreen: {
    backgroundColor: '#059669',
  },
  bgRed: {
    backgroundColor: '#DC2626',
  },
  bgNearest: {
    backgroundColor: '#16A34A',
  },
  nearestTag: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
  },
  nearestTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  photoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  detailsCol: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  placeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  placeArea: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 2,
  },
  reviewText: {
    fontSize: 9,
    color: '#92400E',
    marginLeft: 2,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  directionsBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  camBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  camBtnText: {
    color: '#1E3A8A',
    fontSize: 11,
    fontWeight: '700',
  },
});
