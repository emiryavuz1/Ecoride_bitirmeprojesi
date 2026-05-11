import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

interface ProfileScreenProps {
  navigation: any;
}

const LEVEL_THRESHOLDS = [
  { level: 1, label: 'Yeni Başlayan', min: 0, max: 100, color: '#78909C' },
  { level: 2, label: 'Çevre Sevdalısı', min: 100, max: 300, color: '#26A69A' },
  { level: 3, label: 'Çevre Dostu', min: 300, max: 600, color: '#1a9e6e' },
  { level: 4, label: 'Eko Kahraman', min: 600, max: 1000, color: '#2196F3' },
  { level: 5, label: 'Yeşil Efsane', min: 1000, max: Infinity, color: '#9C27B0' },
];

const getLevel = (points: number) => {
  return LEVEL_THRESHOLDS.find((l) => points >= l.min && points < l.max) || LEVEL_THRESHOLDS[0];
};

const getNextLevel = (points: number) => {
  const current = getLevel(points);
  const idx = LEVEL_THRESHOLDS.indexOf(current);
  return LEVEL_THRESHOLDS[idx + 1] || null;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { userName, points, trashCount, history, setIsLoggedIn, refreshProfile } = useAppContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Sayfa her açıldığında profil verisini yenile
  useFocusEffect(
    React.useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const level = getLevel(points);
  const nextLevel = getNextLevel(points);
  const progress = nextLevel
    ? (points - level.min) / (nextLevel.min - level.min)
    : 1;

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            
            const { error } = await supabase.auth.signOut();
            
            if (error) {
              Alert.alert('Hata', 'Çıkış yapırken bir hata oluştu: ' + error.message);
            } else {
              setIsLoggedIn(false);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
          } catch (err: any) {
            Alert.alert('Hata', 'Beklenmedik bir hata oluştu');
          }
        },
      },
    ]);
  };

  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, tension: 200, friction: 5, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getActivityIcon = (type: string) => (type === 'earned' ? 'arrow-up-circle' : 'arrow-down-circle');
  const getActivityColor = (type: string) => (type === 'earned' ? '#1a9e6e' : '#ef5350');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header Gradient */}
        <LinearGradient
          colors={['#1a9e6e', '#0a6644']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Avatar */}
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.9}>
            <Animated.View style={[styles.avatar, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.userName}>{userName}</Text>

          {/* Seviye badge */}
          <View style={[styles.levelBadge, { backgroundColor: level.color + '33' }]}>
            <MaterialCommunityIcons name="shield-star" size={14} color="#fff" />
            <Text style={styles.levelText}> Seviye {level.level} · {level.label}</Text>
          </View>

          {/* Progress bar */}
          {nextLevel && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {points} / {nextLevel.min} puan → {nextLevel.label}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star-circle" size={28} color="#1a9e6e" />
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Toplam Puan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trash-can" size={28} color="#1a9e6e" />
            <Text style={styles.statValue}>{trashCount}</Text>
            <Text style={styles.statLabel}>Atılan Çöp</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="bike" size={28} color="#1a9e6e" />
            <Text style={styles.statValue}>{history.filter((h) => h.type === 'spent').length}</Text>
            <Text style={styles.statLabel}>Kiralama</Text>
          </View>
        </View>

        {/* Aktiviteler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
            <MaterialCommunityIcons name="history" size={18} color="#1a9e6e" />
          </View>

          {history.length > 0 ? (
            <View style={styles.activityList}>
              {history.slice(0, 10).map((item, index) => (
                <View key={index} style={[styles.activityItem, index === history.slice(0, 10).length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.activityIconBox, { backgroundColor: getActivityColor(item.type) + '18' }]}>
                    <MaterialCommunityIcons
                      name={getActivityIcon(item.type)}
                      size={20}
                      color={getActivityColor(item.type)}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityLabel}>{item.label}</Text>
                    <Text style={styles.activityDate}>{item.date}</Text>
                  </View>
                  <Text style={[styles.activityAmount, { color: getActivityColor(item.type) }]}>
                    {item.type === 'earned' ? '+' : '-'}{item.amount}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="inbox-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>Henüz aktivite yok</Text>
              <Text style={styles.emptySubText}>Çöp at, puan kazan!</Text>
            </View>
          )}
        </View>

        {/* Ayarlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.menuList}>
            {[
              { icon: 'account-edit-outline', label: 'Profili Düzenle' },
              { icon: 'bell-outline', label: 'Bildirimler' },
              { icon: 'shield-outline', label: 'Gizlilik' },
              { icon: 'help-circle-outline', label: 'Yardım' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color="#555" />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Çıkış */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} style={styles.logoutWrapper}>
          <View style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={20} color="#ef5350" />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.version}>EcoRide v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { paddingBottom: 40 },
  headerGradient: {
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 10 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  levelText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  progressSection: { width: '100%', alignItems: 'center' },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2, fontWeight: '500' },
  section: { marginHorizontal: 16, marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  activityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: { flex: 1 },
  activityLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  activityDate: { fontSize: 12, color: '#aaa', marginTop: 2 },
  activityAmount: { fontSize: 15, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 14 },
  emptyText: { fontSize: 15, color: '#bbb', marginTop: 10, fontWeight: '600' },
  emptySubText: { fontSize: 12, color: '#ccc', marginTop: 4 },
  menuList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
    gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#333' },
  logoutWrapper: { marginHorizontal: 16, marginTop: 24 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ef5350',
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#ef5350' },
  version: { textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 20 },
});