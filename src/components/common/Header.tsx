import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { Colors } from '../../theme/colors';
import { TrophyIcon } from './Icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  karmaPoints?: number;
  showKarma?: boolean;
  onPressKarma?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'Puducherry Traffic Police • ParkPuduvai',
  karmaPoints = 150,
  showKarma = false,
  onPressKarma,
}) => {
  return (
    <View style={styles.headerWrapper}>
      {/* Official Puducherry Police Dual Livery Stripe (Blue + Red) */}
      <View style={styles.liveryStripe}>
        <View style={styles.stripeBlue} />
        <View style={styles.stripeGold} />
        <View style={styles.stripeRed} />
      </View>

      <View style={styles.container}>
        <View style={styles.leftRow}>
          {/* Puducherry Police Crest Emblem */}
          <View style={styles.emblemContainer}>
            <Image
              source={require('../../../assets/police_logo.png')}
              style={styles.emblemImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.titleColumn}>
            <View style={styles.taglineRow}>
              <Text style={styles.deptTagline}>புதுச்சேரி காவல் • PUDUCHERRY POLICE</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          </View>
        </View>

        {showKarma && typeof karmaPoints === 'number' && (
          <TouchableOpacity
            style={styles.karmaChip}
            onPress={onPressKarma}
            activeOpacity={0.7}
          >
            <View style={{ marginRight: 6 }}>
              <TrophyIcon color={Colors.policeGold} size={15} />
            </View>
            <View>
              <Text style={styles.karmaLabel}>SENTINEL</Text>
              <Text style={styles.karmaValue}>{karmaPoints} pts</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: Colors.policeNavyDark,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  liveryStripe: {
    flexDirection: 'row',
    height: 4,
    width: '100%',
  },
  stripeBlue: {
    flex: 5,
    backgroundColor: Colors.policeNavy,
  },
  stripeGold: {
    width: 6,
    backgroundColor: Colors.policeGold,
  },
  stripeRed: {
    flex: 5,
    backgroundColor: Colors.policeRed,
  },
  container: {
    paddingTop: Platform.select({
      web: 12,
      ios: 44,
      android: StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 14,
      default: 12,
    }),
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emblemContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F1E36',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.policeGold,
    shadowColor: Colors.policeNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  emblemImage: {
    width: 40,
    height: 40,
  },
  titleColumn: {
    flex: 1,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  deptTagline: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 0.8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 3,
  },
  liveText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
    fontWeight: '500',
  },
  karmaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1E36',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  karmaLabel: {
    fontSize: 8.5,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  karmaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
  },
});
