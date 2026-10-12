# ParkPuduvai Mobile (Citizen App)
**Puducherry Police Hackathon 2026 -- Problem Statement 3: Smart Parking, Traffic Enforcement & Citizen Reporting System**

Built with **React Native & Expo** featuring an authentic, anti-AI civic tech design system, pure vector SVG iconography (zero emojis), and client-side device APIs for community-driven traffic enforcement.

---

## Architecture & Team Workspaces

This repository is modularized with dedicated screen and component directories, enabling team members to work concurrently with zero merge conflicts:

| Role / Module | Assigned Member | Dedicated Workspace |
| :--- | :--- | :--- |
| **Citizen Violation Reporting** | **Member 1** | `src/screens/reporting/ReportViolationScreen.tsx` |
| **Complaint Tracking & Civic Karma** | **Member 1** | `src/screens/reporting/TrackComplaintsScreen.tsx` |
| **Smart Parking & Kerb Management** | **Member 2** | `src/screens/parking/FindParkingScreen.tsx` |
| **Traffic Advisories & Emergency Corridor** | **Member 3** | `src/screens/alerts/AdvisoriesScreen.tsx` |
| **Navigation & Core Theme** | Core Team | `App.tsx`, `src/theme/colors.ts`, `src/types/navigation.ts` |

---

## Key Features

1. **Pure Vector Iconography (Zero Emojis):**
   - 20+ custom scalable SVG vector icons in `src/components/common/Icons.tsx`.
   - Adheres to an authentic, authoritative civic technology design language.

2. **Floating Glassmorphic Bottom Navigation Bar:**
   - Tactile curved floating pill with frosted glass backdrop blur.
   - Dynamic labeling showing text only for the active tab to maintain a minimal footprint.
   - Intelligent auto-hiding during live camera viewfinder capture.

3. **Citizen Violation Reporting Pipeline:**
   - Real HTML5 camera viewfinder with bracket HUD, timestamp, and instant shutter.
   - Hardware GPS geolocation with OpenStreetMap reverse geocoding (street landmarks).
   - Built-in Hackathon demo bypass for offline/laptop demonstrations (*Manakula Vinayagar Institute of Technology*).
   - Client-side WebAssembly OCR with DIN 1451 font disambiguation (`TH` -> `TN`, `PV` -> `PY`, etc.) and Indian Motor Vehicles Act positional grammar.
   - Quick Demo Plate chips for one-tap presentation.

4. **Civic Karma & Complaint Tracking:**
   - Real evidence photo preview embedded into complaint cards.
   - 4-stage enforcement lifecycle: *Violation Submitted* -> *Under Review* -> *e-Challan Issuance* -> *Enforcement Complete*.

---

## How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```
- Open on mobile browser on the same Wi-Fi network: `http://<YOUR_LOCAL_IP>:8081`
- Press `w` to open in Desktop Web Browser.
- Press `a` for Android Emulator.
- Press `i` for iOS Simulator.

---

## Civic Design System Palette
- **Official Police Navy:** `#1E3A8A`
- **Authorized Green:** `#10B981`
- **Violation / Red Kerb:** `#EF4444`
- **Warning / Advisory Amber:** `#F59E0B`
- **Slate Surfaces:** `#0F172A`, `#F8FAFC`, `#FFFFFF`
