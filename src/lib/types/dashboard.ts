export interface VehicleDetection {
  id: string;
  vehicleNo: string;
  model: string;
  color: string;
  zone: 'PARKING_AREA' | 'NON_PARKING_AREA';
  status: 'ALLOWED' | 'WARNING' | 'VIOLATION' | 'ECHALLAN_ISSUED';
  durationSeconds: number;
  box: {
    top: number; // percentage (0-100)
    left: number; // percentage (0-100)
    width: number;
    height: number;
  };
  lastSeen: string;
}

export interface EChallanRecord {
  id: string;
  vehicleNo: string;
  violationType: string;
  location: string;
  timestamp: string;
  durationMinutes: number;
  fineAmount: number;
  status: 'Generated' | 'Pending Review' | 'Dispatched';
  evidenceImage: string;
}

export interface AmbulanceState {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number;
  status: 'Active' | 'En Route' | 'Emergency Corridor' | 'Idle';
  destination: string;
  routeProgress: number; // 0 to 100
  isConnected: boolean;
}

export type SignalLightColor = 'RED' | 'YELLOW' | 'GREEN';

export interface SignalStem {
  id: string;
  name: string;
  directionLabel: string;
  angleDegrees: number;
  state: SignalLightColor;
  isAmbulanceApproach: boolean;
  coords?: { lat: number; lng: number };
}

export interface TrafficSignal {
  id: string;
  name: string;
  locationLabel: string;
  coords: { lat: number; lng: number };
  state: SignalLightColor;
  isEmergencyOverride: boolean;
  cycleSeconds: number;
  direction?: string;
  geofenceRadius?: number;
  distanceToAmbulance?: number;
  isInsideGeofence?: boolean;
  stems?: SignalStem[];
}

export interface GeofenceArea {
  name: string;
  center: { lat: number; lng: number };
  radiusMeters: number;
  targetSignalId: string;
  isActive: boolean;
  isAmbulanceInside: boolean;
  distanceToAmbulance?: number;
  currentSignalName?: string;
}

export interface TrafficEvent {
  id: string;
  timestamp: string;
  title: string;
  type: 'GEOFENCE_ENTER' | 'GEOFENCE_EXIT' | 'CORRIDOR_ACTIVE' | 'SIGNAL_RESTORED' | 'AMBULANCE_DISPATCH';
  severity: 'info' | 'warning' | 'urgent';
}

export type CitizenReportStatus = 
  | 'Pending' 
  | 'In Progress' 
  | 'Resolved' 
  | 'PENDING' 
  | 'CHALLAN_ISSUED' 
  | 'ENFORCEMENT_COMPLETE' 
  | 'REJECTED';

export interface CitizenReport {
  id: string;
  title: string;
  description: string;
  category: 'Illegal Parking' | 'Road Damage' | 'Suspicious Person' | 'Street Light Not Working' | 'Other' | string;
  imageUrl: string;
  location: string;
  coords: { lat: number; lng: number };
  reportedTime: string;
  status: CitizenReportStatus;
  reporterName: string;
  reporterContact: string;
  registrationPlate?: string;
  challanReference?: string;
  challanNotes?: string;
  penaltyAmount?: number;
  mvaSection?: string;
  rejectionReason?: string;
  rawAppwriteId?: string;
}

export interface LostFoundItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  foundLocation: string;
  coords: { lat: number; lng: number };
  reportedTime: string;
  status: 'Unclaimed' | 'Claimed' | 'Under Verification';
  contactPerson: string;
  rawAppwriteId?: string;
}
