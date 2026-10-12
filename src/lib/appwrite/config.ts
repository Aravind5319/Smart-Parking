export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6ac891a8002a7a9efbf8',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6ac8ad70001ee5f1f58d',
  collections: {
    violationReports: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'violation_reports',
    lostFound: process.env.NEXT_PUBLIC_APPWRITE_LOST_FOUND_COLLECTION_ID || 'lost_and_found',
  },
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '6ac89653002ecfd6cf10',
};
