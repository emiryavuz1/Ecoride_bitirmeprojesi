import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';

interface BikeRentalScreenProps {
  navigation: any;
  route: any;
}

interface Bike {
  id: string;
  name: string;
  duration: number;
  points: number;
  available: boolean;
}

export const BikeRentalScreen: React.FC<BikeRentalScreenProps> = ({ navigation, route }) => {
  const { station } = route.params || { station: { name: 'İstasyon A' } };
  const { points, spendPoints } = useAppContext();

  const [bikes] = useState<Bike[]>([
    { id: '01', name: 'Bisiklet #01', duration: 30, points: 60, available: true },
    { id: '02', name: 'Bisiklet #02', duration: 60, points: 100, available: true },
    { id: '03', name: 'Bisiklet #03', duration: 45, points: 80, available: false },
  ]);

  const handleRentBike = (bike: Bike) => {
    if (!bike.available) {
      Alert.alert('Uyarı', 'Bu bisiklet şu anda kullanımda');
      return;
    }

    if (points < bike.points) {
      Alert.alert('Yetersiz Puan', `Bu bisikleti kiralamak için ${bike.points} puan gereklidir. Mevcut puanınız: ${points}`);
      return;
    }

    const success = spendPoints(bike.points, `${station.name} - ${bike.name} kiralama (${bike.duration} dk)`);

    if (success) {
      Alert.alert(
        '✅ Başarı!',
        `${bike.name} başarıyla kiralandı!\n${bike.duration} dakika kullanabilirsiniz.`
      );
    }
  };

  const BikeCard = ({ bike }: { bike: Bike }) => (
    <View style={styles.bikeCard}>
      <View style={styles.bikeInfo}>
        <MaterialCommunityIcons
          name="bike"
          size={32}
          color={bike.available ? '#1a9e6e' : '#ccc'}
        />
        <View style={styles.bikeDetails}>
          <Text style={styles.bikeName}>{bike.name}</Text>
          <View style={styles.bikeSpecs}>
            <Text style={styles.bikeSpec}>
              <MaterialCommunityIcons name="clock" size={12} color="#666" /> {bike.duration} dk
            </Text>
            <Text style={styles.bikeSpec}>
              <MaterialCommunityIcons name="star" size={12} color="#1a9e6e" /> {bike.points} puan
            </Text>
          </View>
        </View>
      </View>

      {bike.available ? (
        <TouchableOpacity
          style={styles.rentButtonSmall}
          onPress={() => handleRentBike(bike)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#1a9e6e', '#0d7a53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rentButtonGradient}
          >
            <Text style={styles.rentButtonText}>Kirala</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.unavailableButton}>
          <Text style={styles.unavailableText}>Dolu</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#1a9e6e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{station.name}</Text>
        <View style={{ width: 28 }}>
          {/* Spacer for alignment */}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Station Info */}
        <View style={styles.stationInfoSection}>
          <LinearGradient
            colors={['#1a9e6e', '#0d7a53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.stationInfoCard}
          >
            <View style={styles.stationInfoRow}>
              <View>
                <Text style={styles.infoLabel}>Mevcut Puanınız</Text>
                <Text style={styles.infoValue}>{points}</Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.infoLabel}>Konumu</Text>
                <Text style={styles.infoValue}>{station.distance}m</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Available Bikes Section */}
        <View style={styles.bikesSection}>
          <Text style={styles.sectionTitle}>Kiralanabilir Bisikletler</Text>
          <View style={styles.bikesList}>
            {bikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#1a9e6e" />
          <Text style={styles.infoText}>
            Bisikleti 24 saat içinde iade etmeyi unutmayın
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stationInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  stationInfoCard: {
    borderRadius: 12,
    padding: 16,
  },
  stationInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bikesSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  bikesList: {
    marginBottom: 12,
  },
  bikeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bikeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bikeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  bikeSpecs: {
    flexDirection: 'row',
    gap: 12,
  },
  bikeSpec: {
    fontSize: 12,
    color: '#666',
  },
  rentButtonSmall: {
    marginLeft: 12,
    overflow: 'hidden',
    borderRadius: 8,
  },
  rentButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rentButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  unavailableButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  unavailableText: {
    color: '#999',
    fontWeight: '600',
    fontSize: 12,
  },
  infoBanner: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(26, 158, 110, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#1a9e6e',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});
