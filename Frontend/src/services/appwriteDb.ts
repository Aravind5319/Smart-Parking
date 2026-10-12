// ============================================================================
// APPWRITE DATABASE SERVICE - PARKPUDUVAI BACKEND
// Handles Live Parking Bays, Citizen Violation Reports, & Traffic Bulletins
// ============================================================================

import { Client, Databases, Storage, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG, isAppwriteConfigured } from '../config/appwrite';
import { ParkingZone, REAL_PUDUCHERRY_ZONES } from './parkingService';
import { ViolationReport, TrafficAdvisory } from '../types/navigation';
import { MOCK_TICKETS, MOCK_ADVISORIES } from '../data/mockData';

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
  .setProject(APPWRITE_CONFIG.PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);

// In-memory & local cache for fast responsive UI & offline support (camera Wi-Fi with no internet)
let cachedZones: ParkingZone[] = [...REAL_PUDUCHERRY_ZONES];
let cachedTickets: ViolationReport[] = [...MOCK_TICKETS];
let cachedAdvisories: TrafficAdvisory[] = [...MOCK_ADVISORIES];

try {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('parkpuduvai_zones_cache');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedZones = parsed;
      }
    }
  }
} catch (e) {
  // Ignore storage access errors
}

const withTimeout = <T>(promise: Promise<T>, ms = 2000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Appwrite network timeout (offline mode)')), ms)
    ),
  ]);
};

