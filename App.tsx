import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Header } from './src/components/common/Header';
import { BottomTabBar } from './src/components/common/BottomTabBar';
import { ReportViolationScreen } from './src/screens/reporting/ReportViolationScreen';
import { TrackComplaintsScreen } from './src/screens/reporting/TrackComplaintsScreen';
import { FindParkingScreen } from './src/screens/parking/FindParkingScreen';
import { AdvisoriesScreen } from './src/screens/alerts/AdvisoriesScreen';
import { TabType, ViolationReport } from './src/types/navigation';
import { MOCK_TICKETS } from './src/data/mockData';
import { Colors } from './src/theme/colors';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('parking');
  const [tickets, setTickets] = useState<ViolationReport[]>(MOCK_TICKETS);
  const [karmaPoints, setKarmaPoints] = useState<number>(150);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Set Web Title Tag & Favicon for Puducherry Police
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'ParkPuduvai • Puducherry Police Smart Parking';
      try {
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.getElementsByTagName('head')[0]?.appendChild(link);
        }
        link.type = 'image/png';
        // Use the logo from assets
        link.href = './assets/police_logo.png';
      } catch (e) {
        // Ignore in non-DOM environments
      }
    }

    // Auto dismiss splash after 1.8 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleReportSubmitted = (newReport: ViolationReport) => {
    setTickets([newReport, ...tickets]);
    setKarmaPoints((prev) => prev + newReport.karmaPoints);
    setIsCameraActive(false);
    setActiveTab('tickets');
    Alert.alert(
      'Report Submitted Successfully',
      `Reference Ticket: ${newReport.referenceNo}\n\n+${newReport.karmaPoints} Civic Karma points awarded to your profile.\n\nAssigned to Puducherry Traffic Police Control Room.`
    );
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'parking':
        return 'Find Smart Parking';
      case 'report':
        return 'Report Violation';
      case 'tickets':
        return 'Track Complaints';
      case 'alerts':
        return 'Traffic Advisories';
    }
  };

  // Official Puducherry Police Splash Screen
  if (showSplash) {
    return (
      <TouchableOpacity
        style={styles.splashContainer}
        activeOpacity={1}
        onPress={() => setShowSplash(false)}
      >
        <StatusBar barStyle="light-content" backgroundColor="#071630" />

        {/* Top Dual Livery Stripe */}
        <View style={styles.splashLivery}>
          <View style={styles.splashStripeBlue} />
          <View style={styles.splashStripeGold} />
          <View style={styles.splashStripeRed} />
        </View>

        <View style={styles.splashContent}>
          <View style={styles.splashEmblemCircle}>
            <Image
              source={require('./assets/police_logo.png')}
              style={styles.splashLogo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.splashTamilTitle}>புதுச்சேரி காவல்</Text>
          <Text style={styles.splashDeptTitle}>PUDUCHERRY TRAFFIC POLICE</Text>

          <View style={styles.splashDivider} />

          <Text style={styles.splashAppName}>ParkPuduvai</Text>
          <Text style={styles.splashAppTagline}>
            Smart Kerb & Peripheral Parking Enforcement
          </Text>

          <View style={styles.splashBadge}>
            <Text style={styles.splashBadgeText}>
              🛡️ Protecting with Pride • Command Center
            </Text>
          </View>

          <View style={styles.splashLoadingBox}>
            <ActivityIndicator size="small" color="#F59E0B" />
            <Text style={styles.splashLoadingText}>Initializing Smart Kerb Radar...</Text>
          </View>
        </View>

        <Text style={styles.splashFooter}>
          Government of Puducherry • Smart City Traffic Division
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.policeNavyDark} />

      {/* Global Civic Tech Header */}
      <Header
        title={getHeaderTitle()}
        subtitle="Puducherry Traffic Police • ParkPuduvai"
        showKarma={activeTab === 'tickets'}
        karmaPoints={karmaPoints}
        onPressKarma={() =>
          Alert.alert(
            'Civic Karma Points',
            `You have ${karmaPoints} points (Level 2: Traffic Sentinel).\n\nKeep reporting authentic parking obstructions and choosing peripheral parking to earn civic benefits!`
          )
        }
      />

      {/* Screen Router */}
      <View style={styles.screenContainer}>
        {activeTab === 'parking' && <FindParkingScreen />}
        {activeTab === 'report' && (
          <ReportViolationScreen
            onSubmitSuccess={handleReportSubmitted}
            onCameraActiveChange={setIsCameraActive}
          />
        )}
        {activeTab === 'tickets' && (
          <TrackComplaintsScreen
            tickets={tickets}
            karmaPoints={karmaPoints}
            onNavigateToReport={() => setActiveTab('report')}
          />
        )}
        {activeTab === 'alerts' && <AdvisoriesScreen />}
      </View>

      {/* Tactile Floating Bottom Navigation (Hidden while camera viewfinder is open) */}
      {!isCameraActive && (
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setIsCameraActive(false);
            setActiveTab(tab);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.policeNavyDark,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: '#071630',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
  },
  splashLivery: {
    flexDirection: 'row',
    height: 5,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  splashStripeBlue: {
    flex: 5,
    backgroundColor: '#0B2559',
  },
  splashStripeGold: {
    width: 8,
    backgroundColor: '#F59E0B',
  },
  splashStripeRed: {
    flex: 5,
    backgroundColor: '#D31826',
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  splashEmblemCircle: {
    width: 150,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  splashLogo: {
    width: 150,
    height: 160,
  },
  splashTamilTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  splashDeptTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 2,
    marginBottom: 16,
  },
  splashDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#D31826',
    borderRadius: 2,
    marginBottom: 16,
  },
  splashAppName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  splashAppTagline: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  splashBadge: {
    backgroundColor: 'rgba(11, 37, 89, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginTop: 22,
  },
  splashBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FEF3C7',
    letterSpacing: 0.3,
  },
  splashLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  splashLoadingText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 8,
    fontWeight: '600',
  },
  splashFooter: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
