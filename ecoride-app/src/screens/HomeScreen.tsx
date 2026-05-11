import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { PointBadge } from '../components/PointBadge';
import { StationCard } from '../components/StationCard';

interface HomeScreenProps {
  navigation: any;
}

interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  bike_count: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { points, userName } = useAppContext();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestLocation();
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name, latitude, longitude, bike_count')
        .order('name', { ascending: true });

      if (error) {
        setError('İstasyonlar yüklenemedi');
        console.error('Stations fetch error:', error);
      } else if (data) {
        setStations(data);
      }
    } catch (err) {
      setError('Beklenmedik bir hata oluştu');
      console.error('fetchStations error:', err);
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni',
          'Yakındaki istasyonları görmek için konum iznine ihtiyacımız var.',
          [{ text: 'Tamam' }]
        );
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(loc);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Konum alınamadı');
      console.error('Location error:', error);
      Alert.alert('Hata', 'Konum alınamadı.');
    }
  };

  const handleStationPress = (station: Station) => {
    setSelectedStation(station.id);

    mapRef.current?.animateToRegion({
      latitude: station.latitude,
      longitude: station.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 600);

    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleRentPress = (station: Station) => {
    const distance = location ? getDistance(station) : 0;
    navigation.navigate('BikeRental', { station: { ...station, distance } });
  };

  const getDistance = (station: Station) => {
    if (!location) return 0;
    const R = 6371e3;
    const lat1 = (location.coords.latitude * Math.PI) / 180;
    const lat2 = (station.latitude * Math.PI) / 180;
    const dLat = ((station.latitude - location.coords.latitude) * Math.PI) / 180;
    const dLng = ((station.longitude - location.coords.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const focusMyLocation = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 600);
    } else {
      requestLocation();
    }
  };

  const selectedStationData = stations.find((s) => s.id === selectedStation);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <PointBadge points={points} size="small" />
      </View>

      {/* Harita */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a9e6e" />
            <Text style={styles.loadingText}>Konum alınıyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#ef5350" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => { setLoading(true); requestLocation(); }} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Yeniden Dene</Text>
            </TouchableOpacity>
          </View>
        ) : location ? (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              showsUserLocation
              showsMyLocationButton={false}
              showsCompass={false}
            >
              {/* Kullanıcı çevresi */}
              <Circle
                center={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                radius={400}
                fillColor="rgba(26, 158, 110, 0.08)"
                strokeColor="rgba(26, 158, 110, 0.3)"
                strokeWidth={1}
              />

              {/* İstasyon pinleri */}
              {stations.map((station) => (
                <Marker
                  key={station.id}
                  coordinate={{
                    latitude: station.latitude,
                    longitude: station.longitude,
                  }}
                  onPress={() => handleStationPress(station)}
                >
                  <View style={[
                    styles.markerContainer,
                    selectedStation === station.id && styles.markerSelected,
                  ]}>
                    <MaterialCommunityIcons
                      name="bike"
                      size={18}
                      color={selectedStation === station.id ? '#fff' : '#1a9e6e'}
                    />
                    <Text style={[
                      styles.markerText,
                      selectedStation === station.id && styles.markerTextSelected,
                    ]}>
                      {station.bike_count}
                    </Text>
                  </View>
                </Marker>
              ))}
            </MapView>

            {/* Konumuma dön butonu */}
            <TouchableOpacity style={styles.locationButton} onPress={focusMyLocation}>
              <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#1a9e6e" />
            </TouchableOpacity>

            {/* Seçili istasyon kartı */}
            {selectedStation && selectedStationData && (
              <Animated.View
                style={[
                  styles.selectedCard,
                  {
                    transform: [{
                      translateY: cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    }],
                    opacity: cardAnim,
                  },
                ]}
              >
                <View style={styles.selectedCardContent}>
                  <View>
                    <Text style={styles.selectedCardTitle}>{selectedStationData.name}</Text>
                    <Text style={styles.selectedCardSub}>
                      {selectedStationData.bike_count} bisiklet müsait · {getDistance(selectedStationData)}m uzakta
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRentPress(selectedStationData)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#1a9e6e', '#0d7a53']}
                      style={styles.rentButton}
                    >
                      <Text style={styles.rentButtonText}>Kirala</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </>
        ) : (
          <View style={styles.noLocationContainer}>
            <MaterialCommunityIcons name="map-marker-off" size={60} color="#ccc" />
            <Text style={styles.noLocationText}>Konum alınamadı</Text>
            <TouchableOpacity style={styles.retryButton} onPress={requestLocation}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* İstasyon listesi */}
      {!loading && location && (
        <View style={styles.stationsList}>
          <Text style={styles.stationsTitle}>Yakın İstasyonlar</Text>
          {stations.map((station) => (
            <StationCard
              key={station.id}
              name={station.name}
              distance={getDistance(station)}
              bikeCount={station.bike_count}
              onPress={() => handleStationPress(station)}
            />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: { fontSize: 13, color: '#888', marginBottom: 2 },
  userName: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  mapContainer: {
    height: 300,
    backgroundColor: '#e8f0ee',
    overflow: 'hidden',
  },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { fontSize: 16, color: '#ef5350', marginTop: 12 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationText: { fontSize: 16, color: '#aaa', marginTop: 12 },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#1a9e6e',
    borderRadius: 20,
  },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  locationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a9e6e',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  markerSelected: {
    backgroundColor: '#1a9e6e',
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a9e6e',
  },
  markerTextSelected: { color: '#fff' },
  selectedCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectedCardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  selectedCardSub: { fontSize: 13, color: '#888', marginTop: 4 },
  rentButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rentButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stationsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stationsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
});