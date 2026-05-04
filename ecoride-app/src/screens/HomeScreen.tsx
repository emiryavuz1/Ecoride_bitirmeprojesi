import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import { PointBadge } from '../components/PointBadge';
import { StationCard } from '../components/StationCard';

interface HomeScreenProps {
  navigation: any;
}

// Mock veri
const MOCK_STATIONS = [
  { id: '1', name: 'İstasyon A', distance: 120, bikeCount: 5 },
  { id: '2', name: 'İstasyon B', distance: 340, bikeCount: 2 },
  { id: '3', name: 'İstasyon C', distance: 500, bikeCount: 3 },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { points, userName } = useAppContext();

  const handleStationPress = (station: typeof MOCK_STATIONS[0]) => {
    navigation.navigate('BikeRental', { station });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Merhaba!</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <PointBadge points={points} size="small" />
        </View>

        {/* Map Section */}
        <View style={styles.mapSection}>
          <View style={styles.mapPlaceholder}>
            <View style={[styles.stationDot, { top: '30%', left: '20%' }]} />
            <View style={[styles.stationDot, { top: '50%', left: '50%' }]} />
            <View style={[styles.stationDot, { top: '70%', left: '70%' }]} />
            <Text style={styles.mapText}>📍 Yakındaki İstasyonlar</Text>
            <MaterialCommunityIcons name="map-outline" size={60} color="#ddd" />
          </View>
        </View>

        {/* Nearby Stations Section */}
        <View style={styles.stationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yakın İstasyonlar</Text>
            <MaterialCommunityIcons name="sync" size={20} color="#1a9e6e" />
          </View>

          <View style={styles.stationsList}>
            {MOCK_STATIONS.map((station) => (
              <StationCard
                key={station.id}
                name={station.name}
                distance={station.distance}
                bikeCount={station.bikeCount}
                onPress={() => handleStationPress(station)}
              />
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <LinearGradient
            colors={['rgba(26, 158, 110, 0.1)', 'rgba(26, 158, 110, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <MaterialCommunityIcons name="leaf" size={28} color="#1a9e6e" />
            <Text style={styles.statLabel}>Çevre Dostu Hareket</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(26, 158, 110, 0.1)', 'rgba(26, 158, 110, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <MaterialCommunityIcons name="bike" size={28} color="#1a9e6e" />
            <Text style={styles.statLabel}>Karbonu Azalt</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  mapSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  stationDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1a9e6e',
  },
  mapText: {
    fontSize: 12,
    color: '#1a9e6e',
    fontWeight: '600',
    marginBottom: 10,
    zIndex: 1,
  },
  stationsSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  stationsList: {
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a9e6e',
    marginTop: 8,
    textAlign: 'center',
  },
});
