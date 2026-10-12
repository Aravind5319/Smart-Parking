import { Client, Account, Databases, Storage } from 'appwrite';
import { appwriteConfig } from './config';

const client = new Client();

if (appwriteConfig.endpoint && appwriteConfig.projectId) {
  client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Helper to construct image URL from Appwrite bucket or fallback path
export function getAppwriteImageUrl(imageIdOrUrl?: string, fallbackUrl: string = '/beach_road_camera.jpg'): string {
  if (!imageIdOrUrl || typeof imageIdOrUrl !== 'string' || !imageIdOrUrl.trim()) return fallbackUrl;
  
  const cleanUrl = imageIdOrUrl.trim();

  // If already a full URL or local path
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('/')) {
    return cleanUrl.replace(/&impersonateuserid=$/, '');
  }

  // Appwrite file ID
  try {
    return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${cleanUrl}/view?project=${appwriteConfig.projectId}`;
  } catch {
    return fallbackUrl;
  }
}

export default client;
