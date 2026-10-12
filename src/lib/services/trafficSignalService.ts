import { TrafficSignal, AmbulanceState, GeofenceArea, TrafficEvent, SignalLightColor } from '../types/dashboard';

// Haversine formula to compute distance in meters between two GPS coordinates
function computeDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Puducherry Route Waypoints for Ambulance
const AMBULANCE_ROUTE = [
  { lat: 11.9425, lng: 79.8250 }, // Starting: North Boulevard
  { lat: 11.9400, lng: 79.8270 }, // Mission Street Junction
  { lat: 11.9375, lng: 79.8295 }, // Nehru Street Cross
  { lat: 11.9355, lng: 79.8318 }, // Approaching Bharathi Park Outer
  { lat: 11.9338, lng: 79.8335 }, // Inside Geofence: Bharathi Park Health Center
  { lat: 11.9320, lng: 79.8350 }, // Clearing intersection towards General Hospital
  { lat: 11.9305, lng: 79.8360 }, // Arrived at Beach Hospital Wing
];

class TrafficControlService {
  private signals: TrafficSignal[] = [
    {
      id: 'SIG-01',
      name: 'Bharathi Park',
      locationLabel: 'Bharathi Park (Selected)',
      coords: { lat: 11.9338, lng: 79.8335 },
      state: 'GREEN',
      isEmergencyOverride: true,
      cycleSeconds: 45
    },
    {
      id: 'SIG-02',
      name: 'Pondy Beach',
      locationLabel: 'Pondy Beach',
      coords: { lat: 11.9355, lng: 79.8375 },
      state: 'RED',
      isEmergencyOverride: true,
      cycleSeconds: 40
    },
    {
      id: 'SIG-03',
      name: 'Railway Station',
      locationLabel: 'Railway Station',
      coords: { lat: 11.9285, lng: 79.8270 },
      state: 'RED',
      isEmergencyOverride: true,
      cycleSeconds: 50
    },
    {
      id: 'SIG-04',
      name: 'White Town',
      locationLabel: 'White Town',
      coords: { lat: 11.9310, lng: 79.8340 },
      state: 'RED',
      isEmergencyOverride: true,
      cycleSeconds: 40
    }
  ];

  private geofence: GeofenceArea = {
    name: 'Geofence Area (Health Center)',
    center: { lat: 11.9338, lng: 79.8335 },
    radiusMeters: 380,
    targetSignalId: 'SIG-01',
    isActive: true,
    isAmbulanceInside: true
  };

  private ambulance: AmbulanceState = {
    id: 'AMB-108',
    name: 'Ambulance 04 (Emergency Unit)',
    lat: 11.9348,
    lng: 79.8328,
    speed: 42,
    heading: 135,
    status: 'Emergency Corridor',
    destination: 'Bharathi Park Health Center',
    routeProgress: 65,
    isConnected: true
  };

  private events: TrafficEvent[] = [
    {
      id: 'EVT-101',
      timestamp: '14:32:10 IST',
      title: 'Ambulance entered geofence area. Signal at Bharathi Park will turn GREEN. Others will turn RED.',
      type: 'GEOFENCE_ENTER',
      severity: 'urgent'
    },
    {
      id: 'EVT-100',
      timestamp: '14:30:45 IST',
      title: 'Ambulance GPS connected. Route calculated to Bharathi Park Health Center.',
      type: 'AMBULANCE_DISPATCH',
      severity: 'info'
    }
  ];

