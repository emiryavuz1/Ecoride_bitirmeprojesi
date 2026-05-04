import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PointBadgeProps {
  points: number;
  size?: 'small' | 'large';
}

export const PointBadge: React.FC<PointBadgeProps> = ({ points, size = 'small' }) => {
  const isLarge = size === 'large';

  return (
    <LinearGradient
      colors={['#1a9e6e', '#0d7a53']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, isLarge ? styles.badgeLarge : styles.badgeSmall]}
    >
      <Text style={[styles.badgeText, isLarge ? styles.badgeTextLarge : styles.badgeTextSmall]}>
        {points}
      </Text>
      <Text style={[styles.badgeLabel, isLarge ? styles.badgeLabelLarge : styles.badgeLabelSmall]}>
        {isLarge ? 'PUANınız' : 'Puan'}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSmall: {
    width: 70,
    height: 70,
  },
  badgeLarge: {
    width: 120,
    height: 120,
  },
  badgeText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  badgeTextSmall: {
    fontSize: 20,
  },
  badgeTextLarge: {
    fontSize: 36,
  },
  badgeLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  badgeLabelSmall: {
    fontSize: 10,
  },
  badgeLabelLarge: {
    fontSize: 12,
  },
});
