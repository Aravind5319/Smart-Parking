// ============================================================================
// PARKPUDUVAI - SHARED TYPES & DATA CONTRACTS
// ============================================================================

export type TabType = 'parking' | 'report' | 'profile' | 'tickets' | 'alerts';

export type PlaceCategory =
  | 'PARKING_SMART'
  | 'PARKING_FREE'
  | 'NO_PARKING'
  | 'TOILET'
  | 'FUEL'
  | 'ATM'
  | 'SIGNAL'
  | 'ATTRACTION';

export interface CityPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  streetName: string;
  area: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distanceKm: number;
  walkingTimeMin: number;
  drivingTimeMin: number;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  badgeText: string;
  totalSlots?: number;
  occupiedSlots?: number;
  vacantSlots?: number;
  tariff?: string;
  amenities?: string[];
  phone?: string;
  cameraEnabled?: boolean;
  openHours?: string;
  enforcementNotice?: string;
  statusText?: string;
  isFull?: boolean;
}

export interface NavigationSession {
  destination: CityPlace;
  origin: { latitude: number; longitude: number };
  etaMinutes: number;
  distanceKm: number;
  arrivalTime: string;
  currentStepIndex: number;
  steps: {
    instruction: string;
    distance: string;
    action: 'LEFT' | 'RIGHT' | 'STRAIGHT' | 'ARRIVE';
    street: string;
  }[];
}

export type ReportDomain = 'TRAFFIC' | 'CIVIC_LOST_FOUND';

export type ViolationCategory = 
  | 'NO_PARKING_ZONE'
  | 'FOOTPATH_BLOCKED'
  | 'DOUBLE_PARKING'
  | 'GATE_BLOCKED'
  | 'BUS_STOP_OBSTRUCTION'
  | 'WRONG_SIDE'
  // Civic & Lost / Found Categories
  | 'FOUND_PURSE_VALUABLE'
  | 'FOUND_DOCUMENTS'
  | 'LOST_PROPERTY'
  | 'ROAD_HAZARD'
  | 'UNATTENDED_OBJECT'
  | 'OTHERS';

export interface LocationData {
  latitude: number;
  longitude: number;
  landmark: string;
  accuracy: number;
  timestamp: string;
}

export interface ViolationReport {
  id: string;
  referenceNo: string;
  reportDomain?: ReportDomain;
  civicFlowType?: 'FOUND' | 'LOST';
  ownerContact?: string;
  photoUri: string | null;
  location: LocationData;
  vehicleNumber: string; // In traffic: plate number. In civic/lost: item title (e.g. "Leather Purse / Wallet")
  violationType: ViolationCategory;
  otherDescription?: string;
  timestamp: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CHALLAN_ISSUED' | 'ENFORCEMENT_COMPLETE' | 'REJECTED';
  karmaPoints: number;
  policeNote?: string;
  challanNumber?: string;
}

export interface KerbParkingZone {
  id: string;
  streetName: string;
  sideA_Type: 'PARKING_AUTHORIZED';
  sideA_Available: number;
  sideA_Total: number;
  sideB_Type: 'NO_PARKING_STRICT';
  hourlyRate: string;
  isFull: boolean;
}

export interface TrafficAdvisory {
  id: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'EMERGENCY';
  activeTime: string;
  affectedRoads: string;
}
