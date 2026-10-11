import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
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
} from '../../components/common/Icons';
import {
  ParkingZone,
  LocationCoordinates,
  REAL_PUDUCHERRY_ZONES,
  getNearestAvailableParking,
  reportViolationEvent,
  getDistance,
  fetchRealParkingZones,
} from '../../services/parkingService';

export const FindParkingScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zones, setZones] = useState<ParkingZone[]>(REAL_PUDUCHERRY_ZONES);
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(REAL_PUDUCHERRY_ZONES[0]);
  const [redirectZone, setRedirectZone] = useState<ParkingZone | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>({
    latitude: 11.9338,
    longitude: 79.8310,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVAILABLE' | '2W' | '4W' | 'RESTRICTED'>('ALL');
  
  // 10-minute warning countdown simulation (demo set to 10 seconds or 600s)
  const [warningTimer, setWarningTimer] = useState<number | null>(null);
  const [violationGenerated, setViolationGenerated] = useState(false);
  const [activeWarningZone, setActiveWarningZone] = useState<string>('');

  const mapRef = useRef<MapView>(null);

  // Fetch live OSM parking on mount while immediately showing verified Puducherry zones
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
      setWarningTimer(10); // 10-second demo representation for review
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

  // Quick destination selector
  const handleSelectDestination = (destName: string, coords: LocationCoordinates) => {
    setSearchQuery(destName);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });
    }

    // Find nearest green parking
    const nearest = [...zones]
      .filter((z) => z.type === 'PARKING_GREEN')
      .sort((a, b) => getDistance(coords, a.coordinates) - getDistance(coords, b.coordinates))[0];

    if (nearest) {
      handleSelectZone(nearest);
    }
  };

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
      const nearest = getNearestAvailableParking(zone.coordinates, zone.id);
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
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Filtered zones
  const filteredZones = zones.filter((zone) => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const match =
        zone.name.toLowerCase().includes(query) ||
        zone.streetName.toLowerCase().includes(query) ||
        (zone.area && zone.area.toLowerCase().includes(query));
      if (!match) return false;
    }

    if (activeFilter === 'AVAILABLE') {
      return zone.type === 'PARKING_GREEN' && !zone.isFull;
    }
    if (activeFilter === '2W') {
      return zone.type === 'PARKING_GREEN' && zone.vehicleTypes?.includes('2-Wheeler');
    }
    if (activeFilter === '4W') {
      return zone.type === 'PARKING_GREEN' && zone.vehicleTypes?.includes('4-Wheeler');
    }
    if (activeFilter === 'RESTRICTED') {
      return zone.type === 'NO_PARKING_RED';
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* 1. Official Puducherry Police Command Banner */}
        <View style={styles.commandBanner}>
          <View style={styles.commandTopRow}>
            <Image
              source={require('../../../assets/police_logo.png')}
              style={styles.bannerLogo}
              resizeMode="contain"
            />
            <View style={styles.commandTextCol}>
              <Text style={styles.commandAgency}>GOVERNMENT OF PUDUCHERRY • POLICE DEPARTMENT</Text>
              <Text style={styles.commandTitle}>ParkPuduvai Smart Parking Command</Text>
            </View>
          </View>

          <View style={styles.commandStatsRow}>
            <View style={styles.commandStatPill}>
              <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statPillText}>114 Vacancies Monitored</Text>
            </View>
            <View style={styles.commandStatPill}>
              <View style={[styles.statDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.statPillText}>3 Tow-Away Corridors</Text>
            </View>
            <View style={styles.commandStatPill}>
              <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statPillText}>10m Tow Warning</Text>
            </View>
          </View>
        </View>

        {/* 2. Destination Search & GPS Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchBar}>
            <SearchIcon color="#0B2559" size={17} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination (e.g. Rock Beach, White Town)"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Destination Suggestion Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickChipsContainer}
          >
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() =>
                handleSelectDestination('Rock Beach', { latitude: 11.933, longitude: 79.8358 })
              }
            >
              <BeachIcon color="#0B2559" size={13} />
              <Text style={styles.quickChipText}>Rock Beach</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() =>
                handleSelectDestination('White Town', { latitude: 11.9325, longitude: 79.8338 })
              }
            >
              <MonumentIcon color="#0B2559" size={13} />
              <Text style={styles.quickChipText}>White Town</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() =>
                handleSelectDestination('Mission Street', { latitude: 11.9348, longitude: 79.8295 })
              }
            >
              <ShoppingBagIcon color="#0B2559" size={13} />
              <Text style={styles.quickChipText}>Mission St</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() =>
                handleSelectDestination('Bharathi Park', { latitude: 11.9315, longitude: 79.834 })
              }
            >
              <ParkTreeIcon color="#0B2559" size={13} />
              <Text style={styles.quickChipText}>Bharathi Park</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() =>
                handleSelectDestination('Old Port', { latitude: 11.9265, longitude: 79.8345 })
              }
            >
              <AnchorIcon color="#0B2559" size={13} />
              <Text style={styles.quickChipText}>Old Port</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Row: Use Location + Test Warning Demo */}
          <View style={styles.searchActionRow}>
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={handleGetCurrentLocation}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              <LocationPinIcon color={Colors.policeNavy} size={16} />
              <Text style={styles.locationBtnText}>
                {isLocating ? 'Locating GPS...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoWarningBtn}
              onPress={triggerDemoWarning}
              activeOpacity={0.8}
            >
              <WarningIcon color="#D31826" size={14} />
              <Text style={styles.demoWarningBtnText}>Test 10m Warning</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Real-Time Police No-Parking Warning System (10-Minute Countdown) */}
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

            <TouchableOpacity
              style={styles.findSafeParkingBtn}
              onPress={() => {
                const nearestSafe = zones.find((z) => z.type === 'PARKING_GREEN' && !z.isFull);
                if (nearestSafe) handleSelectZone(nearestSafe);
              }}
            >
              <NavigationIcon color="#FFFFFF" size={14} />
              <Text style={styles.findSafeParkingBtnText}>Navigate to Safe Parking</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Violation Logged State */}
        {violationGenerated && (
          <View style={styles.violationCard}>
            <View style={styles.warningHeader}>
              <View style={[styles.warningIconCircle, { backgroundColor: '#7F1D1D' }]}>
                <WarningIcon color="#FFFFFF" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.warningTitle, { color: '#991B1B' }]}>
                  VIOLATION LOGGED TO POLICE CONTROL ROOM
                </Text>
                <Text style={styles.warningSubtitle}>
                  Tow-Away Event ID: PD-TOW-{Math.floor(1000 + Math.random() * 9000)}
                </Text>
              </View>
            </View>
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

        {/* 4. Filter Pills */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'ALL' && styles.filterPillActive]}
            onPress={() => setActiveFilter('ALL')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'ALL' && styles.filterPillTextActive]}>
              All ({zones.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'AVAILABLE' && styles.filterPillActiveGreen]}
            onPress={() => setActiveFilter('AVAILABLE')}
          >
            <View style={[styles.filterDot, { backgroundColor: activeFilter === 'AVAILABLE' ? '#FFFFFF' : '#059669' }]} />
            <Text style={[styles.filterPillText, activeFilter === 'AVAILABLE' && styles.filterPillTextActiveGreen]}>
              Vacant ({zones.filter((z) => z.type === 'PARKING_GREEN' && !z.isFull).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === '2W' && styles.filterPillActive]}
            onPress={() => setActiveFilter('2W')}
          >
            <MotorcycleIcon color={activeFilter === '2W' ? '#FFFFFF' : '#475569'} size={14} />
            <Text style={[styles.filterPillText, activeFilter === '2W' && styles.filterPillTextActive]}>
              Two-Wheeler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === '4W' && styles.filterPillActive]}
            onPress={() => setActiveFilter('4W')}
          >
            <CarIcon color={activeFilter === '4W' ? '#FFFFFF' : '#475569'} size={15} />
            <Text style={[styles.filterPillText, activeFilter === '4W' && styles.filterPillTextActive]}>
              Four-Wheeler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'RESTRICTED' && styles.filterPillActiveRed]}
            onPress={() => setActiveFilter('RESTRICTED')}
          >
            <ProhibitedIcon color={activeFilter === 'RESTRICTED' ? '#FFFFFF' : '#D31826'} size={13} strokeWidth={2.2} />
            <Text style={[styles.filterPillText, activeFilter === 'RESTRICTED' && styles.filterPillTextActiveRed]}>
              Tow-Away Zones ({zones.filter((z) => z.type === 'NO_PARKING_RED').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Interactive Map View */}
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
          {filteredZones.map((zone) => {
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

          {filteredZones
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

        {/* 6. Selected Parking Detail Card */}
        {selectedZone && (
          <View
            style={[
              styles.selectedCard,
              selectedZone.type === 'NO_PARKING_RED' && styles.selectedCardRed,
            ]}
          >
            <View style={styles.selectedHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.zoneTypeBadgeRow}>
                  <View
                    style={[
                      styles.zoneTypeBadge,
                      selectedZone.type === 'PARKING_GREEN'
                        ? styles.badgeGreen
                        : styles.badgeRed,
                    ]}
                  >
                    <View
                      style={[
                        styles.indicatorDot,
                        {
                          backgroundColor:
                            selectedZone.type === 'PARKING_GREEN' ? '#059669' : '#DC2626',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.zoneTypeBadgeText,
                        selectedZone.type === 'PARKING_GREEN'
                          ? styles.textGreen
                          : styles.textRed,
                      ]}
                    >
                      {selectedZone.type === 'PARKING_GREEN'
                        ? 'AUTHORIZED CIVIC PARKING'
                        : 'STRICT NO-PARKING / TOW-AWAY'}
                    </Text>
                  </View>
                  <Text style={styles.zoneAreaText}>{selectedZone.area}</Text>
                </View>

                <Text style={styles.selectedZoneName}>{selectedZone.name}</Text>
                <View style={styles.selectedLocationRow}>
                  <LocationPinIcon color="#CBD5E1" size={13} />
                  <Text style={styles.selectedStreetName}>{selectedZone.streetName}</Text>
                </View>
              </View>
            </View>

            {selectedZone.type === 'NO_PARKING_RED' ? (
              <View style={styles.redDetailsBox}>
                <View style={styles.redDetailsHeader}>
                  <WarningIcon color="#FCA5A5" size={14} />
                  <Text style={styles.redDetailsTitle}>Police Enforcement Advisory</Text>
                </View>
                <Text style={styles.redDetailsText}>{selectedZone.enforcementNotes}</Text>
                <TouchableOpacity
                  style={styles.redirectActionBtn}
                  onPress={() => {
                    const nearest = getNearestAvailableParking(selectedZone.coordinates);
                    if (nearest) handleSelectZone(nearest);
                  }}
                >
                  <NavigationIcon color="#FFFFFF" size={14} />
                  <Text style={styles.redirectActionBtnText}>
                    Find Nearest Safe Parking
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Availability Progress Meter */}
                <View style={styles.occupancyMeterBox}>
                  <View style={styles.meterHeader}>
                    <Text style={styles.meterLabel}>BAY OCCUPANCY & AVAILABILITY</Text>
                    <View style={styles.meterStatusBadge}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: selectedZone.isFull
                              ? '#EF4444'
                              : (selectedZone.occupiedSlots! / selectedZone.totalSlots!) > 0.7
                              ? '#F59E0B'
                              : '#10B981',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.meterStatus,
                          selectedZone.isFull
                            ? { color: '#EF4444' }
                            : (selectedZone.occupiedSlots! / selectedZone.totalSlots!) > 0.7
                            ? { color: '#F59E0B' }
                            : { color: '#10B981' },
                        ]}
                      >
                        {selectedZone.isFull
                          ? 'FULL'
                          : (selectedZone.occupiedSlots! / selectedZone.totalSlots!) > 0.7
                          ? 'FILLING FAST'
                          : 'AVAILABLE'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.round((selectedZone.occupiedSlots! / selectedZone.totalSlots!) * 100)
                          )}%`,
                          backgroundColor: selectedZone.isFull
                            ? '#EF4444'
                            : (selectedZone.occupiedSlots! / selectedZone.totalSlots!) > 0.7
                            ? '#F59E0B'
                            : '#10B981',
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.slotsCountRow}>
                    <Text style={styles.slotsVacantHighlight}>
                      {selectedZone.isFull
                        ? '0 SPACES VACANT'
                        : `${selectedZone.totalSlots! - selectedZone.occupiedSlots!} VACANT SPACES`}
                    </Text>
                    <Text style={styles.slotsTotalText}>
                      ({selectedZone.occupiedSlots} occupied of {selectedZone.totalSlots} total)
                    </Text>
                  </View>
                </View>

                {/* Statistics Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCell}>
                    <Text style={styles.statCellLabel}>DISTANCE</Text>
                    <Text style={styles.statCellValue}>{selectedZone.distanceKm} km</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statCellLabel}>WALK TIME</Text>
                    <View style={styles.statIconRow}>
                      <WalkIcon color="#FFFFFF" size={12} />
                      <Text style={styles.statCellValue}> {selectedZone.walkingTimeMin} min</Text>
                    </View>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statCellLabel}>TARIFF</Text>
                    <Text style={styles.statCellValue}>{selectedZone.hourlyRate}</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statCellLabel}>VEHICLES</Text>
                    <Text style={styles.statCellValue}>
                      {selectedZone.vehicleTypes?.join(', ') || '2W / 4W'}
                    </Text>
                  </View>
                </View>

                {/* Smart Kerb Diagram */}
                <View style={styles.kerbVisualBox}>
                  <View style={styles.kerbGreen}>
                    <View style={styles.kerbTitleRow}>
                      <View style={[styles.kerbDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.kerbTitle}>AUTHORIZED BAY</Text>
                    </View>
                    <Text style={styles.kerbSub}>
                      {selectedZone.isFull
                        ? '0'
                        : selectedZone.totalSlots! - selectedZone.occupiedSlots!}{' '}
                      SPACES VACANT
                    </Text>
                  </View>
                  <View style={styles.kerbRoad}>
                    <View style={styles.dash} />
                    <View style={styles.dash} />
                  </View>
                  <View style={styles.kerbRed}>
                    <View style={styles.kerbTitleRow}>
                      <View style={[styles.kerbDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={styles.kerbTitle}>NO-PARKING KERB</Text>
                    </View>
                    <Text style={styles.kerbSub}>ZERO TOLERANCE</Text>
                  </View>
                </View>

                {/* Smart Redirection Notice when full */}
                {selectedZone.isFull && redirectZone && (
                  <View style={styles.redirectBanner}>
                    <View style={styles.redirectHeader}>
                      <RefreshIcon color="#F59E0B" size={16} />
                      <Text style={styles.redirectTitle}>
                        Smart Redirection: Nearest Available Alternative
                      </Text>
                    </View>
                    <Text style={styles.redirectDestination}>
                      {redirectZone.name}
                    </Text>
                    <Text style={styles.redirectSub}>
                      {redirectZone.totalSlots! - redirectZone.occupiedSlots!} spaces vacant •{' '}
                      {redirectZone.distanceKm} km away
                    </Text>
                    <TouchableOpacity
                      style={styles.actionBtnRedirect}
                      onPress={() => handleSelectZone(redirectZone)}
                    >
                      <NavigationIcon color="#FFF" size={14} />
                      <Text style={styles.actionBtnText}>
                        Divert to {redirectZone.name}
                      </Text>
                      <ArrowRightIcon color="#FFF" size={14} />
                    </TouchableOpacity>
                  </View>
                )}

                {!selectedZone.isFull && (
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() =>
                      Alert.alert(
                        'Directions Initialized',
                        `Turn-by-turn route to ${selectedZone.name} loaded.\n\nPuducherry Traffic Police monitors sensor bay status in real-time.`
                      )
                    }
                  >
                    <NavigationIcon color="#FFF" size={15} />
                    <Text style={styles.actionBtnText}>Get Navigation Directions</Text>
                    <ArrowRightIcon color="#FFF" size={15} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* 7. Nearby Parking List with Rich Cards */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Puducherry Authorized Parking Directory ({filteredZones.length})
          </Text>
        </View>

        {filteredZones.map((zone) => {
          const isGreen = zone.type === 'PARKING_GREEN';
          const vacantSpots = isGreen ? (zone.totalSlots! - zone.occupiedSlots!) : 0;
          const isSelected = selectedZone?.id === zone.id;

          return (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zoneListItem,
                isSelected && styles.zoneListItemActive,
                !isGreen && styles.zoneListItemRed,
              ]}
              onPress={() => handleSelectZone(zone)}
              activeOpacity={0.8}
            >
              <View style={styles.zoneListLeft}>
                <View style={styles.zoneNameRow}>
                  <Text style={styles.zoneListName}>{zone.name}</Text>
                  {!isGreen && (
                    <View style={styles.towBadge}>
                      <Text style={styles.towBadgeText}>TOW-AWAY</Text>
                    </View>
                  )}
                </View>

                <View style={styles.zoneLocationRow}>
                  <LocationPinIcon color="#64748B" size={12} />
                  <Text style={styles.zoneListSub}>
                    {zone.streetName} • {zone.area}
                  </Text>
                </View>

                <View style={styles.zoneTagsRow}>
                  <Text style={styles.zoneTagText}>{zone.distanceKm} km</Text>
                  {isGreen && (
                    <>
                      <Text style={styles.zoneTagDivider}>•</Text>
                      <WalkIcon color="#64748B" size={11} />
                      <Text style={styles.zoneTagText}> {zone.walkingTimeMin} min walk</Text>
                      <Text style={styles.zoneTagDivider}>•</Text>
                      <Text style={styles.zoneTagText}>{zone.hourlyRate}</Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.zoneListRight}>
                {isGreen ? (
                  <View
                    style={[
                      styles.statusBadge,
                      zone.isFull
                        ? styles.statusBadgeFull
                        : vacantSpots <= 5
                        ? styles.statusBadgeAmber
                        : styles.statusBadgeAvailable,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        zone.isFull
                          ? styles.statusTextFull
                          : vacantSpots <= 5
                          ? styles.statusTextAmber
                          : styles.statusTextAvailable,
                      ]}
                    >
                      {zone.isFull ? 'FULL' : `${vacantSpots} LEFT`}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.redCirclePin}>
                    <ProhibitedIcon color="#DC2626" size={15} strokeWidth={2.2} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredZones.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No parking zones matching "{searchQuery}"</Text>
            <Text style={styles.emptyStateSub}>Try searching Rock Beach, White Town, or Mission Street</Text>
            <TouchableOpacity
              style={styles.emptyStateResetBtn}
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('ALL');
              }}
            >
              <Text style={styles.emptyStateResetText}>Reset Filters</Text>
            </TouchableOpacity>
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
  // 1. Command Banner
  commandBanner: {
    backgroundColor: '#071630',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#D31826',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  commandTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerLogo: {
    width: 44,
    height: 46,
    marginRight: 12,
  },
  commandTextCol: {
    flex: 1,
  },
  commandAgency: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.8,
  },
  commandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  commandStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  commandStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1E36',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statPillText: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '700',
  },

  // 2. Search & Location Card
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    marginLeft: 8,
    fontWeight: '500',
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  clearBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  quickChipsContainer: {
    flexDirection: 'row',
    paddingBottom: 10,
    gap: 6,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 5,
  },
  quickChipText: {
    color: '#0B2559',
    fontSize: 11,
    fontWeight: '700',
  },
  searchActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  locationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  locationBtnText: {
    color: '#0B2559',
    fontSize: 12,
    fontWeight: '700',
  },
  demoWarningBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 5,
  },
  demoWarningBtnText: {
    color: '#D31826',
    fontSize: 11.5,
    fontWeight: '700',
  },

  // 3. Warning Card
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#D31826',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#D31826',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
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
    letterSpacing: 0.2,
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
  findSafeParkingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B2559',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  findSafeParkingBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  violationCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#7F1D1D',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
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

  // 4. Filter Bar
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 5,
  },
  filterPillActive: {
    backgroundColor: '#0B2559',
    borderColor: '#0B2559',
  },
  filterPillActiveGreen: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterPillActiveRed: {
    backgroundColor: '#D31826',
    borderColor: '#D31826',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  filterPillTextActiveGreen: {
    color: '#FFFFFF',
  },
  filterPillTextActiveRed: {
    color: '#FFFFFF',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // 5. Map Component
  mapArea: {
    height: 310,
    borderRadius: 14,
    marginBottom: 14,
  },

  // 6. Selected Zone Card
  selectedCard: {
    backgroundColor: '#0B2559',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedCardRed: {
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
  },
  selectedHeaderRow: {
    marginBottom: 12,
  },
  zoneTypeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  zoneTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 5,
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  zoneTypeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textGreen: {
    color: '#34D399',
  },
  textRed: {
    color: '#FCA5A5',
  },
  zoneAreaText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  selectedZoneName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  selectedLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  selectedStreetName: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '500',
  },

  // Red details
  redDetailsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.3)',
  },
  redDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  redDetailsTitle: {
    color: '#FCA5A5',
    fontSize: 11.5,
    fontWeight: '800',
  },
  redDetailsText: {
    color: '#FEE2E2',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  redirectActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B2559',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
  },
  redirectActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Occupancy Meter
  occupancyMeterBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  meterStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  meterStatus: {
    fontSize: 10,
    fontWeight: '900',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  slotsCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  slotsVacantHighlight: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  slotsTotalText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCellLabel: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  statCellValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Smart Kerb visual
  kerbVisualBox: {
    backgroundColor: '#071630',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  kerbGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  kerbRed: {
    backgroundColor: 'rgba(211, 24, 38, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  kerbTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kerbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kerbRoad: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 36,
  },
  dash: {
    width: 2,
    height: 8,
    backgroundColor: '#F59E0B',
  },
  kerbTitle: {
    color: '#FFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  kerbSub: {
    color: '#CBD5E1',
    fontSize: 7.5,
    fontWeight: '700',
    marginTop: 2,
  },

  // Smart Redirection Banner
  redirectBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  redirectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  redirectTitle: {
    color: '#F59E0B',
    fontSize: 10.5,
    fontWeight: '800',
  },
  redirectDestination: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  redirectSub: {
    color: '#FEF3C7',
    fontSize: 11,
    marginTop: 1,
    marginBottom: 10,
  },
  actionBtnRedirect: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },

  // Primary Action Button
  actionBtnPrimary: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // 7. Directory List
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  zoneListItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  zoneListItemActive: {
    borderColor: '#0B2559',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  zoneListItemRed: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FFFDFD',
  },
  zoneListLeft: {
    flex: 1,
  },
  zoneNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  zoneListName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  towBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  towBadgeText: {
    color: '#991B1B',
    fontSize: 8.5,
    fontWeight: '800',
  },
  zoneLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  zoneListSub: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  zoneTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneTagText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  zoneTagDivider: {
    color: '#CBD5E1',
    marginHorizontal: 4,
    fontSize: 10,
  },
  zoneListRight: {
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
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
    fontSize: 10,
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
  redCirclePin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  emptyStateResetBtn: {
    backgroundColor: '#0B2559',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  emptyStateResetText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
