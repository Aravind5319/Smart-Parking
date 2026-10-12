import { KerbParkingZone, TrafficAdvisory, ViolationReport } from '../types/navigation';

export const PUDUCHERRY_KERB_ZONES: KerbParkingZone[] = [
  {
    id: 'zone-1',
    streetName: 'Mission Street (Calve College stretch)',
    sideA_Type: 'PARKING_AUTHORIZED',
    sideA_Available: 12,
    sideA_Total: 25,
    sideB_Type: 'NO_PARKING_STRICT',
    hourlyRate: '₹20/hr',
    isFull: false,
  },
  {
    id: 'zone-2',
    streetName: 'Rue Romain Rolland (White Town)',
    sideA_Type: 'PARKING_AUTHORIZED',
    sideA_Available: 3,
    sideA_Total: 15,
    sideB_Type: 'NO_PARKING_STRICT',
    hourlyRate: '₹30/hr',
    isFull: false,
  },
  {
    id: 'zone-3',
    streetName: 'Jawaharlal Nehru Street',
    sideA_Type: 'PARKING_AUTHORIZED',
    sideA_Available: 0,
    sideA_Total: 30,
    sideB_Type: 'NO_PARKING_STRICT',
    hourlyRate: '₹20/hr',
    isFull: true, // Trigger auto-redirect test
  },
  {
    id: 'zone-4',
    streetName: 'Goubert Avenue (Rock Beach Promenade)',
    sideA_Type: 'PARKING_AUTHORIZED',
    sideA_Available: 0,
    sideA_Total: 40,
    sideB_Type: 'NO_PARKING_STRICT',
    hourlyRate: 'Restricted',
    isFull: true,
  },
];

export const MOCK_TICKETS: ViolationReport[] = [
  {
    id: 'rep-001',
    referenceNo: 'PTP-10234',
    photoUri: null,
    location: {
      latitude: 11.9328,
      longitude: 79.8335,
      landmark: 'Rue Romain Rolland, White Town, Puducherry',
      accuracy: 5,
      timestamp: '10:35 AM',
    },
    vehicleNumber: 'PY-01-A-1234',
    violationType: 'NO_PARKING_ZONE',
    timestamp: 'Today, 10:35 AM',
    status: 'UNDER_REVIEW',
    karmaPoints: 50,
    policeNote: 'Assigned to Beach Patrol Unit for verification.',
  },
  {
    id: 'rep-002',
    referenceNo: 'PTP-10198',
    photoUri: null,
    location: {
      latitude: 11.9345,
      longitude: 79.8298,
      landmark: 'Mission Street, Heritage Quarter',
      accuracy: 3,
      timestamp: 'Yesterday, 04:12 PM',
    },
    vehicleNumber: 'TN-07-CB-9081',
    violationType: 'FOOTPATH_BLOCKED',
    timestamp: 'Yesterday, 04:12 PM',
    status: 'CHALLAN_ISSUED',
    karmaPoints: 50,
    challanNumber: 'PUD-MVA-2026-8812',
    policeNote: 'e-Challan issued under Indian MVA Section 122 (Penalty: ₹1,500). Tow truck cleared obstruction.',
  },
];

export const MOCK_ADVISORIES: TrafficAdvisory[] = [
  {
    id: 'adv-01',
    title: 'Festival Road Closure: Gandhi Jayanthi',
    description: 'Beach Road (Goubert Ave) is strictly pedestrian-only from 18:00 to 21:00. Motorists must divert to AFT Mill Ground Satellite Lot.',
    severity: 'HIGH',
    activeTime: 'Tomorrow, 18:00 - 21:00',
    affectedRoads: 'Goubert Ave, Suffren St, Dumas St',
  },
  {
    id: 'adv-02',
    title: 'Diversion Alert: Mission Street One-Way',
    description: 'Single-side alternate parking active on West kerb only. East kerb is strict tow-away corridor.',
    severity: 'MEDIUM',
    activeTime: 'Active 24/7',
    affectedRoads: 'Mission Street from Bussy St to Rangapillai St',
  },
  {
    id: 'adv-03',
    title: 'Emergency Ambulance Corridor Clearance',
    description: 'Priority medical corridor active for Indira Gandhi Medical College. Keep curb side clear.',
    severity: 'EMERGENCY',
    activeTime: 'Continuous Alert',
    affectedRoads: 'Vazhudavur Road, Gorimedu junction',
  },
];
