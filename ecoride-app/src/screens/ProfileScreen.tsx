import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { userName, points, trashCount, history, setIsLoggedIn } = useAppContext();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const getActivityIcon = (type: string) => {
    return type === 'earned' ? 'star-circle' : 'dots-horizontal-circle';
  };

  const getActivityColor = (type: string) => {
    return type === 'earned' ? '#1a9e6e' : '#ff6b6b';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#1a9e6e', '#0d7a53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="star" size={14} color="#ffd700" />
            <Text style={styles.levelText}> Seviye 3 · Çevre Dostu</Text>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(26, 158, 110, 0.1)', 'rgba(26, 158, 110, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCardGradient}
            >
              <MaterialCommunityIcons name="star-circle" size={32} color="#1a9e6e" />
              <Text style={styles.statValue}>{points}</Text>
              <Text style={styles.statLabel}>Toplam Puan</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(26, 158, 110, 0.1)', 'rgba(26, 158, 110, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCardGradient}
            >
              <MaterialCommunityIcons name="trash-can" size={32} color="#1a9e6e" />
              <Text style={styles.statValue}>{trashCount}</Text>
              <Text style={styles.statLabel}>Atılan Çöp</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
            <MaterialCommunityIcons name="history" size={20} color="#1a9e6e" />
          </View>

          {history.length > 0 ? (
            <View style={styles.activityList}>
              {history.slice(0, 8).map((item, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: getActivityColor(item.type) }]}>
                    <MaterialCommunityIcons
                      name={getActivityIcon(item.type)}
                      size={16}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityLabel}>{item.label}</Text>
                    <Text style={styles.activityDate}>{item.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.activityAmount,
                      item.type === 'earned'
                        ? styles.activityAmountEarned
                        : styles.activityAmountSpent,
                    ]}
                  >
                    {item.type === 'earned' ? '+' : '-'}{item.amount}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="inbox-multiple" size={40} color="#ccc" />
              <Text style={styles.emptyText}>Henüz aktivite yok</Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <LinearGradient
          colors={['#ff6b6b', '#ff5252']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoutButtonGradient}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </LinearGradient>
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
  profileHeader: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -30,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statCardGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a9e6e',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  activitySection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityAmountEarned: {
    color: '#1a9e6e',
  },
  activityAmountSpent: {
    color: '#ff6b6b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  logoutButtonGradient: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButton: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});
