import { TrafficSignal, AmbulanceState, GeofenceArea, TrafficEvent, SignalLightColor, SignalStem } from '../types/dashboard';

// Haversine formula to compute distance in meters between two GPS coordinates
export function computeDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Calculate bearing in degrees from point 1 to point 2
function computeBearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

// EXACT ROADWAY CENTERLINE: Lying 100% directly on the asphalt surface of 100 Feet Road (SH32) / Kamaraj Salai
// Originates at Indira Gandhi Statue (Yellow Circle - 4-Way Signal), passes Rajiv Gandhi Hospital,
// enters Muruga Theatre 5-Way Rotary (South Arm), traverses rotary and exits along Kamaraj Salai East
export const REAL_ROAD_CORRIDOR_ROUTE = [
  // 1. INDIRA GANDHI STATUE (Yellow Circle Geofence - 4-Way Signal)
  { lat: 11.93157, lng: 79.80766 }, // 0: Indira Gandhi Statue 4-Way Junction Center
  { lat: 11.93168, lng: 79.80762 }, // 1: Northward departure onto 100 Feet Road
  { lat: 11.93200, lng: 79.80759 }, // 2: 100 Feet Road Carriageway
  { lat: 11.93245, lng: 79.80755 }, // 3: Passing 1st Cross Rd
  { lat: 11.93293, lng: 79.80751 }, // 4: 100 Feet Rd Northbound
  { lat: 11.93350, lng: 79.80747 }, // 5: 100 Feet Road
  { lat: 11.93399, lng: 79.80744 }, // 6: Commercial Stretch
  { lat: 11.93449, lng: 79.80741 }, // 7: 100 Feet Rd
  { lat: 11.93503, lng: 79.80751 }, // 8: 100 Feet Rd gentle curve
  { lat: 11.93599, lng: 79.80771 }, // 9: Approaching Rajiv Gandhi Hospital
  // 2. RAJIV GANDHI HOSPITAL JUNCTION
  { lat: 11.93662, lng: 79.80783 }, // 10: Rajiv Gandhi Women Hospital Jn
  { lat: 11.93720, lng: 79.80790 }, // 11: Past Hospital junction
  { lat: 11.93777, lng: 79.80794 }, // 12: 100 Feet Road Northbound
  { lat: 11.93839, lng: 79.80798 }, // 13: 100 Feet Road
  { lat: 11.93875, lng: 79.80801 }, // 14: 100 Feet Road
  { lat: 11.93951, lng: 79.80809 }, // 15: 100 Feet Rd towards Muruga Theatre
  { lat: 11.94035, lng: 79.80822 }, // 16: Approaching bridge before Muruga Rotary
  { lat: 11.94074, lng: 79.80827 }, // 17: South Bridge Approach
  { lat: 11.94088, lng: 79.80829 }, // 18: GEOFENCE ENTRY: Stem 4 South Approach
  { lat: 11.94105, lng: 79.80835 }, // 19: Stem 4: South Bridge / 100Ft Entrance
  { lat: 11.94139, lng: 79.80829 }, // 20: Entering Muruga Rotary Arc
  // 3. MURUGA THEATRE 5-WAY ROTARY JUNCTION
  { lat: 11.94162, lng: 79.80825 }, // 21: MURUGA THEATRE 5-WAY ROTARY JUNCTION CENTER
  { lat: 11.94166, lng: 79.80832 }, // 22: Roundabout Rotary Turn
  { lat: 11.94156, lng: 79.80843 }, // 23: Roundabout East Flare
  { lat: 11.94154, lng: 79.80854 }, // 24: Stem 3 Kamaraj Salai East Entrance
  { lat: 11.94151, lng: 79.80871 }, // 25: GEOFENCE EXIT: Kamaraj Salai East
  { lat: 11.94130, lng: 79.80955 }, // 26: Kamaraj Salai East
  { lat: 11.94115, lng: 79.80989 }, // 27: Kamaraj Salai East Carriageway
  { lat: 11.94103, lng: 79.81053 }, // 28: Kamaraj Salai East towards Town
  { lat: 11.94099, lng: 79.81092 }, // 29: Kamaraj Salai East
  { lat: 11.94101, lng: 79.81147 }  // 30: Kamaraj Salai East Corridor End
];

