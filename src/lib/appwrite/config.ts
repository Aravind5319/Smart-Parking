export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.APPWRITE_DATABASE_ID || '',
  collections: {
    violationReports: process.env.APPWRITE_VIOLATION_REPORTS_COLLECTION_ID || '',
    parkingFacilities: process.env.APPWRITE_PARKING_FACILITIES_COLLECTION_ID || '',
    kerbZones: process.env.APPWRITE_KERB_ZONES_COLLECTION_ID || '',
    predictiveAlerts: process.env.APPWRITE_PREDICTIVE_ALERTS_COLLECTION_ID || '',
    patrolRoutes: process.env.APPWRITE_PATROL_ROUTES_COLLECTION_ID || '',
    auditLogs: process.env.APPWRITE_AUDIT_LOGS_COLLECTION_ID || '',
  },
  storageBucketId: process.env.APPWRITE_STORAGE_BUCKET_ID || '',
};
