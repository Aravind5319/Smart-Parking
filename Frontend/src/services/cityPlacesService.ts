// ============================================================================
// PUDUCHERRY CITY PLACES & SMART HUB SERVICE
// Google Maps inspired city catalog: Smart Parking, Free Zones, Toilets, Fuel, ATMs & Signals
// ============================================================================

import { CityPlace, PlaceCategory, NavigationSession } from '../types/navigation';
import { ParkingZone, REAL_PUDUCHERRY_ZONES } from './parkingService';

export const PUDUCHERRY_CITY_PLACES: CityPlace[] = [
  // 1. SMART PARKING FACILITIES (WITH CAMERA & LIVE SLOTS)
  {
    id: 'zone-test-mvit',
    name: 'Test 1 - MVIT Smart Parking',
    category: 'PARKING_SMART',
    streetName: 'Kalitheerthalkuppam, NH-45A Villupuram Main Road',
    area: 'MVIT Campus Gate & Engineering Quad',
    coordinates: { latitude: 11.9226, longitude: 79.6269 },
    distanceKm: 0.2,
    walkingTimeMin: 2,
    drivingTimeMin: 1,
    rating: 4.8,
    reviewCount: 95,
    imageUrl: 'https://mvit.edu.in/wp-content/images/photo/8.jpg',
    badgeText: '35 / 50 slots • Live Cam',
    totalSlots: 50,
    occupiedSlots: 15,
    vacantSlots: 35,
    tariff: 'FREE (Campus Smart Gate)',
    amenities: ['Live Hardware OpenCV Cam', 'Gate Entry/Exit Counter', 'Dual-Approach Fence Sensor', 'CCTV Monitored', 'EV Charging'],
    phone: '0413-2643007',
    cameraEnabled: true,
    openHours: 'Open 24/7',
    statusText: 'Active Live Hardware Camera Stream (Trueview / Cloudflare)',
    isFull: false,
  },
  {
    id: 'place-beach-lot',
    name: 'Beach Parking Lot',
    category: 'PARKING_SMART',
    streetName: 'Goubert Avenue / South Beach Road',
    area: 'Rock Beach Promenade, White Town',
    coordinates: { latitude: 11.9338, longitude: 79.8358 },
    distanceKm: 0.4,
    walkingTimeMin: 4,
    drivingTimeMin: 2,
    rating: 4.2,
    reviewCount: 320,
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    badgeText: '28 / 40 slots',
    totalSlots: 40,
    occupiedSlots: 12,
    vacantSlots: 28,
    tariff: '₹20/hr • Public Parking',
    amenities: ['24/7 Access', 'CCTV Monitored', 'Street Lighting', 'Public Toilet Nearby', 'EV Charging'],
    phone: '0413-2231300',
    cameraEnabled: true,
    openHours: 'Open 24/7',
    statusText: 'Available 28 / 40 slots • Updated 2 min ago',
    isFull: false,
  },
  {
    id: 'place-port-facility',
    name: 'Old Port High-Capacity Facility',
    category: 'PARKING_SMART',
    streetName: 'Goubert Avenue South',
    area: 'South Promenade Port Gate',
    coordinates: { latitude: 11.9265, longitude: 79.8345 },
    distanceKm: 1.1,
    walkingTimeMin: 11,
    drivingTimeMin: 4,
    rating: 4.5,
    reviewCount: 185,
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    badgeText: '42 / 60 slots',
    totalSlots: 60,
    occupiedSlots: 18,
    vacantSlots: 42,
    tariff: '₹30/day • Municipal Lot',
    amenities: ['24/7 Access', 'CCTV Monitored', 'Tourist Bus Bays', 'Security Guard'],
    phone: '0413-2231301',
    cameraEnabled: true,
    openHours: 'Open 24/7',
    statusText: 'High Availability (42 spots vacant)',
    isFull: false,
  },
  {
    id: 'place-bharathi-park',
    name: 'Bharathi Park Peripheral Lot',
    category: 'PARKING_SMART',
    streetName: 'Rue Suffren',
    area: 'Government & Cultural Enclave',
    coordinates: { latitude: 11.9315, longitude: 79.8340 },
    distanceKm: 0.6,
    walkingTimeMin: 6,
    drivingTimeMin: 3,
    rating: 4.3,
    reviewCount: 240,
    imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80',
    badgeText: '22 / 30 slots',
    totalSlots: 30,
    occupiedSlots: 8,
    vacantSlots: 22,
    tariff: '₹20/hr • Shaded Lots',
    amenities: ['CCTV Monitored', 'Shaded Trees', 'Boom Barrier', 'Drinking Water'],
    phone: '0413-2231300',
    cameraEnabled: true,
    openHours: '6:00 AM – 10:00 PM',
    statusText: 'Sensors Online (22 vacant)',
    isFull: false,
  },
  {
    id: 'place-mission-street',
    name: 'Mission Street Commercial Kerb',
    category: 'PARKING_SMART',
    streetName: 'Mission Street',
    area: 'Heritage Commercial Corridor',
    coordinates: { latitude: 11.9348, longitude: 79.8295 },
    distanceKm: 0.8,
    walkingTimeMin: 8,
    drivingTimeMin: 4,
    rating: 4.1,
    reviewCount: 410,
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    badgeText: '21 / 35 slots',
    totalSlots: 35,
    occupiedSlots: 14,
    vacantSlots: 21,
    tariff: 'FREE (2h Civic Limit)',
    amenities: ['Angle Parking', 'Wardens on Duty', 'CCTV Monitored'],
    phone: '103',
    cameraEnabled: true,
    openHours: '8:00 AM – 10:00 PM',
    statusText: '21 vacant spots • Angle Parking',
    isFull: false,
  },
  {
    id: 'place-jn-street',
    name: 'JN Street Commercial Kerb',
    category: 'PARKING_SMART',
    streetName: 'Jawaharlal Nehru Street',
    area: 'Shopping & Textile District',
    coordinates: { latitude: 11.9372, longitude: 79.8268 },
    distanceKm: 1.4,
    walkingTimeMin: 14,
    drivingTimeMin: 6,
    rating: 3.8,
    reviewCount: 520,
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    badgeText: 'FULL (0 slots)',
    totalSlots: 40,
    occupiedSlots: 40,
    vacantSlots: 0,
    tariff: '₹20/hr',
    amenities: ['Shopping Access', 'CCTV Monitored'],
    phone: '103',
    cameraEnabled: true,
    openHours: '9:00 AM – 10:00 PM',
    statusText: 'Capacity Exceeded - Redirection Triggered',
    isFull: true,
  },

  // 2. FREE SAFE PARKING ZONES (Not official lots, but 100% legal & safe)
  {
    id: 'place-free-romain-rolland',
    name: 'Rue Romain Rolland Free Kerb',
    category: 'PARKING_FREE',
    streetName: 'Rue Romain Rolland (North End)',
    area: 'French Quarter, White Town',
    coordinates: { latitude: 11.9352, longitude: 79.8335 },
    distanceKm: 0.3,
    walkingTimeMin: 3,
    drivingTimeMin: 2,
    rating: 4.6,
    reviewCount: 95,
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    badgeText: '100% Free Kerb • ~15 Spots',
    totalSlots: 15,
    occupiedSlots: 7,
    vacantSlots: 8,
    tariff: 'FREE (Legal Street Kerb)',
    amenities: ['Wide Tree Shaded Kerb', 'Zero Tow Risk', 'Well Lit at Night', 'Safe Residential Area'],
    openHours: 'Open 24/7',
    statusText: 'Unofficial but Safe & Permitted • No Police Towing',
    isFull: false,
  },
  {
    id: 'place-free-dubrayapet',
    name: 'Dubrayapet Coastal Open Bay',
    category: 'PARKING_FREE',
    streetName: 'Dubrayapet Beach Road',
    area: 'South Promenade Extension',
    coordinates: { latitude: 11.9215, longitude: 79.8320 },
    distanceKm: 1.5,
    walkingTimeMin: 15,
    drivingTimeMin: 5,
    rating: 4.4,
    reviewCount: 68,
    imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
    badgeText: '100% Free Open Space • ~30 Spots',
    totalSlots: 30,
    occupiedSlots: 11,
    vacantSlots: 19,
    tariff: 'FREE (Open Ground)',
    amenities: ['High Capacity Open Ground', 'Free for Cars & Bikes', 'Ocean Breeze'],
    openHours: 'Open 24/7',
    statusText: 'Free Spacious Peripheral Ground',
    isFull: false,
  },
  {
    id: 'place-free-colas-nagar',
    name: 'Colas Nagar Wide Avenue Kerb',
    category: 'PARKING_FREE',
    streetName: 'Colas Nagar Main Road',
    area: 'Colas Nagar Waterfront Side',
    coordinates: { latitude: 11.9240, longitude: 79.8290 },
    distanceKm: 1.2,
    walkingTimeMin: 12,
    drivingTimeMin: 4,
    rating: 4.3,
    reviewCount: 42,
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    badgeText: '100% Free Kerb • ~20 Spots',
    totalSlots: 20,
    occupiedSlots: 9,
    vacantSlots: 11,
    tariff: 'FREE (Wide Road Kerb)',
    amenities: ['Parallel Kerb Parking', 'Quiet Area', 'Free 24/7'],
    openHours: 'Open 24/7',
    statusText: 'Legal Free Street Bay',
    isFull: false,
  },

  // 3. STRICT NO PARKING / TOW-AWAY RED ZONES
  {
    id: 'place-no-park-goubert',
    name: 'Rock Beach Goubert Promenade',
    category: 'NO_PARKING',
    streetName: 'Goubert Avenue Promenade',
    area: 'Waterfront Pedestrian Zone',
    coordinates: { latitude: 11.9330, longitude: 79.8358 },
    distanceKm: 0.3,
    walkingTimeMin: 3,
    drivingTimeMin: 2,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    badgeText: 'STRICT NO PARKING • TOW ZONE',
    tariff: 'Penalty ₹1,500 + Towing',
    enforcementNotice: 'Vehicle Curfew between 5:00 PM – 6:00 AM. Zero tolerance hydraulic crane towing.',
    openHours: 'No Vehicles Allowed 5 PM - 6 AM',
    statusText: 'Active Hydraulic Tow Crane Patrolling',
  },
  {
    id: 'place-no-park-raj-nivas',
    name: 'Raj Nivas & High Court Perimeter',
    category: 'NO_PARKING',
    streetName: 'Rue Dumas / Rangapillai Cross',
    area: 'VVIP High Security Enclave',
    coordinates: { latitude: 11.9320, longitude: 79.8348 },
    distanceKm: 0.5,
    walkingTimeMin: 5,
    drivingTimeMin: 2,
    badgeText: 'VVIP ZONE • INSTANT FINE',
    tariff: 'Penalty ₹2,000 + Impound',
    enforcementNotice: 'VVIP Enclave. Automated license plate capture & immediate impounding.',
    openHours: 'Strict 24/7 No Parking',
    statusText: 'ANPR High-Def Police Enforcement Cameras',
  },
  {
    id: 'place-no-park-clock-tower',
    name: 'Clock Tower Bus Turnaround Choke',
    category: 'NO_PARKING',
    streetName: 'Mahatma Gandhi Road Junction',
    area: 'Grand Bazaar Transit Node',
    coordinates: { latitude: 11.9385, longitude: 79.8285 },
    distanceKm: 1.1,
    walkingTimeMin: 11,
    drivingTimeMin: 5,
    badgeText: 'EMERGENCY CORRIDOR • NO STOPPING',
    tariff: 'Penalty ₹1,000 + Towing',
    enforcementNotice: 'Designated Ambulance & Public Bus Transit Route. Tow-away enforced 24/7.',
    openHours: 'Strict 24/7 Red Kerb',
    statusText: 'Live Bus & Ambulance Route Obstruction Monitoring',
  },

  // 4. PUBLIC TOILETS & RESTROOMS (PAID & CLEAN)
  {
    id: 'place-toilet-rock-beach',
    name: 'Rock Beach Public Toilet',
    category: 'TOILET',
    streetName: 'Goubert Avenue (Near Gandhi Statue)',
    area: 'Promenade Beach Center',
    coordinates: { latitude: 11.9332, longitude: 79.8354 },
    distanceKm: 0.3,
    walkingTimeMin: 4,
    drivingTimeMin: 2,
    rating: 4.4,
    reviewCount: 210,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Clean & Sanitized • ₹5',
    tariff: '₹5 Entry • Smart Card & UPI',
    amenities: ['Open 24/7', 'Wheelchair Accessible', 'Soap & Water Tap', 'Sanitary Pad Dispenser', 'Baby Care Room'],
    openHours: 'Open 24/7',
    statusText: 'Verified Clean by Smart City Swachh Team',
  },
  {
    id: 'place-toilet-bharathi-park',
    name: 'Bharathi Park Restroom Complex',
    category: 'TOILET',
    streetName: 'Rue Saint Louis (Inside Bharathi Park)',
    area: 'White Town Central Park',
    coordinates: { latitude: 11.9318, longitude: 79.8335 },
    distanceKm: 0.5,
    walkingTimeMin: 6,
    drivingTimeMin: 3,
    rating: 4.2,
    reviewCount: 145,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Park Restroom • ₹5',
    tariff: '₹5 (Municipal Clean)',
    amenities: ['Attendant on Duty', 'Running Water', 'Disability Ramp', 'Green Shaded Garden'],
    openHours: '6:00 AM – 10:00 PM',
    statusText: 'Cleaned Hourly by Municipal Attendants',
  },
  {
    id: 'place-toilet-french-colony',
    name: 'French Colony Heritage Public Toilet',
    category: 'TOILET',
    streetName: 'Rue Romain Rolland',
    area: 'French Quarter Heritage Zone',
    coordinates: { latitude: 11.9340, longitude: 79.8330 },
    distanceKm: 0.6,
    walkingTimeMin: 7,
    drivingTimeMin: 3,
    rating: 4.5,
    reviewCount: 190,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Premium Sanitized • ₹10',
    tariff: '₹10 (Air Conditioned & Sanitized)',
    amenities: ['Air Conditioned', 'Paper Towels', 'Western Toilets', 'Contactless Faucets'],
    openHours: 'Open 24/7',
    statusText: 'Premium Tourist Restroom Facility',
  },
  {
    id: 'place-toilet-goubert-north',
    name: 'Goubert Avenue North Toilet',
    category: 'TOILET',
    streetName: 'North Goubert Avenue Extension',
    area: 'Near French War Memorial',
    coordinates: { latitude: 11.9362, longitude: 79.8350 },
    distanceKm: 0.8,
    walkingTimeMin: 9,
    drivingTimeMin: 4,
    rating: 4.1,
    reviewCount: 88,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Beach Side Toilet • ₹5',
    tariff: '₹5 (Beach Visitors)',
    amenities: ['Foot Shower for Beach Sand', 'Running Water', 'Wheelchair Access'],
    openHours: '6:00 AM – 11:00 PM',
    statusText: 'Convenient Beach Foot-wash & Restroom',
  },
  {
    id: 'place-toilet-bus-stand',
    name: 'New Bus Stand Municipal Complex',
    category: 'TOILET',
    streetName: 'Maraimalai Adigal Salai',
    area: 'Central Bus Terminal',
    coordinates: { latitude: 11.9280, longitude: 79.8180 },
    distanceKm: 2.1,
    walkingTimeMin: 22,
    drivingTimeMin: 8,
    rating: 3.7,
    reviewCount: 340,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Free & Paid Bays • 24/7',
    tariff: 'FREE (Govt) / ₹5 (Deluxe)',
    amenities: ['Open 24/7', 'High Capacity', 'Bathing Cubicles available'],
    openHours: 'Open 24/7',
    statusText: 'High Capacity Transit Facility',
  },

  // 5. PETROL / FUEL STATIONS
  {
    id: 'place-fuel-indianoil',
    name: 'Indian Oil Petrol Pump - Cuddalore Rd',
    category: 'FUEL',
    streetName: 'Cuddalore Main Road',
    area: 'South Boulevard Exit',
    coordinates: { latitude: 11.9250, longitude: 79.8260 },
    distanceKm: 0.9,
    walkingTimeMin: 10,
    drivingTimeMin: 3,
    rating: 4.4,
    reviewCount: 310,
    imageUrl: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Open 24/7 • Free Nitrogen Air',
    tariff: 'Petrol ₹108.20 • Diesel ₹94.10',
    amenities: ['Free Tyre Air', 'UPI & Card Accepted', 'Clean Restrooms', 'Engine Oil'],
    openHours: 'Open 24/7',
    statusText: 'Active Pumps • Fast Queue',
  },
  {
    id: 'place-fuel-hp',
    name: 'HP Auto Care Petrol Pump - Anna Salai',
    category: 'FUEL',
    streetName: 'Anna Salai',
    area: 'Heritage Center Corridor',
    coordinates: { latitude: 11.9360, longitude: 79.8240 },
    distanceKm: 1.2,
    walkingTimeMin: 13,
    drivingTimeMin: 4,
    rating: 4.3,
    reviewCount: 225,
    imageUrl: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Open 24/7 • Fuel & EV Charging',
    tariff: 'Petrol ₹108.20 • EV Fast Charger',
    amenities: ['EV 60kW DC Fast Charger', 'Tyre Pressure Check', 'Convenience Store'],
    openHours: 'Open 24/7',
    statusText: 'Dual Fuel & EV Fast Charge Station',
  },

  // 6. 24/7 ATMS
  {
    id: 'place-atm-sbi',
    name: 'State Bank of India 24/7 ATM & CDM',
    category: 'ATM',
    streetName: 'Rue Suffren Cross',
    area: 'White Town Core',
    coordinates: { latitude: 11.9328, longitude: 79.8332 },
    distanceKm: 0.3,
    walkingTimeMin: 3,
    drivingTimeMin: 1,
    rating: 4.5,
    reviewCount: 160,
    badgeText: 'Cash Available • ₹500 & ₹100 Notes',
    tariff: 'Zero Fee for SBI Users',
    amenities: ['Air Conditioned', 'CCTV Security Guard', 'Cash Deposit Machine (CDM)'],
    openHours: 'Open 24/7',
    statusText: 'High Cash Availability • No Line',
  },
  {
    id: 'place-atm-hdfc',
    name: 'HDFC Bank 24/7 ATM',
    category: 'ATM',
    streetName: 'Mission Street Center',
    area: 'Grand Bazaar Entrance',
    coordinates: { latitude: 11.9355, longitude: 79.8290 },
    distanceKm: 0.7,
    walkingTimeMin: 7,
    drivingTimeMin: 3,
    rating: 4.3,
    reviewCount: 110,
    badgeText: '24/7 Cash Available',
    tariff: 'All Bank Cards Accepted',
    amenities: ['Air Conditioned', 'Security Guard'],
    openHours: 'Open 24/7',
    statusText: 'Cash Dispenser Online',
  },

  // 7. REAL-TIME TRAFFIC SIGNALS & MONITORING
  {
    id: 'place-signal-rajiv-gandhi',
    name: 'Rajiv Gandhi Signal',
    category: 'SIGNAL',
    streetName: 'Kamaraj Salai / Boulevard Intersection',
    area: 'Thilagar Nagar Hub',
    coordinates: { latitude: 11.9380, longitude: 79.8220 },
    distanceKm: 1.4,
    walkingTimeMin: 15,
    drivingTimeMin: 5,
    badgeText: 'Normal Flow • Green Phase (35s)',
    tariff: 'Smart Adaptive Timer',
    statusText: 'Normal Flow • No Congestion • Last updated 1 min ago',
    enforcementNotice: 'Red-Light Violation Detection Radar Active. Fines issued automatically.',
  },
  {
    id: 'place-signal-indira-gandhi',
    name: 'Indira Gandhi Square Junction',
    category: 'SIGNAL',
    streetName: 'Villupuram Road Bypass',
    area: 'City West Gateway',
    coordinates: { latitude: 11.9300, longitude: 79.8050 },
    distanceKm: 3.2,
    walkingTimeMin: 35,
    drivingTimeMin: 9,
    badgeText: 'Moderate Flow • 45s Delay',
    statusText: 'Moderate Traffic Flow • Police Warden Directing',
  },

  // 8. CIVIC DUSTBINS & WASTE DISPOSAL HUBS (Clean Puducherry Mission)
  {
    id: 'place-dustbin-rock-beach',
    name: 'Rock Beach Segregated Waste Bins',
    category: 'DUSTBIN',
    streetName: 'Goubert Avenue Promenade',
    area: 'Promenade Waterfront',
    coordinates: { latitude: 11.9345, longitude: 79.8356 },
    distanceKm: 0.4,
    walkingTimeMin: 4,
    drivingTimeMin: 2,
    rating: 4.6,
    reviewCount: 42,
    badgeText: 'Wet & Dry Waste Bins',
    tariff: 'FREE Civic Disposal',
    amenities: ['Segregated Wet / Dry Bins', 'Cleared Hourly by Municipal Sweepers', 'Bottle Crushing Point'],
    openHours: 'Accessible 24/7',
    statusText: 'Municipal Clean Spot • 100% Cleared Daily',
  },
  {
    id: 'place-dustbin-french-quarter',
    name: 'French Quarter Eco Waste Station',
    category: 'DUSTBIN',
    streetName: 'Rue Suffren Cross',
    area: 'White Town Core',
    coordinates: { latitude: 11.9322, longitude: 79.8339 },
    distanceKm: 0.5,
    walkingTimeMin: 5,
    drivingTimeMin: 2,
    rating: 4.5,
    reviewCount: 30,
    badgeText: 'Eco Stainless Steel Bins',
    tariff: 'FREE Civic Disposal',
    amenities: ['Biodegradable & Plastic Bins', 'Zero Litter Zone'],
    openHours: 'Accessible 24/7',
    statusText: 'Swachh Puducherry Model Spot',
  },
  {
    id: 'place-dustbin-grand-bazaar',
    name: 'Grand Bazaar Commercial Waste Hub',
    category: 'DUSTBIN',
    streetName: 'Mahatma Gandhi Road / JN Street',
    area: 'Market Entrance',
    coordinates: { latitude: 11.9365, longitude: 79.8280 },
    distanceKm: 0.9,
    walkingTimeMin: 9,
    drivingTimeMin: 3,
    rating: 4.2,
    reviewCount: 55,
    badgeText: 'High Capacity Compactors',
    tariff: 'FREE Civic Disposal',
    amenities: ['Commercial Grade Bins', 'Frequent Clearance'],
    openHours: 'Accessible 24/7',
    statusText: 'Commercial Waste Compactor Station',
  },

  // 9. POPULAR ATTRACTIONS
  {
    id: 'place-attraction-rock-beach',
    name: 'Rock Beach & Promenade',
    category: 'ATTRACTION',
    streetName: 'Goubert Avenue',
    area: 'Puducherry Waterfront',
    coordinates: { latitude: 11.9338, longitude: 79.8358 },
    distanceKm: 0.4,
    walkingTimeMin: 4,
    drivingTimeMin: 2,
    rating: 4.8,
    reviewCount: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Top Attraction • Iconic Waterfront',
    amenities: ['Walking Track', 'Benches', 'Sea Breeze', 'Le Cafe Nearby'],
    openHours: 'Open 24/7 (Vehicles barred 5 PM - 6 AM)',
    statusText: 'Pedestrian Seaside Paradise',
  },
  {
    id: 'place-attraction-french-quarter',
    name: 'French Quarter (White Town)',
    category: 'ATTRACTION',
    streetName: 'Rue Romain Rolland / Rue Suffren',
    area: 'Heritage District',
    coordinates: { latitude: 11.9330, longitude: 79.8335 },
    distanceKm: 0.3,
    walkingTimeMin: 3,
    drivingTimeMin: 2,
    rating: 4.7,
    reviewCount: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    badgeText: 'Colonial Architecture & Cafes',
    amenities: ['Heritage Villas', 'Art Galleries', 'French Bakeries'],
    openHours: 'Open All Day',
    statusText: 'Famous French Colonial Streets',
  },
];

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Calculate travel times based on distance
export function calculateTravelTimes(distKm: number) {
  const drivingTimeMin = Math.max(2, Math.round(distKm * 2.8));
  const walkingTimeMin = Math.max(1, Math.round(distKm * 12.5));
  return { drivingTimeMin, walkingTimeMin };
}

