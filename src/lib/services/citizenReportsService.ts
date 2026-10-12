import { CitizenReport } from '../types/dashboard';

class CitizenReportsService {
  private reports: CitizenReport[] = [
    {
      id: 'REP-2025-01',
      title: 'Illegal Parking',
      category: 'Illegal Parking',
      description: 'Car parked in no-parking zone causing traffic obstruction near promenade entrance.',
      imageUrl: '/beach_road_camera.jpg',
      location: 'Puducherry Beach Road',
      coords: { lat: 11.9352, lng: 79.8360 },
      reportedTime: '2 mins ago',
      status: 'Pending',
      reporterName: 'M. Saravanan',
      reporterContact: '+91 94421 •••••'
    },
    {
      id: 'REP-2025-02',
      title: 'Road Damage',
      category: 'Road Damage',
      description: 'Large pothole on main road after rain, two-wheelers skidding frequently.',
      imageUrl: '/pothole.jpg',
      location: 'Ranga Pillai Street',
      coords: { lat: 11.9335, lng: 79.8310 },
      reportedTime: '12 mins ago',
      status: 'In Progress',
      reporterName: 'K. Priya',
      reporterContact: '+91 98412 •••••'
    },
    {
      id: 'REP-2025-03',
      title: 'Suspicious Person',
      category: 'Suspicious Person',
      description: 'Person in hoodie loitering near passenger waiting bays for over 45 minutes.',
      imageUrl: '/suspicious.jpg',
      location: 'Old Bus Stand',
      coords: { lat: 11.9265, lng: 79.8235 },
      reportedTime: '25 mins ago',
      status: 'Pending',
      reporterName: 'T. Balaji',
      reporterContact: '+91 97901 •••••'
    },
    {
      id: 'REP-2025-04',
      title: 'Street Light Not Working',
      category: 'Street Light Not Working',
      description: 'Street light not working near junction causing complete darkness at night.',
      imageUrl: '/streetlight.jpg',
      location: 'Netaji Nagar',
      coords: { lat: 11.9220, lng: 79.8290 },
      reportedTime: '40 mins ago',
      status: 'Resolved',
      reporterName: 'S. Anand',
      reporterContact: '+91 94863 •••••'
    }
  ];

  private listeners: Array<() => void> = [];

  public getReports(): CitizenReport[] {
    return [...this.reports];
  }

  public updateStatus(id: string, status: CitizenReport['status']) {
    this.reports = this.reports.map((r) => (r.id === id ? { ...r, status } : r));
    this.notify();
  }

  public addReport(report: Omit<CitizenReport, 'id' | 'reportedTime'>) {
    const newRecord: CitizenReport = {
      ...report,
      id: `REP-2025-0${this.reports.length + 1}`,
      reportedTime: 'Just now'
    };
    this.reports.unshift(newRecord);
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

export const citizenReportsService = new CitizenReportsService();
