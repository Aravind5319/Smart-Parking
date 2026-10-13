// ============================================================================
// PUDUCHERRY SMART MAP & CITY HUB (GOOGLE MAPS INSPIRED REDESIGN)
// Full screen interactive Google-style map, floating search bar, swipable category pills,
// horizontal swipable cards carousel, turn-by-turn navigation HUD & OpenCV live camera
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import { CityPlace, PlaceCategory, NavigationSession } from '../../types/navigation';
import {
  PUDUCHERRY_CITY_PLACES,
  createNavigationSession,
  parkingZoneToCityPlace,
  fetchRoadRoute,
  enrichPlacesWithUserLocation,
} from '../../services/cityPlacesService';
import { REAL_PUDUCHERRY_ZONES, ParkingZone } from '../../services/parkingService';
import { AppwriteDb } from '../../services/appwriteDb';
import { GoogleSearchHeader, CategoryFilterType } from '../../components/map/GoogleSearchHeader';
import { GoogleMapView } from '../../components/map/GoogleMapView';
import { SwipablePlacesCarousel } from '../../components/map/SwipablePlacesCarousel';
import { NearbySlideUpSheet } from '../../components/map/NearbySlideUpSheet';
import { TurnByTurnNavigationHUD } from '../../components/map/TurnByTurnNavigationHUD';
import { PlaceDetailsModal } from '../../components/map/PlaceDetailsModal';
import { EmergencyAssistanceModal } from '../../components/emergency/EmergencyAssistanceModal';
import { ParkingCameraModal } from '../../components/parking/ParkingCameraModal';
import { NoParkingTimerBanner } from '../../components/emergency/NoParkingTimerBanner';

