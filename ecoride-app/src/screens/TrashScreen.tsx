import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';

interface TrashScreenProps {
  navigation: any;
}

interface TrashType {
  id: string;
  name: string;
  points: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  selected: boolean;
}

export const TrashScreen: React.FC<TrashScreenProps> = ({ navigation }) => {
  const { addPoints } = useAppContext();
  const [selectedTrash, setSelectedTrash] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const [trashTypes, setTrashTypes] = useState<TrashType[]>([
    { id: 'plastic', name: 'Plastik', points: 10, icon: 'bottle-wine', selected: false },
    { id: 'glass', name: 'Cam', points: 15, icon: 'water-percent', selected: false },
    { id: 'paper', name: 'Kağıt', points: 8, icon: 'newspaper', selected: false },
    { id: 'other', name: 'Diğer', points: 5, icon: 'trash-can-outline', selected: false },
  ]);

  const handleTrashSelect = (trashId: string) => {
    setSelectedTrash(trashId);
    setTrashTypes((prev) =>
      prev.map((trash) => ({
        ...trash,
        selected: trash.id === trashId,
      }))
    );
  };

  const handleEarnPoints = () => {
    if (!selectedTrash) {
      Alert.alert('Uyarı', 'Lütfen bir çöp türü seçiniz');
      return;
    }

    const selected = trashTypes.find((t) => t.id === selectedTrash);
    if (selected) {
      setIsAnimating(true);
      addPoints(selected.points, `Çöp atma (${selected.name})`);

      Alert.alert('🎉 Başarılı!', `${selected.points} puan kazandınız!`, [
        {
          text: 'Tamam',
          onPress: () => {
            setIsAnimating(false);
            setSelectedTrash(null);
            setTrashTypes((prev) =>
              prev.map((t) => ({
                ...t,
                selected: false,
              }))
            );
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Çöp At & Puan Kazan</Text>
          <Text style={styles.subtitle}>Çöp türünü seçerek puan kazanın</Text>
        </View>

        {/* QR Camera Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrCamera}>
            {/* Top Left Corner */}
            <View style={[styles.corner, styles.topLeft]} />
            {/* Top Right Corner */}
            <View style={[styles.corner, styles.topRight]} />
            {/* Bottom Left Corner */}
            <View style={[styles.corner, styles.bottomLeft]} />
            {/* Bottom Right Corner */}
            <View style={[styles.corner, styles.bottomRight]} />

            <MaterialCommunityIcons name="qrcode-scan" size={80} color="rgba(26, 158, 110, 0.3)" />
            <Text style={styles.qrText}>QR Kodu Okutun</Text>
            <Text style={styles.qrSubtext}>(Veya aşağıdan seçiniz)</Text>
          </View>
        </View>

        {/* Trash Type Selection */}
        <View style={styles.trashSelectionSection}>
          <Text style={styles.sectionTitle}>Çöp Türünü Seç</Text>
          <View style={styles.trashGrid}>
            {trashTypes.map((trash) => (
              <TouchableOpacity
                key={trash.id}
                style={[styles.trashCard, trash.selected && styles.trashCardSelected]}
                onPress={() => handleTrashSelect(trash.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    trash.selected
                      ? ['#1a9e6e', '#0d7a53']
                      : ['#f5f5f5', '#efefef']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.trashCardGradient}
                >
                  <MaterialCommunityIcons
                    name={trash.icon}
                    size={40}
                    color={trash.selected ? '#fff' : '#1a9e6e'}
                  />
                  <Text style={[styles.trashName, trash.selected && styles.trashNameSelected]}>
                    {trash.name}
                  </Text>
                  <Text style={[styles.trashPoints, trash.selected && styles.trashPointsSelected]}>
                    +{trash.points}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Earn Button */}
        <LinearGradient
          colors={['#1a9e6e', '#0d7a53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earnButtonGradient}
        >
          <TouchableOpacity
            style={styles.earnButton}
            onPress={handleEarnPoints}
            disabled={isAnimating}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="star-circle" size={24} color="#fff" />
            <Text style={styles.earnButtonText}>
              {isAnimating ? 'Puan Ekleniyor...' : 'Puan Kazan'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Info */}
        <View style={styles.infoSection}>
          <MaterialCommunityIcons name="leaf" size={20} color="#1a9e6e" />
          <Text style={styles.infoText}>
            Çöpü doğru yerlere atarak çevreyi koruyun ve puan kazanın!
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  qrSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  qrCamera: {
    height: 220,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#1a9e6e',
    borderWidth: 3,
  },
  topLeft: {
    top: 10,
    left: 10,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 10,
    right: 10,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 10,
    left: 10,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  qrText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a9e6e',
    marginTop: 12,
  },
  qrSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  trashSelectionSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  trashGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trashCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  trashCardSelected: {},
  trashCardGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  trashName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 8,
  },
  trashNameSelected: {
    color: '#fff',
  },
  trashPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a9e6e',
    marginTop: 4,
  },
  trashPointsSelected: {
    color: '#fff',
  },
  earnButtonGradient: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  earnButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 20,
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
