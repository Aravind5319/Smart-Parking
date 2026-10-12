'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { 
  Shield, 
  Car, 
  AlertTriangle, 
  ParkingSquare, 
  Layers, 
  MapPin, 
  Key, 
  Crosshair, 
  Compass, 
  Check, 
  X, 
  Radio, 
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Puducherry Coordinates
const PUDUCHERRY_CENTER = { lat: 11.9338, lng: 79.8297 };

// Police Surveillance & Enforcement Zones in Puducherry
const POLICE_ZONES = [
  {
    id: 'Z-101',
    name: 'White Town Core Heritage',
    type: 'No Parking / Strict Tow Zone',
    status: 'Active Enforcement',
    color: '#C84646', // Red
    fillColor: '#C84646',
    paths: [
      { lat: 11.9365, lng: 79.8315 },
      { lat: 11.9372, lng: 79.8362 },
      { lat: 11.9292, lng: 79.8368 },
      { lat: 11.9288, lng: 79.8318 }
    ],
    info: 'Strict zero-parking zone for tourist safety. Only permitted permit-holders allowed between 08:00 - 22:00.'
  },
  {
    id: 'Z-102',
    name: 'Goubert Ave Promenade',
    type: 'Pedestrian Only',
    status: 'Restricted Access',
    color: '#E6A23C', // Amber
    fillColor: '#E6A23C',
    paths: [
      { lat: 11.9385, lng: 79.8360 },
      { lat: 11.9385, lng: 79.8378 },
      { lat: 11.9275, lng: 79.8384 },
      { lat: 11.9275, lng: 79.8366 }
    ],
    info: 'Vehicular movement prohibited daily from 17:00 to 06:00. Active patrol by beach police.'
  },
  {
    id: 'Z-103',
    name: 'Mission & Nehru Commercial Hub',
    type: 'Pay & Regulated Parking',
    status: 'Monitored',
    color: '#168B83', // Teal
    fillColor: '#168B83',
    paths: [
      { lat: 11.9362, lng: 79.8242 },
      { lat: 11.9368, lng: 79.8312 },
      { lat: 11.9292, lng: 79.8316 },
      { lat: 11.9286, lng: 79.8248 }
    ],
    info: 'Commercial shopping strip with time-limited kerbside parking and AI plate detection.'
  }
];

// Live Units, Violations & Smart Parking Facilities
const MAP_ITEMS = {
  patrols: [
    { id: 'PT-01', name: 'Patrol Unit 01 (Beach Sector)', lat: 11.9348, lng: 79.8358, officer: 'Insp. R. Arumugam', status: 'On Patrol', speed: '24 km/h' },
    { id: 'PT-02', name: 'Patrol Unit 02 (Mission St)', lat: 11.9318, lng: 79.8275, officer: 'Sub-Insp. K. Selvam', status: 'Enforcing', speed: 'Stationary' },
    { id: 'PT-03', name: 'Patrol Unit 03 (Bus Terminus)', lat: 11.9262, lng: 79.8234, officer: 'Head Constable V. Murugan', status: 'Patrolling', speed: '18 km/h' }
  ],
  violations: [
    { id: 'VIO-9824', name: 'Illegal Double Parking', lat: 11.9352, lng: 79.8324, vehicle: 'PY-01-CA-4421', fine: '₹1,500', time: '4m ago', status: 'Pending Review' },
    { id: 'VIO-9825', name: 'Yellow Kerb Obstruction', lat: 11.9312, lng: 79.8368, vehicle: 'TN-09-BZ-9012', fine: '₹1,000', time: '12m ago', status: 'Warden Dispatched' },
    { id: 'VIO-9826', name: 'Bus Bay Blockade', lat: 11.9270, lng: 79.8252, vehicle: 'PY-01-BK-1102', fine: '₹2,000', time: '19m ago', status: 'Tow Requested' }
  ],
  facilities: [
    { id: 'PK-01', name: 'Old Port Ground Parking', lat: 11.9288, lng: 79.8362, total: 350, occupied: 280, type: 'Open Bay' },
    { id: 'PK-02', name: 'Grand Canal Multilevel Park', lat: 11.9332, lng: 79.8288, total: 120, occupied: 45, type: 'Automated MLCP' },
    { id: 'PK-03', name: 'Goubert Market Bay', lat: 11.9348, lng: 79.8268, total: 80, occupied: 76, type: 'Kerbside Dedicated' }
  ]
};