// Helper to create the 4 physical stems for Indira Gandhi Statue 4-Way Intersection
// Location: Indira Gandhi Statue (Yellow Circle at 11.93157, 79.80766)
export function createIGStems(isAmbulanceInGeofence: boolean, cyclePhase: number = 0): SignalStem[] {
  if (isAmbulanceInGeofence) {
    // Ambulance preemption: North corridor towards Muruga Theatre is GREEN, other 3 stems are RED
    return [
      {
        id: 'STEM-IG-1-SOUTH',
        name: 'Stem 1: South (Cuddalore)',
        directionLabel: 'NH45A towards Cuddalore & Ariyankuppam (South Arm)',
        angleDegrees: 180,
        coords: { lat: 11.93095, lng: 79.80766 },
        state: 'RED',
        isAmbulanceApproach: false
      },
      {
        id: 'STEM-IG-2-EAST',
        name: 'Stem 2: East (Bus Stand)',
        directionLabel: 'Maraimalai Adigal Salai towards New Bus Stand & Town (East Arm)',
        angleDegrees: 90,
        coords: { lat: 11.93157, lng: 79.80825 },
        state: 'RED',
        isAmbulanceApproach: false
      },
      {
        id: 'STEM-IG-3-NORTH',
        name: 'Stem 3: North (100Ft Rd)',
        directionLabel: '100 Feet Road towards Rajiv Gandhi & Muruga Theatre (North Corridor)',
        angleDegrees: 0,
        coords: { lat: 11.93220, lng: 79.80766 },
        state: 'GREEN',
        isAmbulanceApproach: true
      },
      {
        id: 'STEM-IG-4-WEST',
        name: 'Stem 4: West (Villianur)',
        directionLabel: 'Villianur Road & Rotary connector (West Arm)',
        angleDegrees: 270,
        coords: { lat: 11.93157, lng: 79.80705 },
        state: 'RED',
        isAmbulanceApproach: false
      }
    ];
  }

  // Normal sequential 4-phase round-robin cycle: 0 -> 1 -> 2 -> 3 -> 0
  const activeIdx = Math.abs(cyclePhase) % 4;
  return [
    {
      id: 'STEM-IG-1-SOUTH',
      name: 'Stem 1: South (Cuddalore)',
      directionLabel: 'NH45A towards Cuddalore & Ariyankuppam (South Arm)',
      angleDegrees: 180,
      coords: { lat: 11.93095, lng: 79.80766 },
      state: activeIdx === 0 ? 'GREEN' : 'RED',
      isAmbulanceApproach: false
    },
    {
      id: 'STEM-IG-2-EAST',
      name: 'Stem 2: East (Bus Stand)',
      directionLabel: 'Maraimalai Adigal Salai towards New Bus Stand & Town (East Arm)',
      angleDegrees: 90,
      coords: { lat: 11.93157, lng: 79.80825 },
      state: activeIdx === 1 ? 'GREEN' : 'RED',
      isAmbulanceApproach: false
    },
    {
      id: 'STEM-IG-3-NORTH',
      name: 'Stem 3: North (100Ft Rd)',
      directionLabel: '100 Feet Road towards Rajiv Gandhi & Muruga Theatre (North Corridor)',
      angleDegrees: 0,
      coords: { lat: 11.93220, lng: 79.80766 },
      state: activeIdx === 2 ? 'GREEN' : 'RED',
      isAmbulanceApproach: true
    },
    {
      id: 'STEM-IG-4-WEST',
      name: 'Stem 4: West (Villianur)',
      directionLabel: 'Villianur Road & Rotary connector (West Arm)',
      angleDegrees: 270,
      coords: { lat: 11.93157, lng: 79.80705 },
      state: activeIdx === 3 ? 'GREEN' : 'RED',
      isAmbulanceApproach: false
    }
  ];
}

