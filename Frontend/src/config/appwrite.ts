// ============================================================================
// APPWRITE CONFIGURATION - PARKPUDUVAI BACKEND DATABASE
// ============================================================================

export const APPWRITE_CONFIG = {
  // Appwrite Cloud or Self-hosted Endpoint
  // Default cloud endpoint: https://cloud.appwrite.io/v1
  ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',

  // Appwrite Project ID (Found in Appwrite Console > Project Settings)
  PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'park-puduvai',

  // Database ID
  DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'park_puduvai_db',

  // Collection IDs
  COLLECTIONS: {
    PARKING_ZONES: 'parking_zones',
    VIOLATION_REPORTS: 'violation_reports',
    TRAFFIC_ADVISORIES: 'traffic_advisories',
  },

  // Storage Bucket ID for Citizen Evidence Photos
  BUCKETS: {
    VIOLATION_PHOTOS: 'violation_photos',
  },

  // Optional Server API Key (Used by setup scripts and administrative operations)
  API_KEY: process.env.APPWRITE_API_KEY || '',
};

// Helper to determine if Appwrite is configured with real credentials
export const isAppwriteConfigured = (): boolean => {
  return (
    Boolean(APPWRITE_CONFIG.PROJECT_ID) &&
    APPWRITE_CONFIG.PROJECT_ID !== 'park-puduvai' &&
    APPWRITE_CONFIG.PROJECT_ID !== 'YOUR_PROJECT_ID'
  );
};