export const FindParkingScreen: React.FC = () => {
  // Places & Filter States
  const [places, setPlaces] = useState<CityPlace[]>(PUDUCHERRY_CITY_PLACES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<CityPlace | null>(PUDUCHERRY_CITY_PLACES[0]);
  const [noParkingDismissed, setNoParkingDismissed] = useState<boolean>(false);

  // Modals & Navigation States
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState<boolean>(false);
  const [cameraModalVisible, setCameraModalVisible] = useState<boolean>(false);
  const [selectedCamZone, setSelectedCamZone] = useState<ParkingZone | null>(REAL_PUDUCHERRY_ZONES[0]);
  const [navigationSession, setNavigationSession] = useState<NavigationSession | null>(null);

  // User GPS Location State
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 11.9338,
    longitude: 79.8310,
  });

  // Fetch live sync from Appwrite if available
  useEffect(() => {
    AppwriteDb.fetchParkingZones()
      .then((realZones) => {
        if (realZones && realZones.length > 0) {
          const appwritePlaces = realZones.map((z) => parkingZoneToCityPlace(z, userCoords));
          // Merge with static toilets, fuel, ATMs
          const nonParking = PUDUCHERRY_CITY_PLACES.filter(
            (p) => p.category !== 'PARKING_SMART' && p.category !== 'PARKING_FREE' && p.category !== 'NO_PARKING'
          );
          // Always ensure MVIT parking is included
          const mvitPlace = PUDUCHERRY_CITY_PLACES.find((p) => p.id === 'zone-test-mvit');
          const hasMvit = appwritePlaces.some((p) => p.id === 'zone-test-mvit' || p.name.toLowerCase().includes('mvit'));
          const finalParking = hasMvit ? appwritePlaces : (mvitPlace ? [mvitPlace, ...appwritePlaces] : appwritePlaces);
          setPlaces([...finalParking, ...nonParking]);
        }
      })
      .catch(() => {});

    // Request GPS
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (e) {}
    })();
  }, []);

  // Dynamically calculate distance and duration from actual user coordinates
  const enrichedPlaces = useMemo(() => {
    return enrichPlacesWithUserLocation(places, userCoords);
  }, [places, userCoords]);

  // Filtered Places based on Category Pill and Search Query, sorted with MVIT Parking pinned first
  const filteredPlaces = useMemo(() => {
    const filtered = enrichedPlaces.filter((place) => {
      // 1. Category Filter
      if (selectedCategory !== 'ALL' && selectedCategory !== 'EMERGENCY') {
        if (place.category !== selectedCategory) return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = place.name.toLowerCase().includes(q);
        const matchStreet = place.streetName.toLowerCase().includes(q);
        const matchArea = place.area.toLowerCase().includes(q);
        const matchTariff = (place.tariff || '').toLowerCase().includes(q);
        if (!matchName && !matchStreet && !matchArea && !matchTariff) return false;
      }

      return true;
    });

    // Pinned: MVIT Parking is permanently pinned to the very top, followed by nearest distance
    return [...filtered].sort((a, b) => {
      const aIsMvit = a.id === 'zone-test-mvit' || a.name.toLowerCase().includes('mvit');
      const bIsMvit = b.id === 'zone-test-mvit' || b.name.toLowerCase().includes('mvit');
      if (aIsMvit && !bIsMvit) return -1;
      if (!aIsMvit && bIsMvit) return 1;
      return a.distanceKm - b.distanceKm;
    });
  }, [enrichedPlaces, selectedCategory, searchQuery]);

  // Start Real Road Turn-by-Turn Navigation (OSRM street grid geometry)
  const handleStartDirections = async (place: CityPlace) => {
    try {
      const roadRoute = await fetchRoadRoute(userCoords, place.coordinates);
      const session = createNavigationSession(place, userCoords, roadRoute);
      setNavigationSession(session);
      setSelectedPlace(place);
    } catch (err) {
      const fallbackSession = createNavigationSession(place, userCoords);
      setNavigationSession(fallbackSession);
      setSelectedPlace(place);
    }
  };

  // Find nearest legal parking bay when user is warned about No Parking zone
  const handleNavigateNearestLegalParking = () => {
    const legalParking = enrichedPlaces.find(
      (p) => p.category === 'PARKING_SMART' || p.category === 'PARKING_FREE'
    );
    if (legalParking) {
      setNoParkingDismissed(true);
      handleStartDirections(legalParking);
    }
  };

  // Open Live OpenCV Camera Modal
  const handleOpenCam = (place: CityPlace) => {
    const matchedZone = REAL_PUDUCHERRY_ZONES.find((z) => z.id === place.id) || {
      id: place.id,
      name: place.name,
      streetName: place.streetName,
      area: place.area,
      coordinates: place.coordinates,
      type: 'PARKING_GREEN',
      category: place.category === 'PARKING_FREE' ? 'FREE_CIVIC' : 'GOVT_MUNICIPAL',
      totalSlots: place.totalSlots || 40,
      occupiedSlots: place.occupiedSlots || 12,
      isFull: place.isFull || false,
    } as ParkingZone;

    setSelectedCamZone(matchedZone);
    setCameraModalVisible(true);
  };

  const isNoParkingActive = Boolean(
    selectedPlace && selectedPlace.category === 'NO_PARKING' && !noParkingDismissed
  );

  return (
    <View style={styles.container}>
      {/* 1. Full-Screen Google Maps Vector / Tile View with Road Polyline & Floating SOS */}
      <GoogleMapView
        places={filteredPlaces}
        selectedPlace={selectedPlace}
        onSelectPlace={(p) => {
          setSelectedPlace(p);
          if (p.category === 'NO_PARKING') {
            setNoParkingDismissed(false);
          }
          setDetailsModalVisible(true);
        }}
        userCoords={userCoords}
        navigationSession={navigationSession}
        showAmbulanceAlert={true}
        onOpenSos={() => setEmergencyModalVisible(true)}
      />

      {/* 2. No Parking 5-Minute Warning Countdown Banner (When user stops or views Red Zone) */}
      <NoParkingTimerBanner
        visible={isNoParkingActive}
        zoneName={selectedPlace?.name || 'Restricted Tow-Away Red Zone'}
        onNavigateNearestParking={handleNavigateNearestLegalParking}
        onDismiss={() => setNoParkingDismissed(true)}
      />

      {/* 3. Floating Google Maps Search Bar & Category Pills (Hidden while in Navigation HUD) */}
      {!navigationSession && (
        <GoogleSearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (cat === 'EMERGENCY') {
              setEmergencyModalVisible(true);
              return;
            }
            // Auto focus closest matching place
            const match = enrichedPlaces.find((p) => cat === 'ALL' || p.category === cat);
            if (match) setSelectedPlace(match);
          }}
          onOpenEmergency={() => setEmergencyModalVisible(true)}
          weatherText="28°C Good Air"
        />
      )}

      {/* 4. Slide-Up Nearby Sheet & Explore Puducherry Peek Bar (Matching Image 3 & 4) */}
      {!navigationSession && (
        <NearbySlideUpSheet
          places={filteredPlaces}
          selectedPlaceId={selectedPlace?.id}
          onSelectPlace={(place) => {
            setSelectedPlace(place);
            if (place.category === 'NO_PARKING') {
              setNoParkingDismissed(false);
            }
          }}
          onStartDirections={handleStartDirections}
          onOpenCam={handleOpenCam}
          onOpenDetails={(place) => {
            setSelectedPlace(place);
            setDetailsModalVisible(true);
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (cat === 'EMERGENCY') {
              setEmergencyModalVisible(true);
              return;
            }
            const match = enrichedPlaces.find((p) => cat === 'ALL' || p.category === cat);
            if (match) setSelectedPlace(match);
          }}
        />
      )}

      {/* 5. Turn-by-Turn Navigation HUD (When user taps Directions) */}
      {navigationSession && (
        <TurnByTurnNavigationHUD
          session={navigationSession}
          onEndNavigation={() => setNavigationSession(null)}
        />
      )}

      {/* 6. Google Maps Place Details Sheet with Directions, Live Cam & Nearby Amenities */}
      <PlaceDetailsModal
        visible={detailsModalVisible}
        place={selectedPlace}
        onClose={() => setDetailsModalVisible(false)}
        onStartDirections={handleStartDirections}
        onOpenCam={handleOpenCam}
        allPlaces={enrichedPlaces}
        onSelectPlace={(p) => setSelectedPlace(p)}
      />

      {/* 7. Emergency Assistance Modal with 108/100 and Live Responder Radar */}
      <EmergencyAssistanceModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        userCoords={userCoords}
      />

      {/* 8. Live OpenCV Camera Modal (Preserves Computer Vision Detection & Cloudflare Tunneling) */}
      <ParkingCameraModal
        visible={cameraModalVisible}
        zone={selectedCamZone}
        onClose={() => setCameraModalVisible(false)}
        onNavigateToBay={(zone) => {
          setCameraModalVisible(false);
          const p = parkingZoneToCityPlace(zone, userCoords);
          handleStartDirections(p);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e5e3df',
  },
});