// Helper to create the 5 physical stems for Muruga Theatre 5-Way Intersection
// Exact GPS coordinates matching the 5 physical road branches
export function createMurugaTheatreStems(isAmbulanceInGeofence: boolean, cyclePhase: number = 0): SignalStem[] {
  if (isAmbulanceInGeofence) {
    // Ambulance arriving from IG along 100 Feet Road South Bridge: Stem 4 is GREEN, all other 4 stems RED
    return [
      {
        id: 'STEM-1-IG',
        name: 'Stem 1: Accord / West [32]',
        directionLabel: 'Highway 32 from Accord Puducherry (West Approach with [32] shields)',
        angleDegrees: 270,
        coords: { lat: 11.94163, lng: 79.80771 },
        state: 'RED',
        isAmbulanceApproach: false
      },
      {
        id: 'STEM-2-NORTH',
        name: 'Stem 2: Muruga Theatre (N)',
        directionLabel: 'Tindivanam Road in front of Muruga Theatre (North Approach with [332A] shield)',
        angleDegrees: 0,
        coords: { lat: 11.94215, lng: 79.80825 },
        state: 'RED',
        isAmbulanceApproach: false
      },
      {
        id: 'STEM-3-EAST',
        name: 'Stem 3: Kamaraj Salai (E)',
        directionLabel: 'Kamaraj Salai towards Beach & Town Center (East Approach / Exit)',
        angleDegrees: 90,
        coords: { lat: 11.94154, lng: 79.80854 },
        state: 'GREEN', // Green exit arm allowing corridor discharge
        isAmbulanceApproach: false
      },
      {
        id: 'STEM-4-CANAL',
        name: 'Stem 4: South Bridge / 100Ft',
        directionLabel: '100 Feet Road approach from IG Statue & Rajiv Gandhi Hospital (South Approach)',
        angleDegrees: 180,
        coords: { lat: 11.94105, lng: 79.80835 },
        state: 'GREEN',
        isAmbulanceApproach: true
      },
      {
        id: 'STEM-5-CROSS',
        name: 'Stem 5: Cross Arterial (SW)',
        directionLabel: 'Arterial branch towards 2nd Cross & Thilaspet (SW Approach)',
        angleDegrees: 225,
        coords: { lat: 11.94135, lng: 79.80795 },
        state: 'RED',
        isAmbulanceApproach: false
      }
    ];
  }

  // Normal sequential 5-phase round-robin cycle: 0 -> 1 -> 2 -> 3 -> 4 -> 0
  const activeIdx = Math.abs(cyclePhase) % 5;
  return [
    {
      id: 'STEM-1-IG',
      name: 'Stem 1: Accord / West [32]',
      directionLabel: 'Highway 32 from Accord Puducherry (West Approach with [32] shields)',
      angleDegrees: 270,
      coords: { lat: 11.94163, lng: 79.80771 },
      state: activeIdx === 0 ? 'GREEN' : 'RED',
      isAmbulanceApproach: false
    },
    {
      id: 'STEM-2-NORTH',
      name: 'Stem 2: Muruga Theatre (N)',
      directionLabel: 'Tindivanam Road in front of Muruga Theatre (North Approach with [332A] shield)',
      angleDegrees: 0,
      coords: { lat: 11.94215, lng: 79.80825 },
      state: activeIdx === 1 ? 'GREEN' : 'RED',
      isAmbulanceApproach: false
    },
    {
      id: 'STEM-3-EAST',
      name: 'Stem 3: Kamaraj Salai (E)',
      directionLabel: 'Kamaraj Salai towards Beach & Town Center (East Approach)',
      angleDegrees: 90,
      coords: { lat: 11.94154, lng: 79.80854 },
      state: activeIdx === 2 ? 'GREEN' : 'RED',
      isAmbulanceApproach: false
    },
    {
      id: 'STEM-4-CANAL',
      name: 'Stem 4: South Bridge / 100Ft',
      directionLabel: 'Across Bridge towards 100 Feet Road / Mudaliarpet (South Approach)',
      angleDegrees: 180,
      coords: { lat: 11.94105, lng: 79.80835 },
      state: activeIdx === 3 ? 'GREEN' : 'RED',
      isAmbulanceApproach: true
    },
    {
      id: 'STEM-5-CROSS',
      name: 'Stem 5: Cross Arterial (SW)',
      directionLabel: 'Arterial branch towards 2nd Cross & Thilaspet (SW Approach)',
      angleDegrees: 225,
      coords: { lat: 11.94135, lng: 79.80795 },
      state: activeIdx === 4 ? 'GREEN' : 'RED',
      isAmbulanceApproach: false
    }
  ];
}

