// ============================================================================
// PARKPUDUVAI SMART PARKING & NO-PARKING ZONE SERVICE
// Puducherry Police Traffic Command, IoT Sensor Engine & Trip Guidance
// ============================================================================

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export type ParkingCategory = 'FREE_CIVIC' | 'GOVT_MUNICIPAL' | 'RESTRICTED';

export interface ParkingZone {
  id: string;
  name: string;
  streetName: string;
  area: string;
  coordinates: LocationCoordinates;
  type: 'PARKING_GREEN' | 'NO_PARKING_RED';
  category: ParkingCategory;
  totalSlots?: number;
  occupiedSlots?: number;
  isFull?: boolean;
  hourlyRate?: string;
  walkingTimeMin?: number;
  distanceKm?: number;
  vehicleTypes?: string[];
  enforcementNotes?: string;
  // Hardware & IoT Sensor Status
  sensorType?: string;
  sensorStatus?: string;
  lastHardwarePingSec?: number;
  // Traffic flow status to reach this zone
  trafficLevel?: 'SMOOTH' | 'MODERATE' | 'CONGESTED';
  trafficDelayMin?: number;
  imageKey?: string;
  imageUrl?: string;
}

export interface TripPlanSuggestion {
  id: string;
  name: string;
  iconName: string;
  stops: string[];
  recommendedZoneId: string;
  guidanceNotes: string;
}

