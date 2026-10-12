// ============================================================================
// PARKPUDUVAI - SHARED TYPES & DATA CONTRACTS
// ============================================================================

export type TabType = 'parking' | 'report' | 'tickets' | 'alerts';

export type ViolationCategory = 
  | 'NO_PARKING_ZONE'
  | 'FOOTPATH_BLOCKED'
  | 'DOUBLE_PARKING'
  | 'GATE_BLOCKED'
  | 'BUS_STOP_OBSTRUCTION'
  | 'WRONG_SIDE'
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
  photoUri: string | null;
  location: LocationData;
  vehicleNumber: string;
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
