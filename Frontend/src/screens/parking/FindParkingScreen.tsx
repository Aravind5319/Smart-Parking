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
} from '../../services/cityPlacesService';
import { REAL_PUDUCHERRY_ZONES, ParkingZone } from '../../services/parkingService';
import { AppwriteDb } from '../../services/appwriteDb';
import { GoogleSearchHeader, CategoryFilterType } from '../../components/map/GoogleSearchHeader';
import { GoogleMapView } from '../../components/map/GoogleMapView';
import { SwipablePlacesCarousel } from '../../components/map/SwipablePlacesCarousel';
import { TurnByTurnNavigationHUD } from '../../components/map/TurnByTurnNavigationHUD';
import { PlaceDetailsModal } from '../../components/map/PlaceDetailsModal';
import { EmergencyAssistanceModal } from '../../components/emergency/EmergencyAssistanceModal';
import { ParkingCameraModal } from '../../components/parking/ParkingCameraModal';

export const FindParkingScreen: React.FC = () => {
  // Places & Filter States
  const [places, setPlaces] = useState<CityPlace[]>(PUDUCHERRY_CITY_PLACES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<CityPlace | null>(PUDUCHERRY_CITY_PLACES[0]);

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
          const appwritePlaces = realZones.map(parkingZoneToCityPlace);
          // Merge with static toilets, fuel, ATMs
          const nonParking = PUDUCHERRY_CITY_PLACES.filter(
            (p) => p.category !== 'PARKING_SMART' && p.category !== 'PARKING_FREE' && p.category !== 'NO_PARKING'
          );
          setPlaces([...appwritePlaces, ...nonParking]);
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

  // Filtered Places based on Category Pill and Search Query
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
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
  }, [places, selectedCategory, searchQuery]);

  // Start Turn-by-Turn Navigation (Matching Screen 2 of Image 2)
  const handleStartDirections = (place: CityPlace) => {
    const session = createNavigationSession(place, userCoords);
    setNavigationSession(session);
    setSelectedPlace(place);
  };

  // Open Live OpenCV Camera Modal
  const handleOpenCam = (place: CityPlace) => {
    // Match to corresponding ParkingZone
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

  return (
    <View style={styles.container}>
      {/* 1. Full-Screen Google Maps Vector / Tile View */}
      <GoogleMapView
        places={filteredPlaces}
        selectedPlace={selectedPlace}
        onSelectPlace={(p) => {
          setSelectedPlace(p);
          setDetailsModalVisible(true);
        }}
        userCoords={userCoords}
        navigationSession={navigationSession}
        showAmbulanceAlert={true}
      />

      {/* 2. Floating Google Maps Search Bar & Category Pills (Hidden while in Navigation HUD) */}
      {!navigationSession && (
        <GoogleSearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            // Auto focus top matching place
            const match = places.find((p) => cat === 'ALL' || p.category === cat);
            if (match) setSelectedPlace(match);
          }}
          onOpenEmergency={() => setEmergencyModalVisible(true)}
          weatherText="28°C Good Air"
        />
      )}

      {/* 3. Swipable Horizontal Cards Carousel (Hidden while in Navigation HUD) */}
      {!navigationSession && (
        <SwipablePlacesCarousel
          places={filteredPlaces}
          selectedPlaceId={selectedPlace?.id}
          onSelectPlace={(place) => setSelectedPlace(place)}
          onStartDirections={handleStartDirections}
          onOpenCam={handleOpenCam}
          onOpenDetails={(place) => {
            setSelectedPlace(place);
            setDetailsModalVisible(true);
          }}
        />
      )}

      {/* 4. Turn-by-Turn Navigation HUD (When user taps Directions) */}
      {navigationSession && (
        <TurnByTurnNavigationHUD
          session={navigationSession}
          onEndNavigation={() => setNavigationSession(null)}
        />
      )}

      {/* 5. Google Maps Place Details Sheet (Matching Screen 3 of Image 2) */}
      <PlaceDetailsModal
        visible={detailsModalVisible}
        place={selectedPlace}
        onClose={() => setDetailsModalVisible(false)}
        onStartDirections={handleStartDirections}
        onOpenCam={handleOpenCam}
      />

      {/* 6. Emergency Assistance Modal (Matching Screen 6 of Image 2) */}
      <EmergencyAssistanceModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        userCoords={userCoords}
      />

      {/* 7. Live OpenCV Camera Modal (Preserves Computer Vision Detection & Cloudflare Tunneling) */}
      <ParkingCameraModal
        visible={cameraModalVisible}
        zone={selectedCamZone}
        onClose={() => setCameraModalVisible(false)}
        onNavigateToBay={(zone) => {
          setCameraModalVisible(false);
          const p = parkingZoneToCityPlace(zone);
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