export const AppwriteDb = {
  client,
  databases,
  storage,

  /**
   * Check connection status to Appwrite backend
   */
  async testConnection(): Promise<{ connected: boolean; message: string }> {
    if (!isAppwriteConfigured()) {
      return {
        connected: false,
        message: 'Appwrite Project ID not set. Running in local fallback mode.',
      };
    }
    try {
      await withTimeout(
        databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.PARKING_ZONES,
          [Query.limit(1)]
        ),
        2000
      );
      return {
        connected: true,
        message: 'Successfully connected to Appwrite Database!',
      };
    } catch (err: any) {
      return {
        connected: false,
        message: err?.message || 'Failed to connect to Appwrite backend.',
      };
    }
  },

  // ==========================================================================
  // PARKING ZONES
  // ==========================================================================

  /**
   * Fetch live parking zones from Appwrite DB (with seamless fallback)
   */
  async fetchParkingZones(): Promise<ParkingZone[]> {
    if (!isAppwriteConfigured()) {
      return cachedZones;
    }

    try {
      const response = await withTimeout(
        databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.PARKING_ZONES,
          [Query.limit(50)]
        ),
        2500
      );

      if (response && response.documents && response.documents.length > 0) {
        const parsed: ParkingZone[] = response.documents.map((doc: any) => ({
          id: doc.zoneId || doc.$id,
          name: doc.name,
          streetName: doc.streetName,
          area: doc.area,
          coordinates: {
            latitude: doc.latitude,
            longitude: doc.longitude,
          },
          type: doc.type,
          category: doc.category,
          totalSlots: doc.totalSlots,
          occupiedSlots: doc.occupiedSlots,
          isFull: doc.occupiedSlots >= doc.totalSlots,
          hourlyRate: doc.hourlyRate,
          walkingTimeMin: doc.walkingTimeMin,
          distanceKm: doc.distanceKm,
          vehicleTypes: doc.vehicleTypes || (doc.name && doc.name.toLowerCase().includes('bike') ? ['2-Wheeler'] : ['4-Wheeler', '2-Wheeler']),
          sensorType: doc.sensorType,
          sensorStatus: doc.sensorStatus,
          trafficLevel: doc.trafficLevel,
          trafficDelayMin: doc.trafficDelayMin,
          imageUrl: doc.imageUrl || undefined,
        }));
        cachedZones = parsed;
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('parkpuduvai_zones_cache', JSON.stringify(parsed));
          }
        } catch (e) {}
        return parsed;
      }
      return cachedZones;
    } catch (error) {
      console.warn('[Appwrite] Fetch parking zones offline/timeout fallback to local:', error);
      return cachedZones;
    }
  },

  /**
   * Update occupied slot count in Appwrite DB
   */
  async updateOccupancy(zoneId: string, occupiedSlots: number): Promise<boolean> {
    const zone = cachedZones.find((z) => z.id === zoneId);
    if (zone) {
      zone.occupiedSlots = occupiedSlots;
      zone.isFull = occupiedSlots >= (zone.totalSlots || 0);
    }

    if (!isAppwriteConfigured()) {
      return true;
    }

    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PARKING_ZONES,
        zoneId,
        {
          occupiedSlots,
          isFull: zone ? zone.isFull : false,
        }
      );
      return true;
    } catch (err) {
      console.warn('[Appwrite] Failed to update zone occupancy:', err);
      return false;
    }
  },

  // ==========================================================================
  // VIOLATION REPORTS / COMPLAINTS
  // ==========================================================================

  /**
   * Save a new citizen violation report to Appwrite DB
   */
  async createViolationReport(report: ViolationReport): Promise<{ success: boolean; documentId?: string }> {
    // Optimistic local update
    cachedTickets = [report, ...cachedTickets];

    if (!isAppwriteConfigured()) {
      return { success: true, documentId: report.id };
    }

    try {
      const doc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.VIOLATION_REPORTS,
        ID.unique(),
        {
          referenceNo: report.referenceNo,
          photoUri: report.photoUri || '',
          latitude: report.location.latitude,
          longitude: report.location.longitude,
          landmark: report.location.landmark,
          vehicleNumber: report.vehicleNumber,
          violationType: report.violationType,
          otherDescription: report.otherDescription || '',
          timestamp: report.timestamp,
          status: report.status,
          karmaPoints: report.karmaPoints,
          policeNote: report.policeNote || '',
          challanNumber: report.challanNumber || '',
        }
      );
      return { success: true, documentId: doc.$id };
    } catch (err) {
      console.warn('[Appwrite] Error creating violation report:', err);
      return { success: true, documentId: report.id };
    }
  },

  /**
   * Fetch all violation reports submitted by citizens
   */
  async fetchViolationReports(): Promise<ViolationReport[]> {
    if (!isAppwriteConfigured()) {
      return cachedTickets;
    }

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.VIOLATION_REPORTS,
        [Query.orderDesc('$createdAt'), Query.limit(50)]
      );

      if (response.documents.length > 0) {
        const parsed: ViolationReport[] = response.documents.map((doc: any) => ({
          id: doc.$id,
          referenceNo: doc.referenceNo,
          photoUri: doc.photoUri || null,
          location: {
            latitude: doc.latitude,
            longitude: doc.longitude,
            landmark: doc.landmark,
            accuracy: 5,
            timestamp: doc.timestamp,
          },
          vehicleNumber: doc.vehicleNumber,
          violationType: doc.violationType,
          otherDescription: doc.otherDescription,
          timestamp: doc.timestamp,
          status: doc.status,
          karmaPoints: doc.karmaPoints || 50,
          policeNote: doc.policeNote,
          challanNumber: doc.challanNumber,
        }));
        cachedTickets = parsed;
        return parsed;
      }
      return cachedTickets;
    } catch (err) {
      console.warn('[Appwrite] Fetch complaints fallback:', err);
      return cachedTickets;
    }
  },

  // ==========================================================================
  // TRAFFIC ADVISORIES
  // ==========================================================================

  /**
   * Fetch official Puducherry Police traffic advisories
   */
  async fetchTrafficAdvisories(): Promise<TrafficAdvisory[]> {
    if (!isAppwriteConfigured()) {
      return cachedAdvisories;
    }

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.TRAFFIC_ADVISORIES,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
      );

      if (response.documents.length > 0) {
        const parsed: TrafficAdvisory[] = response.documents.map((doc: any) => ({
          id: doc.$id,
          title: doc.title,
          description: doc.description,
          severity: doc.severity,
          activeTime: doc.activeTime,
          affectedRoads: doc.affectedRoads,
        }));
        cachedAdvisories = parsed;
        return parsed;
      }
      return cachedAdvisories;
    } catch (err) {
      console.warn('[Appwrite] Fetch advisories fallback:', err);
      return cachedAdvisories;
    }
  },
};
