import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Alert } from 'react-native';
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
  const [activeTab, setActiveTab] = useState<TabType>('report');
  const [tickets, setTickets] = useState<ViolationReport[]>(MOCK_TICKETS);
  const [karmaPoints, setKarmaPoints] = useState<number>(150);

  const [isCameraActive, setIsCameraActive] = useState(false);

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
});
