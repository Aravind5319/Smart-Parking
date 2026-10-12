import { LostFoundItem } from '../types/dashboard';

class LostFoundService {
  private items: LostFoundItem[] = [
    {
      id: 'LF-2025-01',
      title: 'Brown Wallet',
      category: 'Personal Accessories',
      description: 'Men\'s genuine brown leather bi-fold wallet containing government ID and bus pass.',
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

  private listeners: Array<() => void> = [];

  public getItems(): LostFoundItem[] {
    return [...this.items];
  }

  public updateStatus(id: string, status: LostFoundItem['status']) {
    this.items = this.items.map((i) => (i.id === id ? { ...i, status } : i));
    this.notify();
  }

  public addItem(item: Omit<LostFoundItem, 'id' | 'reportedTime'>) {
    const newItem: LostFoundItem = {
      ...item,
      id: `LF-2025-0${this.items.length + 1}`,
      reportedTime: 'Just now'
    };
    this.items.unshift(newItem);
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
}

export const lostFoundService = new LostFoundService();
