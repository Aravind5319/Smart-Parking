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

const styles = StyleSheet.create({
  fallbackBox: {
    borderWidth: 1.5,
    borderRadius: 3,
  },
});
