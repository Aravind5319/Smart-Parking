import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../../theme/colors';
import {
  SearchIcon,
  RefreshIcon,
  LocationPinIcon,
  WarningIcon,
  CarIcon,
  MotorcycleIcon,
  ArrowRightIcon,
  NavigationIcon,
  WalkIcon,
  CrosshairIcon,
  PoliceShieldIcon,
  PhoneCallIcon,
  CheckCircleIcon,
  ClockIcon,
  ProhibitedIcon,
  CameraIcon,
} from '../../components/common/Icons';
import {
  ParkingZone,
  LocationCoordinates,
  REAL_PUDUCHERRY_ZONES,
  POPULAR_TRIP_PLANS,
  TripPlanSuggestion,
  getNearestAvailableParking,
  getDistance,
  fetchRealParkingZones,
} from '../../services/parkingService';
import { AppwriteDb } from '../../services/appwriteDb';
import { ParkingDetailsModal } from '../../components/parking/ParkingDetailsModal';
import { InAppNavigationModal } from '../../components/parking/InAppNavigationModal';
import { ParkingCameraModal } from '../../components/parking/ParkingCameraModal';

type VehicleType = 'CAR' | 'BIKE';
type CategoryFilter = 'ALL' | 'FREE' | 'GOVT';

// Real photographic views of Puducherry parking facilities
const PARKING_IMAGES: Record<string, any> = {
  'zone-mission-st': require('../../../assets/parking/grand_bazaar.jpg'),
  'zone-white-town': require('../../../assets/parking/french_quarter.jpg'),
  'zone-rock-beach-north': require('../../../assets/parking/beach_free.jpg'),
  'zone-bharathi-park': require('../../../assets/parking/french_quarter.jpg'),
  'zone-jn-street': require('../../../assets/parking/grand_bazaar.jpg'),
  'zone-old-port': require('../../../assets/parking/goubert.jpg'),
  'zone-bussy-st': require('../../../assets/parking/french_quarter.jpg'),
  default: require('../../../assets/parking/beach_free.jpg'),
};