// Recalculate dynamic distance & travel times from real GPS user coordinates
export function enrichPlacesWithUserLocation(
  placesList: CityPlace[],
  userLoc: { latitude: number; longitude: number }
): CityPlace[] {
  return placesList.map((place) => {
    const distKm = calculateDistanceKm(
      userLoc.latitude,
      userLoc.longitude,
      place.coordinates.latitude,
      place.coordinates.longitude
    );
    const { drivingTimeMin, walkingTimeMin } = calculateTravelTimes(distKm);
    return {
      ...place,
      distanceKm: distKm,
      drivingTimeMin,
      walkingTimeMin,
    };
  });
}


// Helper to convert ParkingZone into CityPlace format with dynamic user location
export function parkingZoneToCityPlace(z: ParkingZone, userLoc?: { latitude: number; longitude: number }): CityPlace {
  const isFree = z.category === 'FREE_CIVIC';
  const total = z.totalSlots || 30;
  const occ = z.occupiedSlots || 10;
  const vacant = Math.max(0, total - occ);

  const fallbackCoord = REAL_PUDUCHERRY_ZONES.find((rz) => rz.id === z.id)?.coordinates || {
    latitude: 11.9338,
    longitude: 79.8310,
  };

  const validCoords =
    z.coordinates &&
    typeof z.coordinates.latitude === 'number' &&
    typeof z.coordinates.longitude === 'number' &&
    !isNaN(z.coordinates.latitude) &&
    !isNaN(z.coordinates.longitude) &&
    z.coordinates.latitude !== 0
      ? z.coordinates
      : fallbackCoord;

  const distKm = userLoc
    ? calculateDistanceKm(userLoc.latitude, userLoc.longitude, validCoords.latitude, validCoords.longitude)
    : z.distanceKm || 0.5;

  const { drivingTimeMin, walkingTimeMin } = calculateTravelTimes(distKm);

  return {
    id: z.id,
    name: z.name,
    category: z.type === 'NO_PARKING_RED' ? 'NO_PARKING' : (isFree ? 'PARKING_FREE' : 'PARKING_SMART'),
    streetName: z.streetName,
    area: z.area,
    coordinates: validCoords,
    distanceKm: distKm,
    walkingTimeMin,
    drivingTimeMin,
    rating: isFree ? 4.4 : 4.2,
    reviewCount: 150,
    imageUrl: z.imageUrl || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    badgeText: z.type === 'NO_PARKING_RED' ? 'STRICT NO PARKING' : `${vacant} / ${total} slots`,
    totalSlots: total,
    occupiedSlots: occ,
    vacantSlots: vacant,
    tariff: z.hourlyRate || (isFree ? 'FREE' : '₹20/hr'),
    amenities: ['CCTV Monitored', 'Street Lighting', isFree ? 'Free Kerb' : 'Municipal Receipt'],
    phone: '103',
    cameraEnabled: z.type === 'PARKING_GREEN',
    openHours: 'Open 24/7',
    statusText: z.enforcementNotes || `${vacant} spots available now`,
    isFull: z.isFull,
  };
}

