import { LostFoundItem } from '../types/dashboard';
import client, { databases, getAppwriteImageUrl } from '../appwrite/client';
import { appwriteConfig } from '../appwrite/config';
import { Query, ID } from 'appwrite';

const INITIAL_ITEMS: LostFoundItem[] = [
  {
    id: 'LF-2025-01',
    title: 'Brown Wallet',
    category: 'Personal Accessories',
    description: "Men's genuine brown leather bi-fold wallet containing government ID and bus pass.",
    imageUrl: '/wallet.jpg',
    foundLocation: 'Beach Road',
    coords: { lat: 11.9340, lng: 79.8365 },
    reportedTime: '2 hrs ago',
    status: 'Unclaimed',
    contactPerson: 'Constable Murugan (Beat 01)'
  },
  {
    id: 'LF-2025-02',
    title: 'Mobile Phone',
    category: 'Electronics',
    description: 'Sleek black Android smartphone found on passenger waiting bench near Bay 3.',
    imageUrl: '/phone.jpg',
    foundLocation: 'Bus Stand',
    coords: { lat: 11.9260, lng: 79.8230 },
    reportedTime: '4 hrs ago',
    status: 'Unclaimed',
    contactPerson: 'Duty Officer Selvam'
  },
  {
    id: 'LF-2025-03',
    title: 'Bike Helmet',
    category: 'Vehicle Gear',
    description: 'Matte black full-face motorcycle helmet with tinted visor left on sidewalk.',
    imageUrl: '/helmet.jpg',
    foundLocation: 'White Town',
    coords: { lat: 11.9325, lng: 79.8335 },
    reportedTime: '6 hrs ago',
    status: 'Unclaimed',
    contactPerson: 'Traffic Warden Arumugam'
  }
];

class LostFoundService {
  private items: LostFoundItem[] = [...INITIAL_ITEMS];
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

  public async fetchFromAppwrite() {
    if (!appwriteConfig.databaseId || !appwriteConfig.collections.lostFound) {
      return;
    }

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lostFound,
        [Query.orderDesc('$createdAt'), Query.limit(50)]
      );

