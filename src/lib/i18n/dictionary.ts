export type Language = 'en' | 'ta';

export const dictionaries = {
  en: {
    dashboard: {
      title: 'Police Command Centre',
      overview: 'Overview',
      reports: 'Violation Reports',
      map: 'Live Traffic Map',
      zones: 'Parking & Kerb Zones',
      predictions: 'Predictive Intelligence',
      patrols: 'Patrol Dispatch',
      analytics: 'Analytics & Reports',
      audit: 'Audit Log',
      settings: 'Settings',
      search: 'Search reports, vehicles, zones...',
      pendingReports: 'Pending Reports',
      highPriority: 'High-Priority Violations',
      verifiedToday: 'Verified Reports Today',
      availableParking: 'Available Parking',
      activeAlerts: 'Active Traffic Alerts',
      reviewQueue: 'Review Queue',
      viewAll: 'View All Reports',
    }
  },
  ta: {
    dashboard: {
      title: 'காவல் கட்டுப்பாட்டு மையம்',
      overview: 'கண்ணோட்டம்',
      reports: 'விதிமீறல் புகார்கள்',
      map: 'நேரடி போக்குவரத்து வரைபடம்',
      zones: 'வாகன நிறுத்த மண்டலங்கள்',
      predictions: 'போக்குவரத்து முன்னறிவிப்பு',
      patrols: 'ரோந்து பணியமர்த்தல்',
      analytics: 'பகுப்பாய்வு மற்றும் அறிக்கைகள்',
      audit: 'தணிக்கைப் பதிவு',
      settings: 'அமைப்புகள்',
      search: 'தேடுக...',
      pendingReports: 'நிலுவையில் உள்ள புகார்கள்',
      highPriority: 'முக்கியமான விதிமீறல்கள்',
      verifiedToday: 'இன்று சரிபார்க்கப்பட்டவை',
      availableParking: 'காலியான இடங்கள்',
      activeAlerts: 'போக்குவரத்து எச்சரிக்கைகள்',
      reviewQueue: 'பரிசீலனை பட்டியல்',
      viewAll: 'அனைத்து புகார்களையும் காண்',
    }
  }
};

export function getDictionary(lang: Language) {
  return dictionaries[lang];
}
