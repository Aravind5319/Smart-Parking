import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Colors } from '../../theme/colors';
import { PoliceShieldIcon, TrophyIcon } from './Icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  karmaPoints?: number;
  showKarma?: boolean;
  onPressKarma?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'Puducherry Traffic Police',
  karmaPoints = 150,
  showKarma = false,
  onPressKarma,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.badgeIcon}>
          <PoliceShieldIcon color="#60A5FA" size={20} />
        </View>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {showKarma && typeof karmaPoints === 'number' && (
        <TouchableOpacity
          style={styles.karmaChip}
          onPress={onPressKarma}
          activeOpacity={0.7}
        >
          <View style={{ marginRight: 6 }}>
            <TrophyIcon color="#F59E0B" size={16} />
          </View>
          <View>
            <Text style={styles.karmaLabel}>Karma</Text>
            <Text style={styles.karmaValue}>{karmaPoints} pts</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.policeNavyDark,
    paddingTop: Platform.select({
      web: 14,
      ios: 44,
      android: StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 16,
      default: 14,
    }),
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    fontSize: 20,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  karmaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  karmaEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  karmaLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  karmaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FBBF24',
  },
});
