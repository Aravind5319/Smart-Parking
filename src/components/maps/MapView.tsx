'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Puducherry Coordinates
const PUDUCHERRY_CENTER: [number, number] = [11.9329, 79.8299];

export default function MapView() {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={PUDUCHERRY_CENTER} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        
        {/* Sample Marker for White Town */}
        <Marker position={[11.9344, 79.8335]} icon={customIcon}>
          <Popup>
            <div className="text-sm font-semibold mb-1">White Town Zone</div>
            <div className="text-xs text-main-text/70">Restricted parking active</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
