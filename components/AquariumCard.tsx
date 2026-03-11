import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { Aquarium } from '../utils/types';
import { colors, spacing, borderRadius } from '../utils/theme';

interface AquariumCardProps {
  aquarium: Aquarium;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
}

export function AquariumCard({ aquarium, onPress, onLongPress, isSelected }: AquariumCardProps) {
  return (
    <View style={[styles.cardWrapper, isSelected && styles.cardWrapperSelected]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {aquarium.coverImage ? (
            <Image source={{ uri: aquarium.coverImage }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🐠</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{aquarium.name}</Text>
          <View style={styles.meta}>
            {aquarium.liters != null && (
              <Text style={styles.metaText}>{aquarium.liters} L</Text>
            )}
            <Text style={[styles.typeBadge, aquarium.type === 'marino' ? styles.marino : styles.dolce]}>
              {aquarium.type === 'marino' ? 'Marino' : 'Dolce'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: spacing.md,
  },
  cardWrapperSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F0FDFA',
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    height: 120,
    backgroundColor: colors.waterBlueLight,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.waterBlueLight,
  },
  placeholderText: {
    fontSize: 48,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  typeBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  dolce: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  marino: {
    backgroundColor: '#DBEAFE',
    color: '#2563EB',
  },
});