class TrafficControlService {
  private signals: TrafficSignal[] = [
    {
      id: 'SIG-IG',
      name: 'Indira Gandhi Statue (IG)',
      locationLabel: 'Indira Gandhi Statue (NH45A / 100 Feet Rd / Maraimalai Adigal)',
      coords: { lat: 11.93157, lng: 79.80766 }, // EXACT YELLOW CIRCLE POSITION
      state: 'RED',
      isEmergencyOverride: false,
      cycleSeconds: 45,
      direction: '4-Way Junction: 100 Feet Rd to Muruga Theatre',
      geofenceRadius: 90, // Precise ~90m geofence covering the yellow marked area
      distanceToAmbulance: 0,
      isInsideGeofence: false,
      stems: createIGStems(false, 0)
    },
    {
      id: 'SIG-MURUGA',
      name: 'Muruga Theatre (5-Way)',
      locationLabel: 'Muruga Theatre 5-Way Rotary (Kamaraj Salai / 100 Feet Rd Jn)',
      coords: { lat: 11.94162, lng: 79.80825 },
      state: 'RED',
      isEmergencyOverride: false,
      cycleSeconds: 45,
      direction: '5-Arm Rotary Junction (100 Feet Rd / Kamaraj Salai)',
      geofenceRadius: 270, // Extended radius matching user's marked area in Image 1
      distanceToAmbulance: 0,
      isInsideGeofence: false,
      stems: createMurugaTheatreStems(false, 0)
    }
  ];

  private geofence: GeofenceArea = {
    name: 'Indira Gandhi Statue Geofence Area',
    center: { lat: 11.93157, lng: 79.80766 },
    radiusMeters: 90,
    targetSignalId: 'SIG-IG',
    isActive: true,
    isAmbulanceInside: true,
    distanceToAmbulance: 0,
    currentSignalName: 'Indira Gandhi Statue (IG)'
  };

  private ambulance: AmbulanceState = {
    id: 'AMB-108',
    name: 'Ambulance 04 (Emergency Unit)',
    lat: 11.93157,
    lng: 79.80766,
    speed: 56,
    heading: 0,
    status: 'Emergency Corridor',
    destination: 'IG Signal (Statue) -> Muruga Theatre 5-Way Rotary',
    routeProgress: 0,
    isConnected: true
  };

  private events: TrafficEvent[] = [
    {
      id: 'EVT-102',
      timestamp: '12:15:10 IST',
      title: 'GPS route locked along 100 Feet Road asphalt connecting IG Statue to Muruga Theatre 5-Way.',
      type: 'AMBULANCE_DISPATCH',
      severity: 'info'
    },
    {
      id: 'EVT-101',
      timestamp: '12:12:30 IST',
      title: 'Indira Gandhi Statue 4-way geofence armed: Stem 3 (North towards Muruga) ready for green preemption.',
      type: 'CORRIDOR_ACTIVE',
      severity: 'info'
    }
  ];

