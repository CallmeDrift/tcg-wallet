import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import type { CollectionCard } from '../types/card';
import { formatUsd } from '../utils/summary';

export function CardDetailsModal({ card, onClose }: { card: CollectionCard | null; onClose(): void }) {
  return (
    <Modal visible={Boolean(card)} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {card && <ThemedView style={styles.screen}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Detalle de carta</ThemedText>
          <Pressable onPress={onClose} accessibilityLabel="Cerrar detalle"><MaterialIcons name="close" size={26} color={Colors.dark.text} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {card.imageUrl ? <Image source={{ uri: card.imageUrl }} style={styles.image} /> : null}
          <ThemedText type="title">{card.name}</ThemedText>
          <ThemedText type="small" style={styles.muted}>{card.setName ?? 'Expansión desconocida'}{card.cardNumber ? ` · #${card.cardNumber}` : ''}</ThemedText>
          <View style={styles.metrics}>
            <Metric label="Precio mercado" value={formatUsd(card.marketPrice)} />
            <Metric label="Valor colección" value={formatUsd(card.marketPrice * card.quantity)} />
            <Metric label="Cantidad" value={`${card.quantity}`} />
            <Metric label="Rareza" value={card.rarity ?? '—'} />
            <Metric label="Condición" value={card.condition ?? '—'} />
            <Metric label="Cambio" value={`${(card.priceChangePercent ?? 0).toFixed(2)}%`} />
          </View>
        </ScrollView>
      </ThemedView>}
    </Modal>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <ThemedView type="backgroundElement" style={styles.metric}><ThemedText type="small" style={styles.muted}>{label}</ThemedText><ThemedText type="smallBold">{value}</ThemedText></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.four },
  content: { padding: Spacing.four, paddingTop: 0, gap: Spacing.two }, image: { width: '100%', height: 380, resizeMode: 'contain', borderRadius: Spacing.three },
  muted: { color: Colors.dark.textSecondary }, metrics: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.two },
  metric: { width: '48%', margin: '1%', minHeight: 76, borderRadius: Spacing.three, padding: Spacing.two, gap: Spacing.one },
});
