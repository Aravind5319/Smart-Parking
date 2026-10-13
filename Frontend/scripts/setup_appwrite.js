/**
 * PARKPUDUVAI - AUTOMATED APPWRITE DATABASE SETUP & SEEDING SCRIPT
 * 
 * Usage:
 *   node scripts/setup_appwrite.js <ENDPOINT> <PROJECT_ID> <API_KEY>
 * 
 * Or set environment variables:
 *   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
 *   APPWRITE_PROJECT_ID=your_project_id
 *   APPWRITE_API_KEY=your_secret_api_key
 *   node scripts/setup_appwrite.js
 */

const { Client, Databases, Storage, Permission, Role, ID } = require('node-appwrite');

const ENDPOINT = process.argv[2] || process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.argv[3] || process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.argv[4] || process.env.APPWRITE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error('\x1b[31m[ERROR] Missing Appwrite Project ID or API Key!\x1b[0m');
  console.log('\nUsage:');
  console.log('  node scripts/setup_appwrite.js <ENDPOINT> <PROJECT_ID> <API_KEY>\n');
  console.log('Example:');
  console.log('  node scripts/setup_appwrite.js https://cloud.appwrite.io/v1 6708xxxxxx abcdef123456...\n');
  process.exit(1);
}

const client = new Client();
client
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = 'park_puduvai_db';
const COLL_ZONES = 'parking_zones';
const COLL_VIOLATIONS = 'violation_reports';
const COLL_ADVISORIES = 'traffic_advisories';
const BUCKET_PHOTOS = 'violation_photos';

const REAL_PUDUCHERRY_ZONES = [
  {
    zoneId: 'zone-test-mvit',
    name: 'Test 1 - MVIT Smart Parking',
    streetName: 'Kalitheerthalkuppam, NH-45A Villupuram Main Road',
    area: 'MVIT Campus Gate & Engineering Quad',
    latitude: 11.9226,
    longitude: 79.6269,
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 50,
    occupiedSlots: 15,
    hourlyRate: 'FREE (Campus Smart Gate)',
    walkingTimeMin: 1,
    distanceKm: 0.2,
    sensorType: 'Hardware Trueview Wi-Fi / Cloudflare Stream (Active Cam)',
    sensorStatus: 'Active Live Hardware Camera Stream',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 0,
    imageUrl: 'https://mvit.edu.in/wp-content/images/photo/8.jpg',
  },
  {
    zoneId: 'zone-mission-st',
    name: 'Mission Street Authorized Kerb Parking',
    streetName: 'Mission Street',
    area: 'Heritage Commercial Corridor',
    latitude: 11.9348,
    longitude: 79.8295,
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 35,
    occupiedSlots: 14,
    hourlyRate: 'FREE (2h Civic Limit)',
    walkingTimeMin: 3,
    distanceKm: 0.8,
    sensorType: 'ANPR Pole Camera 02 & Magnetic In-Ground Sensors',
    sensorStatus: 'Active (99.8% precision)',
    trafficLevel: 'MODERATE',
    trafficDelayMin: 2,
  },
  {
    zoneId: 'zone-white-town',
    name: 'White Town Kerb Parking',
    streetName: 'Rue Romain Rolland',
    area: 'French Quarter Heritage Zone',
    latitude: 11.9325,
    longitude: 79.8338,
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 20,
    occupiedSlots: 17,
    hourlyRate: 'Rs 20/hr (Municipal Receipt)',
    walkingTimeMin: 2,
    distanceKm: 0.4,
    sensorType: 'ANPR Cam 07 + Ultrasonic Kerb Node',
    sensorStatus: 'Active (3 spots remaining)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 0,
  },
  {
    zoneId: 'zone-rock-beach-north',
    name: 'Rock Beach North Bay Parking',
    streetName: 'Rue Saint Gilles / Goubert Ave Ext.',
    area: 'Promenade Waterfront North',
    latitude: 11.9360,
    longitude: 79.8355,
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 25,
    occupiedSlots: 19,
    hourlyRate: 'FREE (Beach Access Bay)',
    walkingTimeMin: 1,
    distanceKm: 0.5,
    sensorType: 'ANPR Cam 01 (Waterfront Pole)',
    sensorStatus: 'Live Video Feed Active',
    trafficLevel: 'CONGESTED',
    trafficDelayMin: 5,
  },
  {
    zoneId: 'zone-bharathi-park',
    name: 'Bharathi Park Peripheral Lot',
    streetName: 'Rue Suffren',
    area: 'Government & Cultural Enclave',
    latitude: 11.9315,
    longitude: 79.8340,
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 30,
    occupiedSlots: 8,
    hourlyRate: 'Rs 20/hr',
    walkingTimeMin: 2,
    distanceKm: 0.6,
    sensorType: 'Automated Boom Barrier + Ground Loop Sensors',
    sensorStatus: 'Sensors Online (22 vacant)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 0,
  },
  {
    zoneId: 'zone-old-port',
    name: 'Old Port High-Capacity Facility',
    streetName: 'Goubert Avenue South',
    area: 'South Promenade Port Gate',
    latitude: 11.9265,
    longitude: 79.8345,
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 60,
    occupiedSlots: 18,
    hourlyRate: 'Rs 30/day (High Capacity Lot)',
    walkingTimeMin: 7,
    distanceKm: 1.1,
    sensorType: 'Smart Gate ANPR Barcode Scanner',
    sensorStatus: 'High Availability (42 spots vacant)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 1,
  },
  {
    zoneId: 'zone-bussy-st',
    name: 'Bussy Street Municipal Bike Bay',
    streetName: 'Bussy Street',
    area: 'Boulevard Town West',
    latitude: 11.9310,
    longitude: 79.8275,
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 28,
    occupiedSlots: 16,
    hourlyRate: 'FREE (Two-Wheeler Priority)',
    walkingTimeMin: 5,
    distanceKm: 0.9,
    sensorType: 'Kerb Magnetometer Sensor Array',
    sensorStatus: 'Active (12 bike slots available)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 1,
  },
];