// Verified Puducherry Parking Facilities
export const REAL_PUDUCHERRY_ZONES: ParkingZone[] = [
  {
    id: 'zone-test-mvit',
    name: 'Test 1 - MVIT Parking',
    streetName: 'Kalitheerthalkuppam, NH-45A Villupuram Main Road',
    area: 'MVIT Campus Gate & Engineering Quad',
    coordinates: { latitude: 11.9226, longitude: 79.6269 },
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 50,
    occupiedSlots: 15,
    isFull: false,
    hourlyRate: 'FREE (Campus Smart Gate)',
    walkingTimeMin: 1,
    distanceKm: 0.2,
    vehicleTypes: ['4-Wheeler', '2-Wheeler'],
    enforcementNotes: 'Live Optical OpenCV Smart Camera Deployed (Gate & Fence Sensor)',
    sensorType: 'Hardware Trueview Wi-Fi / Cloudflare Stream (Active Cam)',
    sensorStatus: 'Active Live Hardware Camera Stream',
    lastHardwarePingSec: 1,
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 0,
    imageUrl: 'https://mvit.edu.in/wp-content/images/photo/8.jpg',
  },
  {
    id: 'zone-mission-st',
    name: 'Mission Street Authorized Kerb Parking',
    streetName: 'Mission Street',
    area: 'Heritage Commercial Corridor',
    coordinates: { latitude: 11.9348, longitude: 79.8295 },
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 35,
    occupiedSlots: 14,
    isFull: false,
    hourlyRate: 'FREE (2h Civic Limit)',
    walkingTimeMin: 3,
    distanceKm: 0.8,
    vehicleTypes: ['2-Wheeler', '4-Wheeler'],
    enforcementNotes: 'Marked white bays. Angle parking only.',
    sensorType: 'ANPR Pole Camera 02 & Magnetic In-Ground Sensors',
    sensorStatus: 'Active (99.8% precision)',
    lastHardwarePingSec: 5,
    trafficLevel: 'MODERATE',
    trafficDelayMin: 2,
  },
  {
    id: 'zone-white-town',
    name: 'White Town Kerb Parking',
    streetName: 'Rue Romain Rolland',
    area: 'French Quarter Heritage Zone',
    coordinates: { latitude: 11.9325, longitude: 79.8338 },
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 20,
    occupiedSlots: 17,
    isFull: false,
    hourlyRate: '₹20/hr (Municipal Receipt)',
    walkingTimeMin: 2,
    distanceKm: 0.4,
    vehicleTypes: ['4-Wheeler', '2-Wheeler'],
    enforcementNotes: 'Parallel kerb parking. CCTV sensor monitored.',
    sensorType: 'ANPR Cam 07 + Ultrasonic Kerb Node',
    sensorStatus: 'Active (3 spots remaining)',
    lastHardwarePingSec: 3,
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 0,
  },
  {
    id: 'zone-rock-beach-north',
    name: 'Rock Beach North Bay Parking',
    streetName: 'Rue Saint Gilles / Goubert Ave Ext.',
    area: 'Promenade Waterfront North',
    coordinates: { latitude: 11.9360, longitude: 79.8355 },
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 25,
    occupiedSlots: 19,
    isFull: false,
    hourlyRate: 'FREE (Beach Access Bay)',
    walkingTimeMin: 1,
    distanceKm: 0.5,
    vehicleTypes: ['2-Wheeler', '4-Wheeler'],
    enforcementNotes: 'High tourist turnover. Wardens on duty.',
    sensorType: 'ANPR Cam 01 (Waterfront Pole)',
    sensorStatus: 'Live Video Feed Active',
    lastHardwarePingSec: 8,
    trafficLevel: 'CONGESTED',
    trafficDelayMin: 5,
  },
  {
    id: 'zone-bharathi-park',
    name: 'Bharathi Park Peripheral Lot',
    streetName: 'Rue Suffren',
    area: 'Government & Cultural Enclave',
    coordinates: { latitude: 11.9315, longitude: 79.8340 },
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 30,
    occupiedSlots: 8,
    isFull: false,
    hourlyRate: '₹20/hr',
    walkingTimeMin: 2,
    distanceKm: 0.6,
    vehicleTypes: ['4-Wheeler', '2-Wheeler'],
    enforcementNotes: 'Shaded municipal slots. CCTV active.',
    sensorType: 'Automated Boom Barrier + Ground Loop Sensors',
    sensorStatus: 'Sensors Online (22 vacant)',
    lastHardwarePingSec: 2,
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 0,
  },
  {
    id: 'zone-jn-street',
    name: 'JN Street Commercial Kerb',
    streetName: 'Jawaharlal Nehru Street',
    area: 'Shopping & Textile District',
    coordinates: { latitude: 11.9372, longitude: 79.8268 },
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 40,
    occupiedSlots: 40,
    isFull: true,
    hourlyRate: '₹20/hr',
    walkingTimeMin: 6,
    distanceKm: 1.4,
    vehicleTypes: ['2-Wheeler', '4-Wheeler'],
    enforcementNotes: 'Zero vacancies. Smart redirection active.',
    sensorType: 'Overhead Optical Flow Sensor Pole 08',
    sensorStatus: 'Capacity Exceeded - Redirection Triggered',
    lastHardwarePingSec: 4,
    trafficLevel: 'CONGESTED',
    trafficDelayMin: 6,
  },
  {
    id: 'zone-old-port',
    name: 'Old Port High-Capacity Facility',
    streetName: 'Goubert Avenue South',
    area: 'South Promenade Port Gate',
    coordinates: { latitude: 11.9265, longitude: 79.8345 },
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 60,
    occupiedSlots: 18,
    isFull: false,
    hourlyRate: '₹30/day (High Capacity Lot)',
    walkingTimeMin: 7,
    distanceKm: 1.1,
    vehicleTypes: ['Tourist Buses', '4-Wheeler', '2-Wheeler'],
    enforcementNotes: 'Designated peripheral lot with shuttle access.',
    sensorType: 'Smart Gate ANPR Barcode Scanner',
    sensorStatus: 'High Availability (42 spots vacant)',
    lastHardwarePingSec: 6,
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 1,
  },
  {
    id: 'zone-bussy-st',
    name: 'Bussy Street Municipal Bike Bay',
    streetName: 'Bussy Street',
    area: 'Boulevard Town West',
    coordinates: { latitude: 11.9310, longitude: 79.8275 },
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 28,
    occupiedSlots: 16,
    isFull: false,
    hourlyRate: 'FREE (Two-Wheeler Priority)',
    walkingTimeMin: 5,
    distanceKm: 0.9,
    vehicleTypes: ['2-Wheeler'],
    enforcementNotes: 'Two-wheeler exclusive bays. Tow-away for four-wheelers.',
    sensorType: 'Kerb Magnetometer Sensor Array',
    sensorStatus: 'Active (12 bike slots available)',
    lastHardwarePingSec: 9,
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 1,
  },

  // STRICT RESTRICTED / TOW-AWAY RED ZONES
  {
    id: 'red-gourbert-promenade',
    name: 'Rock Beach Goubert Promenade',
    streetName: 'Goubert Avenue Waterfront',
    area: 'Waterfront Pedestrian Promenade',
    coordinates: { latitude: 11.9330, longitude: 79.8358 },
    type: 'NO_PARKING_RED',
    category: 'RESTRICTED',
    enforcementNotes: 'Strict No-Vehicle Zone between 5:00 PM – 6:00 AM. Zero tolerance crane tow-away.',
    sensorType: 'CCTV ANPR PTZ Dome Cameras 01 & 02',
    sensorStatus: 'Active Violation Monitoring',
    trafficLevel: 'CONGESTED',
  },
  {
    id: 'red-raj-nivas',
    name: 'Raj Nivas & High Court Perimeter',
    streetName: 'Rue Dumas / Rue Rangapillai Cross',
    area: 'VVIP High Security Zone',
    coordinates: { latitude: 11.9320, longitude: 79.8348 },
    type: 'NO_PARKING_RED',
    category: 'RESTRICTED',
    enforcementNotes: 'VVIP Enclave. Immediate automated fine & municipal crane towing.',
    sensorType: 'Police Security Cam ANPR Feed',
    sensorStatus: 'Zero-Tolerance Strict Enforcement',
    trafficLevel: 'SMOOTH',
  },
  {
    id: 'red-clock-tower',
    name: 'Clock Tower Junction Bus Turnaround',
    streetName: 'Mahatma Gandhi Rd Junction',
    area: 'Grand Bazaar Transit Node',
    coordinates: { latitude: 11.9385, longitude: 79.8285 },
    type: 'NO_PARKING_RED',
    category: 'RESTRICTED',
    enforcementNotes: 'Emergency ambulance & city bus corridor. Tow-away in effect.',
    sensorType: 'Traffic Control Radar Camera',
    sensorStatus: 'Obstruction Auto-Detection Active',
    trafficLevel: 'CONGESTED',
  },
];