      if (response && response.documents && response.documents.length > 0) {
        const fetchedItems: LostFoundItem[] = response.documents.map((doc: any) =>
          this.mapDocumentToItem(doc)
        );

        const combined = [...fetchedItems];
        INITIAL_ITEMS.forEach(seed => {
          if (!combined.some(i => i.id === seed.id || i.rawAppwriteId === seed.id)) {
            combined.push(seed);
          }
        });

        this.items = combined;
        this.isConnectedToAppwrite = true;
        this.notify();
      } else {
        this.isConnectedToAppwrite = true;
      }
    } catch (err: any) {
      console.warn('Appwrite lost_and_found fetch note (using local catalog):', err?.message || err);
      this.isConnectedToAppwrite = false;
    }
  }

  private mapDocumentToItem(doc: any): LostFoundItem {
    const rawTime = doc.$createdAt
      ? new Date(doc.$createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : 'Recently';
    
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
      doc.fileUri || 
      doc.imageUri || 
      doc.image || 
      doc.attachment || 
      doc.attachmentId || 
      doc.mediaId;

    let fallbackImage = '/wallet.jpg';
    const lowerTitle = (doc.title || doc.itemName || '').toLowerCase();
    if (lowerTitle.includes('phone') || lowerTitle.includes('mobile')) {
      fallbackImage = '/phone.jpg';
    } else if (lowerTitle.includes('helmet')) {
      fallbackImage = '/helmet.jpg';
    }

    const finalImageUrl = getAppwriteImageUrl(imageKey, fallbackImage);

    return {
      id: doc.$id || `LF-${Date.now()}`,
      rawAppwriteId: doc.$id,
      title: doc.title || doc.itemName || doc.item_name || 'Unspecified Recovered Item',
      category: doc.category || 'Personal Accessories',
      description: doc.description || doc.details || 'Found item deposited at police custody desk.',
      imageUrl: finalImageUrl,
      foundLocation: doc.foundLocation || doc.location || doc.place || 'Puducherry Command Sector',
      coords: {
        lat: Number(doc.latitude || doc.lat || 11.9338),
        lng: Number(doc.longitude || doc.lng || 79.8297)
      },
      reportedTime: rawTime,
      status: this.normalizeStatus(doc.status),
      contactPerson: doc.contactPerson || doc.custodian || doc.officer || 'Police Control Room Officer'
    };
  }

  private normalizeStatus(statusRaw?: string): LostFoundItem['status'] {
    if (!statusRaw) return 'Unclaimed';
    const s = String(statusRaw).toLowerCase();
    if (s.includes('claim') && !s.includes('unclaim')) return 'Claimed';
    if (s.includes('verif')) return 'Under Verification';
    return 'Unclaimed';
  }

  private setupRealtimeSubscription() {
    if (typeof window === 'undefined') return;
    if (!appwriteConfig.databaseId || !appwriteConfig.collections.lostFound) return;

    try {
      const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collections.lostFound}.documents`;

      this.unsubscribeRealtime = client.subscribe(channel, (response: any) => {
        if (!response || !response.payload) return;
        const payload = response.payload;

        const isCreate = response.events.some((e: string) => e.includes('.create'));
        const isUpdate = response.events.some((e: string) => e.includes('.update'));
        const isDelete = response.events.some((e: string) => e.includes('.delete'));

        if (isCreate) {
          const newItem = this.mapDocumentToItem(payload);
          this.items = [newItem, ...this.items.filter(i => i.id !== newItem.id)];
          this.notify();
        } else if (isUpdate) {
          const updated = this.mapDocumentToItem(payload);
          this.items = this.items.map(i => (i.id === updated.id || i.rawAppwriteId === updated.id ? updated : i));
          this.notify();
        } else if (isDelete) {
          this.items = this.items.filter(i => i.id !== payload.$id && i.rawAppwriteId !== payload.$id);
          this.notify();
        }
      });
    } catch (err) {
      console.warn('Lost & Found realtime subscription fallback note:', err);
    }
  }

  public getItems(): LostFoundItem[] {
    return [...this.items];
  }

  public isAppwriteLive(): boolean {
    return this.isConnectedToAppwrite;
  }

  public async updateStatus(id: string, status: LostFoundItem['status']) {
    this.items = this.items.map((i) => (i.id === id || i.rawAppwriteId === id ? { ...i, status } : i));
    this.notify();

    if (!appwriteConfig.databaseId || !appwriteConfig.collections.lostFound) return;

    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lostFound,
        id,
        { status }
      );
    } catch (e) {
      console.warn('Appwrite lost & found status updated locally:', id);
    }
  }

  public async addItem(item: Omit<LostFoundItem, 'id' | 'reportedTime'>) {
    const newItem: LostFoundItem = {
      ...item,
      id: `LF-2026-0${this.items.length + 1}`,
      reportedTime: 'Just now'
    };
    this.items.unshift(newItem);
    this.notify();

    if (!appwriteConfig.databaseId || !appwriteConfig.collections.lostFound) return;

    try {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lostFound,
        ID.unique(),
        {
          title: item.title,
          category: item.category,
          description: item.description,
          imageUrl: item.imageUrl,
          foundLocation: item.foundLocation,
          latitude: item.coords.lat,
          longitude: item.coords.lng,
          status: item.status,
          contactPerson: item.contactPerson
        }
      );
      if (doc && doc.$id) {
        newItem.rawAppwriteId = doc.$id;
      }
    } catch (e) {
      console.warn('Appwrite lost & found item saved locally:', item.title);
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
    if (this.unsubscribeRealtime) {
      this.unsubscribeRealtime();
    }
  }
}

export const lostFoundService = new LostFoundService();
