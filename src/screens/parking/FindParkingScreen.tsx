import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from '../../components/common/MapComponent';
import * as Location from 'expo-location';
import { Colors } from '../../theme/colors';
import {
  SearchIcon,
  RefreshIcon,
  LocationPinIcon,
  WarningIcon,
  CarIcon,
  ArrowRightIcon,
  NavigationIcon,
  WalkIcon,
  MotorcycleIcon,
  BeachIcon,
  MonumentIcon,
  ShoppingBagIcon,
  ParkTreeIcon,
  AnchorIcon,
  ProhibitedIcon,
  MapIcon,
  FileTextIcon,
  PoliceShieldIcon,
  SirenIcon,
} from '../../components/common/Icons';
import {
  ParkingZone,
  LocationCoordinates,
  REAL_PUDUCHERRY_ZONES,
  POPULAR_TRIP_PLANS,
  TripPlanSuggestion,
  getNearestAvailableParking,
  reportViolationEvent,
  getDistance,
  fetchRealParkingZones,
} from '../../services/parkingService';

type ViewMode = 'GUIDANCE' | 'MAP' | 'ENFORCEMENT';
type VehicleType = 'CAR' | 'BIKE';

export const FindParkingScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('GUIDANCE');
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR');
  const [selectedPlan, setSelectedPlan] = useState<TripPlanSuggestion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zones, setZones] = useState<ParkingZone[]>(REAL_PUDUCHERRY_ZONES);
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(REAL_PUDUCHERRY_ZONES[0]);
  const [redirectZone, setRedirectZone] = useState<ParkingZone | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>({
    latitude: 11.9338,
    longitude: 79.8310,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'FREE' | 'GOVT'>('ALL');
  
  // 10-minute warning countdown simulation
  const [warningTimer, setWarningTimer] = useState<number | null>(null);
  const [violationGenerated, setViolationGenerated] = useState(false);
  const [activeWarningZone, setActiveWarningZone] = useState<string>('');

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchRealParkingZones().then((realZones) => {
      if (realZones && realZones.length > 0) {
        setZones(realZones);
      }
    });
  }, []);

  // Handle GPS / Current Location
  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'GPS access helps find authorized parking nearest to you. Falling back to Boulevard Town Center.'
        );
        const fallbackLoc = { latitude: 11.9338, longitude: 79.8310 };
        setUserLocation(fallbackLoc);
        checkIfInRestrictedZone(fallbackLoc);
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const realLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(realLoc);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: realLoc.latitude,
          longitude: realLoc.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      checkIfInRestrictedZone(realLoc);

      // Recommend nearest bay for the selected vehicle type
      const nearest = getNearestAvailableParking(realLoc, undefined, vehicleType);
      if (nearest) {
        handleSelectZone(nearest);
      }
    } catch (err) {
      console.warn('Location error', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Check if coordinates enter a restricted Tow-Away zone
  const checkIfInRestrictedZone = (loc: LocationCoordinates) => {
    const redZones = zones.filter((z) => z.type === 'NO_PARKING_RED');
    let inRestricted = false;
    let matchedZoneName = '';

    for (const zone of redZones) {
      if (getDistance(loc, zone.coordinates) < 0.3) {
        inRestricted = true;
        matchedZoneName = zone.name;
        break;
      }
    }

    if (inRestricted && warningTimer === null && !violationGenerated) {
      setActiveWarningZone(matchedZoneName);
      setWarningTimer(10);
    } else if (!inRestricted && warningTimer !== null) {
      setWarningTimer(null);
      setActiveWarningZone('');
    }
  };

  // Warning countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (warningTimer !== null && warningTimer > 0) {
      interval = setInterval(() => {
        setWarningTimer((prev) => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (warningTimer === 0) {
      setWarningTimer(null);
      setViolationGenerated(true);
      reportViolationEvent(
        'CITIZEN-PY-01',
        activeWarningZone || 'Rock Beach Promenade',
        userLocation || { latitude: 11.933, longitude: 79.835 },
        10
      );
    }
    return () => clearInterval(interval);
  }, [warningTimer, userLocation, activeWarningZone]);

  // Zone selection logic with Smart Redirection
  const handleSelectZone = (zone: ParkingZone) => {
    setSelectedZone(zone);
    setRedirectZone(null);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: zone.coordinates.latitude,
        longitude: zone.coordinates.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      });
    }

    if (zone.isFull) {
      const nearest = getNearestAvailableParking(zone.coordinates, zone.id, vehicleType);
      if (nearest) {
        setRedirectZone(nearest);
      }
    }
  };

  // Trigger test for police no-parking warning
  const triggerDemoWarning = () => {
    const rockBeachRedZone = zones.find((z) => z.id === 'red-gourbert-promenade') || zones[7];
    setActiveWarningZone(rockBeachRedZone.name);
    setViolationGenerated(false);
    setWarningTimer(10);
    setSelectedZone(rockBeachRedZone);
    setViewMode('ENFORCEMENT');
  };

  // Trip Plan Selector handler
  const handleSelectTripPlan = (plan: TripPlanSuggestion) => {
    setSelectedPlan(plan);
    const targetZone = zones.find(z => z.id === plan.recommendedZoneId);
    if (targetZone) {
      handleSelectZone(targetZone);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const greenZones = zones.filter((z) => z.type === 'PARKING_GREEN');
  const redZones = zones.filter((z) => z.type === 'NO_PARKING_RED');
  const totalVacantCount = greenZones.reduce((sum, z) => sum + (z.isFull ? 0 : (z.totalSlots! - z.occupiedSlots!)), 0);

  // Filtered by vehicle type and search
  const vehicleFilteredZones = greenZones.filter(z => {
    if (vehicleType === 'BIKE') {
      return z.vehicleTypes?.includes('2-Wheeler');
    }
    return z.vehicleTypes?.includes('4-Wheeler');
  });

  const freeZones = vehicleFilteredZones.filter(z => z.category === 'FREE_CIVIC');
  const govtZones = vehicleFilteredZones.filter(z => z.category === 'GOVT_MUNICIPAL');

  return (
    <View style={styles.container}>
      {/* 1. Single Slim Civic Status Strip (NO DUPLICATE BANNERS) */}
      <View style={styles.civicStatusStrip}>
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statusPillText}>{totalVacantCount} Vacant Spaces</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.statusPillText}>3 Tow-Away Corridors</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.statusPillText}>10m Violation Grace</Text>
        </View>
      </View>

      {/* 2. Top Segmented Mode Switcher */}
      <View style={styles.modeSwitcherContainer}>
        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'GUIDANCE' && styles.modeTabActive]}
          onPress={() => setViewMode('GUIDANCE')}
          activeOpacity={0.8}
        >
          <FileTextIcon color={viewMode === 'GUIDANCE' ? '#FFFFFF' : '#64748B'} size={14} />
          <Text style={[styles.modeTabText, viewMode === 'GUIDANCE' && styles.modeTabTextActive]}>
            Parking Guidance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'MAP' && styles.modeTabActive]}
          onPress={() => setViewMode('MAP')}
          activeOpacity={0.8}
        >
          <MapIcon color={viewMode === 'MAP' ? '#FFFFFF' : '#64748B'} size={14} />
          <Text style={[styles.modeTabText, viewMode === 'MAP' && styles.modeTabTextActive]}>
            City Radar Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'ENFORCEMENT' && styles.modeTabActiveRed]}
          onPress={() => setViewMode('ENFORCEMENT')}
          activeOpacity={0.8}
        >
          <SirenIcon color={viewMode === 'ENFORCEMENT' ? '#FFFFFF' : '#64748B'} size={14} />
          <Text style={[styles.modeTabText, viewMode === 'ENFORCEMENT' && styles.modeTabTextActive]}>
            Traffic Enforcement
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* ========================================================================= */}
        {/* MODE 1: PARKING GUIDANCE & ROUTE TRIP ASSISTANT                           */}
        {/* ========================================================================= */}
        {viewMode === 'GUIDANCE' && (
          <View style={styles.tabSection}>

            {/* Vehicle Type Input Selector (Car vs Bike) */}
            <View style={styles.vehicleSelectorCard}>
              <Text style={styles.sectionHeaderLabel}>STEP 1: SELECT YOUR VEHICLE</Text>
              <View style={styles.vehicleToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.vehicleBtn,
                    vehicleType === 'CAR' && styles.vehicleBtnActive,
                  ]}
                  onPress={() => setVehicleType('CAR')}
                  activeOpacity={0.8}
                >
                  <CarIcon color={vehicleType === 'CAR' ? '#FFFFFF' : '#0B2559'} size={18} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[styles.vehicleBtnTitle, vehicleType === 'CAR' && styles.vehicleBtnTitleActive]}>
                      Four-Wheeler (Car)
                    </Text>
                    <Text style={[styles.vehicleBtnSub, vehicleType === 'CAR' && styles.vehicleBtnSubActive]}>
                      Multi-level & Kerb bays
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.vehicleBtn,
                    vehicleType === 'BIKE' && styles.vehicleBtnActive,
                  ]}
                  onPress={() => setVehicleType('BIKE')}
                  activeOpacity={0.8}
                >
                  <MotorcycleIcon color={vehicleType === 'BIKE' ? '#FFFFFF' : '#0B2559'} size={18} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[styles.vehicleBtnTitle, vehicleType === 'BIKE' && styles.vehicleBtnTitleActive]}>
                      Two-Wheeler (Bike)
                    </Text>
                    <Text style={[styles.vehicleBtnSub, vehicleType === 'BIKE' && styles.vehicleBtnSubActive]}>
                      Dedicated bike kerbs
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Smart Trip Route / Multi-Destination Plan Assistant */}
            <View style={styles.tripPlannerCard}>
              <View style={styles.tripPlannerHeader}>
                <NavigationIcon color="#0B2559" size={16} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.tripPlannerTitle}>WHERE ARE YOU HEADING?</Text>
                  <Text style={styles.tripPlannerSub}>
                    Select your destination or multi-stop trip to find the closest legal parking:
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.planChipsScroll}
              >
                {POPULAR_TRIP_PLANS.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planChip,
                        isSelected && styles.planChipSelected,
                      ]}
                      onPress={() => handleSelectTripPlan(plan)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.planChipTitle, isSelected && styles.planChipTitleSelected]}>
                        {plan.name}
                      </Text>
                      <Text style={styles.planChipStops} numberOfLines={1}>
                        Stops: {plan.stops.join(' ➔ ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Active Trip Plan Recommendation Result */}
              {selectedPlan && selectedZone && (
                <View style={styles.planRecommendationBox}>
                  <View style={styles.recHeaderRow}>
                    <Text style={styles.recBadge}>RECOMMENDED ANCHOR PARKING</Text>
                    <Text style={styles.recWalkTime}>🚶 {selectedZone.walkingTimeMin} min walk</Text>
                  </View>
                  <Text style={styles.recZoneName}>{selectedZone.name}</Text>
                  <Text style={styles.recGuidanceNotes}>{selectedPlan.guidanceNotes}</Text>
                  <View style={styles.recActionRow}>
                    <TouchableOpacity
                      style={styles.recNavBtn}
                      onPress={() =>
                        Alert.alert('Route Navigation Loaded', `Turn-by-turn route to ${selectedZone.name} active.`)
                      }
                    >
                      <NavigationIcon color="#FFFFFF" size={13} />
                      <Text style={styles.recNavBtnText}>Navigate to Recommended Bay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.recClearBtn}
                      onPress={() => setSelectedPlan(null)}
                    >
                      <Text style={styles.recClearBtnText}>Reset Plan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Quick GPS Location Row */}
            <View style={styles.locationBarRow}>
              <TouchableOpacity
                style={styles.locationBarBtn}
                onPress={handleGetCurrentLocation}
                disabled={isLocating}
                activeOpacity={0.8}
              >
                <LocationPinIcon color="#0B2559" size={15} />
                <Text style={styles.locationBarBtnText}>
                  {isLocating ? 'Acquiring GPS...' : '📍 Find Nearest Parking Near Me'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CATEGORY 1: FREE CIVIC PARKING ZONES */}
            <View style={styles.categorySection}>
              <View style={styles.categoryTitleRow}>
                <View style={[styles.categoryIndicator, { backgroundColor: '#10B981' }]} />
                <Text style={styles.categoryTitle}>FREE CIVIC PARKING ZONES (GOVT AUTHORIZED)</Text>
              </View>
              <Text style={styles.categorySub}>
                Zero fee kerb bays provided by Puducherry Traffic Police (2-hour limit)
              </Text>

              {freeZones.map((zone) => {
                const vacant = zone.isFull ? 0 : (zone.totalSlots! - zone.occupiedSlots!);
                const isSelected = selectedZone?.id === zone.id;

                return (
                  <TouchableOpacity
                    key={zone.id}
                    style={[styles.facilityCard, isSelected && styles.facilityCardSelected]}
                    onPress={() => handleSelectZone(zone)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.facilityTopRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.facilityTagRow}>
                          <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>100% FREE</Text>
                          </View>
                          <Text style={styles.facilityArea}>{zone.area}</Text>
                        </View>
                        <Text style={styles.facilityTitle}>{zone.name}</Text>
                        <Text style={styles.facilityStreet}>📍 {zone.streetName}</Text>
                      </View>
                      <View style={[styles.statusBadge, zone.isFull ? styles.statusBadgeFull : styles.statusBadgeAvailable]}>
                        <Text style={[styles.statusBadgeText, zone.isFull ? styles.statusTextFull : styles.statusTextAvailable]}>
                          {zone.isFull ? 'FULL' : `${vacant} VACANT`}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Gauge */}
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, Math.round((zone.occupiedSlots! / zone.totalSlots!) * 100))}%`,
                            backgroundColor: zone.isFull ? '#EF4444' : '#10B981',
                          },
                        ]}
                      />
                    </View>

                    {/* Hardware Sensor & ANPR Status */}
                    <View style={styles.iotStatusRow}>
                      <View style={styles.iotDot} />
                      <Text style={styles.iotText}>
                        HARDWARE FEED: {zone.sensorType} • {zone.sensorStatus}
                      </Text>
                    </View>

                    {/* Traffic & Meta Row */}
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>📍 {zone.distanceKm} km</Text>
                      <Text style={styles.metaDivider}>•</Text>
                      <WalkIcon color="#64748B" size={12} />
                      <Text style={styles.metaText}> {zone.walkingTimeMin}m walk</Text>
                      <Text style={styles.metaDivider}>•</Text>
                      <Text style={[styles.metaTrafficText, zone.trafficLevel === 'CONGESTED' ? styles.textRed : styles.textGreen]}>
                        Traffic: {zone.trafficLevel} {zone.trafficDelayMin ? `(+${zone.trafficDelayMin}m)` : ''}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.facilityNavBtn}
                      onPress={() =>
                        Alert.alert('Directions Initialized', `Route to ${zone.name} loaded.`)
                      }
                    >
                      <NavigationIcon color="#FFFFFF" size={13} />
                      <Text style={styles.facilityNavBtnText}>Get Directions to Bay</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CATEGORY 2: OFFICIAL GOVT / MUNICIPAL PAID PARKING */}
            <View style={styles.categorySection}>
              <View style={styles.categoryTitleRow}>
                <View style={[styles.categoryIndicator, { backgroundColor: '#1E40AF' }]} />
                <Text style={styles.categoryTitle}>OFFICIAL GOVT & MUNICIPAL FACILITIES (CCTV GUARDED)</Text>
              </View>
              <Text style={styles.categorySub}>
                Dedicated high-capacity lots with barrier gates, surveillance, and official receipts
              </Text>

              {govtZones.map((zone) => {
                const vacant = zone.isFull ? 0 : (zone.totalSlots! - zone.occupiedSlots!);
                const isSelected = selectedZone?.id === zone.id;

                return (
                  <TouchableOpacity
                    key={zone.id}
                    style={[styles.facilityCard, isSelected && styles.facilityCardSelected]}
                    onPress={() => handleSelectZone(zone)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.facilityTopRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.facilityTagRow}>
                          <View style={styles.govtBadge}>
                            <Text style={styles.govtBadgeText}>GOVT MONITORED</Text>
                          </View>
                          <Text style={styles.facilityRateText}>{zone.hourlyRate}</Text>
                        </View>
                        <Text style={styles.facilityTitle}>{zone.name}</Text>
                        <Text style={styles.facilityStreet}>📍 {zone.streetName} • {zone.area}</Text>
                      </View>
                      <View style={[styles.statusBadge, zone.isFull ? styles.statusBadgeFull : vacant <= 5 ? styles.statusBadgeAmber : styles.statusBadgeAvailable]}>
                        <Text style={[styles.statusBadgeText, zone.isFull ? styles.statusTextFull : vacant <= 5 ? styles.statusTextAmber : styles.statusTextAvailable]}>
                          {zone.isFull ? 'FULL' : `${vacant} VACANT`}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Gauge */}
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, Math.round((zone.occupiedSlots! / zone.totalSlots!) * 100))}%`,
                            backgroundColor: zone.isFull ? '#EF4444' : vacant <= 5 ? '#F59E0B' : '#10B981',
                          },
                        ]}
                      />
                    </View>

                    {/* Hardware Sensor & ANPR Status */}
                    <View style={styles.iotStatusRow}>
                      <View style={styles.iotDot} />
                      <Text style={styles.iotText}>
                        HARDWARE FEED: {zone.sensorType} • {zone.sensorStatus}
                      </Text>
                    </View>

                    {/* Traffic & Meta Row */}
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>📍 {zone.distanceKm} km</Text>
                      <Text style={styles.metaDivider}>•</Text>
                      <WalkIcon color="#64748B" size={12} />
                      <Text style={styles.metaText}> {zone.walkingTimeMin}m walk</Text>
                      <Text style={styles.metaDivider}>•</Text>
                      <Text style={[styles.metaTrafficText, zone.trafficLevel === 'CONGESTED' ? styles.textRed : styles.textGreen]}>
                        Traffic: {zone.trafficLevel} {zone.trafficDelayMin ? `(+${zone.trafficDelayMin}m)` : ''}
                      </Text>
                    </View>

                    {/* Smart Redirection Notice if full */}
                    {zone.isFull && redirectZone && (
                      <View style={styles.fullRedirectBox}>
                        <Text style={styles.fullRedirectTitle}>Parking Full. Recommended Nearest Alternative:</Text>
                        <Text style={styles.fullRedirectDest}>
                          {redirectZone.name} ({redirectZone.totalSlots! - redirectZone.occupiedSlots!} spots vacant)
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.facilityNavBtn}
                      onPress={() =>
                        Alert.alert('Directions Initialized', `Route to ${zone.name} loaded.`)
                      }
                    >
                      <NavigationIcon color="#FFFFFF" size={13} />
                      <Text style={styles.facilityNavBtnText}>Get Directions to Facility</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>

          </View>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: CITY RADAR MAP                                                    */}
        {/* ========================================================================= */}
        {viewMode === 'MAP' && (
          <View style={styles.tabSection}>
            <MapView
              ref={mapRef}
              style={styles.mapArea}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 11.9338,
                longitude: 79.831,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {zones.map((zone) => {
                const isGreen = zone.type === 'PARKING_GREEN';
                const markerColor = isGreen
                  ? zone.isFull
                    ? Colors.policeRed
                    : zone.occupiedSlots && zone.totalSlots && (zone.occupiedSlots / zone.totalSlots) > 0.7
                    ? '#F59E0B'
                    : Colors.parkingGreen
                  : Colors.policeRed;

                return (
                  <Marker
                    key={zone.id}
                    coordinate={zone.coordinates}
                    title={zone.name}
                    pinColor={markerColor}
                    onPress={() => handleSelectZone(zone)}
                  />
                );
              })}

              {zones
                .filter((z) => z.type === 'NO_PARKING_RED')
                .map((zone) => (
                  <Circle
                    key={`circle-${zone.id}`}
                    center={zone.coordinates}
                    radius={250}
                    fillColor="rgba(211, 24, 38, 0.22)"
                    strokeColor="rgba(211, 24, 38, 0.8)"
                  />
                ))}
            </MapView>

            {/* Selected Zone Card in Map View */}
            {selectedZone && (
              <View
                style={[
                  styles.selectedCard,
                  selectedZone.type === 'NO_PARKING_RED' && styles.selectedCardRed,
                ]}
              >
                <Text style={styles.selectedZoneName}>{selectedZone.name}</Text>
                <Text style={styles.selectedStreetName}>📍 {selectedZone.streetName} • {selectedZone.area}</Text>
                {selectedZone.sensorType && (
                  <Text style={styles.selectedIotText}>🎥 {selectedZone.sensorType}</Text>
                )}
                <TouchableOpacity
                  style={styles.mapCardNavBtn}
                  onPress={() =>
                    Alert.alert('Navigation Initialized', `Route to ${selectedZone.name} loaded.`)
                  }
                >
                  <NavigationIcon color="#FFFFFF" size={13} />
                  <Text style={styles.mapCardNavBtnText}>Navigate to this Location</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: TRAFFIC ENFORCEMENT & TOW-AWAY ZONES                              */}
        {/* ========================================================================= */}
        {viewMode === 'ENFORCEMENT' && (
          <View style={styles.tabSection}>
            {/* 10-Minute Warning Countdown Card */}
            {warningTimer !== null && (
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <View style={styles.warningIconCircle}>
                    <WarningIcon color="#FFFFFF" size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.warningTitle}>RESTRICTED NO-PARKING ZONE DETECTED</Text>
                    <Text style={styles.warningSubtitle}>
                      Puducherry Traffic Police • Zero Tolerance Tow-Away Zone
                    </Text>
                  </View>
                </View>

                <Text style={styles.warningDesc}>
                  Your GPS is within <Text style={{ fontWeight: '800' }}>{activeWarningZone || 'Rock Beach Promenade'}</Text>.
                  Parking is strictly prohibited here. Move your vehicle to an authorized parking bay immediately.
                </Text>

                <View style={styles.timerBox}>
                  <Text style={styles.timerLabel}>COUNTDOWN BEFORE TOW-AWAY VIOLATION NOTICE:</Text>
                  <Text style={styles.timerValue}>{formatTime(warningTimer)}</Text>
                  <Text style={styles.timerSubNotice}>
                    Automated ANPR and Traffic Warden dispatch triggered at 00:00
                  </Text>
                </View>
              </View>
            )}

            {/* Violation Logged State */}
            {violationGenerated && (
              <View style={styles.violationCard}>
                <Text style={styles.violationTitle}>🚨 VIOLATION LOGGED TO POLICE CONTROL ROOM</Text>
                <Text style={styles.violationDesc}>
                  10-minute maximum grace period exceeded. A possible obstruction event has been logged for municipal crane dispatch and e-challan verification.
                </Text>
                <TouchableOpacity
                  style={styles.dismissViolationBtn}
                  onPress={() => setViolationGenerated(false)}
                >
                  <Text style={styles.dismissViolationBtnText}>Acknowledge Notice</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Active Tow-Away Corridors */}
            <View style={styles.enforcementCard}>
              <View style={styles.enforcementCardHeader}>
                <ProhibitedIcon color="#D31826" size={16} strokeWidth={2.2} />
                <Text style={styles.enforcementCardTitle}>STRICT TOW-AWAY CORRIDORS (ZERO TOLERANCE)</Text>
              </View>

              {redZones.map((zone) => (
                <View key={zone.id} style={styles.redZoneCard}>
                  <View style={styles.redZoneHeaderRow}>
                    <Text style={styles.redZoneName}>{zone.name}</Text>
                    <View style={styles.redTowBadge}>
                      <Text style={styles.redTowBadgeText}>TOW-AWAY</Text>
                    </View>
                  </View>
                  <Text style={styles.redZoneStreet}>📍 {zone.streetName} • {zone.area}</Text>
                  <Text style={styles.redZoneNotes}>{zone.enforcementNotes}</Text>
                  <Text style={styles.redZoneIot}>🎥 {zone.sensorType}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.testWarningActionBtn}
                onPress={triggerDemoWarning}
              >
                <WarningIcon color="#D31826" size={15} />
                <Text style={styles.testWarningActionBtnText}>Simulate 10-Minute Warning Trigger</Text>
              </TouchableOpacity>
            </View>

            {/* Traffic Control Room Contact */}
            <View style={styles.helplineBanner}>
              <PoliceShieldIcon color="#0B2559" size={18} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.helplineTitle}>PUDUCHERRY TRAFFIC POLICE CONTROL ROOM</Text>
                <Text style={styles.helplineSub}>Helpline: 103 / 0413-2231310 • Traffic Advisory Active</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  contentContainer: {
    padding: 14,
    paddingBottom: 110,
  },

  // 1. Single Slim Civic Status Strip
  civicStatusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#071630',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusPillText: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '700',
  },
  statusDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#334155',
  },

  // 2. Mode Switcher
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  modeTabActive: {
    backgroundColor: '#0B2559',
    borderColor: '#0B2559',
  },
  modeTabActiveRed: {
    backgroundColor: '#D31826',
    borderColor: '#D31826',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },

  tabSection: {
    width: '100%',
  },

  // Vehicle Selector Card
  vehicleSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  vehicleToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  vehicleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  vehicleBtnActive: {
    backgroundColor: '#0B2559',
    borderColor: '#0B2559',
  },
  vehicleBtnTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  vehicleBtnTitleActive: {
    color: '#FFFFFF',
  },
  vehicleBtnSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  vehicleBtnSubActive: {
    color: '#94A3B8',
  },

  // Trip Planner Card
  tripPlannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tripPlannerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tripPlannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B2559',
    letterSpacing: 0.4,
  },
  tripPlannerSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  planChipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  planChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    minWidth: 180,
  },
  planChipSelected: {
    backgroundColor: '#0B2559',
    borderColor: '#0B2559',
  },
  planChipTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0B2559',
    marginBottom: 2,
  },
  planChipTitleSelected: {
    color: '#FFFFFF',
  },
  planChipStops: {
    fontSize: 9.5,
    color: '#64748B',
  },
  planRecommendationBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  recBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  recWalkTime: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  recZoneName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  recGuidanceNotes: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 15,
    marginBottom: 8,
  },
  recActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 7,
    borderRadius: 6,
    gap: 5,
  },
  recNavBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  recClearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  recClearBtnText: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Location Bar Row
  locationBarRow: {
    marginBottom: 14,
  },
  locationBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  locationBarBtnText: {
    color: '#0B2559',
    fontSize: 12,
    fontWeight: '800',
  },

  // Categories
  categorySection: {
    marginBottom: 16,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  categorySub: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 10,
  },

  // Facility Cards
  facilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  facilityCardSelected: {
    borderColor: '#0B2559',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  facilityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  facilityTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  freeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  freeBadgeText: {
    color: '#059669',
    fontSize: 8.5,
    fontWeight: '800',
  },
  govtBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  govtBadgeText: {
    color: '#1D4ED8',
    fontSize: 8.5,
    fontWeight: '800',
  },
  facilityArea: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  facilityRateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  facilityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  facilityStreet: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 1,
  },

  progressTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  iotStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginVertical: 4,
  },
  iotDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  iotText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '700',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  metaDivider: {
    color: '#CBD5E1',
    marginHorizontal: 4,
    fontSize: 10,
  },
  metaTrafficText: {
    fontSize: 10,
    fontWeight: '700',
  },

  facilityNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B2559',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 6,
    gap: 5,
  },
  facilityNavBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  fullRedirectBox: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginVertical: 4,
  },
  fullRedirectTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D97706',
  },
  fullRedirectDest: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginTop: 1,
  },

  // Map Area
  mapArea: {
    height: 380,
    borderRadius: 14,
    marginBottom: 14,
  },
  selectedCard: {
    backgroundColor: '#0B2559',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  selectedCardRed: {
    backgroundColor: '#7F1D1D',
  },
  selectedZoneName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  selectedStreetName: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  selectedIotText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  },
  mapCardNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 5,
  },
  mapCardNavBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Enforcement View
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#D31826',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D31826',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  warningTitle: {
    color: '#D31826',
    fontSize: 12.5,
    fontWeight: '800',
  },
  warningSubtitle: {
    color: '#991B1B',
    fontSize: 10,
    fontWeight: '600',
  },
  warningDesc: {
    color: '#7F1D1D',
    fontSize: 11.5,
    lineHeight: 17,
    marginBottom: 10,
  },
  timerBox: {
    backgroundColor: '#D31826',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  timerLabel: {
    color: '#FECACA',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timerSubNotice: {
    color: '#FEE2E2',
    fontSize: 9,
    marginTop: 3,
  },
  violationCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#7F1D1D',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  violationTitle: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  violationDesc: {
    color: '#7F1D1D',
    fontSize: 11.5,
    lineHeight: 17,
    marginBottom: 10,
  },
  dismissViolationBtn: {
    backgroundColor: '#7F1D1D',
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  dismissViolationBtnText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  enforcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    marginBottom: 14,
  },
  enforcementCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  enforcementCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#D31826',
    letterSpacing: 0.5,
  },
  redZoneCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D31826',
  },
  redZoneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  redZoneName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  redTowBadge: {
    backgroundColor: '#D31826',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  redTowBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  redZoneStreet: {
    fontSize: 10.5,
    color: '#7F1D1D',
    marginBottom: 3,
  },
  redZoneNotes: {
    fontSize: 10,
    color: '#B91C1C',
    lineHeight: 14,
  },
  redZoneIot: {
    fontSize: 9.5,
    color: '#991B1B',
    fontWeight: '700',
    marginTop: 4,
  },
  testWarningActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: 6,
    gap: 6,
  },
  testWarningActionBtnText: {
    color: '#D31826',
    fontSize: 12,
    fontWeight: '800',
  },
  helplineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  helplineTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B2559',
    letterSpacing: 0.3,
  },
  helplineSub: {
    fontSize: 9.5,
    color: '#1E40AF',
    marginTop: 1,
  },

  // Status badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusBadgeAvailable: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgeAmber: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeFull: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  statusTextAvailable: {
    color: '#059669',
  },
  statusTextAmber: {
    color: '#D97706',
  },
  statusTextFull: {
    color: '#DC2626',
  },

  textGreen: {
    color: '#059669',
  },
  textRed: {
    color: '#DC2626',
  },
});