  private isSimRunning = true;
  private tickCount = 0;
  private waypointIndex = 0;
  private subStep = 0.0;
  private forwardDirection = true;
  private listeners: Array<() => void> = [];
  private intervalId: any = null;
  private lastActiveSignalId: string | null = null;

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    if (typeof window === 'undefined') return;
    // 80ms high-frequency tick for ultra-smooth gliding movement (Swiggy / Uber real-time delivery style)
    this.intervalId = setInterval(() => {
      if (!this.isSimRunning) return;

      this.tickCount++;
      this.stepAmbulanceRoute();
      this.checkGeofenceTransition();
      this.notify();
    }, 80);
  }

  private stepAmbulanceRoute() {
    const total = REAL_ROAD_CORRIDOR_ROUTE.length;
    this.subStep += 0.018;

    if (this.subStep >= 1) {
      this.subStep = 0;
      if (this.forwardDirection) {
        if (this.waypointIndex < total - 2) {
          this.waypointIndex += 1;
        } else {
          // Loop smoothly back and forth along the corridor
          this.forwardDirection = false;
        }
      } else {
        if (this.waypointIndex > 0) {
          this.waypointIndex -= 1;
        } else {
          this.forwardDirection = true;
        }
      }
    }

    const p1 = REAL_ROAD_CORRIDOR_ROUTE[this.waypointIndex];
    const targetIdx = this.forwardDirection ? this.waypointIndex + 1 : this.waypointIndex - 1;
    const p2 = REAL_ROAD_CORRIDOR_ROUTE[targetIdx] || p1;

    const currentLat = p1.lat + (p2.lat - p1.lat) * this.subStep;
    const currentLng = p1.lng + (p2.lng - p1.lng) * this.subStep;

    const heading = this.forwardDirection
      ? computeBearingDegrees(p1.lat, p1.lng, p2.lat, p2.lng)
      : (computeBearingDegrees(p1.lat, p1.lng, p2.lat, p2.lng) + 180) % 360;

    const progress = Math.round(((this.waypointIndex + this.subStep) / (total - 1)) * 100);

    const isInside = this.geofence.isAmbulanceInside;
    const speed = isInside ? 48 : 58;

    this.ambulance = {
      ...this.ambulance,
      lat: Number(currentLat.toFixed(5)),
      lng: Number(currentLng.toFixed(5)),
      heading: Math.round(heading),
      routeProgress: Math.min(100, Math.max(0, progress)),
      speed
    };
  }

  private checkGeofenceTransition() {
    // Normal cycle phase: changes sequentially every ~4.0 seconds (50 ticks of 80ms)
    const cyclePhase = Math.floor(this.tickCount / 50);

    let insideSignal: TrafficSignal | null = null;
    let closestSignal = this.signals[0];
    let minDistance = 999999;

    this.signals = this.signals.map((sig) => {
      const dist = Math.round(
        computeDistanceMeters(this.ambulance.lat, this.ambulance.lng, sig.coords.lat, sig.coords.lng)
      );

      if (dist < minDistance) {
        minDistance = dist;
        closestSignal = sig;
      }

      const radius = sig.geofenceRadius || 90;
      const isInside = dist <= radius;

      if (isInside && !insideSignal) {
        insideSignal = sig;
      }

      return {
        ...sig,
        distanceToAmbulance: dist,
        isInsideGeofence: isInside,
      };
    });

    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (insideSignal) {
      const activeSig = insideSignal as TrafficSignal;

      this.signals = this.signals.map((sig) => {
        if (sig.id === activeSig.id) {
          // EMERGENCY OVERRIDE: ONLY this active junction triggers corridor preemption
          let stems = sig.stems;
          if (sig.id === 'SIG-IG') {
            stems = createIGStems(true, cyclePhase);
          } else if (sig.id === 'SIG-MURUGA') {
            stems = createMurugaTheatreStems(true, cyclePhase);
          }

          return {
            ...sig,
            state: 'GREEN' as SignalLightColor,
            isEmergencyOverride: true,
            stems
          };
        }

        // Non-active signal maintains normal sequential cyclic order
        let stems = sig.stems;
        let state: SignalLightColor = 'RED';
        if (sig.id === 'SIG-IG') {
          stems = createIGStems(false, cyclePhase);
          state = (stems.find(s => s.state === 'GREEN')?.state || 'RED') as SignalLightColor;
        } else if (sig.id === 'SIG-MURUGA') {
          stems = createMurugaTheatreStems(false, cyclePhase);
          state = (stems.find(s => s.state === 'GREEN')?.state || 'RED') as SignalLightColor;
        }

        return {
          ...sig,
          state,
          isEmergencyOverride: false,
          stems
        };
      });

      this.geofence = {
        name: `${activeSig.name} Geofence Area`,
        center: activeSig.coords,
        radiusMeters: activeSig.geofenceRadius || 90,
        targetSignalId: activeSig.id,
        isActive: true,
        isAmbulanceInside: true,
        distanceToAmbulance: activeSig.distanceToAmbulance,
        currentSignalName: activeSig.name,
      };

      this.ambulance.status = 'Emergency Corridor';

      if (this.lastActiveSignalId !== activeSig.id) {
        this.lastActiveSignalId = activeSig.id;
        const approachLabel = activeSig.id === 'SIG-IG' 
          ? 'Stem 3 North (100Ft Rd to Muruga)' 
          : 'Stem 4 South (100Ft Rd Approach)';
        this.events.unshift({
          id: `EVT-${Date.now()}`,
          timestamp: `${nowTime} IST`,
          title: `🚨 Ambulance touched geofence at ${activeSig.name}! ${approachLabel} turned GREEN; other stems set to RED!`,
          type: 'GEOFENCE_ENTER',
          severity: 'urgent'
        });
      }
    } else {
      // Outside all geofences: NORMAL SEQUENTIAL SIGNAL ROTATION RESTORED!
      if (this.lastActiveSignalId !== null) {
        const clearedSig = this.signals.find((s) => s.id === this.lastActiveSignalId);
        const clearedName = clearedSig ? clearedSig.name : 'Intersection';
        this.lastActiveSignalId = null;

        this.events.unshift({
          id: `EVT-${Date.now()}`,
          timestamp: `${nowTime} IST`,
          title: `✅ Ambulance cleared ${clearedName} geofence. Restored normal cyclic sequential signal schedule.`,
          type: 'GEOFENCE_EXIT',
          severity: 'info'
        });
      }

      this.signals = this.signals.map((sig) => {
        let stems = sig.stems;
        let state: SignalLightColor = 'RED';

        if (sig.id === 'SIG-IG') {
          stems = createIGStems(false, cyclePhase);
          state = (stems.find(s => s.state === 'GREEN')?.state || 'RED') as SignalLightColor;
        } else if (sig.id === 'SIG-MURUGA') {
          stems = createMurugaTheatreStems(false, cyclePhase);
          state = (stems.find(s => s.state === 'GREEN')?.state || 'RED') as SignalLightColor;
        }

        return {
          ...sig,
          state,
          isEmergencyOverride: false,
          stems
        };
      });

      this.geofence = {
        name: `${closestSignal.name} Geofence Area`,
        center: closestSignal.coords,
        radiusMeters: closestSignal.geofenceRadius || 90,
        targetSignalId: closestSignal.id,
        isActive: true,
        isAmbulanceInside: false,
        distanceToAmbulance: minDistance,
        currentSignalName: closestSignal.name,
      };

      this.ambulance.status = 'En Route';
    }
  }

  // Public Methods
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
    return REAL_ROAD_CORRIDOR_ROUTE;
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
    this.forwardDirection = true;
    this.lastActiveSignalId = null;
    this.isSimRunning = true;
    this.stepAmbulanceRoute();
    this.checkGeofenceTransition();
    this.notify();
  }

  // Instantly teleport ambulance inside the specified geofence to demonstrate green preemption
  public triggerEnterGeofence(targetSignalId?: string) {
    const targetId = targetSignalId || 'SIG-IG';
    const sig = this.signals.find(s => s.id === targetId) || this.signals[0];

    if (sig.id === 'SIG-IG') {
      this.waypointIndex = 0; // Indira Gandhi Statue
      this.subStep = 0.0;
      this.forwardDirection = true;
      this.ambulance.lat = 11.93157;
      this.ambulance.lng = 79.80766;
    } else if (sig.id === 'SIG-MURUGA') {
      this.waypointIndex = 19; // Just crossing into Muruga Theatre from 100 Feet Rd South
      this.subStep = 0.1;
      this.forwardDirection = true;
      this.ambulance.lat = 11.94105;
      this.ambulance.lng = 79.80835;
    } else {
      this.ambulance.lat = sig.coords.lat;
      this.ambulance.lng = sig.coords.lng;
    }

    this.checkGeofenceTransition();
    this.notify();
  }

  public triggerExitGeofence() {
    // Position ambulance mid-route (near Rajiv Gandhi Hospital) outside both IG and Muruga geofences
    this.waypointIndex = 11;
    this.subStep = 0.0;
    this.forwardDirection = true;
    this.ambulance.lat = 11.93720;
    this.ambulance.lng = 79.80790;
    this.checkGeofenceTransition();
    this.notify();
  }

  public selectEmergencySignal(signalId: string) {
    const sig = this.signals.find((s) => s.id === signalId);
    if (sig) {
      this.geofence = {
        ...this.geofence,
        center: sig.coords,
        targetSignalId: sig.id,
        name: `${sig.name} Geofence Area`,
        currentSignalName: sig.name
      };

      if (sig.id === 'SIG-IG') {
        this.waypointIndex = 0;
        this.subStep = 0.0;
        this.forwardDirection = true;
      } else if (sig.id === 'SIG-MURUGA') {
        this.waypointIndex = 19;
        this.subStep = 0.1;
        this.forwardDirection = true;
      }

      this.checkGeofenceTransition();
      this.notify();
    }
  }

  public updateExternalAmbulanceGps(lat: number, lng: number, speed?: number, heading?: number) {
    this.ambulance = {
      ...this.ambulance,
      lat,
      lng,
      speed: speed ?? this.ambulance.speed,
      heading: heading ?? this.ambulance.heading,
      isConnected: true
    };
    this.checkGeofenceTransition();
    this.notify();
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
