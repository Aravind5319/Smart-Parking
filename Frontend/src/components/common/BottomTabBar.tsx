// ============================================================================
// PUDUCHERRY TRAFFIC POLICE - COMFORTABLE DOCKED BOTTOM TAB BAR
// Responsive Docked Navigation for Mobile & Desktop with Crisp Typography
// ============================================================================

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
      renderIcon: ({ color, focused }) => <ParkingIcon color={color} size={22} focused={focused} />,
    },
    {
      key: 'report',
      label: 'Report Violation',
      renderIcon: ({ color, focused }) => <CameraIcon color={color} size={22} focused={focused} />,
    },
    {
      key: 'tickets',
      label: 'My Complaints',
      renderIcon: ({ color, focused }) => <TicketIcon color={color} size={22} focused={focused} />,
    },
    {
      key: 'alerts',
      label: 'Advisories',
      renderIcon: ({ color, focused }) => <BellIcon color={color} size={22} focused={focused} />,
    },
  ];

  return (
    <View style={styles.dockedWrapper}>
      <View style={styles.tabBarInner}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const activeColor = '#0B2559';
          const inactiveColor = '#64748B';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.75}
            >
              {/* Active Top Accent Line */}
              {isActive && <View style={styles.activeTopPill} />}

              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                {tab.renderIcon({
                  color: isActive ? '#0B2559' : inactiveColor,
                  focused: isActive,
                })}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockedWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    zIndex: 999,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px -4px 16px rgba(15, 23, 42, 0.08)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  tabBarInner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 680,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabItemActive: {
    // Active subtle styling
  },
  activeTopPill: {
    position: 'absolute',
    top: -6,
    width: 28,
    height: 3,
    backgroundColor: '#0B2559',
    borderRadius: 2,
  },
  iconContainer: {
    width: 38,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#0B2559',
    fontWeight: '800',
  },
  tabLabelInactive: {
    color: '#64748B',
    fontWeight: '600',
  },
});
