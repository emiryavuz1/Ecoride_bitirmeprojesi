import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StationCardProps {
  name: string;
  distance: number;
  bikeCount: number;
  onPress: () => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  name,
  distance,
  bikeCount,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="location-on" size={24} color="#1a9e6e" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.distance}>{distance}m</Text>
          <View style={styles.bikeCount}>
            <MaterialIcons name="two-wheeler" size={14} color="#1a9e6e" />
            <Text style={styles.bikeCountText}> {bikeCount}</Text>
          </View>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  bikeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0faf7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bikeCountText: {
    fontSize: 12,
    color: '#1a9e6e',
    fontWeight: '600',
  },
});
