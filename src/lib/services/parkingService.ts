import { VehicleDetection, EChallanRecord } from '../types/dashboard';

class ParkingMonitoringService {
  private vehicles: VehicleDetection[] = [
    {
      id: 'VEH-01',
      vehicleNo: 'PY-01-CA-4421',
      model: 'White Sedan (Swift Dzire)',
      color: '#FFFFFF',
      zone: 'NON_PARKING_AREA',
      status: 'ECHALLAN_ISSUED',
      durationSeconds: 740, // 12m 20s (> 10 mins)
      box: { top: 62, left: 16, width: 90, height: 110 },
      lastSeen: 'Just now'
    },
    {
      id: 'VEH-02',
      vehicleNo: 'TN-09-BZ-9012',
      model: 'Red Compact SUV (Brezza)',
      color: '#F52235',
      zone: 'NON_PARKING_AREA',
      status: 'VIOLATION',
      durationSeconds: 430, // 7m 10s
      box: { top: 43, left: 22, width: 75, height: 90 },
      lastSeen: 'Just now'
    },
    {
      id: 'VEH-03',
      vehicleNo: 'PY-01-BK-1102',
      model: 'Maroon Hatchback (i20)',
      color: '#A02030',
      zone: 'NON_PARKING_AREA',
      status: 'WARNING',
      durationSeconds: 560, // 9m 20s (approaching 10 min)
      box: { top: 29, left: 28, width: 60, height: 70 },
      lastSeen: 'Just now'
    },
    {
      id: 'VEH-04',
      vehicleNo: 'PY-01-ER-8842',
      model: 'Bajaj Auto Rickshaw',
      color: '#FFB800',
      zone: 'PARKING_AREA',
      status: 'ALLOWED',
      durationSeconds: 15,
      box: { top: 68, left: 63, width: 55, height: 75 },
      lastSeen: 'Moving'
    }
  ];

  private challans: EChallanRecord[] = [
    {
      id: 'ECH-PUDU-9824',
      vehicleNo: 'PY-01-CA-4421',
      violationType: 'Strict No-Parking Kerbside Obstruction',
      location: 'Beach Road (Opposite Promenade)',
      timestamp: 'Today, 14:32 IST',
      durationMinutes: 12,
      fineAmount: 1500,
      status: 'Generated',
      evidenceImage: '/beach_road_camera.jpg'
    }
  ];

  private speedMultiplier = 1;
  private isCameraConnected = true;
  private listeners: Array<() => void> = [];
  private intervalId: any = null;

  constructor() {
    this.startSimulationClock();
  }

  private startSimulationClock() {
    if (typeof window === 'undefined') return;
    this.intervalId = setInterval(() => {
      let stateChanged = false;
      this.vehicles = this.vehicles.map((v) => {
        if (v.zone === 'NON_PARKING_AREA') {
          const nextDuration = v.durationSeconds + 1 * this.speedMultiplier;
          let nextStatus = v.status;
          
          if (nextDuration >= 600) {
            nextStatus = 'ECHALLAN_ISSUED';
            if (v.status !== 'ECHALLAN_ISSUED') {
              this.generateChallan(v);
            }
          } else if (nextDuration >= 480) {
            nextStatus = 'WARNING';
          } else {
            nextStatus = 'VIOLATION';
          }

          stateChanged = true;
          return {
            ...v,
            durationSeconds: nextDuration,
            status: nextStatus
          };
        }
        return v;
      });

      if (stateChanged) {
        this.notify();
      }
    }, 1000);
  }

  private generateChallan(v: VehicleDetection) {
    const exists = this.challans.some((c) => c.vehicleNo === v.vehicleNo);
    if (!exists) {
      this.challans.unshift({
        id: `ECH-PUDU-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicleNo: v.vehicleNo,
        violationType: 'No-Parking Kerbside Obstruction (> 10 Min Exceeded)',
        location: 'Beach Road (Opposite Promenade)',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: Math.round(v.durationSeconds / 60),
        fineAmount: 1500,
        status: 'Generated',
        evidenceImage: '/beach_road_camera.jpg'
      });
    }
  }

  public getVehicles(): VehicleDetection[] {
    return [...this.vehicles];
  }

  public getChallans(): EChallanRecord[] {
    return [...this.challans];
  }

  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  public setSpeedMultiplier(mult: number) {
    this.speedMultiplier = mult;
    this.notify();
  }

  public getIsCameraConnected(): boolean {
    return this.isCameraConnected;
  }

  public toggleCamera() {
    this.isCameraConnected = !this.isCameraConnected;
    this.notify();
  }

  public addViolationVehicle() {
    const regNum = `PY-01-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCar: VehicleDetection = {
      id: `VEH-${Date.now().toString().slice(-4)}`,
      vehicleNo: regNum,
      model: 'Silver Sedan (Ciaz)',
      color: '#C0C0C0',
      zone: 'NON_PARKING_AREA',
      status: 'VIOLATION',
      durationSeconds: 30,
      box: { top: 22, left: 34, width: 50, height: 60 },
      lastSeen: 'Just now'
    };
    this.vehicles.push(newCar);
    this.notify();
  }

  public fastForwardTenMinutes() {
    this.vehicles = this.vehicles.map((v) => {
      if (v.zone === 'NON_PARKING_AREA') {
        const nextDur = Math.max(v.durationSeconds, 630);
        const updated = { ...v, durationSeconds: nextDur, status: 'ECHALLAN_ISSUED' as const };
        this.generateChallan(updated);
        return updated;
      }
      return v;
    });
    this.notify();
  }

  public removeVehicle(id: string) {
    this.vehicles = this.vehicles.filter((v) => v.id !== id);
    this.notify();
  }

  public resetSimulation() {
    this.vehicles = [
      {
        id: 'VEH-01',
        vehicleNo: 'PY-01-CA-4421',
        model: 'White Sedan (Swift Dzire)',
        color: '#FFFFFF',
        zone: 'NON_PARKING_AREA',
        status: 'VIOLATION',
        durationSeconds: 120,
        box: { top: 62, left: 16, width: 90, height: 110 },
        lastSeen: 'Just now'
      },
      {
        id: 'VEH-02',
        vehicleNo: 'TN-09-BZ-9012',
        model: 'Red Compact SUV (Brezza)',
        color: '#F52235',
        zone: 'NON_PARKING_AREA',
        status: 'VIOLATION',
        durationSeconds: 430,
        box: { top: 43, left: 22, width: 75, height: 90 },
        lastSeen: 'Just now'
      },
      {
        id: 'VEH-03',
        vehicleNo: 'PY-01-BK-1102',
        model: 'Maroon Hatchback (i20)',
        color: '#A02030',
        zone: 'NON_PARKING_AREA',
        status: 'WARNING',
        durationSeconds: 560,
        box: { top: 29, left: 28, width: 60, height: 70 },
        lastSeen: 'Just now'
      },
      {
        id: 'VEH-04',
        vehicleNo: 'PY-01-ER-8842',
        model: 'Bajaj Auto Rickshaw',
        color: '#FFB800',
        zone: 'PARKING_AREA',
        status: 'ALLOWED',
        durationSeconds: 15,
        box: { top: 68, left: 63, width: 55, height: 75 },
        lastSeen: 'Moving'
      }
    ];
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

export const parkingService = new ParkingMonitoringService();
