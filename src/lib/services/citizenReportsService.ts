import { CitizenReport, CitizenReportStatus } from '../types/dashboard';
import client, { databases, getAppwriteImageUrl } from '../appwrite/client';
import { appwriteConfig } from '../appwrite/config';
import { Query } from 'appwrite';

const INITIAL_REPORTS: CitizenReport[] = [
  {
    id: 'REP-2026-01',
    title: 'Illegal Parking (No-Parking Clearway)',
    category: 'Illegal Parking',
    registrationPlate: 'PY-01-BK-1102',
    description: 'White SUV parked in designated yellow-kerb clearway creating severe bottleneck near promenade entrance.',
    imageUrl: '/beach_road_camera.jpg',
    location: 'Puducherry Beach Road (Goubert Ave)',
    coords: { lat: 11.9352, lng: 79.8360 },
    reportedTime: '2 mins ago',
    status: 'PENDING',
    reporterName: 'M. Saravanan',
    reporterContact: '+91 94421 •••••',
    penaltyAmount: 500,
    mvaSection: 'Section 122 MVA (Obstruction of Flow)'
  },
  {
    id: 'REP-2026-02',
    title: 'Hazardous Road Pothole Damage',
    category: 'Road Damage',
    registrationPlate: 'N/A',
    description: 'Deep rainwater cavity in carriageway lane causing two-wheeler skids during morning transit peak.',
    imageUrl: '/pothole.jpg',
    location: 'Ranga Pillai Street & MG Road Jn',
    coords: { lat: 11.9335, lng: 79.8310 },
    reportedTime: '12 mins ago',
    status: 'In Progress',
    reporterName: 'K. Priya',
    reporterContact: '+91 98412 •••••',
    mvaSection: 'Civic Hazard Notice'
  },
  {
    id: 'REP-2026-03',
    title: 'Suspicious Vehicle Loitering',
    category: 'Suspicious Person',
    registrationPlate: 'TN-09-BZ-9012',
    description: 'Black sedan engine running near passenger arrival shelter with covered front plates for over 45 minutes.',
    imageUrl: '/suspicious.jpg',
    location: 'Old Bus Stand (Maraimalai Adigal)',
    coords: { lat: 11.9265, lng: 79.8235 },
    reportedTime: '25 mins ago',
    status: 'PENDING',
    reporterName: 'T. Balaji',
    reporterContact: '+91 97901 •••••',
    penaltyAmount: 1000,
    mvaSection: 'Section 177 MVA (Defective Number Plate)'
  },
  {
    id: 'REP-2026-04',
    title: 'Street Light Cluster Offline',
    category: 'Street Light Not Working',
    registrationPlate: 'N/A',
    description: 'Overhead electrical luminaire cluster non-functional creating blind corner hazard for night commuters.',
    imageUrl: '/streetlight.jpg',
    location: 'Netaji Nagar Arterial Bend',
    coords: { lat: 11.9220, lng: 79.8290 },
    reportedTime: '40 mins ago',
    status: 'Resolved',
    reporterName: 'S. Anand',
    reporterContact: '+91 94863 •••••'
  }
];