const INITIAL_ADVISORIES = [
  {
    title: 'Beach Promenade Evening Vehicle Curfew',
    description: 'Goubert Avenue is pedestrianized between 17:00 and 06:00. Park at Old Port Lot or Saint Gilles Free Bay.',
    severity: 'HIGH',
    activeTime: 'Daily 17:00 - 06:00',
    affectedRoads: 'Goubert Avenue, Promenade Rock Beach',
  },
  {
    title: 'Mission Street Alternate Kerb Parking Rule',
    description: 'Even days West Kerb, Odd days East Kerb. Active crane tow-away on prohibited kerb.',
    severity: 'MEDIUM',
    activeTime: 'Active 24/7',
    affectedRoads: 'Mission Street (Bussy St to Rangapillai St)',
  },
  {
    title: 'Emergency Medical Corridor Clearance',
    description: 'Priority ambulance path to IGMCRI Hospital. Zero curb obstruction tolerated.',
    severity: 'EMERGENCY',
    activeTime: 'Immediate & Continuous',
    affectedRoads: 'Vazhudavur Road, Gorimedu Junction',
  },
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSetup() {
  console.log('\x1b[36m========================================================\x1b[0m');
  console.log('\x1b[36m PUDUCHERRY TRAFFIC POLICE - APPWRITE DB PROVISIONING  \x1b[0m');
  console.log('\x1b[36m========================================================\x1b[0m\n');
  console.log(`Endpoint:   ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID}\n`);

  // 1. Create or verify Database
  try {
    console.log(`[1/5] Creating Database "${DB_ID}"...`);
    await databases.create(DB_ID, 'ParkPuduvai Civic Database');
    console.log('\x1b[32m✔ Database created successfully.\x1b[0m');
  } catch (err) {
    if (err.code === 409) {
      console.log('\x1b[33mℹ Database already exists. Reusing existing database.\x1b[0m');
    } else {
      console.error('\x1b[31mFailed to create database:\x1b[0m', err.message);
    }
  }

  // 2. Create Parking Zones Collection
  try {
    console.log(`\n[2/5] Creating Collection "${COLL_ZONES}"...`);
    await databases.createCollection(DB_ID, COLL_ZONES, 'Puducherry Parking Zones', [
      Permission.read(Role.any()),
      Permission.write(Role.any()),
    ]);
    console.log('\x1b[32m✔ Parking Zones collection created.\x1b[0m');
    await sleep(500);

    // Attributes
    console.log('  Adding attributes to parking_zones...');
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'zoneId', 64, true);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'name', 128, true);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'streetName', 128, true);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'area', 128, true);
    await databases.createFloatAttribute(DB_ID, COLL_ZONES, 'latitude', true);
    await databases.createFloatAttribute(DB_ID, COLL_ZONES, 'longitude', true);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'type', 32, true);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'category', 32, true);
    await databases.createIntegerAttribute(DB_ID, COLL_ZONES, 'totalSlots', true);
    await databases.createIntegerAttribute(DB_ID, COLL_ZONES, 'occupiedSlots', true);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'hourlyRate', 64, false);
    await databases.createIntegerAttribute(DB_ID, COLL_ZONES, 'walkingTimeMin', false);
    await databases.createFloatAttribute(DB_ID, COLL_ZONES, 'distanceKm', false);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'sensorType', 128, false);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'sensorStatus', 128, false);
    await databases.createStringAttribute(DB_ID, COLL_ZONES, 'trafficLevel', 32, false);
    await databases.createIntegerAttribute(DB_ID, COLL_ZONES, 'trafficDelayMin', false);
    console.log('\x1b[32m✔ Attributes configured.\x1b[0m');
  } catch (err) {
    if (err.code === 409) {
      console.log('\x1b[33mℹ Collection parking_zones already exists.\x1b[0m');
    } else {
      console.error('Error creating parking_zones collection:', err.message);
    }
  }

  // 3. Create Violation Reports Collection
  try {
    console.log(`\n[3/5] Creating Collection "${COLL_VIOLATIONS}"...`);
    await databases.createCollection(DB_ID, COLL_VIOLATIONS, 'Citizen Violation Reports', [
      Permission.read(Role.any()),
      Permission.create(Role.any()),
      Permission.update(Role.any()),
    ]);
    console.log('\x1b[32m✔ Violation Reports collection created.\x1b[0m');
    await sleep(500);

    console.log('  Adding attributes to violation_reports...');
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'referenceNo', 64, true);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'photoUri', 1000, false);
    await databases.createFloatAttribute(DB_ID, COLL_VIOLATIONS, 'latitude', true);
    await databases.createFloatAttribute(DB_ID, COLL_VIOLATIONS, 'longitude', true);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'landmark', 256, true);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'vehicleNumber', 32, true);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'violationType', 64, true);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'otherDescription', 512, false);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'timestamp', 64, true);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'status', 32, true);
    await databases.createIntegerAttribute(DB_ID, COLL_VIOLATIONS, 'karmaPoints', true);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'policeNote', 512, false);
    await databases.createStringAttribute(DB_ID, COLL_VIOLATIONS, 'challanNumber', 64, false);
    console.log('\x1b[32m✔ Violation Reports attributes configured.\x1b[0m');
  } catch (err) {
    if (err.code === 409) {
      console.log('\x1b[33mℹ Collection violation_reports already exists.\x1b[0m');
    } else {
      console.error('Error creating violation_reports collection:', err.message);
    }
  }

  // 4. Create Traffic Advisories Collection
  try {
    console.log(`\n[4/5] Creating Collection "${COLL_ADVISORIES}"...`);
    await databases.createCollection(DB_ID, COLL_ADVISORIES, 'Traffic Bulletins', [
      Permission.read(Role.any()),
    ]);
    console.log('\x1b[32m✔ Traffic Advisories collection created.\x1b[0m');
    await sleep(500);

    console.log('  Adding attributes to traffic_advisories...');
    await databases.createStringAttribute(DB_ID, COLL_ADVISORIES, 'title', 128, true);
    await databases.createStringAttribute(DB_ID, COLL_ADVISORIES, 'description', 1000, true);
    await databases.createStringAttribute(DB_ID, COLL_ADVISORIES, 'severity', 32, true);
    await databases.createStringAttribute(DB_ID, COLL_ADVISORIES, 'activeTime', 64, true);
    await databases.createStringAttribute(DB_ID, COLL_ADVISORIES, 'affectedRoads', 256, true);
    console.log('\x1b[32m✔ Traffic Advisories attributes configured.\x1b[0m');
  } catch (err) {
    if (err.code === 409) {
      console.log('\x1b[33mℹ Collection traffic_advisories already exists.\x1b[0m');
    } else {
      console.error('Error creating traffic_advisories collection:', err.message);
    }
  }

  // 5. Create Storage Bucket for Violation Evidence Photos
  try {
    console.log(`\n[5/5] Creating Storage Bucket "${BUCKET_PHOTOS}"...`);
    await storage.createBucket(BUCKET_PHOTOS, 'Violation Evidence Photos', [
      Permission.read(Role.any()),
      Permission.create(Role.any()),
    ], false, true, 10000000, ['jpg', 'jpeg', 'png', 'webp']);
    console.log('\x1b[32m✔ Storage bucket created.\x1b[0m');
  } catch (err) {
    if (err.code === 409) {
      console.log('\x1b[33mℹ Bucket violation_photos already exists.\x1b[0m');
    } else {
      console.log('Bucket status:', err.message);
    }
  }

  // Seed Data
  console.log('\n\x1b[36mSeeding initial Puducherry Parking Zones & Advisories...\x1b[0m');
  await sleep(1500); // Give Appwrite attribute indexes a moment to finalize

  for (const zone of REAL_PUDUCHERRY_ZONES) {
    try {
      await databases.createDocument(DB_ID, COLL_ZONES, zone.zoneId, zone);
      console.log(`  ✔ Seeded zone: ${zone.name}`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`  ℹ Zone ${zone.zoneId} already exists.`);
      } else {
        console.warn(`  Failed to seed ${zone.zoneId}:`, err.message);
      }
    }
  }

  for (const adv of INITIAL_ADVISORIES) {
    try {
      await databases.createDocument(DB_ID, COLL_ADVISORIES, ID.unique(), adv);
      console.log(`  ✔ Seeded advisory: ${adv.title}`);
    } catch (err) {
      console.warn(`  Advisory seed error:`, err.message);
    }
  }

  console.log('\n\x1b[32m========================================================\x1b[0m');
  console.log('\x1b[32m APPWRITE SETUP COMPLETE! BACKEND IS READY FOR APP     \x1b[0m');
  console.log('\x1b[32m========================================================\x1b[0m\n');
}

runSetup().catch((e) => {
  console.error('Setup failed with error:', e);
});
