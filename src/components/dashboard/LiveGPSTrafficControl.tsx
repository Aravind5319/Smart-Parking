'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { trafficSignalService } from '@/lib/services/trafficSignalService';
import { TrafficSignal, AmbulanceState, GeofenceArea, SignalStem } from '@/lib/types/dashboard';
import { 
  Network, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Crosshair, 
  X,
  Plus,
  Minus,
  Radio,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2
} from 'lucide-react';

export function LiveGPSTrafficControl() {
  const { lang, t } = useLanguage();
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [ambulance, setAmbulance] = useState<AmbulanceState | null>(null);
  const [geofence, setGeofence] = useState<GeofenceArea | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showStemInspector, setShowStemInspector] = useState(false);
  const [hideDetails, setHideDetails] = useState(false);
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const ambulanceMarkerRef = useRef<any>(null);
  const activeGeofenceCircleRef = useRef<any>(null);
  const signalMarkersRef = useRef<Record<string, any>>({});
  const stemMarkersRef = useRef<Record<string, any>>({});
  const stemPolylinesRef = useRef<Record<string, any>>({});
  const traveledPolylineRef = useRef<any>(null);
  const isMapInitializedRef = useRef(false);

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

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (isMapInitializedRef.current) return;

    let map: any = null;

    import('leaflet').then((L) => {
      if (!mapContainerRef.current || isMapInitializedRef.current) return;

      // Centered on corridor midpoint between IG Statue (11.93157, 79.80766) and Muruga Theatre (11.94162, 79.80825)
      const puducherryCenter: [number, number] = [11.9366, 79.8080];

      map = L.map(mapContainerRef.current, {
        center: puducherryCenter,
        zoom: 15.5,
        zoomControl: false,
        attributionControl: false
      });

      // Zoom control in top-left to avoid ANY overlay collisions
      L.control.zoom({ position: 'topleft' }).addTo(map);

      const googleTileUrl = mapType === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      const tileLayer = L.tileLayer(googleTileUrl, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      mapInstanceRef.current = map;
      (map as any)._googleTileLayer = tileLayer;

      // REAL ROAD POLYLINE: Lying 100% directly on 100 Feet Road / Kamaraj Salai asphalt road surface
      const routeCoords = trafficSignalService.getRouteCoordinates().map(c => [c.lat, c.lng]);
      
      // Outer road casing glow (Swiggy / Uber style route line)
      L.polyline(routeCoords as [number, number][], {
        color: '#002B66',
        weight: 10,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Inner electric blue navigation route line lying directly on the road
      L.polyline(routeCoords as [number, number][], {
        color: '#1677FF',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Traveled active route line (Glowing Green trail behind ambulance like live delivery apps)
      const traveledPolyline = L.polyline([], {
        color: '#00D68F',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      traveledPolylineRef.current = traveledPolyline;

      // Render geofence perimeter rings for all intersections
      const initialSignals = trafficSignalService.getSignals();
      initialSignals.forEach(sig => {
        L.circle([sig.coords.lat, sig.coords.lng], {
          radius: sig.geofenceRadius || 90,
          color: '#1677FF',
          fillColor: '#1677FF',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '5, 5'
        }).addTo(map);
      });

      // Active Dynamic Geofence Highlight Circle
      const gf = trafficSignalService.getGeofence();
      if (gf) {
        const activeCircle = L.circle([gf.center.lat, gf.center.lng], {
          radius: gf.radiusMeters,
          color: gf.isAmbulanceInside ? '#00D68F' : '#1677FF',
          fillColor: gf.isAmbulanceInside ? '#00D68F' : '#1677FF',
          fillOpacity: gf.isAmbulanceInside ? 0.28 : 0.12,
          weight: 2.5,
          dashArray: '6, 4'
        }).addTo(map);

        activeGeofenceCircleRef.current = activeCircle;
      }

      // Signal Markers on Map
      initialSignals.forEach(sig => {
        const isGreen = sig.state === 'GREEN';
        const isSelected = sig.id === gf?.targetSignalId;
        const hasStems = Boolean(sig.stems && sig.stems.length > 0);

        if (hasStems) {
          // Multi-Way Junction Hub (IG 4-Way or Muruga 5-Way)
          const iconHtml = createMultiWaySignalMarkerHtml(sig, sig.isInsideGeofence ?? false, isSelected);
          const signalIcon = L.divIcon({
            className: `traffic-signal-marker-${sig.id}`,
            html: iconHtml,
            iconSize: [60, 60],
            iconAnchor: [30, 30]
          });

          const marker = L.marker([sig.coords.lat, sig.coords.lng], { icon: signalIcon, zIndexOffset: 900 }).addTo(map);
          marker.on('click', () => {
            trafficSignalService.selectEmergencySignal(sig.id);
          });

          marker.bindTooltip(`<b>${sig.name}</b><br/>${sig.locationLabel}`, {
            direction: 'top',
            offset: [0, -32]
          });

          signalMarkersRef.current[sig.id] = marker;

          // Render physical stems directly on each road arm
          if (sig.stems) {
            sig.stems.forEach(stem => {
              if (stem.coords) {
                const isStemGreen = stem.state === 'GREEN';

                // Glowing Branch Connection Ray from Center to Stem
                const branchRay = L.polyline(
                  [[sig.coords.lat, sig.coords.lng], [stem.coords.lat, stem.coords.lng]],
                  {
                    color: isStemGreen ? '#00D68F' : '#F52235',
                    weight: isStemGreen ? 4.5 : 2.5,
                    opacity: 0.85,
                    dashArray: isStemGreen ? undefined : '5, 4'
                  }
                ).addTo(map);
                stemPolylinesRef.current[stem.id] = branchRay;

                // Dedicated Stem Traffic Signal Marker directly on the physical road arm
                const stemIcon = L.divIcon({
                  className: `traffic-stem-marker-${stem.id}`,
                  html: createIndividualStemMarkerHtml(stem, sig.isInsideGeofence ?? false),
                  iconSize: [44, 44],
                  iconAnchor: [22, 22]
                });

                const stemMarker = L.marker([stem.coords.lat, stem.coords.lng], {
                  icon: stemIcon,
                  zIndexOffset: 850
                }).addTo(map);

                stemMarker.bindTooltip(`<b>${stem.name}</b><br/>${stem.directionLabel}<br/><b>Signal:</b> ${stem.state}`, {
                  direction: 'top',
                  offset: [0, -24]
                });

                stemMarkersRef.current[stem.id] = stemMarker;
              }
            });
          }
        } else {
          // Standard Signal Pole
          const iconHtml = createStandardSignalMarkerHtml(sig, isGreen, isSelected);
          const signalIcon = L.divIcon({
            className: `traffic-signal-marker-${sig.id}`,
            html: iconHtml,
            iconSize: [44, 66],
            iconAnchor: [22, 60]
          });

          const marker = L.marker([sig.coords.lat, sig.coords.lng], { icon: signalIcon }).addTo(map);
          marker.on('click', () => {
            trafficSignalService.selectEmergencySignal(sig.id);
          });

          marker.bindTooltip(`<b>${sig.name}</b><br/>${sig.locationLabel}`, {
            direction: 'top',
            offset: [0, -35]
          });

          signalMarkersRef.current[sig.id] = marker;
        }
      });

      // Realistic Animated Ambulance Vehicle Marker
      const curAmbulance = trafficSignalService.getAmbulance();
      if (curAmbulance) {
        const ambIcon = L.divIcon({
          className: 'ambulance-map-marker',
          html: createRealisticAmbulanceMarkerHtml(curAmbulance),
          iconSize: [56, 56],
          iconAnchor: [28, 28]
        });

        const ambMarker = L.marker([curAmbulance.lat, curAmbulance.lng], {
          icon: ambIcon,
          zIndexOffset: 1000
        }).addTo(map);

        ambulanceMarkerRef.current = ambMarker;
      }

      isMapInitializedRef.current = true;

      // Ensure leaflet tiles always redraw cleanly to exact flex container size
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      (map as any)._customResizeObserver = resizeObserver;
    });

    return () => {
      if (map) {
        if ((map as any)._customResizeObserver) {
          (map as any)._customResizeObserver.disconnect();
        }
        map.remove();
        isMapInitializedRef.current = false;
        signalMarkersRef.current = {};
        stemMarkersRef.current = {};
        stemPolylinesRef.current = {};
      }
    };
  }, []);

  // Update ambulance marker position & heading smoothly on the road + dynamic traveled polyline
  useEffect(() => {
    if (!ambulance) return;
    import('leaflet').then((L) => {
      if (ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current.setLatLng([ambulance.lat, ambulance.lng]);
        const newIcon = L.divIcon({
          className: 'ambulance-map-marker',
          html: createRealisticAmbulanceMarkerHtml(ambulance),
          iconSize: [56, 56],
          iconAnchor: [28, 28]
        });
        ambulanceMarkerRef.current.setIcon(newIcon);
      }

      if (traveledPolylineRef.current) {
        const route = trafficSignalService.getRouteCoordinates();
        const targetLen = Math.max(1, Math.round((ambulance.routeProgress / 100) * route.length));
        const passed = route.slice(0, targetLen).map(c => [c.lat, c.lng]);
        passed.push([ambulance.lat, ambulance.lng]);
        traveledPolylineRef.current.setLatLngs(passed);
      }
    });
  }, [ambulance]);

  // Update signal markers, stems, branch rays, and active geofence circle
  useEffect(() => {
    if (!geofence) return;
    import('leaflet').then((L) => {
      signals.forEach(sig => {
        const marker = signalMarkersRef.current[sig.id];
        const isSelected = sig.id === geofence.targetSignalId;
        const hasStems = Boolean(sig.stems && sig.stems.length > 0);

        if (marker) {
          if (hasStems) {
            const iconHtml = createMultiWaySignalMarkerHtml(sig, sig.isInsideGeofence ?? false, isSelected);
            const newIcon = L.divIcon({
              className: `traffic-signal-marker-${sig.id}`,
              html: iconHtml,
              iconSize: [60, 60],
              iconAnchor: [30, 30]
            });
            marker.setIcon(newIcon);

            // Update all individual stem markers & branch rays
            if (sig.stems) {
              sig.stems.forEach(stem => {
                const sMarker = stemMarkersRef.current[stem.id];
                if (sMarker) {
                  const sIcon = L.divIcon({
                    className: `traffic-stem-marker-${stem.id}`,
                    html: createIndividualStemMarkerHtml(stem, sig.isInsideGeofence ?? false),
                    iconSize: [44, 44],
                    iconAnchor: [22, 22]
                  });
                  sMarker.setIcon(sIcon);
                }

                const sPolyline = stemPolylinesRef.current[stem.id];
                if (sPolyline) {
                  const isStemGreen = stem.state === 'GREEN';
                  sPolyline.setStyle({
                    color: isStemGreen ? '#00D68F' : '#F52235',
                    weight: isStemGreen ? 4.5 : 2.5,
                    opacity: 0.85,
                    dashArray: isStemGreen ? undefined : '5, 4'
                  });
                }
              });
            }
          } else {
            const isGreen = sig.state === 'GREEN';
            const iconHtml = createStandardSignalMarkerHtml(sig, isGreen, isSelected);
            const newIcon = L.divIcon({
              className: `traffic-signal-marker-${sig.id}`,
              html: iconHtml,
              iconSize: [44, 66],
              iconAnchor: [22, 60]
            });
            marker.setIcon(newIcon);
          }
        }
      });

      if (activeGeofenceCircleRef.current) {
        activeGeofenceCircleRef.current.setLatLng([geofence.center.lat, geofence.center.lng]);
        activeGeofenceCircleRef.current.setRadius(geofence.radiusMeters);
        activeGeofenceCircleRef.current.setStyle({
          color: geofence.isAmbulanceInside ? '#00D68F' : '#1677FF',
          fillColor: geofence.isAmbulanceInside ? '#00D68F' : '#1677FF',
          fillOpacity: geofence.isAmbulanceInside ? 0.30 : 0.12
        });
      }
    });
  }, [signals, geofence]);

  const handleToggleMapType = (nextType: 'roadmap' | 'satellite') => {
    setMapType(nextType);
    if (mapInstanceRef.current && (mapInstanceRef.current as any)._googleTileLayer) {
      const tileUrl = nextType === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      (mapInstanceRef.current as any)._googleTileLayer.setUrl(tileUrl);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && ambulance) {
      mapInstanceRef.current.panTo([ambulance.lat, ambulance.lng]);
    }
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      if (delta > 0) mapInstanceRef.current.zoomIn();
      else mapInstanceRef.current.zoomOut();
    }
  };

  const getSignalLocalizedName = (sig: TrafficSignal) => {
    if (sig.id === 'SIG-IG') return lang === 'ta' ? 'இந்திரா காந்தி சிலை (4-வழி)' : 'Indira Gandhi Statue (4-Way)';
    if (sig.id === 'SIG-MURUGA') return lang === 'ta' ? 'முருகா தியேட்டர் (5-வழி)' : 'Muruga Theatre (5-Way)';
    return sig.name;
  };

  const igSignal = signals.find(s => s.id === 'SIG-IG');
  const murugaSignal = signals.find(s => s.id === 'SIG-MURUGA');

  return (
    <div className="police-card rounded-xl p-2.5 flex flex-col h-full min-h-0 relative border-t-4 border-t-[#1677FF] shadow-lg select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--card-inner-border)] shrink-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1677FF]/20 border border-[#1677FF]/40 flex items-center justify-center text-[#1677FF] shrink-0 shadow-sm">
            <Network size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold theme-title tracking-wide leading-tight truncate">
              {lang === 'ta' ? 'நேரடி ஜிபிஎஸ் & சிக்னல் கட்டுப்பாடு' : 'Live GPS & Traffic Signal Control'}
            </h2>
            <p className="text-[11px] theme-sub leading-tight font-medium mt-0.5 truncate">
              {lang === 'ta' ? 'இந்திரா காந்தி சிலை (4-வழி) -> 100 அடி சாலை -> முருகா தியேட்டர் (5-வழி)' : 'Indira Gandhi Statue (4-Way) -> 100 Feet Rd -> Muruga Theatre (5-Way)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* USER REQUESTED: Button to Hide/Show Details for Clear View */}
          <button
            onClick={() => setHideDetails(!hideDetails)}
            className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              hideDetails
                ? 'bg-[#1677FF] text-white shadow-md'
                : 'theme-inner-card theme-sub hover:text-[#1677FF] border border-[var(--card-inner-border)]'
            }`}
            title={hideDetails ? 'Show All Controls (Full HUD)' : 'Clean Map Mode (Hide Overlays)'}
          >
            {hideDetails ? <Eye size={13} className="text-white" /> : <EyeOff size={13} />}
            <span className="hidden sm:inline">
              {hideDetails 
                ? (lang === 'ta' ? 'விவரங்களை காட்டு' : 'Show Details') 
                : (lang === 'ta' ? 'விவரங்களை மறை' : 'Hide Details')}
            </span>
          </button>

          {/* Map Type Toggle */}
          <div className="flex items-center p-0.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
            <button
              onClick={() => handleToggleMapType('roadmap')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                mapType === 'roadmap' ? 'bg-[#1677FF] text-white shadow-xs' : 'theme-sub hover:text-[#1677FF]'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => handleToggleMapType('satellite')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                mapType === 'satellite' ? 'bg-[#1677FF] text-white shadow-xs' : 'theme-sub hover:text-[#1677FF]'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg theme-inner-card border border-[var(--card-inner-border)]">
            <button
              onClick={() => handleZoom(1)}
              className="p-1 rounded theme-sub hover:text-[#1677FF] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Plus size={13} />
            </button>
            <button
              onClick={() => handleZoom(-1)}
              className="p-1 rounded theme-sub hover:text-[#1677FF] hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus size={13} />
            </button>
          </div>

          {/* Simulation Drawer Toggle */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-1.5 rounded theme-inner-card hover:bg-black/10 dark:hover:bg-white/10 theme-sub hover:text-[#1677FF] border border-[var(--card-inner-border)] transition-colors cursor-pointer shrink-0"
            title="GPS Emergency Corridor Controls"
          >
            <Sliders size={14} />
          </button>

          {/* Live Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/40 text-[#00D68F] text-[10.5px] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            <span>{t.common.live}</span>
          </div>
        </div>
      </div>

      {/* Main Map Space */}
      <div className="relative my-1.5 rounded-xl overflow-hidden border border-[#132B52] bg-[#030D1E] flex-1 min-h-0 w-full select-none shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* TOP HUD BANNER: Emergency Preemption Alert (Smoothly collapses or shrinks when hideDetails is active) */}
        {!hideDetails && (
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-none transition-all duration-300">
            <div className="pointer-events-auto bg-[#030D1E]/95 [data-theme='white']:bg-white/95 backdrop-blur-md border border-[#1677FF]/80 [data-theme='white']:border-slate-300 text-white [data-theme='white']:text-slate-900 rounded-xl px-3 py-2 shadow-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0 animate-bounce">🚨</span>
                <div className="text-[11px] leading-tight min-w-0 truncate">
                  {geofence?.isAmbulanceInside ? (
                    <span className="truncate">
                      <strong className="text-[#00D68F] font-black uppercase tracking-wide">
                        {lang === 'ta' ? 'அவசரகால பாதை இயங்குகிறது:' : 'EMERGENCY CORRIDOR ACTIVE:'}
                      </strong>{' '}
                      {lang === 'ta' ? 'ஆம்புலன்ஸ் எல்லையை தொட்டது' : 'Ambulance inside geofence at'}{' '}
                      <strong className="text-white [data-theme='white']:text-black underline font-extrabold">
                        {geofence.currentSignalName || 'Traffic Signal'}
                      </strong>
                      . <span className="text-[#00D68F] font-black">
                        {geofence.targetSignalId === 'SIG-IG' 
                          ? (lang === 'ta' ? 'கிளை 3 வடக்கு பாதை பச்சை (மற்ற 3 திசைகள் சிவப்பு)' : 'Stem 3 North (100Ft Rd) is GREEN (Other 3 Stems RED)')
                          : (lang === 'ta' ? 'தெற்கு பாலம் பாதை பச்சை (மற்ற 4 திசைகள் சிவப்பு)' : 'Stem 4 South Approach is GREEN (Other 4 Stems RED)')}
                      </span>.
                    </span>
                  ) : (
                    <span className="truncate theme-title font-medium">
                      🛡️ <strong className="text-[#38BDF8] font-bold">{lang === 'ta' ? 'கண்காணிப்பு பாதை:' : 'PATROL CORRIDOR:'}</strong>{' '}
                      {lang === 'ta' ? '100 அடி சாலை (SH32)-ல் பயணிக்கிறது' : 'En route along 100 Feet Road (SH32)'} • {lang === 'ta' ? 'அடுத்த சிக்னல்:' : 'Approaching'}{' '}
                      <span className="font-bold underline">{geofence?.currentSignalName || 'Traffic Signal'}</span>{' '}
                      ({geofence?.distanceToAmbulance || 0}m)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleRecenter}
                  className="p-1 rounded bg-[#1677FF]/30 hover:bg-[#1677FF] text-[#1677FF] hover:text-white border border-[#1677FF]/50 transition-colors cursor-pointer"
                  title="Recenter Map on Ambulance"
                >
                  <Crosshair size={12} />
                </button>
                <button
                  onClick={() => trafficSignalService.togglePlayPause()}
                  className="px-2.5 py-1 rounded bg-[#1677FF] hover:bg-[#0056cc] text-white font-bold text-[10px] flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                >
                  {isRunning ? <Pause size={10} /> : <Play size={10} />}
                  <span>{isRunning ? 'Pause' : 'Play'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING ACTION PILL: Appears when Details are hidden so user can restore HUD anytime */}
        {hideDetails && (
          <div className="absolute bottom-3 right-3 z-30 pointer-events-auto">
            <button
              onClick={() => setHideDetails(false)}
              className="px-3 py-1.5 rounded-xl bg-[#030D1E]/95 [data-theme='white']:bg-white/95 backdrop-blur-md border border-[#1677FF] text-white [data-theme='white']:text-slate-900 text-xs font-extrabold shadow-2xl flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer"
            >
              <Eye size={14} className="text-[#1677FF]" />
              <span>{lang === 'ta' ? 'கட்டுப்பாடுகளை காட்டு' : 'Show Controls & HUD'}</span>
            </button>
          </div>
        )}

        {/* UNIFIED FULL-WIDTH COMMAND DOCK: Can be hidden or minimized for clear map inspection */}
        {!hideDetails && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-none flex flex-col gap-1.5 transition-all duration-300">

            {/* DOCK ROW 1: Real-time Ambulance Telemetry Ribbon */}
            {ambulance && (
              <div className="pointer-events-auto bg-[#030D1E]/95 [data-theme='white']:bg-white/95 backdrop-blur-md border border-[#1677FF]/60 [data-theme='white']:border-slate-300 text-white [data-theme='white']:text-slate-900 rounded-xl px-3 py-1.5 shadow-xl flex items-center justify-between gap-2 overflow-hidden relative">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="text-base">🚑</span>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-[11px] theme-title leading-tight truncate">
                      {ambulance.name} <span className="text-[#38BDF8] font-mono text-[9.5px]">({ambulance.id})</span>
                    </div>
                    <div className="text-[9px] theme-sub font-mono flex items-center gap-2 mt-0.5">
                      <span>GPS: {ambulance.lat.toFixed(4)}°N, {ambulance.lng.toFixed(4)}°E</span>
                      <span className="hidden sm:inline">• 100 Feet Road (SH32) • Heading: {ambulance.heading}°</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-[#F52235] text-white font-black text-[10px] shadow-sm animate-pulse">
                    {ambulance.speed} km/h
                  </span>

                  <span className={`font-black text-[9px] uppercase px-2 py-0.5 rounded ${
                    geofence?.isAmbulanceInside
                      ? 'bg-[#00D68F]/20 text-[#00D68F] border border-[#00D68F]/50 animate-pulse'
                      : 'bg-[#1677FF]/20 text-[#38BDF8] border border-[#1677FF]/50'
                  }`}>
                    {geofence?.isAmbulanceInside ? '⚡ GEOFENCE PREEMPTION' : '🛡️ EN ROUTE'}
                  </span>
                </div>

                {/* Bottom route progress indicator line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 dark:bg-white/10">
                  <div 
                    className="bg-gradient-to-r from-[#1677FF] to-[#00D68F] h-full transition-all duration-500"
                    style={{ width: `${ambulance.routeProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* DOCK ROW 2: Responsive Signal Controller Matrix (Collapsible) */}
            <div className="pointer-events-auto bg-[#030D1E]/95 [data-theme='white']:bg-white/95 backdrop-blur-md border border-[#1677FF]/60 [data-theme='white']:border-slate-300 rounded-xl p-2 shadow-2xl transition-all">
              <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-black/10 dark:border-white/10 px-1">
                <div className="text-[10px] font-black tracking-wider text-[#AFC4E8] [data-theme='white']:text-slate-600 uppercase flex items-center gap-1.5">
                  <Radio size={12} className="text-[#1677FF]" />
                  <span>Puducherry Traffic Intersections</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStemInspector(!showStemInspector)}
                    className="text-[9px] font-bold text-[#1677FF] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{showStemInspector ? 'Hide Stem Details' : 'Show Multi-Stem Details'}</span>
                    {showStemInspector ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>

                  <button
                    onClick={() => setIsDockMinimized(!isDockMinimized)}
                    className="p-1 rounded theme-inner-card hover:text-[#1677FF] text-[#AFC4E8] [data-theme='white']:text-slate-600 transition-colors cursor-pointer"
                    title={isDockMinimized ? 'Expand Signal Matrix' : 'Minimize Dock'}
                  >
                    {isDockMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                  </button>
                </div>
              </div>

              {/* 2-Column Responsive Buttons (No text squeezed, comfortable width) */}
              {!isDockMinimized && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {signals.map((sig) => {
                    const isSelected = sig.id === geofence?.targetSignalId;
                    const isInside = Boolean(sig.isInsideGeofence);
                    const isGreen = sig.state === 'GREEN';
                    const localizedName = getSignalLocalizedName(sig);
                    const isIG = sig.id === 'SIG-IG';
                    const isMuruga = sig.id === 'SIG-MURUGA';

                    return (
                      <button
                        key={sig.id}
                        onClick={() => trafficSignalService.selectEmergencySignal(sig.id)}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isInside
                            ? 'bg-[#00D68F]/20 [data-theme="white"]:bg-emerald-50 border-[#00D68F] shadow-[0_0_12px_rgba(0,214,143,0.35)]'
                            : isSelected
                            ? 'bg-[#0E2A5A] [data-theme="white"]:bg-blue-50 border-[#1677FF] shadow-[0_0_8px_rgba(22,119,255,0.3)]'
                            : 'bg-black/50 [data-theme="white"]:bg-slate-100 border-black/10 dark:border-white/15 hover:border-[#1677FF]'
                        }`}
                      >
                        <span 
                          className={`w-3.5 h-3.5 rounded-full shrink-0 transition-all ${
                            isGreen ? 'bg-[#00D68F] shadow-[0_0_10px_#00D68F]' : 'bg-[#F52235] shadow-[0_0_10px_#F52235]'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-extrabold theme-title truncate leading-tight">
                              {localizedName}
                            </span>
                            <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 ${
                              isGreen ? 'bg-[#00D68F]/20 text-[#00D68F]' : 'bg-[#F52235]/20 text-[#F52235]'
                            }`}>
                              {isInside 
                                ? (isIG ? 'STEM 3 GREEN' : isMuruga ? 'STEM 4 GREEN' : 'PREEMPT GREEN') 
                                : sig.state}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                            <span className="theme-sub truncate max-w-[140px]">
                              {sig.direction}
                            </span>
                            <span className="theme-title font-bold shrink-0">
                              {isInside ? (
                                <span className="text-[#00D68F] font-black animate-pulse">🎯 IN GEOFENCE</span>
                              ) : (
                                `${sig.distanceToAmbulance || 0}m`
                              )}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* EXPANDABLE: Multi-Stem Traffic Light Monitors (Both IG 4-Way and Muruga 5-Way) */}
              {!isDockMinimized && showStemInspector && (
                <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 space-y-2">
                  {/* Indira Gandhi Statue 4-Stem Monitor */}
                  {igSignal && igSignal.stems && (
                    <div>
                      <div className="flex items-center justify-between mb-1 text-[9.5px]">
                        <span className="font-extrabold text-[#AFC4E8] [data-theme='white']:text-slate-700 flex items-center gap-1">
                          <Zap size={11} className={igSignal.isInsideGeofence ? 'text-[#00D68F]' : 'text-[#38BDF8]'} />
                          {lang === 'ta' ? 'இந்திரா காந்தி சிலை: 4-திசை சிக்னல் நேரலை நிலை' : 'Indira Gandhi Statue: 4-Way Stem Matrix (100Ft Rd)'}
                        </span>
                        <span className="font-mono text-[8.5px] text-[#00D68F] font-bold">
                          {igSignal.isInsideGeofence 
                            ? '⚡ STEM 3 (NORTH) GREEN • 3 STEMS RED' 
                            : '🔄 4-PHASE SEQUENTIAL ROTATION'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[8.5px]">
                        {igSignal.stems.map((stem) => {
                          const isStemGreen = stem.state === 'GREEN';
                          return (
                            <div
                              key={stem.id}
                              className={`p-1 rounded border flex items-center gap-1.5 ${
                                isStemGreen
                                  ? 'bg-[#00D68F]/20 border-[#00D68F] text-[#00D68F] font-black shadow-xs'
                                  : 'bg-black/40 [data-theme="white"]:bg-slate-200 border-black/10 dark:border-white/10 theme-sub font-semibold'
                              }`}
                            >
                              <span 
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isStemGreen ? 'bg-[#00D68F] shadow-[0_0_6px_#00D68F]' : 'bg-[#F52235]'
                                }`}
                              />
                              <div className="min-w-0 truncate">
                                <div className="truncate font-bold leading-tight">{stem.name}</div>
                                <div className="text-[7.5px] uppercase font-mono">{stem.state}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Muruga Theatre 5-Stem Monitor */}
                  {murugaSignal && murugaSignal.stems && (
                    <div>
                      <div className="flex items-center justify-between mb-1 text-[9.5px]">
                        <span className="font-extrabold text-[#AFC4E8] [data-theme='white']:text-slate-700 flex items-center gap-1">
                          <Zap size={11} className={murugaSignal.isInsideGeofence ? 'text-[#00D68F]' : 'text-[#38BDF8]'} />
                          {lang === 'ta' ? 'முருகா தியேட்டர்: 5-திசை சிக்னல் நேரலை நிலை' : 'Muruga Theatre: 5-Direction Stem Status Matrix'}
                        </span>
                        <span className="font-mono text-[8.5px] text-[#00D68F] font-bold">
                          {murugaSignal.isInsideGeofence 
                            ? '⚡ STEM 4 (SOUTH 100FT) GREEN • 4 STEMS RED' 
                            : '🔄 5-PHASE SEQUENTIAL ROTATION'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 text-[8.5px]">
                        {murugaSignal.stems.map((stem) => {
                          const isStemGreen = stem.state === 'GREEN';
                          return (
                            <div
                              key={stem.id}
                              className={`p-1 rounded border flex items-center gap-1.5 ${
                                isStemGreen
                                  ? 'bg-[#00D68F]/20 border-[#00D68F] text-[#00D68F] font-black shadow-xs'
                                  : 'bg-black/40 [data-theme="white"]:bg-slate-200 border-black/10 dark:border-white/10 theme-sub font-semibold'
                              }`}
                            >
                              <span 
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isStemGreen ? 'bg-[#00D68F] shadow-[0_0_6px_#00D68F]' : 'bg-[#F52235]'
                                }`}
                              />
                              <div className="min-w-0 truncate">
                                <div className="truncate font-bold leading-tight">{stem.name}</div>
                                <div className="text-[7.5px] uppercase font-mono">{stem.state}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Floating Simulation Controls Drawer */}
      {showControls && (
        <div className="absolute top-12 right-3 z-30 w-84 bg-[#06152F] [data-theme='white']:bg-white border-2 border-[#1677FF] rounded-xl p-3.5 shadow-2xl space-y-2.5 text-white [data-theme='white']:text-slate-900">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#132B52] [data-theme='white']:border-slate-200">
            <span className="text-xs font-bold flex items-center gap-1.5 text-white [data-theme='white']:text-slate-900">
              <Sliders size={13} className="text-[#1677FF]" /> Puducherry Geofence Simulation
            </span>
            <button onClick={() => setShowControls(false)} className="text-[#AFC4E8] [data-theme='white']:text-slate-500 hover:opacity-80 cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => trafficSignalService.triggerEnterGeofence('SIG-IG')}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 hover:bg-[#132B52] [data-theme='white']:hover:bg-slate-200 font-semibold text-white [data-theme='white']:text-slate-900 flex items-center justify-between border border-[#132B52] [data-theme='white']:border-slate-300 cursor-pointer"
            >
              <span>Test Indira Gandhi Statue (4-Way Green)</span>
              <span className="text-[#00D68F] font-bold text-[10px]">FORCE GREEN</span>
            </button>

            <button
              onClick={() => trafficSignalService.triggerEnterGeofence('SIG-MURUGA')}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 hover:bg-[#132B52] [data-theme='white']:hover:bg-slate-200 font-semibold text-white [data-theme='white']:text-slate-900 flex items-center justify-between border border-[#132B52] [data-theme='white']:border-slate-300 cursor-pointer"
            >
              <span>Test Muruga Theatre (5-Way Green)</span>
              <span className="text-[#00D68F] font-bold text-[10px]">FORCE GREEN</span>
            </button>

            <button
              onClick={() => trafficSignalService.triggerExitGeofence()}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 hover:bg-[#132B52] [data-theme='white']:hover:bg-slate-200 font-semibold text-white [data-theme='white']:text-slate-900 flex items-center justify-between border border-[#132B52] [data-theme='white']:border-slate-300 cursor-pointer"
            >
              <span>Trigger Geofence Exit (Normal Cycling)</span>
              <span className="text-[#AFC4E8] [data-theme='white']:text-slate-600 font-bold text-[10px]">RESTORE</span>
            </button>

            <button
              onClick={() => trafficSignalService.resetSimulation()}
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#0A1B39] [data-theme='white']:bg-slate-100 hover:bg-[#132B52] [data-theme='white']:hover:bg-slate-200 font-semibold text-white [data-theme='white']:text-slate-900 flex items-center justify-between border border-[#132B52] [data-theme='white']:border-slate-300 cursor-pointer"
            >
              <span>Reset Route to Start</span>
              <RotateCcw size={12} className="text-[#1677FF]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Realistic Animated Ambulance Marker with Dual Flashing Strobes and Road Rotation
function createRealisticAmbulanceMarkerHtml(ambulance: AmbulanceState): string {
  return `
    <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
      <!-- Siren pulse wave -->
      <div style="position: absolute; width: 52px; height: 52px; border-radius: 50%; background: rgba(22, 119, 255, 0.25); border: 1.5px solid rgba(22, 119, 255, 0.6); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      
      <!-- Direction-aligned rotating vehicle -->
      <div style="transform: rotate(${ambulance.heading}deg); transform-origin: center center; width: 34px; height: 48px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        
        <!-- Forward Headlight Beams -->
        <div style="position: absolute; top: -14px; width: 28px; height: 18px; background: radial-gradient(ellipse at bottom, rgba(255,255,200,0.6) 0%, rgba(255,255,200,0) 80%); pointer-events: none;"></div>

        <!-- Vehicle Body (SVG Top View) -->
        <svg width="30" height="44" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.7));">
          <!-- Main Chassis -->
          <rect x="2" y="2" width="26" height="40" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
          
          <!-- Red Emergency Stripe (Side/Back) -->
          <rect x="2" y="16" width="26" height="4" fill="#EF4444"/>
          <rect x="2" y="32" width="26" height="3" fill="#EF4444"/>
          
          <!-- Front Windshield -->
          <path d="M5 8C5 6 7 4 10 4H20C23 4 25 6 25 8V12H5V8Z" fill="#1E293B"/>
          
          <!-- Rear Windows -->
          <rect x="5" y="37" width="8" height="3" rx="1" fill="#1E293B"/>
          <rect x="17" y="37" width="8" height="3" rx="1" fill="#1E293B"/>

          <!-- Red Cross on Roof -->
          <rect x="13.5" y="21" width="3" height="9" rx="0.5" fill="#EF4444"/>
          <rect x="10.5" y="24" width="9" height="3" rx="0.5" fill="#EF4444"/>
        </svg>

        <!-- Roof Emergency Lightbar: Flashing Dual LED Strobes -->
        <div style="position: absolute; top: 13px; width: 16px; height: 6px; background: #0F172A; border-radius: 2px; display: flex; align-items: center; justify-content: space-between; padding: 0 1px; box-shadow: 0 0 6px rgba(0,0,0,0.8); z-index: 10;">
          <div style="width: 5px; height: 4px; border-radius: 1px; background: #FF1744; box-shadow: 0 0 8px #FF1744; animation: flashRed 0.4s infinite alternate;"></div>
          <div style="width: 5px; height: 4px; border-radius: 1px; background: #2979FF; box-shadow: 0 0 8px #2979FF; animation: flashBlue 0.4s infinite alternate 0.2s;"></div>
        </div>
      </div>
    </div>

    <style>
      @keyframes flashRed {
        0% { opacity: 0.3; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1.3); }
      }
      @keyframes flashBlue {
        0% { opacity: 0.3; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1.3); }
      }
    </style>
  `;
}

// Multi-Way Rotary / Junction Center Hub Marker (IG 4-Way Junction and Muruga 5-Way Rotary)
function createMultiWaySignalMarkerHtml(signal: TrafficSignal, isAmbulanceInGeofence: boolean, isSelected: boolean): string {
  const isIG = signal.id === 'SIG-IG';
  const stemCount = signal.stems ? signal.stems.length : (isIG ? 4 : 5);
  const borderColor = isAmbulanceInGeofence ? '#00D68F' : (isSelected ? '#38BDF8' : '#1677FF');
  const shadowColor = isAmbulanceInGeofence ? '0 0 22px rgba(0,214,143,0.95)' : '0 0 14px rgba(22,119,255,0.6)';
  const label = isIG ? 'IG 4-WAY STATUE' : 'MURUGA 5-WAY ROTARY';
  const tagText = isAmbulanceInGeofence 
    ? (isIG ? '⚡ IG CORRIDOR GREEN' : '⚡ 5-WAY ROTARY ACTIVE') 
    : label;

  return `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; position: relative;">
      <!-- Central Hub Beacon -->
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #020914; border: 3px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: ${shadowColor}, 0 4px 12px rgba(0,0,0,0.85); z-index: 10;">
        <span style="font-size: 15px; color: ${borderColor}; font-weight: 900; line-height: 1;">${isIG ? '✚' : '↻'}</span>
        <span style="font-size: 7.5px; font-weight: 900; color: #FFFFFF; line-height: 1; margin-top: 1px;">${stemCount}-WAY</span>
      </div>

      <!-- Status Tag -->
      <div style="background: ${isAmbulanceInGeofence ? '#00D68F' : '#0A1B39'}; color: ${isAmbulanceInGeofence ? '#030D1E' : '#FFFFFF'}; font-weight: 900; font-size: 8px; padding: 2px 7px; border-radius: 4px; border: 1.5px solid white; white-space: nowrap; box-shadow: 0 3px 8px rgba(0,0,0,0.85); margin-top: 2px; z-index: 11;">
        ${tagText}
      </div>
    </div>
  `;
}

// Dedicated Physical Stem Marker: Rendered directly on each of the 5 road branches meeting at the rotary
function createIndividualStemMarkerHtml(stem: SignalStem, isAmbulanceInGeofence: boolean): string {
  const isGreen = stem.state === 'GREEN';
  const color = isGreen ? '#00D68F' : '#F52235';
  const glow = isGreen ? '0 0 16px #00D68F, 0 0 4px #FFFFFF' : '0 0 9px #F52235';
  const icon = isGreen ? '➔' : '✋';
  const actionLabel = isGreen ? 'PASS' : 'STOP';

  return `
    <div style="display: flex; flex-direction: column; align-items: center; position: relative; pointer-events: auto; cursor: pointer;">
      ${isGreen ? `
        <!-- Animated Green Pulse Ring for approaching corridor -->
        <div style="position: absolute; top: -5px; width: 38px; height: 38px; border-radius: 50%; background: rgba(0, 214, 143, 0.3); border: 2px solid #00D68F; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
      ` : ''}

      <!-- Signal Lamp Head -->
      <div style="width: 26px; height: 26px; border-radius: 50%; background: ${color}; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: ${glow}, 0 3px 8px rgba(0,0,0,0.85); z-index: 15;">
        <span style="font-size: ${isGreen ? '14px' : '11px'}; color: ${isGreen ? '#020914' : '#FFFFFF'}; font-weight: 900; line-height: 1;">${icon}</span>
      </div>

      <!-- Road Arm Badge -->
      <div style="background: #020914; color: ${color}; font-weight: 900; font-size: 7.5px; padding: 1.5px 5px; border-radius: 4px; border: 1.5px solid ${color}; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.9); margin-top: 2px; display: flex; align-items: center; gap: 3px; z-index: 16;">
        <span style="letter-spacing: 0.2px;">${stem.name.split(':')[0]}</span>
        <span style="background: ${color}; color: ${isGreen ? '#020914' : '#FFFFFF'}; border-radius: 2px; padding: 0.5px 3px; font-size: 6.5px; font-weight: 900;">${actionLabel}</span>
      </div>
    </div>
  `;
}

// Standard 3-Lamp Pole for other junctions
function createStandardSignalMarkerHtml(signal: TrafficSignal, isGreen: boolean, isSelected: boolean): string {
  const lampRedBg = isGreen ? '#3a080c' : '#F52235';
  const lampRedGlow = isGreen ? 'none' : '0 0 10px #F52235';
  const lampGreenBg = isGreen ? '#00D68F' : '#082a19';
  const lampGreenGlow = isGreen ? '0 0 12px #00D68F' : 'none';
  const borderColor = isSelected ? '#00D68F' : '#ffffff';

  return `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div style="background: #020914; border: 2px solid ${borderColor}; border-radius: 6px; padding: 3px 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 3px; align-items: center;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${lampRedBg}; box-shadow: ${lampRedGlow}; border: 1px solid rgba(255,255,255,0.3);"></div>
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #3b2a08; border: 1px solid rgba(255,255,255,0.2);"></div>
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${lampGreenBg}; box-shadow: ${lampGreenGlow}; border: 1px solid rgba(255,255,255,0.3);"></div>
      </div>
      <div style="width: 3px; height: 8px; background: #64748B;"></div>
      <div style="background: ${isSelected ? '#00D68F' : '#0A1B39'}; color: ${isSelected ? '#030D1E' : '#FFFFFF'}; font-weight: 800; font-size: 8.5px; padding: 1px 4px; border-radius: 4px; border: 1px solid white; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.6); margin-top: -2px;">
        ${signal.name}
      </div>
    </div>
  `;
}
