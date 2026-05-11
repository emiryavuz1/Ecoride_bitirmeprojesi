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
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

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
  { id: 'plastic', name: 'Plastik', points: 10, icon: 'bottle-soda', color: '#2196F3', description: 'Şişe, ambalaj' },
  { id: 'glass', name: 'Cam', points: 15, icon: 'glass-fragile', color: '#9C27B0', description: 'Şişe, kavanoz' },
  { id: 'paper', name: 'Kağıt', points: 8, icon: 'newspaper-variant', color: '#FF9800', description: 'Gazete, karton' },
  { id: 'organic', name: 'Organik', points: 12, icon: 'leaf', color: '#4CAF50', description: 'Yiyecek atığı' },
  { id: 'metal', name: 'Metal', points: 20, icon: 'pipe', color: '#607D8B', description: 'Teneke, kutu' },
  { id: 'other', name: 'Diğer', points: 5, icon: 'trash-can-outline', color: '#795548', description: 'Diğer atıklar' },
];

// Sunum için QR kodlarının karşılıkları
const QR_TRASH_MAP: { [key: string]: string } = {
  'ecoride_plastic': 'plastic',
  'ecoride_glass': 'glass',
  'ecoride_paper': 'paper',
  'ecoride_organic': 'organic',
  'ecoride_metal': 'metal',
  'ecoride_other': 'other',
  'plastic': 'plastic',
  'glass': 'glass',
  'paper': 'paper',
  'organic': 'organic',
  'metal': 'metal',
  'other': 'other',
};

export const TrashScreen: React.FC<TrashScreenProps> = () => {
  const { addPoints, points } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastEarned, setLastEarned] = useState<number | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [qrPending, setQrPending] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const confettiRef = useRef<any>(null);
  const scannedRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const pointsOpacity = useRef(new Animated.Value(0)).current;

  const handleSelect = (id: string) => {
    if (qrPending) {
      Alert.alert('⚠️ QR Seçimi Aktif', 'QR ile seçim yapıldı, önce puan kazan!');
      return;
    }
    setSelectedId(id);
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const handleOpenCamera = async () => {
    if (qrPending) {
      Alert.alert(
        '⚠️ Bekleyen İşlem',
        'Önce mevcut çöpün için "Puan Kazan" butonuna basmalısın!',
        [{ text: 'Tamam' }]
      );
      return;
    }
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Kamera İzni',
          'QR kod okutmak için kamera iznine ihtiyacımız var.',
          [{ text: 'Tamam' }]
        );
        return;
      }
    }
    setScanned(false);
    scannedRef.current = false;
    setCameraVisible(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanned(true);
    setCameraVisible(false);

    setTimeout(() => {
      const trashId = QR_TRASH_MAP[data.toLowerCase().trim()];
      if (trashId) {
        const trash = TRASH_TYPES.find((t) => t.id === trashId);
        if (trash) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setSelectedId(trashId);
          setQrPending(true);
          Alert.alert(
            '✅ QR Kod Okundu!',
            `${trash.name} çöpü tespit edildi!\n+${trash.points} puan kazanmak için "Puan Kazan" butonuna bas.`,
            [{ text: 'Harika!' }]
          );
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          '❌ Geçersiz QR Kod',
          'Bu QR kod EcoRide sistemine ait değil.',
          [
            { text: 'Tekrar Dene', onPress: () => { scannedRef.current = false; setScanned(false); setCameraVisible(true); } },
            { text: 'İptal' }
          ]
        );
      }
    }, 300);
  };

  const handleEarnPoints = async () => {
    if (!selectedId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', 'Lütfen bir çöp türü seçin');
      return;
    }

    if (!qrPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        '⚠️ QR Kod Gerekli',
        'Puan kazanmak için önce çöp kutusundaki QR kodu taratman gerekiyor!',
        [{ text: 'Tamam' }]
      );
      return;
    }

    const selected = TRASH_TYPES.find((t) => t.id === selectedId);
    if (!selected) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Çöp logunu kaydet
        await supabase.from('trash_logs').insert({
          user_id: user.id,
          trash_type: selected.id,
          points_earned: selected.points,
        });

        // Puan işlemini kaydet
        await supabase.from('point_transactions').insert({
          user_id: user.id,
          type: 'earned',
          amount: selected.points,
          label: `Çöp atma (${selected.name})`,
        });

        // Profili güncelle
        const { data: profile } = await supabase
          .from('profiles')
          .select('points, trash_count')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              points: profile.points + selected.points,
              trash_count: profile.trash_count + 1,
            })
            .eq('id', user.id);
        }
      }

      // Local state güncelle
      addPoints(selected.points, `Çöp atma (${selected.name})`);
      setLastEarned(selected.points);
      setIsLoading(false);
      setSelectedId(null);
      setQrPending(false);

      confettiRef.current?.start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      pointsAnim.setValue(0);
      pointsOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(pointsAnim, { toValue: -60, duration: 1000, useNativeDriver: true }),
        Animated.timing(pointsOpacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]).start(() => setLastEarned(null));

    } catch (err) {
      setIsLoading(false);
      Alert.alert('Hata', 'Puan eklenirken bir sorun oluştu');
    }
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

        {/* QR Section — tıklanabilir */}
        <TouchableOpacity style={[styles.qrSection, qrPending && { opacity: 0.5 }]} onPress={handleOpenCamera} activeOpacity={0.85}>
          <View style={styles.qrBox}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <MaterialCommunityIcons name="qrcode-scan" size={64} color="rgba(26,158,110,0.4)" />
            <Text style={styles.qrTitle}>QR Kodu Tara</Text>
            <Text style={styles.qrSub}>Çöp kutosundaki kodu okutun</Text>
            <View style={styles.qrTapHint}>
              <MaterialCommunityIcons name="camera" size={14} color="#1a9e6e" />
              <Text style={styles.qrTapText}>Kamerayı açmak için dokun</Text>
            </View>
          </View>
        </TouchableOpacity>

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

      {/* Kamera Modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />

          {/* Kamera overlay */}
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setCameraVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>QR Kod Tara</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.scanArea}>
              <View style={[styles.scanCorner, styles.scanTL]} />
              <View style={[styles.scanCorner, styles.scanTR]} />
              <View style={[styles.scanCorner, styles.scanBL]} />
              <View style={[styles.scanCorner, styles.scanBR]} />
            </View>

            <Text style={styles.cameraHint}>Çöp kutosundaki QR kodu çerçeve içine alın</Text>
          </View>
        </View>
      </Modal>
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
  qrTapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(26,158,110,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  qrTapText: { fontSize: 12, color: '#1a9e6e', fontWeight: '600' },
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
  // Kamera stilleri
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  scanArea: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  scanCorner: { position: 'absolute', width: 40, height: 40, borderColor: '#1a9e6e', borderWidth: 4 },
  scanTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  scanTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  scanBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  scanBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  cameraHint: { textAlign: 'center', color: '#fff', fontSize: 14, paddingHorizontal: 40, opacity: 0.8 },
});