export const FindParkingScreen: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR');
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spotlightZone, setSpotlightZone] = useState<ParkingZone | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TripPlanSuggestion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>({
    latitude: 11.9338,
    longitude: 79.8310,
  });

  // Modal Dialog States
  const [detailZone, setDetailZone] = useState<ParkingZone | null>(null);
  const [navigationZone, setNavigationZone] = useState<ParkingZone | null>(null);
  const [selectedCamZone, setSelectedCamZone] = useState<ParkingZone | null>(null);

  useEffect(() => {
    setIsLoading(true);
    AppwriteDb.fetchParkingZones()
      .then((realZones) => {
        if (realZones && realZones.length > 0) {
          setZones(realZones);
          // Pre-select the top available spot for vehicle type
          const nearest = getNearestAvailableParking(
            { latitude: 11.9338, longitude: 79.8310 },
            realZones,
            vehicleType
          );
          if (nearest) {
            setSpotlightZone(nearest);
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // When vehicle type changes, refresh spotlight recommendation
  const handleVehicleChange = (type: VehicleType) => {
    setVehicleType(type);
    const loc = userLocation || { latitude: 11.9338, longitude: 79.8310 };
    const nearest = getNearestAvailableParking(loc, zones, type);
    if (nearest) {
      setSpotlightZone(nearest);
    }
  };

  // High-reliability "Find Nearest Parking Near Me" GPS action
  const handleFindNearestParking = async () => {
    setIsLocating(true);
    try {
      let coords: LocationCoordinates = { latitude: 11.9338, longitude: 79.8310 };

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      } catch (gpsError) {
        console.log('GPS fallback to Pondicherry center', gpsError);
      }

      setUserLocation(coords);
      const nearest = getNearestAvailableParking(coords, zones, vehicleType);
      if (nearest) {
        setSpotlightZone(nearest);
        Alert.alert(
          'Nearest Parking Located',
          `${nearest.name} is the closest authorized parking bay (${nearest.distanceKm || 0.4} km away).`
        );
      } else {
        Alert.alert(
          'No Vacancies Found',
          `All nearby parking zones for ${vehicleType === 'CAR' ? 'Cars' : 'Bikes'} are currently full.`
        );
      }
    } catch (err) {
      console.warn('Location lookup error', err);
    } finally {
      setIsLocating(false);
    }
  };

  // In-App Turn-by-turn navigation handler
  const handleNavigate = (zone: ParkingZone) => {
    setNavigationZone(zone);
  };

  // Call Police Control Room
  const handleCallPolice = () => {
    Linking.openURL('tel:103').catch(() => {
      Alert.alert('Police Helpline', 'Puducherry Traffic Police Helpline: 103 or 0413-2231300');
    });
  };

  // Handle trip plan selection
  const handleSelectTripPlan = (plan: TripPlanSuggestion) => {
    setSelectedPlan(plan);
    const target = zones.find((z) => z.id === plan.recommendedZoneId);
    if (target) {
      setSpotlightZone(target);
    }
  };

  // Filter available zones by vehicle, category, and search query
  const greenZones = zones.filter((z) => z.type === 'PARKING_GREEN');
  const vehicleZones = greenZones.filter((z) => {
    if (vehicleType === 'BIKE') {
      return z.vehicleTypes?.includes('2-Wheeler');
    }
    return z.vehicleTypes?.includes('4-Wheeler');
  });

  const searchedZones = vehicleZones.filter((z) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      z.name.toLowerCase().includes(q) ||
      z.streetName.toLowerCase().includes(q) ||
      z.area.toLowerCase().includes(q)
    );
  });

  const filteredZones = searchedZones.filter((z) => {
    if (categoryFilter === 'FREE') return z.category === 'FREE_CIVIC';
    if (categoryFilter === 'GOVT') return z.category === 'GOVT_MUNICIPAL';
    return true;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {isLoading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color="#0B2559" />
          <Text style={styles.loadingBannerText}>Syncing live bays from Puducherry Police Database...</Text>
        </View>
      )}

      {/* 1. Step 1: Vehicle Selector (Car vs Bike) */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>SELECT VEHICLE TYPE</Text>
        <View style={styles.vehicleRow}>
          <TouchableOpacity
            style={[styles.vehicleBtn, vehicleType === 'CAR' && styles.vehicleBtnActive]}
            onPress={() => handleVehicleChange('CAR')}
            activeOpacity={0.85}
          >
            <View style={[styles.vehicleIconCircle, vehicleType === 'CAR' && styles.vehicleIconCircleActive]}>
              <CarIcon color={vehicleType === 'CAR' ? '#FFFFFF' : '#0B2559'} size={24} />
            </View>
            <View style={styles.vehicleTextCol}>
              <Text style={[styles.vehicleLabel, vehicleType === 'CAR' && styles.vehicleLabelActive]}>
                Car / 4-Wheeler
              </Text>
              <Text style={[styles.vehicleDesc, vehicleType === 'CAR' && styles.vehicleDescActive]}>
                Multi-level & Street Bays
              </Text>
            </View>
            {vehicleType === 'CAR' && (
              <View style={styles.checkPill}>
                <CheckCircleIcon color="#10B981" size={16} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.vehicleBtn, vehicleType === 'BIKE' && styles.vehicleBtnActive]}
            onPress={() => handleVehicleChange('BIKE')}
            activeOpacity={0.85}
          >
            <View style={[styles.vehicleIconCircle, vehicleType === 'BIKE' && styles.vehicleIconCircleActive]}>
              <MotorcycleIcon color={vehicleType === 'BIKE' ? '#FFFFFF' : '#0B2559'} size={24} />
            </View>
            <View style={styles.vehicleTextCol}>
              <Text style={[styles.vehicleLabel, vehicleType === 'BIKE' && styles.vehicleLabelActive]}>
                Bike / 2-Wheeler
              </Text>
              <Text style={[styles.vehicleDesc, vehicleType === 'BIKE' && styles.vehicleDescActive]}>
                Dedicated Kerb Parking
              </Text>
            </View>
            {vehicleType === 'BIKE' && (
              <View style={styles.checkPill}>
                <CheckCircleIcon color="#10B981" size={16} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Hero Quick Action: Find Nearest Parking */}
      <View style={styles.heroActionCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroRadarIconBox}>
            <CrosshairIcon color="#FFFFFF" size={26} strokeWidth={2.5} />
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>FIND NEAREST PARKING</Text>
            <Text style={styles.heroSubtitle}>
              One-tap GPS detection for the closest vacant bay near you
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.heroLocateBtn}
          onPress={handleFindNearestParking}
          disabled={isLocating}
          activeOpacity={0.85}
        >
          <LocationPinIcon color="#0B2559" size={18} />
          <Text style={styles.heroLocateBtnText}>
            {isLocating ? 'Locating Nearest Bay...' : 'LOCATE CLOSEST PARKING NOW'}
          </Text>
          <ArrowRightIcon color="#0B2559" size={16} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* 4. Nearest Parking Spotlight Card (When located / selected) */}
      {spotlightZone && (
        <View style={styles.spotlightContainer}>
          <View style={styles.spotlightHeaderRow}>
            <PoliceShieldIcon color="#0B2559" size={16} />
            <Text style={styles.spotlightHeaderTag}>NEAREST RECOMMENDED BAY</Text>
          </View>

          <View style={styles.spotlightCard}>
            {/* Real Photographic Header */}
            <View style={styles.imageHeaderWrapper}>
              <Image
                source={
                  spotlightZone.imageUrl
                    ? { uri: spotlightZone.imageUrl }
                    : PARKING_IMAGES[spotlightZone.id] || PARKING_IMAGES.default
                }
                style={styles.parkingImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
              <View style={styles.imageBadgeLeft}>
                <Text style={styles.imageBadgeText}>
                  {spotlightZone.category === 'FREE_CIVIC' ? 'FREE CIVIC BAY' : 'GOVT MUNICIPAL'}
                </Text>
              </View>
              <View style={[
                styles.imageBadgeRight,
                spotlightZone.isFull ? styles.bgRed : styles.bgGreen
              ]}>
                <Text style={styles.imageBadgeText}>
                  {spotlightZone.isFull
                    ? 'CAPACITY FULL'
                    : `${spotlightZone.totalSlots! - spotlightZone.occupiedSlots!} SPOTS LEFT`}
                </Text>
              </View>
            </View>

            {/* Content Details */}
            <View style={styles.spotlightBody}>
              <Text style={styles.spotlightName}>{spotlightZone.name}</Text>
              <Text style={styles.spotlightStreet}>{spotlightZone.streetName} • {spotlightZone.area}</Text>

              {/* Graphical Metric Row */}
              <View style={styles.metricGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{spotlightZone.distanceKm || 0.4} km</Text>
                  <Text style={styles.metricSub}>Distance</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{spotlightZone.walkingTimeMin || 2} min</Text>
                  <Text style={styles.metricSub}>Walking Time</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#059669' }]}>
                    {spotlightZone.hourlyRate || 'FREE'}
                  </Text>
                  <Text style={styles.metricSub}>Tariff</Text>
                </View>
              </View>

              {/* Progress Capacity Meter */}
              <View style={styles.capacityBarWrapper}>
                <View style={styles.capacityBarTrack}>
                  <View
                    style={[
                      styles.capacityBarFill,
                      {
                        width: `${Math.min(100, Math.round((spotlightZone.occupiedSlots! / spotlightZone.totalSlots!) * 100))}%`,
                        backgroundColor: spotlightZone.isFull ? '#DC2626' : '#059669',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.capacityBarLabel}>
                  {spotlightZone.occupiedSlots} of {spotlightZone.totalSlots} slots occupied ({spotlightZone.sensorType})
                </Text>
              </View>

              {/* Big Primary Navigation Button & Live Cam / Details */}
              <View style={styles.spotlightActionsWrapper}>
                <TouchableOpacity
                  style={styles.navigatePrimaryBtn}
                  onPress={() => handleNavigate(spotlightZone)}
                  activeOpacity={0.85}
                >
                  <NavigationIcon color="#FFFFFF" size={18} />
                  <Text style={styles.navigatePrimaryBtnText}>START IN-APP NAVIGATION</Text>
                </TouchableOpacity>

                <View style={styles.spotlightSecondaryRow}>
                  <TouchableOpacity
                    style={styles.spotlightDetailBtn}
                    onPress={() => setDetailZone(spotlightZone)}
                    activeOpacity={0.85}
                  >
                    <PoliceShieldIcon color="#0B2559" size={15} />
                    <Text style={styles.spotlightDetailBtnText}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.spotlightCamBtn}
                    onPress={() => setSelectedCamZone(spotlightZone)}
                    activeOpacity={0.85}
                  >
                    <CameraIcon color="#0B2559" size={15} />
                    <Text style={styles.spotlightCamBtnText}>Live Sensor Cam</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 5. Destination / Multi-Stop Trip Planner */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>PLANNING A VISIT? SELECT DESTINATION</Text>
        <Text style={styles.sectionSubtitle}>
          Select your destination to see the best legal anchor parking:
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.planScroll}>
          {POPULAR_TRIP_PLANS.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, isSelected && styles.planCardActive]}
                onPress={() => handleSelectTripPlan(plan)}
                activeOpacity={0.85}
              >
                <Text style={[styles.planCardTitle, isSelected && styles.planCardTitleActive]}>
                  {plan.name}
                </Text>
                <Text style={styles.planCardStops} numberOfLines={2}>
                  {plan.stops.join('  ->  ')}
                </Text>
                <View style={styles.planSelectRow}>
                  <Text style={[styles.planSelectLabel, isSelected && styles.planSelectLabelActive]}>
                    {isSelected ? 'Selected' : 'View Parking'}
                  </Text>
                  <ArrowRightIcon color={isSelected ? '#0B2559' : '#64748B'} size={12} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedPlan && (
          <View style={styles.planGuidanceCard}>
            <Text style={styles.planGuidanceTitle}>CIVIC ROUTE GUIDANCE</Text>
            <Text style={styles.planGuidanceText}>{selectedPlan.guidanceNotes}</Text>
          </View>
        )}
      </View>

      {/* 6. Search & Category Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <SearchIcon color="#0B2559" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search parking by street or area..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Pills */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.filterPill, categoryFilter === 'ALL' && styles.filterPillActive]}
            onPress={() => setCategoryFilter('ALL')}
          >
            <Text style={[styles.filterPillText, categoryFilter === 'ALL' && styles.filterPillTextActive]}>
              All Bays ({vehicleZones.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, categoryFilter === 'FREE' && styles.filterPillActive]}
            onPress={() => setCategoryFilter('FREE')}
          >
            <Text style={[styles.filterPillText, categoryFilter === 'FREE' && styles.filterPillTextActive]}>
              Free Civic (Zero Fee)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, categoryFilter === 'GOVT' && styles.filterPillActive]}
            onPress={() => setCategoryFilter('GOVT')}
          >
            <Text style={[styles.filterPillText, categoryFilter === 'GOVT' && styles.filterPillTextActive]}>
              Govt Municipal Paid
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 7. Categorized Parking Facilities List with Real Images */}
      <View style={styles.facilitiesListSection}>
        <Text style={styles.sectionTitle}>
          AUTHORIZED PARKING FACILITIES ({filteredZones.length})
        </Text>

        {filteredZones.map((zone) => {
          const vacant = zone.isFull ? 0 : zone.totalSlots! - zone.occupiedSlots!;
          const isSelected = spotlightZone?.id === zone.id;

          return (
            <View key={zone.id} style={[styles.facilityCard, isSelected && styles.facilityCardHighlight]}>
              {/* Real Photographic View */}
              <View style={styles.cardImageContainer}>
                <Image
                  source={
                    zone.imageUrl
                      ? { uri: zone.imageUrl }
                      : PARKING_IMAGES[zone.id] || PARKING_IMAGES.default
                  }
                  style={styles.cardPhoto}
                  resizeMode="cover"
                />
                <View style={styles.photoOverlay} />
                
                {/* Category Badge */}
                <View style={[
                  styles.categoryBadge,
                  zone.category === 'FREE_CIVIC' ? styles.bgGreenBadge : styles.bgBlueBadge
                ]}>
                  <Text style={styles.categoryBadgeText}>
                    {zone.category === 'FREE_CIVIC' ? '100% FREE CIVIC' : 'GOVT MUNICIPAL'}
                  </Text>
                </View>

                {/* Vacancy Badge */}
                <View style={[
                  styles.vacancyBadge,
                  zone.isFull ? styles.bgRedBadge : styles.bgGreenBadge
                ]}>
                  <Text style={styles.vacancyBadgeText}>
                    {zone.isFull ? 'FULL' : `${vacant} SLOTS VACANT`}
                  </Text>
                </View>
              </View>

              {/* Facility Details */}
              <View style={styles.cardDetails}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{zone.name}</Text>
                    <Text style={styles.cardStreet}>{zone.streetName} • {zone.area}</Text>
                  </View>
                  <View style={styles.ratePill}>
                    <Text style={styles.ratePillText}>{zone.hourlyRate}</Text>
                  </View>
                </View>

                {/* Quick Info Badges */}
                <View style={styles.badgeRow}>
                  <View style={styles.infoPill}>
                    <LocationPinIcon color="#0B2559" size={13} />
                    <Text style={styles.infoPillText}>{zone.distanceKm} km</Text>
                  </View>
                  <View style={styles.infoPill}>
                    <WalkIcon color="#0B2559" size={13} />
                    <Text style={styles.infoPillText}>{zone.walkingTimeMin}m walk</Text>
                  </View>
                  <View style={styles.infoPill}>
                    <ClockIcon color="#0B2559" size={13} />
                    <Text style={styles.infoPillText}>Traffic: {zone.trafficLevel}</Text>
                  </View>
                </View>

                {/* Hardware Sensor Badge */}
                <View style={styles.sensorBadgeRow}>
                  <View style={styles.sensorDot} />
                  <Text style={styles.sensorText}>
                    IoT Hardware: {zone.sensorType}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.cardSelectBtn}
                    onPress={() => setDetailZone(zone)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cardSelectBtnText}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardCamBtn}
                    onPress={() => setSelectedCamZone(zone)}
                    activeOpacity={0.8}
                  >
                    <CameraIcon color="#0B2559" size={13} />
                    <Text style={styles.cardCamBtnText}>Live Cam</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardNavBtn}
                    onPress={() => handleNavigate(zone)}
                    activeOpacity={0.8}
                  >
                    <NavigationIcon color="#FFFFFF" size={13} />
                    <Text style={styles.cardNavBtnText}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* 8. Strict Tow-Away & Crane Patrol Warning */}
      <View style={styles.towAwayWarningCard}>
        <View style={styles.towAwayHeader}>
          <ProhibitedIcon color="#DC2626" size={24} strokeWidth={2.5} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.towAwayTitle}>STRICT TOW-AWAY REGULATED CORRIDORS</Text>
            <Text style={styles.towAwaySub}>Active crane patrol. Zero-tolerance unauthorized parking.</Text>
          </View>
        </View>

        <View style={styles.corridorList}>
          <View style={styles.corridorItem}>
            <WarningIcon color="#DC2626" size={14} />
            <Text style={styles.corridorText}>
              Goubert Avenue Beach Promenade: Vehicle curfew 5:00 PM - 6:00 AM (Pedestrians only)
            </Text>
          </View>
          <View style={styles.corridorItem}>
            <WarningIcon color="#DC2626" size={14} />
            <Text style={styles.corridorText}>
              Raj Nivas & Dumas Street VVIP Perimeter: Immediate towing and Rs. 1,500 fine
            </Text>
          </View>
          <View style={styles.corridorItem}>
            <WarningIcon color="#DC2626" size={14} />
            <Text style={styles.corridorText}>
              Mahatma Gandhi Clock Tower Bus Lane: Obstruction tow-away strictly enforced
            </Text>
          </View>
        </View>
      </View>

      {/* 9. Puducherry Police Traffic Helpline */}
      <View style={styles.policeHelplineCard}>
        <View style={styles.helplineContent}>
          <Text style={styles.helplineTitle}>PUDUCHERRY TRAFFIC POLICE CONTROL ROOM</Text>
          <Text style={styles.helplineSub}>Need parking assistance, towing queries, or traffic report?</Text>
          <Text style={styles.helplineNumber}>DIAL 103 OR 0413-2231300</Text>
        </View>
        <TouchableOpacity style={styles.helplineCallBtn} onPress={handleCallPolice} activeOpacity={0.85}>
          <PhoneCallIcon color="#FFFFFF" size={18} />
          <Text style={styles.helplineCallBtnText}>Call 103</Text>
        </TouchableOpacity>
      </View>

      {/* 10. Facility Details Modal */}
      <ParkingDetailsModal
        visible={!!detailZone}
        zone={detailZone}
        onClose={() => setDetailZone(null)}
        onStartNavigation={(z) => {
          setDetailZone(null);
          handleNavigate(z);
        }}
        onOpenCam={(z) => {
          setDetailZone(null);
          setSelectedCamZone(z);
        }}
      />

      {/* 11. In-App Turn-By-Turn Navigation Modal */}
      <InAppNavigationModal
        visible={!!navigationZone}
        destination={navigationZone}
        origin={userLocation}
        onClose={() => setNavigationZone(null)}
        onOpenCam={(z) => {
          setNavigationZone(null);
          setSelectedCamZone(z);
        }}
      />

      {/* 12. Real-Time ANPR / Parking Space CCTV Camera Modal */}
      <ParkingCameraModal
        visible={!!selectedCamZone}
        zone={selectedCamZone}
        onClose={() => setSelectedCamZone(null)}
        onNavigateToBay={(z) => {
          setSelectedCamZone(null);
          handleNavigate(z);
        }}
      />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingBottom: 110,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },

  // Vehicle Selector Card
  cardSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B2559',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#475569',
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  vehicleBtnActive: {
    backgroundColor: '#0B2559',
    borderColor: '#0B2559',
  },
  vehicleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIconCircleActive: {
    backgroundColor: '#1E40AF',
  },
  vehicleTextCol: {
    flex: 1,
    marginLeft: 8,
    marginRight: 16,
  },
  vehicleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  vehicleLabelActive: {
    color: '#FFFFFF',
  },
  vehicleDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  vehicleDescActive: {
    color: '#93C5FD',
  },
  checkPill: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  // Hero Quick Action: Locate Nearest Bay
  heroActionCard: {
    backgroundColor: '#0B2559',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#D31826',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroRadarIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#CBD5E1',
    marginTop: 2,
    lineHeight: 17,
  },
  heroLocateBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 2,
  },
  heroLocateBtnText: {
    color: '#071630',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Spotlight Nearest Bay Card
  spotlightContainer: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  spotlightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  spotlightHeaderTag: {
    color: '#0B2559',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  spotlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0B2559',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageHeaderWrapper: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  parkingImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  imageBadgeLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#0B2559',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  imageBadgeRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bgGreen: {
    backgroundColor: '#059669',
  },
  bgRed: {
    backgroundColor: '#DC2626',
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  spotlightBody: {
    padding: 16,
  },
  spotlightName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  spotlightStreet: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B2559',
  },
  metricSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  capacityBarWrapper: {
    marginTop: 14,
  },
  capacityBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityBarLabel: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 6,
    fontWeight: '600',
  },
  spotlightActionsWrapper: {
    marginTop: 14,
    gap: 8,
  },
  navigatePrimaryBtn: {
    backgroundColor: '#0B2559',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navigatePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  spotlightSecondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  spotlightDetailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  spotlightDetailBtnText: {
    color: '#0B2559',
    fontSize: 12.5,
    fontWeight: '800',
  },
  spotlightCamBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  spotlightCamBtnText: {
    color: '#0B2559',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Plan Visit Scroll
  planScroll: {
    gap: 10,
    paddingRight: 10,
  },
  planCard: {
    width: 220,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  planCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1D4ED8',
  },
  planCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  planCardTitleActive: {
    color: '#1E40AF',
  },
  planCardStops: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  planSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  planSelectLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  planSelectLabelActive: {
    color: '#1E40AF',
  },
  planGuidanceCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  planGuidanceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  planGuidanceText: {
    fontSize: 12.5,
    color: '#78350F',
    marginTop: 3,
    lineHeight: 17,
  },

  // Search & Filter
  searchSection: {
    marginTop: 14,
    marginHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  clearSearchText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  filterPillsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterPillActive: {
    backgroundColor: '#0B2559',
    borderColor: '#0B2559',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // Facilities List
  facilitiesListSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  facilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  facilityCardHighlight: {
    borderColor: '#0B2559',
    borderWidth: 2,
  },
  cardImageContainer: {
    height: 125,
    width: '100%',
    position: 'relative',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bgGreenBadge: {
    backgroundColor: '#059669',
  },
  bgBlueBadge: {
    backgroundColor: '#0B2559',
  },
  bgRedBadge: {
    backgroundColor: '#DC2626',
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  vacancyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vacancyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardDetails: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardStreet: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  ratePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  ratePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  infoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  sensorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sensorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  sensorText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardActionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  cardSelectBtn: {
    flex: 1.1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cardSelectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B2559',
  },
  cardCamBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  cardCamBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  cardNavBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0B2559',
    gap: 4,
  },
  cardNavBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Tow-Away Warning
  towAwayWarningCard: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F87171',
  },
  towAwayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  towAwayTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  towAwaySub: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
  },
  corridorList: {
    marginTop: 12,
    gap: 8,
  },
  corridorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  corridorText: {
    flex: 1,
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 16,
    fontWeight: '600',
  },

  // Police Helpline
  policeHelplineCard: {
    backgroundColor: '#071630',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  helplineContent: {
    flex: 1,
    marginRight: 10,
  },
  helplineTitle: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  helplineSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  helplineNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  helplineCallBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  helplineCallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
  },
  loadingBannerText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '700',
  },
});
