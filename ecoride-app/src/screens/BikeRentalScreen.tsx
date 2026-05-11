import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

interface BikeRentalScreenProps {
  navigation: any;
  route: any;
}

interface Bike {
  id: string;
  bike_number: string;
  station_id: string;
  status: 'available' | 'in_use' | 'maintenance';
  rental_price_points: number;
  rental_duration_minutes: number;
}

export const BikeRentalScreen: React.FC<BikeRentalScreenProps> = ({ navigation, route }) => {
  const { station } = route.params || { station: { id: '1', name: 'İstasyon A', distance: 0 } };
  const { points, spendPoints, refreshProfile } = useAppContext();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [renting, setRenting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('bikes')
        .select('id, bike_number, station_id, status, rental_price_points, rental_duration_minutes')
        .eq('station_id', station.id);

      if (error) {
        setError('Bisikletler yüklenemedi');
        console.error('Bikes fetch error:', error);
      } else if (data) {
        setBikes(data);
      }
    } catch (err) {
      setError('Beklenmedik bir hata oluştu');
      console.error('fetchBikes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRentBike = async (bike: Bike) => {
    if (bike.status !== 'available') {
      Alert.alert('Uyarı', 'Bu bisiklet şu anda kullanımda');
      return;
    }

    if (points < bike.rental_price_points) {
      Alert.alert(
        'Yetersiz Puan',
        `Bu bisikleti kiralamak için ${bike.rental_price_points} puan gereklidir. Mevcut puanınız: ${points}`
      );
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Puan işlemini kaydet
        await supabase.from('point_transactions').insert({
          user_id: user.id,
          type: 'spent',
          amount: bike.rental_price_points,
          label: `${station.name} - Bisiklet #${bike.bike_number} kiralama (${bike.rental_duration_minutes} dk)`,
        });

        // Profil puanını güncelle
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ points: profile.points - bike.rental_price_points })
            .eq('id', user.id);
        }
      }

      // Local state güncelle
      const success = spendPoints(
        bike.rental_price_points,
        `${station.name} - Bisiklet #${bike.bike_number} kiralama (${bike.rental_duration_minutes} dk)`
      );

      if (success) {
        Alert.alert(
          '✅ Başarı!',
          `Bisiklet #${bike.bike_number} başarıyla kiralandı!\n${bike.rental_duration_minutes} dakika kullanabilirsiniz.`
        );
      }

    } catch (err) {
      Alert.alert('Hata', 'Kiralama sırasında bir sorun oluştu');
    }
  };

  const BikeCard = ({ bike }: { bike: Bike }) => (
    <View style={styles.bikeCard}>
      <View style={styles.bikeInfo}>
        <MaterialCommunityIcons
          name="bike"
          size={32}
          color={bike.status === 'available' ? '#1a9e6e' : '#ccc'}
        />
        <View style={styles.bikeDetails}>
          <Text style={styles.bikeName}>Bisiklet #{bike.bike_number}</Text>
          <View style={styles.bikeSpecs}>
            <Text style={styles.bikeSpec}>
              <MaterialCommunityIcons name="clock" size={12} color="#666" /> {bike.rental_duration_minutes} dk
            </Text>
            <Text style={styles.bikeSpec}>
              <MaterialCommunityIcons name="star" size={12} color="#1a9e6e" /> {bike.rental_price_points} puan
            </Text>
          </View>
        </View>
      </View>

      {bike.status === 'available' ? (
        <TouchableOpacity
          style={styles.rentButtonSmall}
          onPress={() => handleRentBike(bike)}
          disabled={renting === bike.id}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={renting === bike.id ? ['#7dcbad', '#5bb898'] : ['#1a9e6e', '#0d7a53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rentButtonGradient}
          >
            {renting === bike.id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.rentButtonText}>Kirala</Text>
            )}
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#1a9e6e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{station.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1a9e6e" />
            <Text style={styles.loadingText}>Bisikletler yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#ef5350" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchBikes} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Yeniden Dene</Text>
            </TouchableOpacity>
          </View>
        ) : bikes.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="bike" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Bu istasyonda bisiklet yok</Text>
          </View>
        ) : (
          <>
            <View style={styles.bikesSection}>
              <Text style={styles.sectionTitle}>Kiralanabilir Bisikletler</Text>
              <View style={styles.bikesList}>
                {bikes.map((bike) => (
                  <BikeCard key={bike.id} bike={bike} />
                ))}
              </View>
            </View>

            <View style={styles.infoBanner}>
              <MaterialCommunityIcons name="information" size={20} color="#1a9e6e" />
              <Text style={styles.infoText}>
                Bisikleti 24 saat içinde iade etmeyi unutmayın
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', flex: 1, textAlign: 'center' },
  scrollContent: { paddingBottom: 20 },
  stationInfoSection: { paddingHorizontal: 16, paddingVertical: 16 },
  stationInfoCard: { borderRadius: 12, padding: 16 },
  stationInfoRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 4 },
  infoValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  divider: { width: 1, height: 50, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, minHeight: 300 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  errorText: { marginTop: 12, color: '#ef5350', fontSize: 14, textAlign: 'center' },
  emptyText: { marginTop: 12, color: '#999', fontSize: 14 },
  retryButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#1a9e6e', borderRadius: 20 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  bikesSection: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  bikesList: { gap: 10 },
  bikeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0' },
  bikeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  bikeDetails: { flex: 1 },
  bikeName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  bikeSpecs: { flexDirection: 'row', gap: 12 },
  bikeSpec: { fontSize: 12, color: '#666' },
  rentButtonSmall: { overflow: 'hidden', borderRadius: 8 },
  rentButtonGradient: { paddingHorizontal: 14, paddingVertical: 8, minWidth: 80, justifyContent: 'center', alignItems: 'center' },
  rentButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  unavailableButton: { backgroundColor: '#f5f5f5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  unavailableText: { color: '#999', fontWeight: '600', fontSize: 12 },
  infoBanner: { marginHorizontal: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5f0', borderLeftWidth: 3, borderLeftColor: '#1a9e6e', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, gap: 10 },
  infoText: { color: '#0d7a53', fontSize: 13, fontWeight: '500', flex: 1 },
});