// Pre-configured citizen & tourist multi-stop trip plans
export const POPULAR_TRIP_PLANS: TripPlanSuggestion[] = [
  {
    id: 'plan-beach-leisure',
    name: 'Beach Walk & Seaside Dining',
    iconName: 'BEACH',
    stops: ['Rock Beach Promenade', 'Le Cafe Waterfront', 'Gandhi Statue'],
    recommendedZoneId: 'zone-rock-beach-north',
    guidanceNotes: 'Avoids Goubert Ave vehicle curfew. Park at North Bay and walk 1 min straight to the promenade.',
  },
  {
    id: 'plan-french-quarter',
    name: 'Heritage Quarter & Cafes',
    iconName: 'MONUMENT',
    stops: ['Hotel Promenade', 'Alliance Française', 'Cafe des Arts'],
    recommendedZoneId: 'zone-white-town',
    guidanceNotes: 'Rue Romain Rolland provides direct shaded walking access to French Quarter villas.',
  },
  {
    id: 'plan-shopping-spree',
    name: 'Grand Bazaar & JN St Shopping',
    iconName: 'SHOPPING',
    stops: ['Mission Street Textiles', 'Casbah', 'JN Street Bazaar'],
    recommendedZoneId: 'zone-mission-st',
    guidanceNotes: 'Mission St Kerb offers 2 hours of free civic parking right at the commercial entrance.',
  },
  {
    id: 'plan-multi-stop-tourist',
    name: 'Full Day: Hotel -> Beach -> Theater',
    iconName: 'MULTI',
    stops: ['Promenade Hotel', 'Rock Beach', 'Alliance Cinema / Theater'],
    recommendedZoneId: 'zone-bharathi-park',
    guidanceNotes: 'Centrally anchored at Bharathi Park! Equidistant (2-4 min walk) to your hotel, beach, and theater without reparking.',
  },
];

export let MOCK_PARKING_ZONES: ParkingZone[] = [];

export const updateLiveParkingZones = (newZones: ParkingZone[]) => {
  MOCK_PARKING_ZONES = [...newZones];
};

export const fetchRealParkingZones = async (): Promise<ParkingZone[]> => {
  return MOCK_PARKING_ZONES;
};

export const getDistance = (loc1: LocationCoordinates, loc2: LocationCoordinates) => {
  const dx = (loc1.latitude - loc2.latitude) * 111;
  const dy = (loc1.longitude - loc2.longitude) * 111 * Math.cos((loc1.latitude * Math.PI) / 180);
  return parseFloat(Math.sqrt(dx * dx + dy * dy).toFixed(2));
};

export const getNearestAvailableParking = (
  targetLocation: LocationCoordinates,
  sourceZones?: ParkingZone[],
  vehicleType: 'CAR' | 'BIKE' = 'CAR'
): ParkingZone | null => {
  const list = sourceZones && sourceZones.length > 0 ? sourceZones : MOCK_PARKING_ZONES;
  const targetType = vehicleType === 'BIKE' ? '2-Wheeler' : '4-Wheeler';

  const available = list.filter((z) => {
    const allowed = z.vehicleTypes || (z.name && z.name.toLowerCase().includes('bike') ? ['2-Wheeler'] : ['4-Wheeler', '2-Wheeler']);
    const isFull = z.isFull ?? ((z.occupiedSlots ?? 0) >= (z.totalSlots ?? 20));
    return z.type === 'PARKING_GREEN' && !isFull && allowed.includes(targetType);
  });

  if (available.length === 0) {
    // If none open for exact type, fallback to any green zone with vacancy
    const fallback = list.filter(z => z.type === 'PARKING_GREEN' && !z.isFull);
    if (fallback.length === 0) return list.find(z => z.type === 'PARKING_GREEN') || null;
    return [...fallback].sort((a, b) => getDistance(targetLocation, a.coordinates) - getDistance(targetLocation, b.coordinates))[0];
  }

  return [...available].sort((a, b) => getDistance(targetLocation, a.coordinates) - getDistance(targetLocation, b.coordinates))[0];
};

export const reportViolationEvent = async (userId: string, zoneName: string, location: LocationCoordinates, durationMins: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[PUDUCHERRY POLICE EVENT] Violation Logged! User: ${userId}, Zone: ${zoneName}, Loc: ${location.latitude},${location.longitude}, Duration: ${durationMins}m`);
      resolve({
        success: true,
        eventId: 'PD-VIOL-' + Date.now().toString(36).toUpperCase(),
        timestamp: new Date().toISOString(),
        dispatchAlertSent: true,
      });
    }, 800);
  });
};