class CitizenReportsService {
  private reports: CitizenReport[] = [...INITIAL_REPORTS];
  private listeners: Array<() => void> = [];
  private isConnectedToAppwrite = false;
  private unsubscribeRealtime: (() => void) | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    await this.fetchFromAppwrite();
    this.setupRealtimeSubscription();
  }

  // Fetch reports from Appwrite Cloud violation_reports collection
  public async fetchFromAppwrite() {
    if (!appwriteConfig.databaseId || !appwriteConfig.collections.violationReports) {
      return;
    }

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.violationReports,
        [Query.orderDesc('$createdAt'), Query.limit(50)]
      );

      if (response && response.documents && response.documents.length > 0) {
        const fetchedReports: CitizenReport[] = response.documents.map((doc: any) =>
          this.mapDocumentToReport(doc)
        );

        // Deduplicate against seed data by ID
        const combined = [...fetchedReports];
        INITIAL_REPORTS.forEach(seed => {
          if (!combined.some(r => r.id === seed.id || r.rawAppwriteId === seed.id)) {
            combined.push(seed);
          }
        });

        this.reports = combined;
        this.isConnectedToAppwrite = true;
        this.notify();
      } else {
        this.isConnectedToAppwrite = true;
      }
    } catch (err: any) {
      console.warn('Appwrite violation_reports fetch note (falling back to initial feed):', err?.message || err);
      this.isConnectedToAppwrite = false;
    }
  }

  // Map arbitrary mobile app Appwrite schema to uniform dashboard report
  private mapDocumentToReport(doc: any): CitizenReport {
    let rawTime = doc.timestamp;
    if (!rawTime || rawTime === 'Just now') {
      if (doc.$createdAt) {
        const diffMs = Date.now() - new Date(doc.$createdAt).getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1) rawTime = 'Just now';
        else if (diffMins < 60) rawTime = `${diffMins} mins ago`;
        else {
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) rawTime = `${diffHours} hrs ago`;
          else rawTime = new Date(doc.$createdAt).toLocaleDateString('en-IN');
        }
      } else {
        rawTime = 'Just now';
      }
    }

    // Check all possible field names for evidence image/photo from mobile app
    const imageKey = 
      doc.photoUri || 
      doc.photoUrl || 
      doc.photoURL || 
      doc.photo || 
      doc.photoId || 
      doc.fileId || 
      doc.imageId || 
      doc.imageUrl || 
      doc.evidenceImage || 
      doc.evidencePhoto || 
      doc.evidenceUri || 
      doc.evidenceUrl || 
      doc.fileUri || 
      doc.imageUri || 
      doc.image || 
      doc.attachment || 
      doc.attachmentId || 
      doc.mediaId;

    const finalImageUrl = getAppwriteImageUrl(imageKey);

    const formatTitle = (type?: string, fallback?: string) => {
      const raw = type || fallback;
      if (!raw) return 'Citizen Traffic Violation';
      if (raw === 'NO_PARKING_ZONE') return 'Illegal Parking (No Parking Zone)';
      if (raw === 'WRONG_WAY') return 'Dangerous Wrong-Way Driving';
      if (raw === 'RED_LIGHT_JUMP') return 'Traffic Signal Red-Light Jump';
      if (raw === 'TRIPLE_RIDING') return 'Triple Riding Two-Wheeler';
      if (raw === 'NO_HELMET') return 'Riding Without Safety Helmet';
      if (raw === 'FOOTPATH_PARKING') return 'Footpath Obstruction';
      if (raw === 'OTHERS') return 'Traffic Infraction Report';
      return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const title = formatTitle(doc.violationType, doc.title);
    const category = doc.category || (doc.violationType ? doc.violationType.replace(/_/g, ' ') : 'Illegal Parking');
    const plate = doc.vehicleNumber || doc.registrationPlate || doc.vehicleNo || doc.plate || 'N/A';
    const description = 
      doc.otherDescription || 
      doc.description || 
      doc.notes || 
      doc.policeNote || 
      'Citizen traffic violation captured and verified via mobile enforcement app.';
    const location = doc.landmark || doc.location || doc.address || 'Puducherry Command Sector';

    return {
      id: doc.$id || doc.referenceNo || `REP-${Date.now()}`,
      rawAppwriteId: doc.$id,
      title,
      category,
      registrationPlate: plate,
      description,
      imageUrl: finalImageUrl,
      location,
      coords: {
        lat: Number(doc.latitude || doc.lat || 11.9352),
        lng: Number(doc.longitude || doc.lng || 79.8360)
      },
      reportedTime: rawTime,
      status: this.normalizeStatus(doc.status),
      reporterName: doc.reporterName || doc.citizenName || 'Verified Citizen Reporter',
      reporterContact: doc.reporterPhone || doc.reporterContact || '+91 94421 •••••',
      challanReference: doc.challanNumber || doc.challanReference || doc.challanRef || doc.challanNo,
      challanNotes: doc.policeNote || doc.challanNotes || doc.officerNotes,
      penaltyAmount: doc.penaltyAmount ? Number(doc.penaltyAmount) : 500,
      mvaSection: doc.mvaSection || 'Section 122 MVA (Obstruction of Flow)',
      rejectionReason: doc.rejectionReason || doc.dismissReason
    };
  }

  private normalizeStatus(statusRaw?: string): CitizenReportStatus {
    if (!statusRaw) return 'PENDING';
    const s = String(statusRaw).toUpperCase();
    if (s === 'CHALLAN_ISSUED' || s === 'APPROVED') return 'CHALLAN_ISSUED';
    if (s === 'ENFORCEMENT_COMPLETE' || s === 'TOWED') return 'ENFORCEMENT_COMPLETE';
    if (s === 'REJECTED' || s === 'DISMISSED') return 'REJECTED';
    if (s === 'IN PROGRESS') return 'In Progress';
    if (s === 'RESOLVED') return 'Resolved';
    if (s === 'SUBMITTED' || s === 'PENDING') return 'PENDING';
    return 'PENDING';
  }

  // Appwrite Realtime WebSocket Subscription
  private setupRealtimeSubscription() {
    if (typeof window === 'undefined') return;
    if (!appwriteConfig.databaseId || !appwriteConfig.collections.violationReports) return;

    try {
      const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collections.violationReports}.documents`;
      
      this.unsubscribeRealtime = client.subscribe(channel, (response: any) => {
        if (!response || !response.payload) return;
        const payload = response.payload;

        const isCreate = response.events.some((e: string) => e.includes('.create'));
        const isUpdate = response.events.some((e: string) => e.includes('.update'));
        const isDelete = response.events.some((e: string) => e.includes('.delete'));

        if (isCreate) {
          const newReport = this.mapDocumentToReport(payload);
          // Prepend so officer sees incoming reports instantly
          this.reports = [newReport, ...this.reports.filter(r => r.id !== newReport.id)];
          this.notify();
        } else if (isUpdate) {
          const updated = this.mapDocumentToReport(payload);
          this.reports = this.reports.map(r => (r.id === updated.id || r.rawAppwriteId === updated.id ? updated : r));
          this.notify();
        } else if (isDelete) {
          this.reports = this.reports.filter(r => r.id !== payload.$id && r.rawAppwriteId !== payload.$id);
          this.notify();
        }
      });
    } catch (err) {
      console.warn('Realtime subscription fallback note:', err);
    }
  }

  // POLICE ENFORCEMENT ACTION 1: Approve & Issue e-Challan
  public async issueChallan(reportId: string, details?: { mvaSection?: string; penaltyAmount?: number; notes?: string }) {
    const challanRef = `PY-ECH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const section = details?.mvaSection || 'Section 122 MVA (Obstruction of Flow)';
    const amount = details?.penaltyAmount ?? 500;
    const notes = details?.notes || 'E-Challan issued via Police Command Dashboard verification queue.';

    // Optimistic UI update
    this.reports = this.reports.map(r => {
      if (r.id === reportId || r.rawAppwriteId === reportId) {
        return {
          ...r,
          status: 'CHALLAN_ISSUED',
          challanReference: challanRef,
          mvaSection: section,
          penaltyAmount: amount,
          challanNotes: notes
        };
      }
      return r;
    });
    this.notify();

    // Sync to Appwrite if possible
    await this.updateAppwriteDoc(reportId, {
      status: 'CHALLAN_ISSUED',
      challanReference: challanRef,
      mvaSection: section,
      penaltyAmount: amount,
      challanNotes: notes
    });

    return challanRef;
  }

  // POLICE ENFORCEMENT ACTION 2: Dispatch Towing / Clear Obstruction
  public async dispatchTowing(reportId: string, notes?: string) {
    const towingNotes = notes || 'Towing unit dispatched. Obstruction scheduled for physical clearance.';

    this.reports = this.reports.map(r => {
      if (r.id === reportId || r.rawAppwriteId === reportId) {
        return {
          ...r,
          status: 'ENFORCEMENT_COMPLETE',
          challanNotes: towingNotes
        };
      }
      return r;
    });
    this.notify();

    await this.updateAppwriteDoc(reportId, {
      status: 'ENFORCEMENT_COMPLETE',
      challanNotes: towingNotes
    });
  }

  // POLICE ENFORCEMENT ACTION 3: Dismiss Report with Reason
  public async rejectReport(reportId: string, reason: string) {
    const dismissReason = reason || 'Evidence insufficient or vehicle not in violation.';

    this.reports = this.reports.map(r => {
      if (r.id === reportId || r.rawAppwriteId === reportId) {
        return {
          ...r,
          status: 'REJECTED',
          rejectionReason: dismissReason
        };
      }
      return r;
    });
    this.notify();

    await this.updateAppwriteDoc(reportId, {
      status: 'REJECTED',
      rejectionReason: dismissReason
    });
  }

  // Generic status update
  public async updateStatus(reportId: string, status: CitizenReportStatus) {
    this.reports = this.reports.map(r => (r.id === reportId || r.rawAppwriteId === reportId ? { ...r, status } : r));
    this.notify();

    await this.updateAppwriteDoc(reportId, { status });
  }

  private async updateAppwriteDoc(reportId: string, data: Record<string, any>) {
    if (!appwriteConfig.databaseId || !appwriteConfig.collections.violationReports) return;

    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.violationReports,
        reportId,
        data
      );
    } catch (e) {
      // Document might be a seed mock or appwrite offline
      console.warn('Appwrite update synced locally:', reportId);
    }
  }

  public getReports(): CitizenReport[] {
    return [...this.reports];
  }

  public isAppwriteLive(): boolean {
    return this.isConnectedToAppwrite;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public destroy() {
    if (this.unsubscribeRealtime) {
      this.unsubscribeRealtime();
    }
  }
}

export const citizenReportsService = new CitizenReportsService();
