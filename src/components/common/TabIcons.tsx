import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

interface IconProps {
  color: string;
  size?: number;
  focused?: boolean;
}

// ============================================================================
// 1. PARKING SVG ICON (Square with 'P' sign)
// ============================================================================
export const ParkingIcon: React.FC<IconProps> = ({ color, size = 22, focused }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={focused ? "2.3" : "1.8"}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <rect x="3" y="3" width="18" height="18" rx="4" fill={focused ? `${color}15` : "none"} />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </svg>
    );
  }

  // Native fallback if running on mobile devices
  return (
    <View style={[styles.nativeBox, { width: size, height: size, borderColor: color }]}>
      <View style={[styles.nativeP, { borderColor: color }]} />
    </View>
  );
};

// ============================================================================
// 2. CAMERA / REPORT SVG ICON
// ============================================================================
export const CameraIcon: React.FC<IconProps> = ({ color, size = 22, focused }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={focused ? `${color}15` : "none"}
        stroke={color}
        strokeWidth={focused ? "2.3" : "1.8"}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" fill={focused ? color : "none"} />
      </svg>
    );
  }

  return (
    <View style={[styles.nativeBox, { width: size, height: size, borderColor: color }]} />
  );
};

// ============================================================================
// 3. MY TICKETS / CLIPBOARD SVG ICON
// ============================================================================
export const TicketIcon: React.FC<IconProps> = ({ color, size = 22, focused }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={focused ? `${color}15` : "none"}
        stroke={color}
        strokeWidth={focused ? "2.3" : "1.8"}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill={focused ? color : "none"} />
        <path d="M9 12h6M9 16h4" />
      </svg>
    );
  }

  return (
    <View style={[styles.nativeBox, { width: size, height: size, borderColor: color }]} />
  );
};

// ============================================================================
// 4. ADVISORIES / BELL SVG ICON
// ============================================================================
export const BellIcon: React.FC<IconProps> = ({ color, size = 22, focused }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={focused ? `${color}15` : "none"}
        stroke={color}
        strokeWidth={focused ? "2.3" : "1.8"}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }

  return (
    <View style={[styles.nativeBox, { width: size, height: size, borderColor: color }]} />
  );
};

const styles = StyleSheet.create({
  nativeBox: {
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeP: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
});
