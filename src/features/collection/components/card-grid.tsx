import React, { memo } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import type { CollectionCard } from '../types/card';
import { formatUsd, isHit } from '../utils/summary';

export function CardGrid({ cards, onSelect }: { cards: CollectionCard[]; onSelect(card: CollectionCard): void }) {
  return (
    <View style={styles.grid}>
      {cards.map((card) => (
        <CardTile key={card.id} card={card} onSelect={onSelect} />
      ))}
    </View>
  );
}

const CardTile = memo(function CardTile({ card, onSelect }: { card: CollectionCard; onSelect(card: CollectionCard): void }) {
  const hit = isHit(card);
  return <Pressable accessibilityRole="button" onPress={() => onSelect(card)} style={styles.cell}>
    <ThemedView type="backgroundElement" style={[styles.card, hit && styles.hitCard]}>
      {hit ? <View style={styles.hitBadge}><ThemedText type="smallBold" style={styles.hitText}>HIT</ThemedText></View> : null}
      {card.imageUrl ? <Image source={{ uri: card.imageUrl }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]} />}
      <ThemedText type="smallBold" numberOfLines={2}>{card.name}</ThemedText>
      <ThemedText type="small" style={{ color: Colors.dark.textSecondary }} numberOfLines={1}>{formatUsd(card.marketPrice)} · {card.quantity}x</ThemedText>
    </ThemedView>
  </Pressable>;
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.one },
  // Five columns keep the web grid compact while mobile remains easy to tap.
  cell: { width: Platform.OS === 'web' ? '20%' : '50%', padding: Spacing.one },
  card: { borderRadius: Spacing.three, overflow: 'hidden', padding: Spacing.two, gap: Spacing.one, borderWidth: 1, borderColor: 'transparent' },
  hitCard: { borderColor: '#9b5de5', backgroundColor: 'rgba(155, 93, 229, 0.14)' },
  hitBadge: { position: 'absolute', zIndex: 1, top: Spacing.two, left: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: 3, borderRadius: 999, backgroundColor: '#7e3ff2' },
  hitText: { color: '#fff', fontSize: 10, letterSpacing: 0.8 },
  image: { width: '100%', aspectRatio: 0.72, borderRadius: Spacing.two, backgroundColor: '#20252e' },
  placeholder: { opacity: 0.8 },
});
