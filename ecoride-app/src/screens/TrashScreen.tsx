import React, { useState, useRef } from 'react';
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
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAppContext } from '../context/AppContext';

interface TrashScreenProps {
  navigation: any;
}

interface TrashType {
  id: string;
  name: string;
  points: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  description: string;
}

const TRASH_TYPES: TrashType[] = [
  {
    id: 'plastic',
    name: 'Plastik',
    points: 10,
    icon: 'bottle-soda',
    color: '#2196F3',
    description: 'Şişe, ambalaj',
  },
  {
    id: 'glass',
    name: 'Cam',
    points: 15,
    icon: 'glass-fragile',
    color: '#9C27B0',
    description: 'Şişe, kavanoz',
  },
  {
    id: 'paper',
    name: 'Kağıt',
    points: 8,
    icon: 'newspaper-variant',
    color: '#FF9800',
    description: 'Gazete, karton',
  },
  {
    id: 'organic',
    name: 'Organik',
    points: 12,
    icon: 'leaf',
    color: '#4CAF50',
    description: 'Yiyecek atığı',
  },
  {
    id: 'metal',
    name: 'Metal',
    points: 20,
    icon: 'silverware-fork-knife',
    color: '#607D8B',
    description: 'Teneke, kutu',
  },
  {
    id: 'other',
    name: 'Diğer',
    points: 5,
    icon: 'trash-can-outline',
    color: '#795548',
    description: 'Diğer atıklar',
  },
];