  private isSimRunning = true;
  private waypointIndex = 3;
  private subStep = 0.5;
  private listeners: Array<() => void> = [];
  private intervalId: any = null;

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    if (typeof window === 'undefined') return;
    this.intervalId = setInterval(() => {
      if (!this.isSimRunning) return;

      this.stepAmbulanceRoute();
      this.checkGeofenceTransition();
      this.notify();
    }, 1500);
  }

  private stepAmbulanceRoute() {
    const totalWaypoints = AMBULANCE_ROUTE.length;
    this.subStep += 0.08;

    if (this.subStep >= 1) {
      this.subStep = 0;
      this.waypointIndex = (this.waypointIndex + 1) % (totalWaypoints - 1);
    }

    const p1 = AMBULANCE_ROUTE[this.waypointIndex];
    const p2 = AMBULANCE_ROUTE[this.waypointIndex + 1];

    const currentLat = p1.lat + (p2.lat - p1.lat) * this.subStep;
    const currentLng = p1.lng + (p2.lng - p1.lng) * this.subStep;

    const progress = Math.round(((this.waypointIndex + this.subStep) / (totalWaypoints - 1)) * 100);

    this.ambulance = {
      ...this.ambulance,
      lat: Number(currentLat.toFixed(5)),
      lng: Number(currentLng.toFixed(5)),
      routeProgress: progress,
      speed: this.geofence.isAmbulanceInside ? 42 : 55
    };
  }

  private checkGeofenceTransition() {
    const dist = computeDistanceMeters(
      this.ambulance.lat,
      this.ambulance.lng,
      this.geofence.center.lat,
      this.geofence.center.lng
    );

    const isInsideNow = dist <= this.geofence.radiusMeters;

    if (isInsideNow && !this.geofence.isAmbulanceInside) {
      // ENTER GEOFENCE
      this.geofence = { ...this.geofence, isAmbulanceInside: true };
      this.ambulance.status = 'Emergency Corridor';
      this.applyEmergencyOverride(this.geofence.targetSignalId);

      this.events.unshift({
        id: `EVT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        title: `Ambulance entered geofence area. Signal at ${this.getSelectedSignalName()} will turn GREEN. Others will turn RED.`,
        type: 'GEOFENCE_ENTER',
        severity: 'urgent'
      });
    } else if (!isInsideNow && this.geofence.isAmbulanceInside) {
      // EXIT GEOFENCE
      this.geofence = { ...this.geofence, isAmbulanceInside: false };
      this.ambulance.status = 'En Route';
      this.restoreNormalCycles();

      this.events.unshift({
        id: `EVT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        title: `Ambulance cleared geofence. Restored normal cyclic traffic signals.`,
        type: 'GEOFENCE_EXIT',
        severity: 'info'
      });
    }
  }

  private applyEmergencyOverride(targetSignalId: string) {
    this.signals = this.signals.map((sig) => {
      if (sig.id === targetSignalId) {
        return { ...sig, state: 'GREEN' as SignalLightColor, isEmergencyOverride: true };
      }
      return { ...sig, state: 'RED' as SignalLightColor, isEmergencyOverride: true };
    });
  }

  private restoreNormalCycles() {
    this.signals = this.signals.map((sig, idx) => {
      return {
        ...sig,
        state: idx % 2 === 0 ? 'GREEN' : 'RED',
        isEmergencyOverride: false
      };
    });
  }

  private getSelectedSignalName(): string {
    const target = this.signals.find((s) => s.id === this.geofence.targetSignalId);
    return target ? target.name : 'Bharathi Park';
  }

  // Public Interface
  public getSignals(): TrafficSignal[] {
    return [...this.signals];
  }

  public getAmbulance(): AmbulanceState {
    return { ...this.ambulance };
  }

  public getGeofence(): GeofenceArea {
    return { ...this.geofence };
  }

  public getRouteCoordinates(): Array<{ lat: number; lng: number }> {
    return AMBULANCE_ROUTE;
  }

  public getEvents(): TrafficEvent[] {
    return [...this.events];
  }

  public isRunning(): boolean {
    return this.isSimRunning;
  }

  public togglePlayPause() {
    this.isSimRunning = !this.isSimRunning;
    this.notify();
  }

  public resetSimulation() {
    this.waypointIndex = 0;
    this.subStep = 0;
    this.isSimRunning = true;
    this.stepAmbulanceRoute();
    this.checkGeofenceTransition();
    this.notify();
  }

  public triggerEnterGeofence() {
    this.ambulance.lat = this.geofence.center.lat + 0.0005;
    this.ambulance.lng = this.geofence.center.lng + 0.0005;
    this.waypointIndex = 4;
    this.subStep = 0.2;
    this.geofence.isAmbulanceInside = false; // will trigger state change in next check
    this.checkGeofenceTransition();
    this.notify();
  }

  public triggerExitGeofence() {
    this.ambulance.lat = 11.9425;
    this.ambulance.lng = 79.8250;
    this.waypointIndex = 0;
    this.subStep = 0;
    this.geofence.isAmbulanceInside = true;
    this.checkGeofenceTransition();
    this.notify();
  }

  public selectEmergencySignal(signalId: string) {
    const sig = this.signals.find((s) => s.id === signalId);
    if (sig) {
      this.geofence = {
        ...this.geofence,
        center: sig.coords,
        targetSignalId: sig.id
      };
      if (this.geofence.isAmbulanceInside) {
        this.applyEmergencyOverride(sig.id);
      }
      this.notify();
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export const trafficSignalService = new TrafficControlService();
