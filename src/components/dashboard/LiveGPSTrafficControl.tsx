'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { trafficSignalService } from '@/lib/services/trafficSignalService';
import { TrafficSignal, AmbulanceState, GeofenceArea } from '@/lib/types/dashboard';
import { 
  Network, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Layers,
  Crosshair,
  Radio,
  Navigation,
  Compass,
  X,
  Zap,
  MapPin
} from 'lucide-react';

export function LiveGPSTrafficControl() {
  const { t } = useLanguage();
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [ambulance, setAmbulance] = useState<AmbulanceState | null>(null);
  const [geofence, setGeofence] = useState<GeofenceArea | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const ambulanceMarkerRef = useRef<any>(null);
  const geofenceCircleRef = useRef<any>(null);
  const signalMarkersRef = useRef<Record<string, any>>({});
  const routePolylineRef = useRef<any>(null);
  const isMapInitializedRef = useRef(false);

  // Subscribe to trafficSignalService
  useEffect(() => {
    const update = () => {
      setSignals(trafficSignalService.getSignals());
      setAmbulance(trafficSignalService.getAmbulance());
      setGeofence(trafficSignalService.getGeofence());
      setIsRunning(trafficSignalService.isRunning());
    };

    update();
    const unsub = trafficSignalService.subscribe(update);
    return () => unsub();
  }, []);

  // Initialize Leaflet Map with Google Maps Tiles
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (isMapInitializedRef.current) return;

    let map: any = null;

    import('leaflet').then((L) => {
      if (!mapContainerRef.current || isMapInitializedRef.current) return;

      const puducherryCenter = [11.9338, 79.8335];

      // Initialize map
      map = L.map(mapContainerRef.current, {
        center: puducherryCenter as [number, number],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Google Maps Roadmap Tile Layer
      const googleTileUrl = mapType === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      const tileLayer = L.tileLayer(googleTileUrl, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      mapInstanceRef.current = map;
      (map as any)._googleTileLayer = tileLayer;

      // Draw Emergency Route Polyline
      const routeCoords = trafficSignalService.getRouteCoordinates().map(c => [c.lat, c.lng]);
      const polyline = L.polyline(routeCoords as [number, number][], {
        color: '#1677FF',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineRef.current = polyline;

      // Draw Geofence Radar Circle
      const gf = trafficSignalService.getGeofence();
      if (gf) {
        const circle = L.circle([gf.center.lat, gf.center.lng], {
          radius: gf.radiusMeters,
          color: '#F52235',
          fillColor: '#F52235',
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '6, 4'
        }).addTo(map);

        circle.bindTooltip(`<b>${gf.name}</b><br/>Emergency Priority Radius: ${gf.radiusMeters}m`, {
          direction: 'top',
          className: 'police-map-tooltip'
        });

        geofenceCircleRef.current = circle;

        // Destination Hospital Pin Icon
        const hospitalIcon = L.divIcon({
          className: 'hospital-marker',
          html: `
            <div style="background: #F52235; color: white; border: 2px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(245,34,53,0.6); font-weight: 900; font-size: 14px;">
              🏥
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        L.marker([gf.center.lat, gf.center.lng], { icon: hospitalIcon }).addTo(map);
      }

      // Draw Traffic Signals Pins on Map
      const curSignals = trafficSignalService.getSignals();
      curSignals.forEach(sig => {
        const isGreen = sig.state === 'GREEN';
        const isSelected = sig.id === gf.targetSignalId;

        const signalIcon = L.divIcon({
          className: `traffic-signal-marker-${sig.id}`,
          html: createSignalMarkerHtml(sig, isGreen, isSelected),
          iconSize: [42, 64],
          iconAnchor: [21, 58]
        });

        const marker = L.marker([sig.coords.lat, sig.coords.lng], { icon: signalIcon }).addTo(map);
        marker.on('click', () => {
          trafficSignalService.selectEmergencySignal(sig.id);
        });

        marker.bindTooltip(`<b>${sig.name}</b><br/>State: ${sig.state}<br/>Click to override corridor`, {
          direction: 'top',
          offset: [0, -45]
        });

        signalMarkersRef.current[sig.id] = marker;
      });

      // Draw Moving Ambulance Marker
      const curAmbulance = trafficSignalService.getAmbulance();
      if (curAmbulance) {
        const ambIcon = L.divIcon({
          className: 'ambulance-map-marker',
          html: createAmbulanceMarkerHtml(curAmbulance),
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const ambMarker = L.marker([curAmbulance.lat, curAmbulance.lng], {
          icon: ambIcon,
          zIndexOffset: 1000
        }).addTo(map);

        ambulanceMarkerRef.current = ambMarker;
      }

      isMapInitializedRef.current = true;
    });

    return () => {
      if (map) {
        map.remove();
        isMapInitializedRef.current = false;
      }
    };
  }, []);

  // Update Ambulance Marker position smoothly as simulation runs
  useEffect(() => {
    if (!ambulance || !ambulanceMarkerRef.current) return;
    import('leaflet').then((L) => {
      ambulanceMarkerRef.current.setLatLng([ambulance.lat, ambulance.lng]);
      const newIcon = L.divIcon({
        className: 'ambulance-map-marker',
        html: createAmbulanceMarkerHtml(ambulance),
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      ambulanceMarkerRef.current.setIcon(newIcon);
    });
  }, [ambulance]);

  // Update Traffic Signal markers & Geofence on simulation state changes
  useEffect(() => {
    if (!geofence) return;
    import('leaflet').then((L) => {
      // Update Traffic Signals markers
      signals.forEach(sig => {
        const marker = signalMarkersRef.current[sig.id];
        if (marker) {
          const isGreen = sig.state === 'GREEN';
          const isSelected = sig.id === geofence.targetSignalId;
          const newIcon = L.divIcon({
            className: `traffic-signal-marker-${sig.id}`,
            html: createSignalMarkerHtml(sig, isGreen, isSelected),
            iconSize: [42, 64],
            iconAnchor: [21, 58]
          });
          marker.setIcon(newIcon);
        }
      });

      // Update Geofence Circle appearance
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.setLatLng([geofence.center.lat, geofence.center.lng]);
        geofenceCircleRef.current.setStyle({
          color: geofence.isAmbulanceInside ? '#00D68F' : '#F52235',
          fillColor: geofence.isAmbulanceInside ? '#00D68F' : '#F52235',
          fillOpacity: geofence.isAmbulanceInside ? 0.25 : 0.15
        });
      }
    });
  }, [signals, geofence]);

  // Toggle Map Type (Roadmap / Satellite)
  const handleToggleMapType = (nextType: 'roadmap' | 'satellite') => {
    setMapType(nextType);
    if (mapInstanceRef.current && (mapInstanceRef.current as any)._googleTileLayer) {
      const tileUrl = nextType === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      (mapInstanceRef.current as any)._googleTileLayer.setUrl(tileUrl);
    }
  };

  // Recenter on Ambulance
  const handleRecenter = () => {
    if (mapInstanceRef.current && ambulance) {
      mapInstanceRef.current.panTo([ambulance.lat, ambulance.lng]);
    }
  };

  return (
    <div className="police-card rounded-xl p-3 flex flex-col justify-between h-full relative border-t-4 border-t-[#1677FF] shadow-lg select-none">

      {/* Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center text-[#1677FF] shrink-0 shadow-sm">
            <Network size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold theme-title tracking-wide leading-tight">
              {t.traffic.title}
            </h2>
            <p className="text-[11px] theme-sub leading-tight font-medium mt-0.5">
              Puducherry Command Sector Emergency Corridor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Map Layer Mode Switcher (Google Roadmap / Satellite) */}
          <div className="flex items-center p-0.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
            <button
              onClick={() => handleToggleMapType('roadmap')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                mapType === 'roadmap' ? 'bg-[#1677FF] text-white shadow-xs' : 'theme-sub hover:text-[#1677FF]'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => handleToggleMapType('satellite')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                mapType === 'satellite' ? 'bg-[#1677FF] text-white shadow-xs' : 'theme-sub hover:text-[#1677FF]'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Simulation Controls Toggle */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-1.5 rounded theme-inner-card hover:bg-white/10 theme-sub hover:text-[#1677FF] border border-[var(--card-inner-border)] transition-colors"
            title="GPS & Signal Controls"
          >
            <Sliders size={14} />
          </button>

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/40 text-[#00D68F] text-[10.5px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            <span>{t.common.live}</span>
          </div>
        </div>
      </div>

      {/* Main Integrated Google Map Space (Full Height Center Rectangle) */}
      <div className="relative my-2 rounded-xl overflow-hidden border border-[#132B52] bg-[#030D1E] flex-1 min-h-[380px] lg:min-h-0 w-full select-none shadow-inner">
        {/* Leaflet Google Map Container */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[360px] z-0" />

        {/* FLOATING HUD OVERLAY 1: Top Emergency Alert Banner */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-none">
          <div className="pointer-events-auto bg-[#030D1E]/90 backdrop-blur-md border-2 border-[#1677FF] text-white rounded-xl px-3 py-2 shadow-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0 animate-bounce">🚨</span>
              <p className="text-[11px] font-bold truncate leading-tight">
                {geofence?.isAmbulanceInside ? (
                  <span>
                    <strong className="text-[#00D68F] font-black uppercase">EMERGENCY CORRIDOR ACTIVE:</strong> Ambulance entered geofence. Signal at <strong className="text-white underline">{signals.find(s => s.id === geofence.targetSignalId)?.name || 'Bharathi Park'}</strong> is <span className="text-[#00D68F] font-extrabold">GREEN</span>. Others <span className="text-[#F52235] font-extrabold">RED</span>.
                  </span>
                ) : (
                  <span>
                    🛡️ <strong className="text-[#38BDF8]">PATROL CORRIDOR:</strong> Ambulance en route to Bharathi Park Health Center.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleRecenter}
                className="p-1 rounded bg-[#1677FF]/30 hover:bg-[#1677FF] text-white border border-[#1677FF]/50 transition-colors"
                title="Recenter Map on Ambulance"
              >
                <Crosshair size={12} />
              </button>
              <button
                onClick={() => trafficSignalService.togglePlayPause()}
                className="px-2 py-0.5 rounded bg-[#1677FF] hover:bg-[#0056cc] text-white font-bold text-[10px] flex items-center gap-1 transition-colors shadow-xs"
              >
                {isRunning ? <Pause size={10} /> : <Play size={10} />}
                <span>{isRunning ? 'Pause' : 'Play'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* FLOATING HUD OVERLAY 2: Bottom-Left Ambulance Telemetry Card */}
        {ambulance && (
          <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-auto max-w-[260px] w-full">
            <div className="bg-[#030D1E]/95 backdrop-blur-md border border-[#1677FF]/60 text-white rounded-xl p-2.5 shadow-2xl">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🚑</span>
                  <div>
                    <div className="font-extrabold text-[11px] leading-tight text-white">{ambulance.name}</div>
                    <div className="text-[9px] text-[#AFC4E8] font-mono">ID: {ambulance.id}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#F52235] text-white font-black text-[10px] shadow-sm animate-pulse">
                  {ambulance.speed} km/h
                </span>
              </div>

              <div className="space-y-1 text-[9.5px]">
                <div className="flex justify-between text-white/80 font-mono">
                  <span>GPS:</span>
                  <span className="text-white font-bold">{ambulance.lat}° N, {ambulance.lng}° E</span>
                </div>
                <div className="flex justify-between items-center text-white/80">
                  <span>Corridor:</span>
                  <span className="text-[#00D68F] font-black uppercase">{ambulance.status}</span>
                </div>
                {/* Route progress bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-gradient-to-r from-[#1677FF] to-[#00D68F] h-full transition-all duration-500"
                    style={{ width: `${ambulance.routeProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING HUD OVERLAY 3: Bottom-Right Traffic Signals Strip */}
        <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-auto">
          <div className="bg-[#030D1E]/95 backdrop-blur-md border border-[#1677FF]/60 rounded-xl p-2 shadow-2xl flex items-center gap-2">
            <div className="text-[9.5px] font-black text-[#AFC4E8] uppercase tracking-wider pl-1 hidden sm:block">
              Signals:
            </div>
            <div className="flex items-center gap-1.5">
              {signals.map((sig) => {
                const isSelected = sig.id === geofence?.targetSignalId;
                const isGreen = sig.state === 'GREEN';

                return (
                  <button
                    key={sig.id}
                    onClick={() => trafficSignalService.selectEmergencySignal(sig.id)}
                    className={`px-2 py-1 rounded-lg border text-center transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0E2A5A] border-[#00D68F] shadow-[0_0_10px_rgba(0,214,143,0.3)]'
                        : 'bg-black/60 border-white/15 hover:border-[#1677FF]'
                    }`}
                    title={`Click to set emergency green for ${sig.name}`}
                  >
                    {/* Glowing LED light dot */}
                    <span 
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        isGreen ? 'bg-[#00D68F] shadow-[0_0_8px_#00D68F]' : 'bg-[#F52235] shadow-[0_0_8px_#F52235]'
                      }`}
                    />
                    <div className="text-left">
                      <div className="text-[9.5px] font-extrabold text-white truncate max-w-[65px]">
                        {sig.name}
                      </div>
                      <div className={`text-[7.5px] font-black uppercase ${isGreen ? 'text-[#00D68F]' : 'text-[#F52235]'}`}>
                        {sig.state}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Simulation Testing Controls Modal / Drawer */}
      {showControls && (
        <div className="absolute top-12 right-3 z-30 w-72 bg-[#06152F] border border-[#1677FF]/50 rounded-xl p-3 shadow-2xl space-y-2 text-white">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#132B52]">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders size={13} className="text-[#1677FF]" /> GPS Corridor Simulation
            </span>
            <button onClick={() => setShowControls(false)} className="text-[#AFC4E8] hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => trafficSignalService.triggerEnterGeofence()}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] hover:bg-[#132B52] font-semibold text-white flex items-center justify-between border border-[#132B52]"
            >
              <span>{t.traffic.enterGeofence}</span>
              <span className="text-[#00D68F] font-bold text-[10px]">FORCE GREEN</span>
            </button>

            <button
              onClick={() => trafficSignalService.triggerExitGeofence()}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] hover:bg-[#132B52] font-semibold text-white flex items-center justify-between border border-[#132B52]"
            >
              <span>{t.traffic.exitGeofence}</span>
              <span className="text-[#AFC4E8] font-bold text-[10px]">RESTORE</span>
            </button>

            <button
              onClick={() => trafficSignalService.resetSimulation()}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] hover:bg-[#132B52] font-semibold text-white flex items-center justify-between border border-[#132B52]"
            >
              <span>{t.traffic.resetRoute}</span>
              <RotateCcw size={12} className="text-[#1677FF]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to create HTML for Moving Ambulance Marker on Google Map
function createAmbulanceMarkerHtml(ambulance: AmbulanceState): string {
  return `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
      <!-- Glowing Red Radar Ripple -->
      <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(245, 34, 53, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <!-- Ambulance Shell -->
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #030D1E; border: 2.5px solid #1677FF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(22, 119, 255, 0.9); z-index: 10;">
        <span style="font-size: 16px;">🚑</span>
      </div>
      <!-- Flasher beacon top dot -->
      <div style="position: absolute; top: 2px; width: 8px; height: 8px; border-radius: 50%; background: #F52235; box-shadow: 0 0 8px #F52235; border: 1px solid white;"></div>
    </div>
  `;
}

// Helper to create HTML for Traffic Signal Marker Pin directly on Google Map
function createSignalMarkerHtml(signal: TrafficSignal, isGreen: boolean, isSelected: boolean): string {
  const lampRedBg = isGreen ? '#40080c' : '#F52235';
  const lampRedGlow = isGreen ? 'none' : '0 0 10px #F52235';
  const lampGreenBg = isGreen ? '#00D68F' : '#08331e';
  const lampGreenGlow = isGreen ? '0 0 12px #00D68F' : 'none';
  const borderColor = isSelected ? '#00D68F' : '#ffffff';

  return `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <!-- Signal Housing Box -->
      <div style="background: #020914; border: 2px solid ${borderColor}; border-radius: 6px; padding: 3px 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 3px; align-items: center;">
        <!-- Red Light -->
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${lampRedBg}; box-shadow: ${lampRedGlow}; border: 1px solid rgba(255,255,255,0.3);"></div>
        <!-- Yellow Light -->
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #3b2a08; border: 1px solid rgba(255,255,255,0.2);"></div>
        <!-- Green Light -->
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${lampGreenBg}; box-shadow: ${lampGreenGlow}; border: 1px solid rgba(255,255,255,0.3);"></div>
      </div>
      <!-- Signal Post Pole -->
      <div style="width: 3px; height: 10px; background: #64748B;"></div>
      <!-- Name Pin Label -->
      <div style="background: ${isSelected ? '#00D68F' : '#0A1B39'}; color: ${isSelected ? '#030D1E' : '#FFFFFF'}; font-weight: 800; font-size: 8.5px; padding: 1px 4px; border-radius: 4px; border: 1px solid white; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.6); margin-top: -2px;">
        ${signal.name}
      </div>
    </div>
  `;
}