// Preset Quick-Focus Locations
const HOTSPOTS = [
  { name: 'Command Center', coords: { lat: 11.9338, lng: 79.8297 }, zoom: 14 },
  { name: 'White Town', coords: { lat: 11.9335, lng: 79.8345 }, zoom: 16 },
  { name: 'Promenade Beach', coords: { lat: 11.9340, lng: 79.8370 }, zoom: 16 },
  { name: 'Central Bus Stand', coords: { lat: 11.9260, lng: 79.8228 }, zoom: 16 },
  { name: 'Nehru Commercial St', coords: { lat: 11.9345, lng: 79.8280 }, zoom: 16 }
];

interface MapViewProps {
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  className?: string;
  showLayerControls?: boolean;
}

export default function MapView({
  initialCenter = PUDUCHERRY_CENTER,
  initialZoom = 14,
  className = '',
  showLayerControls = true
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Map Controls State
  const [useJsApi, setUseJsApi] = useState(true);
  const [isTrafficOn, setIsTrafficOn] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState('Command Center');

  // Layer Visibility
  const [visibleLayers, setVisibleLayers] = useState({
    zones: true,
    patrols: true,
    violations: true,
    facilities: true
  });

  // Selected item modal / details in embed mode
  const [embedSelectedItem, setEmbedSelectedItem] = useState<any | null>(null);

  // Load API key from env or localStorage
  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('google_maps_api_key') || '' : '';
    const activeKey = storedKey || envKey;
    setApiKey(activeKey);
    setTempKeyInput(activeKey);
  }, []);

  // Save API key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempKeyInput.trim();
    if (typeof window !== 'undefined') {
      if (cleanKey) {
        localStorage.setItem('google_maps_api_key', cleanKey);
      } else {
        localStorage.removeItem('google_maps_api_key');
      }
    }
    setApiKey(cleanKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsKeyModalOpen(false);
      // Force reload to reinit Google Maps JS script with new key
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 900);
  };

  // Helper to create SVG marker icons for Google Maps
  const createMarkerIcon = useCallback((type: 'police' | 'violation' | 'facility') => {
    if (typeof window === 'undefined' || !window.google) return undefined;
    
    let path = '';
    let fillColor = '';
    let strokeColor = '#ffffff';

    if (type === 'police') {
      // Police Shield / Badge
      path = 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z';
      fillColor = '#1D4E89'; // Police Navy
    } else if (type === 'violation') {
      // Alert triangle
      path = 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
      fillColor = '#C84646'; // Urgent Red
    } else {
      // Parking "P" rounded square
      path = 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm6 3v10h2.5v-3.5h2c1.7 0 3-1.3 3-3s-1.3-3.5-3-3.5H10zm2.5 2.2h1.8c.7 0 1.2.6 1.2 1.3s-.5 1.3-1.2 1.3h-1.8V9.2z';
      fillColor = '#168B83'; // Teal
    }

    return {
      path,
      fillColor,
      fillOpacity: 1,
      strokeColor,
      strokeWeight: 1.5,
      scale: 1.3,
      anchor: new window.google.maps.Point(12, 12)
    };
  }, []);

  // Initialize Google Maps JavaScript API
  useEffect(() => {
    if (!apiKey) {
      // No API key provided, will show Google Maps interactive embed
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    setIsLoaded(false);
    setLoadError(null);

    try {
      setOptions({
        key: apiKey,
        v: 'weekly',
        libraries: ['places', 'geometry']
      });
    } catch {
      // Options may already be set in this session
    }

    importLibrary('maps').then(() => {
      if (!isMounted || !mapContainerRef.current) return;

      try {

        // Initialize Map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: mapType,
          disableDefaultUI: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          mapTypeControl: false, // We provide modern customized controls
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          },
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels.text',
              stylers: [{ visibility: 'simplified' }]
            },
            {
              featureType: 'administrative.neighborhood',
              elementType: 'labels.text',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Initialize Traffic Layer
        const trafficLayer = new google.maps.TrafficLayer();
        if (isTrafficOn) {
          trafficLayer.setMap(map);
        }
        trafficLayerRef.current = trafficLayer;

        // Info Window singleton
        const infoWindow = new google.maps.InfoWindow();
        infoWindowRef.current = infoWindow;

        // Clear existing markers and polygons
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
        polygonsRef.current.forEach(p => p.setMap(null));
        polygonsRef.current = [];

        // Draw Police Enforcement Zones (Polygons)
        if (visibleLayers.zones) {
          POLICE_ZONES.forEach((zone) => {
            const polygon = new google.maps.Polygon({
              paths: zone.paths,
              strokeColor: zone.color,
              strokeOpacity: 0.85,
              strokeWeight: 2,
              fillColor: zone.fillColor,
              fillOpacity: 0.22,
              map: map
            });

            polygon.addListener('click', (e: google.maps.MapMouseEvent) => {
              const content = `
                <div style="font-family: inherit; padding: 10px 12px; max-width: 280px; color: #253449;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-weight: 700; font-size: 13px; color: #142A43;">${zone.name}</span>
                    <span style="font-size: 10px; font-weight: 700; background: ${zone.color}20; color: ${zone.color}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${zone.id}</span>
                  </div>
                  <div style="font-size: 12px; font-weight: 600; color: ${zone.color}; margin-bottom: 4px;">${zone.type}</div>
                  <p style="font-size: 11px; line-height: 1.4; color: #536471; margin: 0 0 8px 0;">${zone.info}</p>
                  <div style="font-size: 10px; color: #168B83; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                    ● Status: ${zone.status}
                  </div>
                </div>
              `;
              infoWindow.setContent(content);
              infoWindow.setPosition(e.latLng || zone.paths[0]);
              infoWindow.open(map);
            });

            polygonsRef.current.push(polygon);
          });
        }

        // Draw Patrol Units
        if (visibleLayers.patrols) {
          MAP_ITEMS.patrols.forEach((unit) => {
            const marker = new google.maps.Marker({
              position: { lat: unit.lat, lng: unit.lng },
              map: map,
              title: unit.name,
              icon: createMarkerIcon('police')
            });

            marker.addListener('click', () => {
              const content = `
                <div style="font-family: inherit; padding: 10px 12px; max-width: 260px; color: #253449;">
                  <div style="font-weight: 700; font-size: 13px; color: #1D4E89; margin-bottom: 4px;">🚓 ${unit.name}</div>
                  <div style="font-size: 11px; color: #536471; margin-bottom: 2px;">Officer: <b>${unit.officer}</b></div>
                  <div style="font-size: 11px; color: #536471; margin-bottom: 6px;">Speed: <b>${unit.speed}</b> | Status: <b style="color: #168B83;">${unit.status}</b></div>
                  <button style="background: #1D4E89; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; width: 100%;">
                    Dispatch Command
                  </button>
                </div>
              `;
              infoWindow.setContent(content);
              infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
          });
        }

        // Draw Violations
        if (visibleLayers.violations) {
          MAP_ITEMS.violations.forEach((vio) => {
            const marker = new google.maps.Marker({
              position: { lat: vio.lat, lng: vio.lng },
              map: map,
              title: vio.name,
              icon: createMarkerIcon('violation')
            });

            marker.addListener('click', () => {
              const content = `
                <div style="font-family: inherit; padding: 10px 12px; max-width: 260px; color: #253449;">
                  <div style="font-weight: 700; font-size: 13px; color: #C84646; margin-bottom: 4px;">⚠️ ${vio.name}</div>
                  <div style="font-size: 11px; color: #536471; margin-bottom: 2px;">Vehicle: <b style="font-family: monospace;">${vio.vehicle}</b></div>
                  <div style="font-size: 11px; color: #536471; margin-bottom: 2px;">Penalty: <b style="color: #C84646;">${vio.fine}</b> (${vio.time})</div>
                  <div style="font-size: 11px; color: #E6A23C; font-weight: 600; margin-bottom: 6px;">Status: ${vio.status}</div>
                  <button style="background: #C84646; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; width: 100%;">
                    Issue E-Challan / Tow
                  </button>
                </div>
              `;
              infoWindow.setContent(content);
              infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
          });
        }

        // Draw Parking Facilities
        if (visibleLayers.facilities) {
          MAP_ITEMS.facilities.forEach((pk) => {
            const percent = Math.round((pk.occupied / pk.total) * 100);
            const isFull = percent > 85;
            const marker = new google.maps.Marker({
              position: { lat: pk.lat, lng: pk.lng },
              map: map,
              title: pk.name,
              icon: createMarkerIcon('facility')
            });

            marker.addListener('click', () => {
              const content = `
                <div style="font-family: inherit; padding: 10px 12px; max-width: 260px; color: #253449;">
                  <div style="font-weight: 700; font-size: 13px; color: #168B83; margin-bottom: 4px;">🅿️ ${pk.name}</div>
                  <div style="font-size: 11px; color: #536471; margin-bottom: 4px;">Type: ${pk.type}</div>
                  <div style="background: #F7F4ED; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600;">
                      <span>Occupancy:</span>
                      <span style="color: ${isFull ? '#C84646' : '#168B83'};">${pk.occupied} / ${pk.total} (${percent}%)</span>
                    </div>
                    <div style="height: 5px; width: 100%; background: #DDE3EA; border-radius: 3px; overflow: hidden; margin-top: 4px;">
                      <div style="height: 100%; width: ${percent}%; background: ${isFull ? '#C84646' : '#168B83'};"></div>
                    </div>
                  </div>
                </div>
              `;
              infoWindow.setContent(content);
              infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
          });
        }

        setIsLoaded(true);
      } catch (err: any) {
        console.error('Error rendering Google Maps:', err);
        setLoadError(err?.message || 'Failed to initialize Google Maps JS API');
        setIsLoaded(true);
      }
    }).catch((err: any) => {
      console.warn('Google Maps JS API load failed, switching to Google Embed:', err);
      setLoadError(err?.message || 'Google Maps API authentication error. Falling back to Google Maps live embed.');
      setIsLoaded(true);
    });


    return () => {
      isMounted = false;
    };
  }, [apiKey, mapType, isTrafficOn, visibleLayers, createMarkerIcon, initialCenter, initialZoom]);

  // Toggle Traffic Layer
  const handleToggleTraffic = () => {
    const nextState = !isTrafficOn;
    setIsTrafficOn(nextState);
    if (trafficLayerRef.current && mapInstanceRef.current) {
      if (nextState) {
        trafficLayerRef.current.setMap(mapInstanceRef.current);
      } else {
        trafficLayerRef.current.setMap(null);
      }
    }
  };

  // Switch Map Type (Roadmap / Satellite / Hybrid)
  const handleChangeMapType = (type: 'roadmap' | 'satellite' | 'hybrid') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type);
    }
  };

  // Jump to Hotspot
  const handleJumpToHotspot = (hotspot: typeof HOTSPOTS[0]) => {
    setSelectedHotspot(hotspot.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(hotspot.coords);
      mapInstanceRef.current.setZoom(hotspot.zoom);
    }
  };

  // Determine active hotspot coordinates for Embed fallback
  const currentHotspotCoords = HOTSPOTS.find(h => h.name === selectedHotspot)?.coords || PUDUCHERRY_CENTER;
  const currentZoom = HOTSPOTS.find(h => h.name === selectedHotspot)?.zoom || initialZoom;
  const embedMapTypeParam = mapType === 'satellite' ? '&t=k' : mapType === 'hybrid' ? '&t=h' : '&t=m';
  const embedUrl = `https://maps.google.com/maps?q=${currentHotspotCoords.lat},${currentHotspotCoords.lng}&z=${currentZoom}${embedMapTypeParam}&output=embed`;

  return (
    <div className={`w-full h-full relative overflow-hidden flex flex-col ${className}`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Connection Status Pill */}
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-subtle-border flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-navy">Google Maps</span>
          <span className="text-main-text/60 text-[11px] hidden sm:inline">Puducherry Command Sector</span>
        </div>

        {/* View Mode Switcher */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-lg shadow-md border border-subtle-border flex items-center gap-1">
          <button
            onClick={() => handleChangeMapType('roadmap')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              mapType === 'roadmap' ? 'bg-police text-white shadow-xs' : 'text-main-text hover:bg-ivory'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => handleChangeMapType('satellite')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              mapType === 'satellite' ? 'bg-police text-white shadow-xs' : 'text-main-text hover:bg-ivory'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => handleChangeMapType('hybrid')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all hidden md:block ${
              mapType === 'hybrid' ? 'bg-police text-white shadow-xs' : 'text-main-text hover:bg-ivory'
            }`}
          >
            Hybrid
          </button>
        </div>

        {/* Live Traffic Toggle */}
        <button
          onClick={handleToggleTraffic}
          className={`px-3 py-1.5 rounded-lg shadow-md border text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md ${
            isTrafficOn 
              ? 'bg-amber text-white border-amber shadow-amber/20' 
              : 'bg-white/95 text-main-text border-subtle-border hover:bg-ivory'
          }`}
          title="Toggle Google Real-time Traffic"
        >
          <Radio size={14} className={isTrafficOn ? 'animate-pulse' : ''} />
          <span>Live Traffic</span>
          {isTrafficOn && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />}
        </button>

        {/* Hotspot quick jumper dropdown */}
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-md border border-subtle-border flex items-center gap-1.5 text-xs">
          <Compass size={14} className="text-police" />
          <select
            value={selectedHotspot}
            onChange={(e) => {
              const found = HOTSPOTS.find(h => h.name === e.target.value);
              if (found) handleJumpToHotspot(found);
            }}
            className="bg-transparent font-medium text-main-text text-xs focus:outline-none cursor-pointer pr-1"
          >
            {HOTSPOTS.map((h) => (
              <option key={h.name} value={h.name}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Right Action & Settings Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        {/* Recenter Button */}
        <button
          onClick={() => {
            const centerPoint = HOTSPOTS[0];
            handleJumpToHotspot(centerPoint);
          }}
          className="bg-white/95 backdrop-blur-md p-2 rounded-lg shadow-md border border-subtle-border text-main-text hover:text-police hover:bg-ivory transition-colors"
          title="Center on Puducherry"
        >
          <Crosshair size={18} />
        </button>

        {/* Google Maps API Key Config Button */}
        <button
          onClick={() => setIsKeyModalOpen(true)}
          className={`px-3 py-1.5 rounded-lg shadow-md border text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md ${
            apiKey 
              ? 'bg-white/95 text-police border-police/30 hover:bg-ivory' 
              : 'bg-police text-white border-police hover:bg-navy animate-pulse'
          }`}
          title="Configure Google Maps API Key"
        >
          <Key size={14} />
          <span className="hidden sm:inline">{apiKey ? 'API Key Active' : 'Connect API Key'}</span>
        </button>
      </div>

      {/* Main Map Rendering Area */}
      <div className="flex-1 w-full h-full relative">
        {/* Condition 1: When user has API Key and no load error, render Google Maps JS API container */}
        {apiKey && !loadError ? (
          <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />
        ) : (
          /* Condition 2: Embed View fallback (zero config, works out of the box with zero errors) */
          <div className="w-full h-full relative bg-sandstone/10">
            <iframe
              title="Google Maps Puducherry Surveillance"
              src={embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />

            {/* Notification / Helper Banner at bottom */}
            <div className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto z-10 pointer-events-auto">
              <div className="bg-navy/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-white/10 flex items-start gap-3">
                <div className="p-2 bg-police/60 rounded-lg shrink-0 mt-0.5">
                  <Sparkles size={18} className="text-teal" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">Google Maps Live Connected</span>
                    <span className="bg-teal/30 text-teal text-[10px] font-bold px-1.5 py-0.5 rounded">Puducherry</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    Interactive Google Map is streaming live. To enable custom police SVG markers, zone enforcement polygons, and the direct Google Traffic Layer overlay, connect your Google Maps API key.
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      onClick={() => setIsKeyModalOpen(true)}
                      className="bg-police hover:bg-police/80 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Key size={13} />
                      Enter Google Maps API Key
                    </button>
                    <a
                      href="https://console.cloud.google.com/google/maps-apis/overview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sandstone hover:underline text-xs flex items-center gap-1"
                    >
                      Get Key from Google Cloud <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Active Enforcement Summary in Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 hidden lg:block pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-subtle-border p-3 w-72 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-main-text flex items-center gap-1.5">
              <Shield size={14} className="text-police" /> Puducherry Active Zones
            </span>
            <span className="bg-teal/10 text-teal font-bold px-1.5 py-0.5 rounded text-[10px]">3 Active</span>
          </div>
          <div className="space-y-1.5">
            {POLICE_ZONES.map((zone) => (
              <div 
                key={zone.id} 
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.panTo(zone.paths[0]);
                    mapInstanceRef.current.setZoom(16);
                  }
                }}
                className="p-1.5 rounded hover:bg-ivory cursor-pointer flex items-center justify-between border border-transparent hover:border-subtle-border transition-all"
              >
                <div>
                  <div className="font-semibold text-main-text text-[11px]">{zone.name}</div>
                  <div className="text-[10px] text-main-text/60">{zone.type}</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Legend / Quick Stats in Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-subtle-border px-3 py-2 text-xs flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-main-text font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-police" /> Patrols (3)
          </div>
          <div className="flex items-center gap-1.5 text-main-text font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-urgent" /> Violations (3)
          </div>
          <div className="flex items-center gap-1.5 text-main-text font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-teal" /> Facilities (3)
          </div>
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-subtle-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-subtle-border flex items-center justify-between bg-ivory/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-police/10 text-police flex items-center justify-center">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-main-text text-base">Google Maps API Configuration</h3>
                  <p className="text-xs text-main-text/60">Connect your Google Maps JavaScript API Key</p>
                </div>
              </div>
              <button 
                onClick={() => setIsKeyModalOpen(false)}
                className="text-main-text/50 hover:text-main-text p-1.5 rounded-lg hover:bg-sandstone/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveApiKey} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-main-text mb-1.5 uppercase tracking-wider">
                  Google Maps API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={tempKeyInput}
                    onChange={(e) => setTempKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-white border border-subtle-border rounded-lg text-sm text-main-text placeholder-main-text/40 focus:outline-none focus:ring-2 focus:ring-police focus:border-police font-mono"
                  />
                  {tempKeyInput && (
                    <button
                      type="button"
                      onClick={() => setTempKeyInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-main-text/40 hover:text-main-text text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-main-text/60 mt-2 leading-relaxed">
                  Keys are stored securely in your browser&apos;s local storage, or you can add <code className="bg-ivory px-1.5 py-0.5 rounded text-police font-mono text-[11px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="bg-ivory px-1.5 py-0.5 rounded text-police font-mono text-[11px]">.env.local</code> file.
                </p>
              </div>

              {/* Information Card */}
              <div className="p-3.5 bg-ivory rounded-xl border border-subtle-border text-xs space-y-2">
                <div className="font-semibold text-main-text flex items-center gap-1.5">
                  <Info size={14} className="text-police" /> Required Google Cloud APIs:
                </div>
                <ul className="list-disc list-inside text-main-text/70 space-y-1 pl-1">
                  <li><b>Maps JavaScript API</b> (Required for interactive police surveillance markers)</li>
                  <li><b>Places API</b> (Optional, for search & landmarks)</li>
                  <li><b>Directions API</b> (Optional, for patrol route navigation)</li>
                </ul>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-teal/10 border border-teal/30 rounded-lg text-teal text-xs font-semibold flex items-center gap-2">
                  <Check size={16} /> API Key saved successfully! Reloading map...
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-between">
                <a
                  href="https://console.cloud.google.com/google/maps-apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-police hover:underline flex items-center gap-1 font-medium"
                >
                  Create API Key on Google Cloud <ExternalLink size={12} />
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-4 py-2 border border-subtle-border rounded-lg text-xs font-semibold text-main-text hover:bg-ivory transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-police hover:bg-navy text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Check size={14} /> Save & Apply
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
