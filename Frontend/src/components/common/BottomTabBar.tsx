import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import { TabType } from '../../types/navigation';
import { ParkingIcon, CameraIcon, TicketIcon, BellIcon } from './TabIcons';

interface BottomTabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs: {
    key: TabType;
    label: string;
    renderIcon: (props: { color: string; focused: boolean }) => React.ReactNode;
  }[] = [
    {
      key: 'parking',
      label: 'Find Parking',
      renderIcon: ({ color, focused }) => <ParkingIcon color={color} size={20} focused={focused} />,
    },
    {
      key: 'report',
      label: 'Report',
      renderIcon: ({ color, focused }) => <CameraIcon color={color} size={20} focused={focused} />,
    },
    {
      key: 'tickets',
      label: 'My Tickets',
      renderIcon: ({ color, focused }) => <TicketIcon color={color} size={20} focused={focused} />,
    },
    {
      key: 'alerts',
      label: 'Advisories',
      renderIcon: ({ color, focused }) => <BellIcon color={color} size={20} focused={focused} />,
    },
  ];

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={[styles.glassContainer, Platform.OS === 'web' ? styles.webGlass : null]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const iconColor = isActive ? Colors.textInverse : '#1E293B';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive ? styles.activeTabButton : styles.inactiveTabButton]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                {tab.renderIcon({ color: iconColor, focused: isActive })}
              </View>

              {/* Only show the name of the selected page */}
              {isActive && (
                <Text style={styles.activeTabLabel} numberOfLines={1}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 999,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.22)', // Fully transparent glass
    borderRadius: 36, // Curved shape
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.55)', // Translucent glass border
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.1)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
    }),
    elevation: 8,
    width: '100%',
    maxWidth: 440,
  },
  webGlass: {
    // @ts-ignore - web-specific CSS backdrop filter
    backdropFilter: 'blur(24px) saturate(180%)',
    // @ts-ignore
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    // @ts-ignore - web-specific CSS transition
    transition: 'all 0.25s ease',
  },
  activeTabButton: {
    backgroundColor: Colors.policeNavy,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 4px 8px rgba(30, 58, 138, 0.3)',
      },
      default: {
        shadowColor: Colors.policeNavy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
    elevation: 4,
  },
  inactiveTabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabLabel: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});
