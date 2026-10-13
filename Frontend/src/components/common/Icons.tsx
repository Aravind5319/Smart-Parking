// ============================================================================
// PARKPUDUVAI - PURE VECTOR SVG ICON LIBRARY (ZERO EMOJIS)
// ============================================================================

import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

export interface IconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
}

// 1. Police Badge / Authority Shield
export const PoliceShieldIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 20, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 2. Trophy / Karma Award Icon
export const TrophyIcon: React.FC<IconProps> = ({ color = '#F59E0B', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
        <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 3. Plus Icon
export const PlusIcon: React.FC<IconProps> = ({ color = '#1E3A8A', size = 20, strokeWidth = 2.5 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 4. Camera Icon
export const CameraIcon: React.FC<IconProps> = ({ color = '#1E3A8A', size = 24, strokeWidth = 2, fill = 'none' }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 5. Location Pin Icon
export const LocationPinIcon: React.FC<IconProps> = ({ color = '#1E3A8A', size = 20, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 6. Refresh / Cycle Icon
export const RefreshIcon: React.FC<IconProps> = ({ color = '#475569', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 7. Car Silhouette Icon
export const CarIcon: React.FC<IconProps> = ({ color = '#38BDF8', size = 36, strokeWidth = 1.8 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M5 17h14v-5l-2-5H7l-2 5v5z" />
        <circle cx="7.5" cy="17.5" r="2.5" fill={color} />
        <circle cx="16.5" cy="17.5" r="2.5" fill={color} />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 8. Checkmark Icon
export const CheckmarkIcon: React.FC<IconProps> = ({ color = '#10B981', size = 16, strokeWidth = 2.5 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 9. Alert Triangle / Warning Icon
export const WarningIcon: React.FC<IconProps> = ({ color = '#EF4444', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 10. Search Icon
export const SearchIcon: React.FC<IconProps> = ({ color = '#64748B', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 11. Map Icon
export const MapIcon: React.FC<IconProps> = ({ color = '#475569', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 12. Arrow Right / Proceed Icon
export const ArrowRightIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16, strokeWidth = 2.5 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 13. Shield Lock Icon (C.A.T.C.H. security)
export const ShieldLockIcon: React.FC<IconProps> = ({ color = '#1E3A8A', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9" y="10" width="6" height="5" rx="1" />
        <path d="M10 10V8a2 2 0 0 1 4 0v2" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// ============================================================================
// VIOLATION CATEGORY ICONS
// ============================================================================

// 14. Prohibited / No Parking Sign
export const ProhibitedIcon: React.FC<IconProps> = ({ color = '#EF4444', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 15. Pedestrian / Footpath Icon
export const PedestrianIcon: React.FC<IconProps> = ({ color = '#64748B', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="5" r="2" />
        <path d="M10 22v-6l-2-2V9h8v5l-2 2v6" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 16. Double Car / Congestion Icon
export const DoubleCarIcon: React.FC<IconProps> = ({ color = '#EF4444', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <rect x="2" y="7" width="9" height="10" rx="2" />
        <rect x="13" y="7" width="9" height="10" rx="2" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 17. Gate / Barrier Icon
export const GateIcon: React.FC<IconProps> = ({ color = '#64748B', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 18. Bus Stop Icon
export const BusIcon: React.FC<IconProps> = ({ color = '#64748B', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <rect x="4" y="3" width="16" height="16" rx="2" />
        <path d="M4 11h16" />
        <path d="M8 15h.01" />
        <path d="M16 15h.01" />
        <path d="M6 19v2" />
        <path d="M18 19v2" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 19. File / Note Icon
export const FileTextIcon: React.FC<IconProps> = ({ color = '#64748B', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 20. Siren / Emergency Icon
export const SirenIcon: React.FC<IconProps> = ({ color = '#EF4444', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 2v3" />
        <path d="M4.93 4.93l2.12 2.12" />
        <path d="M19.07 4.93l-2.12 2.12" />
        <path d="M5 19h14a2 2 0 0 0 2-2v-4a7 7 0 0 0-14 0v4a2 2 0 0 0 2 2z" />
        <path d="M4 22h16" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 21. Chevron Down / Dropdown Icon
export const ChevronDownIcon: React.FC<IconProps> = ({ color = '#64748B', size = 18, strokeWidth = 2.5 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 22. Navigation Compass Icon
export const NavigationIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polygon points="3 11 22 2 13 21 11 13 3 11" fill={color} fillOpacity="0.2" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 23. Walking Person Icon
export const WalkIcon: React.FC<IconProps> = ({ color = '#64748B', size = 14, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="13.5" cy="4.5" r="2.5" />
        <path d="M7 21l3-6 2 2v5" />
        <path d="M12 11l2 2 4-2" />
        <path d="M10 11l-2 3" />
        <path d="M12 8v5" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 24. Two-Wheeler / Motorcycle Icon
export const MotorcycleIcon: React.FC<IconProps> = ({ color = '#64748B', size = 16, strokeWidth = 1.8 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="5" cy="16" r="3" />
        <circle cx="19" cy="16" r="3" />
        <path d="M12 16h-4l3-7h3l2 4h3" />
        <path d="M14 6l-2 3" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 25. Clock / Countdown Timer Icon
export const ClockIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 26. Beach / Wave Destination Icon
export const BeachIcon: React.FC<IconProps> = ({ color = '#0B2559', size = 14, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M2 19c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
        <path d="M2 15c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
        <circle cx="12" cy="6" r="3" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 27. Monument / Heritage Quarter Icon
export const MonumentIcon: React.FC<IconProps> = ({ color = '#0B2559', size = 14, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M4 21h16" />
        <path d="M6 21V10" />
        <path d="M10 21V10" />
        <path d="M14 21V10" />
        <path d="M18 21V10" />
        <path d="M3 10h18l-9-7-9 7z" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 28. Shopping Bag Icon
export const ShoppingBagIcon: React.FC<IconProps> = ({ color = '#0B2559', size = 14, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 29. Park Tree Icon
export const ParkTreeIcon: React.FC<IconProps> = ({ color = '#0B2559', size = 14, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 2L4 12h4l-3 6h5v4h4v-4h5l-3-6h4z" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 30. Ship / Port Anchor Icon
export const AnchorIcon: React.FC<IconProps> = ({ color = '#0B2559', size = 14, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="5" r="3" />
        <line x1="12" y1="22" x2="12" y2="8" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 31. Map Layers / Switch Icon
export const LayersIcon: React.FC<IconProps> = ({ color = '#0B2559', size = 13, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 32. Crosshair / Radar Locate Icon
export const CrosshairIcon: React.FC<IconProps> = ({ color = '#0B2559', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="22" y1="12" x2="18" y2="12" />
        <line x1="6" y1="12" x2="2" y2="12" />
        <line x1="12" y1="6" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="18" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 33. Phone Call / Emergency Helpline Icon
export const PhoneCallIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 34. Check Circle / Verified Seal Icon
export const CheckCircleIcon: React.FC<IconProps> = ({ color = '#10B981', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};


// 36. Purse / Wallet / Lost Belonging Icon
export const PurseIcon: React.FC<IconProps> = ({ color = '#D97706', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <rect x="2" y="6" width="20" height="14" rx="3" />
        <path d="M16 13a2 2 0 1 0 4 0" />
        <path d="M2 10h20" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 37. Key / Documents / Found ID Icon
export const KeyIcon: React.FC<IconProps> = ({ color = '#0284C7', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="7.5" cy="15.5" r="4.5" />
        <path d="m21 3-9.5 9.5" />
        <path d="m15.5 7.5 3 3" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 38. Hazard / Debris / Road Condition Icon
export const HazardIcon: React.FC<IconProps> = ({ color = '#EF4444', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 39. Telephone / Police Helpline Icon
export const PhoneIcon: React.FC<IconProps> = ({ color = '#1E3A8A', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 40. Upload Document / Photo Icon
export const UploadIcon: React.FC<IconProps> = ({ color = '#1E3A8A', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 41. Restroom / Public Toilet Icon
export const RestroomIcon: React.FC<IconProps> = ({ color = '#0284C7', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="7" cy="5" r="2" />
        <path d="M5 21v-7H3V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5H9v7" />
        <circle cx="17" cy="5" r="2" />
        <path d="M15 21v-5h-1l2-7a1.5 1.5 0 0 1 2 0l2 7h-1v5" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 42. Fuel / Petrol Pump Icon
export const FuelIcon: React.FC<IconProps> = ({ color = '#EA580C', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M3 22h12M4 9h10M4 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18" />
        <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L19 6" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 43. ATM / Cash Icon
export const AtmIcon: React.FC<IconProps> = ({ color = '#16A34A', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="15" x2="10" y2="15" />
        <line x1="14" y1="15" x2="18" y2="15" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 44. Traffic Light / Signal Icon
export const TrafficLightIcon: React.FC<IconProps> = ({ color = '#EAB308', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <rect x="7" y="2" width="10" height="20" rx="4" />
        <circle cx="12" cy="6" r="1.5" fill="#EF4444" stroke="none" />
        <circle cx="12" cy="12" r="1.5" fill="#EAB308" stroke="none" />
        <circle cx="12" cy="18" r="1.5" fill="#10B981" stroke="none" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 45. Ambulance / Emergency Vehicle Icon
export const AmbulanceIcon: React.FC<IconProps> = ({ color = '#DC2626', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M19 17h2b a1 1 0 0 0 1-1v-3.5a2 2 0 0 0-.6-1.4l-2.8-2.8a2 2 0 0 0-1.4-.6H14V5a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <line x1="8" y1="10" x2="10" y2="10" />
        <line x1="9" y1="9" x2="9" y2="11" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 46. Voice Mic Icon
export const MicIcon: React.FC<IconProps> = ({ color = '#4285F4', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 47. Star Rating Icon
export const StarIcon: React.FC<IconProps> = ({ color = '#F59E0B', size = 14, strokeWidth = 1.5 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 48. Share Icon
export const ShareIcon: React.FC<IconProps> = ({ color = '#1E3A8A', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 49. User / Profile Icon
export const UserIcon: React.FC<IconProps> = ({ color = '#0B2559', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 50. Directions Turn Icon (Google Maps Style Diamond)
export const DirectionsIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16, strokeWidth = 2.5 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="m14 10 4 4m0 0-4 4m4-4H9a3 3 0 0 1-3-3V6" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 51. Electric Vehicle (EV) Icon
export const EvIcon: React.FC<IconProps> = ({ color = '#10B981', size = 16, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M13 2 4 14h7v8l9-12h-7z" fill={color} fillOpacity="0.2" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 52. Volume / Audio Prompt Icon
export const VolumeIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 53. Dustbin / Trash / Waste Bin Icon
export const DustbinIcon: React.FC<IconProps> = ({ color = '#059669', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

// 54. SOS / Emergency Siren Icon
export const SosIcon: React.FC<IconProps> = ({ color = '#DC2626', size = 18, strokeWidth = 2 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    );
  }
  return <View style={[styles.fallbackBox, { width: size, height: size, borderColor: color }]} />;
};

const styles = StyleSheet.create({
  fallbackBox: {
    borderWidth: 1.5,
    borderRadius: 3,
  },
});

