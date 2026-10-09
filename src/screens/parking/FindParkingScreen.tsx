import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from '../../components/common/MapComponent';
import * as Location from 'expo-location';
import { Colors } from '../../theme/colors';
import { SearchIcon, MapIcon, RefreshIcon, LocationPinIcon, WarningIcon, CarIcon, ArrowRightIcon } from '../../components/common/Icons';
import { ParkingZone, LocationCoordinates, getNearestAvailableParking, reportViolationEvent, getDistance, fetchRealParkingZones } from '../../services/parkingService';

export const FindParkingScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [redirectZone, setRedirectZone] = useState<ParkingZone | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [warningTimer, setWarningTimer] = useState<number | null>(null);
  const [violationGenerated, setViolationGenerated] = useState(false);

  const DEMO_WARNING_SECONDS = 10;
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchRealParkingZones().then(realZones => {
      setZones(realZones);
    });
  }, []);

  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const realLoc = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      
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

  const checkIfInRestrictedZone = (loc: LocationCoordinates) => {
    const redZones = zones.filter(z => z.type === 'NO_PARKING_RED');
    let inRestricted = false;
    for (const zone of redZones) {
      if (getDistance(loc, zone.coordinates) < 0.2) {
        inRestricted = true;
        break;
      }
    }

    if (inRestricted && warningTimer === null && !violationGenerated) {
      setWarningTimer(DEMO_WARNING_SECONDS);
    } else if (!inRestricted) {
      setWarningTimer(null);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (warningTimer !== null && warningTimer > 0) {
      interval = setInterval(() => {
        setWarningTimer(prev => prev! - 1);
      }, 1000);
    } else if (warningTimer === 0) {
      setWarningTimer(null);
      setViolationGenerated(true);
      reportViolationEvent('citizen_session_123', 'Restricted Area', userLocation!, 10);
    }
    return () => clearInterval(interval);
  }, [warningTimer, userLocation]);

  const handleSelectZone = (zone: ParkingZone) => {
    setSelectedZone(zone);
    setRedirectZone(null);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: zone.coordinates.latitude,
        longitude: zone.coordinates.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }

    if (zone.isFull) {
      const nearest = getNearestAvailableParking(zone.coordinates, zone.id);
      if (nearest) {
        setRedirectZone(nearest);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Search & Location Area */}
        <View style={styles.searchCard}>
          <View style={styles.searchBar}>
            <SearchIcon color="#64748B" size={16} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination (e.g. Rock Beach)"
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.locationBtn} onPress={handleGetCurrentLocation} disabled={isLocating}>
            <LocationPinIcon color={Colors.policeNavy} size={18} />
            <Text style={styles.locationBtnText}>
              {isLocating ? 'Locating...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Warning System UI */}
        {warningTimer !== null && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <WarningIcon color="#EF4444" size={24} />
              <Text style={styles.warningTitle}>NO-PARKING ZONE</Text>
            </View>
            <Text style={styles.warningDesc}>
              You are currently inside a restricted parking area. Please move your vehicle to an authorized parking location.
            </Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>Time remaining before violation:</Text>
              <Text style={styles.timerValue}>{formatTime(warningTimer)}</Text>
            </View>
          </View>
        )}

        {violationGenerated && (
          <View style={[styles.warningCard, { borderColor: '#7F1D1D', backgroundColor: '#FEF2F2' }]}>
            <View style={styles.warningHeader}>
              <WarningIcon color="#991B1B" size={24} />
              <Text style={[styles.warningTitle, { color: '#991B1B' }]}>VIOLATION DETECTED</Text>
            </View>
            <Text style={[styles.warningDesc, { color: '#7F1D1D' }]}>
              You have exceeded the permitted duration in a restricted zone. A potential violation event has been logged for police review.
            </Text>
          </View>
        )}

        {/* Map Component */}
        <View style={styles.mapWrapper}>
            <MapView
              ref={mapRef}
              style={styles.mapArea}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 11.9338,
                longitude: 79.8310,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {zones.map((zone) => {
                const isGreen = zone.type === 'PARKING_GREEN';
                const markerColor = isGreen ? (zone.isFull ? '#F59E0B' : Colors.parkingGreen) : Colors.noParkingRed;

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
              
              {zones.filter(z => z.type === 'NO_PARKING_RED').map(zone => (
                <Circle
                  key={`circle-${zone.id}`}
                  center={zone.coordinates}
                  radius={200}
                  fillColor="rgba(239, 68, 68, 0.2)"
                  strokeColor="rgba(239, 68, 68, 0.6)"
                />
              ))}
            </MapView>
        </View>

        {/* Selected Parking Bottom Sheet / Card */}
        {selectedZone && (
          <View style={styles.selectedCard}>
            <Text style={styles.selectedZoneName}>{selectedZone.name}</Text>
            
            {selectedZone.type === 'NO_PARKING_RED' ? (
              <View style={styles.redZoneInfo}>
                <WarningIcon color={Colors.noParkingRed} size={20} />
                <Text style={styles.redZoneText}>Strict No-Parking / Tow-Away Zone</Text>
              </View>
            ) : (
              <>
                <View style={styles.zoneStatsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Available</Text>
                    <Text style={[styles.statValue, { color: selectedZone.isFull ? '#EF4444' : Colors.parkingGreen }]}>
                      {selectedZone.isFull ? 'FULL' : `${selectedZone.totalSlots! - selectedZone.occupiedSlots!} / ${selectedZone.totalSlots}`}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Distance</Text>
                    <Text style={styles.statValue}>{selectedZone.distanceKm} km</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Walk</Text>
                    <Text style={styles.statValue}>{selectedZone.walkingTimeMin} min</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Fee</Text>
                    <Text style={styles.statValue}>{selectedZone.hourlyRate}</Text>
                  </View>
                </View>

                {/* Smart Kerb Map View Concept */}
                <View style={styles.kerbVisualBox}>
                  <View style={styles.kerbGreen}>
                    <Text style={styles.kerbTitle}>🟢 AUTHORIZED PARKING</Text>
                    <Text style={styles.kerbSub}>{selectedZone.isFull ? '0' : selectedZone.totalSlots! - selectedZone.occupiedSlots!} / {selectedZone.totalSlots} SPACES VACANT</Text>
                  </View>
                  <View style={styles.kerbRoad}>
                    <View style={styles.dash} />
                    <View style={styles.dash} />
                    <View style={styles.dash} />
                  </View>
                  <View style={styles.kerbRed}>
                    <Text style={styles.kerbTitle}>🔴 NO PARKING / TOW-AWAY</Text>
                    <Text style={styles.kerbSub}>ZERO TOLERANCE</Text>
                  </View>
                </View>

                {selectedZone.isFull && redirectZone && (
                  <View style={styles.redirectBanner}>
                     <View style={styles.redirectHeader}>
                        <RefreshIcon color="#1E3A8A" size={16} />
                        <Text style={styles.redirectTitle}>Parking Full. Nearest Alternative:</Text>
                     </View>
                     <Text style={styles.redirectDestination}>
                       {redirectZone.name} • {redirectZone.totalSlots! - redirectZone.occupiedSlots!} spaces left
                     </Text>
                     <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>Get Directions</Text>
                        <ArrowRightIcon color="#FFF" size={14} />
                     </TouchableOpacity>
                  </View>
                )}

                {(!selectedZone.isFull) && (
                  <TouchableOpacity style={styles.actionBtnPrimary}>
                    <Text style={styles.actionBtnText}>Get Directions</Text>
                    <ArrowRightIcon color="#FFF" size={14} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Nearby Parking List */}
        <Text style={styles.sectionTitle}>Nearby Authorized Parking</Text>
        {zones.filter(z => z.type === 'PARKING_GREEN').map(zone => (
          <TouchableOpacity 
            key={zone.id} 
            style={[styles.zoneListItem, selectedZone?.id === zone.id && styles.zoneListItemActive]}
            onPress={() => handleSelectZone(zone)}
          >
            <View style={styles.zoneListInfo}>
              <Text style={styles.zoneListName}>{zone.name}</Text>
              <Text style={styles.zoneListSub}>📍 {zone.distanceKm} km away • {zone.hourlyRate}</Text>
            </View>
            <View style={[styles.statusBadge, zone.isFull ? styles.statusBadgeFull : styles.statusBadgeAvailable]}>
              <Text style={[styles.statusBadgeText, zone.isFull ? styles.statusTextFull : styles.statusTextAvailable]}>
                {zone.isFull ? 'FULL' : `${zone.totalSlots! - zone.occupiedSlots!} LEFT`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
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
  searchCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    marginLeft: 8,
    // @ts-ignore
    outlineStyle: 'none',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  locationBtnText: {
    color: Colors.policeNavy,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  warningDesc: {
    color: '#991B1B',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  timerBox: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timerLabel: {
    color: '#FECACA',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  mapBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  mapWrapper: {
    height: 300,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapArea: {
    flex: 1,
  },
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F1F5F9',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
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
  selectedCard: {
    backgroundColor: Colors.policeNavy,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedZoneName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  zoneStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  redZoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  redZoneText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  kerbVisualBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kerbGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  kerbRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  kerbRoad: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 40,
  },
  dash: {
    width: 2,
    height: 8,
    backgroundColor: '#FBBF24',
  },
  kerbTitle: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  kerbSub: {
    color: '#CBD5E1',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  redirectBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  redirectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  redirectTitle: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  redirectDestination: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionBtnPrimary: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  zoneListItem: {
    backgroundColor: Colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
  },
  zoneListItemActive: {
    borderColor: Colors.policeNavy,
    backgroundColor: '#F8FAFC',
  },
  zoneListInfo: {
    flex: 1,
  },
  zoneListName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  zoneListSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeAvailable: {
    backgroundColor: Colors.parkingGreenLight,
  },
  statusBadgeFull: {
    backgroundColor: Colors.noParkingRedLight,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextAvailable: {
    color: Colors.parkingGreenBorder,
  },
  statusTextFull: {
    color: Colors.noParkingRedBorder,
  }
});
