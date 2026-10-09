// ============================================================================
// PARKING & NO-PARKING ZONE SERVICE
// Mocking Appwrite backend functionality
// ============================================================================

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface ParkingZone {
  id: string;
  name: string;
  streetName: string;
  coordinates: LocationCoordinates;
  type: 'PARKING_GREEN' | 'NO_PARKING_RED';
  totalSlots?: number;
  occupiedSlots?: number;
  isFull?: boolean;
  hourlyRate?: string;
  walkingTimeMin?: number;
  distanceKm?: number;
}

export let MOCK_PARKING_ZONES: ParkingZone[] = [];

export const fetchRealParkingZones = async (): Promise<ParkingZone[]> => {
  try {
    // Puducherry Bounding Box
    const query = `[out:json];
    (
      node["amenity"="parking"](11.91,79.81,11.95,79.84);
      way["amenity"="parking"](11.91,79.81,11.95,79.84);
    );
    out center;`;
    
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();

    const zones: ParkingZone[] = [];
    
    data.elements.forEach((el: any) => {
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      
      if (!lat || !lon) return;

      const name = el.tags?.name || 'Authorized Parking Zone';
      const capacityStr = el.tags?.capacity;
      const capacity = capacityStr ? parseInt(capacityStr, 10) : Math.floor(Math.random() * 40) + 10;
      
      // Pseudo-random occupancy
      const occupied = Math.floor(Math.random() * capacity);
      
      zones.push({
        id: `osm-${el.id}`,
        name: name,
        streetName: el.tags?.['addr:street'] || name,
        coordinates: { latitude: lat, longitude: lon },
        type: 'PARKING_GREEN',
        totalSlots: capacity,
        occupiedSlots: occupied,
        isFull: occupied >= capacity,
        hourlyRate: '₹20/hr',
        walkingTimeMin: Math.floor(Math.random() * 10) + 1,
        distanceKm: parseFloat((Math.random() * 2).toFixed(1)),
      });
    });

    // Add some synthetic red zones for violation demo
    zones.push({
      id: 'red-1',
      name: 'Rock Beach Promenade',
      streetName: 'Goubert Avenue',
      coordinates: { latitude: 11.9310, longitude: 79.8350 },
      type: 'NO_PARKING_RED',
    });
    
    MOCK_PARKING_ZONES = zones;
    return zones;
  } catch (error) {
    console.error('Error fetching real parking data:', error);
    return MOCK_PARKING_ZONES; // Fallback
  }
};

export const getDistance = (loc1: LocationCoordinates, loc2: LocationCoordinates) => {
  // Very rough distance for mock purposes
  const dx = loc1.latitude - loc2.latitude;
  const dy = loc1.longitude - loc2.longitude;
  return Math.sqrt(dx * dx + dy * dy) * 111; // rough km conversion
};

export const getNearestAvailableParking = (targetLocation: LocationCoordinates, excludeId?: string): ParkingZone | null => {
  const available = MOCK_PARKING_ZONES.filter(
    z => z.type === 'PARKING_GREEN' && !z.isFull && z.id !== excludeId
  );
  if (available.length === 0) return null;

  return available.sort((a, b) => getDistance(targetLocation, a.coordinates) - getDistance(targetLocation, b.coordinates))[0];
};

export const reportViolationEvent = async (userId: string, zoneName: string, location: LocationCoordinates, durationMins: number) => {
  // Simulate backend API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[BACKEND EVENT] Violation detected! User: ${userId}, Zone: ${zoneName}, Duration: ${durationMins}m`);
      resolve({ success: true, eventId: 'evt-' + Math.random().toString(36).substring(7) });
    }, 1000);
  });
};