export const TrashScreen: React.FC<TrashScreenProps> = () => {
  const { addPoints, points } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastEarned, setLastEarned] = useState<number | null>(null);
  const confettiRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const pointsOpacity = useRef(new Animated.Value(0)).current;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    Haptics.selectionAsync();

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const handleEarnPoints = () => {
    if (!selectedId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', 'Lütfen bir çöp türü seçin');
      return;
    }

    const selected = TRASH_TYPES.find((t) => t.id === selectedId);
    if (!selected) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setTimeout(() => {
      addPoints(selected.points, `Çöp atma (${selected.name})`);
      setLastEarned(selected.points);
      setIsLoading(false);
      setSelectedId(null);

      // Konfeti
      confettiRef.current?.start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // +puan animasyonu
      pointsAnim.setValue(0);
      pointsOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(pointsAnim, { toValue: -60, duration: 1000, useNativeDriver: true }),
        Animated.timing(pointsOpacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]).start(() => setLastEarned(null));
    }, 800);
  };

  const selectedTrash = TRASH_TYPES.find((t) => t.id === selectedId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Çöp At & Puan Kazan</Text>
          <Text style={styles.subtitle}>Çöp türünü seç, puan kazan</Text>
        </View>

        {/* Puan göstergesi */}
        <View style={styles.pointsRow}>
          <LinearGradient
            colors={['#1a9e6e', '#0d7a53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pointsBadge}
          >
            <MaterialCommunityIcons name="star-circle" size={20} color="#fff" />
            <Text style={styles.pointsBadgeText}>{points} puan</Text>
          </LinearGradient>
        </View>

        {/* QR Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrBox}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <MaterialCommunityIcons name="qrcode-scan" size={64} color="rgba(26,158,110,0.25)" />
            <Text style={styles.qrTitle}>QR Kodu Tara</Text>
            <Text style={styles.qrSub}>Çöp kutusundaki kodu okutun</Text>
          </View>
        </View>

        {/* Ayırıcı */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>veya manuel seç</Text>
          <View style={styles.orLine} />
        </View>

        {/* Çöp türleri grid */}
        <View style={styles.grid}>
          {TRASH_TYPES.map((trash) => {
            const isSelected = selectedId === trash.id;
            return (
              <TouchableOpacity
                key={trash.id}
                onPress={() => handleSelect(trash.id)}
                activeOpacity={0.75}
                style={styles.cardWrapper}
              >
                <Animated.View
                  style={[
                    styles.trashCard,
                    isSelected && { borderColor: trash.color, borderWidth: 2 },
                    isSelected && { transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={[trash.color + '22', trash.color + '08']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <View style={[styles.iconCircle, { backgroundColor: trash.color + '20' }]}>
                    <MaterialCommunityIcons name={trash.icon} size={32} color={trash.color} />
                  </View>
                  <Text style={styles.trashName}>{trash.name}</Text>
                  <Text style={styles.trashDesc}>{trash.description}</Text>
                  <View style={[styles.pointsPill, { backgroundColor: isSelected ? trash.color : '#f0f0f0' }]}>
                    <Text style={[styles.pointsPillText, { color: isSelected ? '#fff' : '#666' }]}>
                      +{trash.points} puan
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <MaterialCommunityIcons name="check-circle" size={18} color={trash.color} />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seçili bilgi */}
        {selectedTrash && (
          <View style={[styles.selectedInfo, { borderLeftColor: selectedTrash.color }]}>
            <MaterialCommunityIcons name={selectedTrash.icon} size={20} color={selectedTrash.color} />
            <Text style={styles.selectedInfoText}>
              <Text style={{ fontWeight: '700' }}>{selectedTrash.name}</Text> seçildi —{' '}
              {selectedTrash.points} puan kazanacaksın!
            </Text>
          </View>
        )}

        {/* Puan Kazan butonu */}
        <TouchableOpacity
          onPress={handleEarnPoints}
          disabled={isLoading}
          activeOpacity={0.85}
          style={styles.earnWrapper}
        >
          <LinearGradient
            colors={isLoading ? ['#7dcbad', '#5bb898'] : ['#1a9e6e', '#0d7a53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.earnButton}
          >
            {isLoading ? (
              <Text style={styles.earnButtonText}>Puan ekleniyor...</Text>
            ) : (
              <>
                <MaterialCommunityIcons name="recycle" size={22} color="#fff" />
                <Text style={styles.earnButtonText}>
                  {selectedTrash ? `+${selectedTrash.points} Puan Kazan` : 'Puan Kazan'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="leaf" size={16} color="#1a9e6e" />
          <Text style={styles.infoText}>
            Doğru atık ayrıştırması çevreye büyük katkı sağlar 🌍
          </Text>
        </View>

      </ScrollView>

      {/* +puan animasyonu */}
      {lastEarned && (
        <Animated.View
          style={[
            styles.floatingPoints,
            {
              transform: [{ translateY: pointsAnim }],
              opacity: pointsOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.floatingPointsText}>+{lastEarned} 🎉</Text>
        </Animated.View>
      )}

      {/* Konfeti */}
      <ConfettiCannon
        ref={confettiRef}
        count={120}
        origin={{ x: 200, y: 0 }}
        autoStart={false}
        fadeOut
        colors={['#1a9e6e', '#ffd700', '#ff6b6b', '#4fc3f7', '#a5d6a7']}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  pointsRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  pointsBadgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  qrSection: { paddingHorizontal: 20, paddingTop: 16 },
  qrBox: {
    height: 180,
    backgroundColor: '#000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#1a9e6e',
    borderWidth: 3,
  },
  tl: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0 },
  qrTitle: { fontSize: 15, fontWeight: '700', color: '#1a9e6e', marginTop: 10 },
  qrSub: { fontSize: 12, color: '#666', marginTop: 4 },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 18,
  },
  orLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  orText: { marginHorizontal: 12, fontSize: 12, color: '#aaa' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  cardWrapper: { width: '30.5%' },
  trashCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
    position: 'relative',
    minHeight: 130,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  trashName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  trashDesc: {
    fontSize: 10,
    color: '#aaa',
    marginBottom: 8,
    textAlign: 'center',
  },
  pointsPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pointsPillText: { fontSize: 11, fontWeight: '600' },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  selectedInfo: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedInfoText: { fontSize: 13, color: '#333', flex: 1 },
  earnWrapper: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },
  earnButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  earnButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  infoBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,158,110,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  infoText: { fontSize: 12, color: '#1a9e6e', fontWeight: '500', flex: 1 },
  floatingPoints: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    zIndex: 999,
  },
  floatingPointsText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a9e6e',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});