// Fetch real road route geometry & maneuvers from OSRM
export async function fetchRoadRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{
  geometry: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  steps: {
    instruction: string;
    distance: string;
    action: 'LEFT' | 'RIGHT' | 'STRAIGHT' | 'ARRIVE';
    street: string;
  }[];
}> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distKm = Math.round((route.distance / 1000) * 10) / 10;
        const durationMin = Math.max(1, Math.round(route.duration / 60));

        // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
        const geometry: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        const steps: {
          instruction: string;
          distance: string;
          action: 'LEFT' | 'RIGHT' | 'STRAIGHT' | 'ARRIVE';
          street: string;
        }[] = [];

        if (route.legs && route.legs[0] && route.legs[0].steps) {
          route.legs[0].steps.forEach((step: any) => {
            const maneuverType = (step.maneuver?.modifier || step.maneuver?.type || '').toLowerCase();
            let action: 'LEFT' | 'RIGHT' | 'STRAIGHT' | 'ARRIVE' = 'STRAIGHT';
            if (maneuverType.includes('left')) action = 'LEFT';
            else if (maneuverType.includes('right')) action = 'RIGHT';
            else if (step.maneuver?.type === 'arrive') action = 'ARRIVE';

            const stepDist =
              step.distance < 1000
                ? `${Math.round(step.distance)} m`
                : `${(step.distance / 1000).toFixed(1)} km`;

            const instruction =
              step.maneuver?.type === 'arrive'
                ? `Arrive at destination`
                : `${step.maneuver?.modifier ? 'Turn ' + step.maneuver.modifier + ' onto ' : 'Continue onto '}${
                    step.name || 'road'
                  }`;

            steps.push({
              instruction,
              distance: stepDist,
              action,
              street: step.name || 'Boulevard Road',
            });
          });
        }

        return {
          geometry,
          distanceKm: distKm,
          durationMinutes: durationMin,
          steps:
            steps.length > 0
              ? steps
              : [
                  {
                    instruction: `Follow road towards destination`,
                    distance: `${distKm} km`,
                    action: 'STRAIGHT',
                    street: 'Main Road',
                  },
                  {
                    instruction: `Arrive at destination`,
                    distance: 'Destination',
                    action: 'ARRIVE',
                    street: 'Destination',
                  },
                ],
        };
      }
    }
  } catch (err) {
    console.warn('OSRM routing fetch failed, using fallback road path', err);
  }

  // Fallback
  const fallbackDist = calculateDistanceKm(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );
  const { drivingTimeMin } = calculateTravelTimes(fallbackDist);

  return {
    geometry: [
      [origin.latitude, origin.longitude],
      [(origin.latitude * 2 + destination.latitude) / 3, (origin.longitude * 2 + destination.longitude) / 3],
      [(origin.latitude + destination.latitude * 2) / 3, (origin.longitude + destination.longitude * 2) / 3],
      [destination.latitude, destination.longitude],
    ],
    distanceKm: fallbackDist,
    durationMinutes: drivingTimeMin,
    steps: [
      {
        instruction: `Head towards destination`,
        distance: `${fallbackDist} km`,
        action: 'STRAIGHT',
        street: 'Main Road',
      },
      {
        instruction: `Arrive at destination`,
        distance: 'Destination',
        action: 'ARRIVE',
        street: 'Destination',
      },
    ],
  };
}

// Generate Turn-by-Turn Navigation Session for Google Maps HUD
export function createNavigationSession(
  place: CityPlace,
  origin: { latitude: number; longitude: number } = { latitude: 11.9338, longitude: 79.8310 },
  roadRoute?: {
    geometry: [number, number][];
    distanceKm: number;
    durationMinutes: number;
    steps: {
      instruction: string;
      distance: string;
      action: 'LEFT' | 'RIGHT' | 'STRAIGHT' | 'ARRIVE';
      street: string;
    }[];
  }
): NavigationSession {
  const dist = roadRoute
    ? roadRoute.distanceKm
    : calculateDistanceKm(
        origin.latitude,
        origin.longitude,
        place.coordinates.latitude,
        place.coordinates.longitude
      ) || place.distanceKm || 0.6;
  const driveMin = roadRoute ? roadRoute.durationMinutes : Math.max(2, Math.round(dist * 2.8));

  const now = new Date();
  now.setMinutes(now.getMinutes() + driveMin);
  const arrivalTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const steps =
    roadRoute && roadRoute.steps.length > 0
      ? roadRoute.steps
      : [
          {
            instruction: `Head towards ${place.streetName}`,
            distance: `${Math.round(dist * 1000)} m`,
            action: 'STRAIGHT' as const,
            street: place.streetName,
          },
          {
            instruction: `Arrived at ${place.name} on your right`,
            distance: 'Destination',
            action: 'ARRIVE' as const,
            street: place.area,
          },
        ];

  return {
    destination: place,
    origin,
    etaMinutes: driveMin,
    distanceKm: dist,
    arrivalTime,
    currentStepIndex: 0,
    geometry: roadRoute?.geometry,
    steps,
  };
}

// Find nearby parkings, toilets, and dustbins near a destination
export function getNearbyAmenitiesForDestination(
  destination: CityPlace,
  allPlaces: CityPlace[],
  radiusKm: number = 2.0
): {
  parkings: CityPlace[];
  toilets: CityPlace[];
  dustbins: CityPlace[];
} {
  const parkings: CityPlace[] = [];
  const toilets: CityPlace[] = [];
  const dustbins: CityPlace[] = [];

  allPlaces.forEach((p) => {
    if (p.id === destination.id) return;
    const d = calculateDistanceKm(
      destination.coordinates.latitude,
      destination.coordinates.longitude,
      p.coordinates.latitude,
      p.coordinates.longitude
    );
    if (d <= radiusKm) {
      if (p.category === 'PARKING_SMART' || p.category === 'PARKING_FREE') {
        parkings.push({ ...p, distanceKm: d });
      } else if (p.category === 'TOILET') {
        toilets.push({ ...p, distanceKm: d });
      } else if (p.category === 'DUSTBIN') {
        dustbins.push({ ...p, distanceKm: d });
      }
    }
  });

  parkings.sort((a, b) => a.distanceKm - b.distanceKm);
  toilets.sort((a, b) => a.distanceKm - b.distanceKm);
  dustbins.sort((a, b) => a.distanceKm - b.distanceKm);

  return { parkings, toilets, dustbins };
}
