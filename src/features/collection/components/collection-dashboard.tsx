import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useCollection } from '../hooks/use-collection';
import type { CollectionCard } from '../types/card';
import { formatUsd, getCollectionSummary, HIT_PRICE_THRESHOLD, isHit } from '../utils/summary';
import { CardDetailsModal } from './card-details-modal';
import { CardGrid } from './card-grid';

const INITIAL_RENDER_LIMIT = 60;
const RENDER_INCREMENT = 60;

export function CollectionDashboard() {
  const { cards, loading, refreshing, error, refresh } = useCollection();
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null);
  const summary = useMemo(() => getCollectionSummary(cards), [cards]);
  const [query, setQuery] = useState('');
  const [expansion, setExpansion] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'hits' | 'regular'>('all');
  const [sortField, setSortField] = useState<'name' | 'price' | 'expansion'>('price');
  const [sortAscending, setSortAscending] = useState(false);
  const [renderLimit, setRenderLimit] = useState(INITIAL_RENDER_LIMIT);
  const deferredQuery = useDeferredValue(query);
  const deferredExpansion = useDeferredValue(expansion);
  const hitCards = useMemo(() => cards.filter(isHit), [cards]);
  const searchIndex = useMemo(() => cards.map((card) => ({
    card,
    searchable: [card.name, card.rarity, card.cardNumber].filter(Boolean).join(' ').toLocaleLowerCase(),
    expansion: (card.setName ?? '').toLocaleLowerCase(),
    name: card.name.toLocaleLowerCase(),
  })), [cards]);
  const visibleCards = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase();
    const normalizedExpansion = deferredExpansion.trim().toLocaleLowerCase();
    return searchIndex
      .filter(({ card }) => visibility === 'all' || (visibility === 'hits' ? isHit(card) : !isHit(card)))
      .filter(({ searchable }) => !normalizedQuery || searchable.includes(normalizedQuery))
      .filter((entry) => !normalizedExpansion || entry.expansion.includes(normalizedExpansion))
      .sort((left, right) => {
        const comparison = sortField === 'price'
          ? left.card.marketPrice - right.card.marketPrice
          : (sortField === 'name' ? left.name : left.expansion).localeCompare(sortField === 'name' ? right.name : right.expansion, 'es');
        return sortAscending ? comparison : -comparison;
      })
      .map(({ card }) => card);
  }, [deferredExpansion, deferredQuery, searchIndex, sortAscending, sortField, visibility]);

  useEffect(() => setRenderLimit(INITIAL_RENDER_LIMIT), [deferredExpansion, deferredQuery, sortAscending, sortField, visibility]);
  const displayedCards = useMemo(() => visibleCards.slice(0, renderLimit), [renderLimit, visibleCards]);

  const changeSort = (field: typeof sortField) => {
    if (field === sortField) setSortAscending((current) => !current);
    else { setSortField(field); setSortAscending(field !== 'price'); }
  };

  return <ThemedView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <View style={styles.header}><View><ThemedText type="title">Mi colección</ThemedText><ThemedText type="small" style={styles.muted}>Sincronizada con tu cartera</ThemedText></View><Pressable onPress={refresh} disabled={refreshing} style={styles.refresh}><MaterialIcons name="refresh" size={22} color={Colors.dark.text} /></Pressable></View>
      <View style={styles.summary}><Summary label="Valor total" value={formatUsd(summary.totalValue)} /><Summary label="Cartas" value={`${summary.totalCards}`} /><Summary label="Únicas" value={`${summary.uniqueCards}`} /><Summary label="Hits" value={`${hitCards.length} · ${formatUsd(hitCards.reduce((total, card) => total + card.marketPrice * card.quantity, 0))}`} /></View>
      {error ? <ThemedView type="backgroundElement" style={styles.notice}><ThemedText type="small">{error}</ThemedText></ThemedView> : null}
      <ThemedText type="subtitle" style={styles.section}>Cartas</ThemedText>
      <ThemedView type="backgroundElement" style={styles.filters}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Buscar por nombre, número o rareza" placeholderTextColor={Colors.dark.textSecondary} style={styles.input} />
        <TextInput value={expansion} onChangeText={setExpansion} placeholder="Filtrar por expansión" placeholderTextColor={Colors.dark.textSecondary} style={styles.input} />
        <View style={styles.chips}><FilterChip label="Todas" active={visibility === 'all'} onPress={() => setVisibility('all')} /><FilterChip label={`Hits +${formatUsd(HIT_PRICE_THRESHOLD)}`} active={visibility === 'hits'} onPress={() => setVisibility('hits')} /><FilterChip label="Regulares" active={visibility === 'regular'} onPress={() => setVisibility('regular')} /></View>
        <ThemedText type="small" style={styles.filterLabel}>Ordenar por</ThemedText>
        <View style={styles.chips}><SortChip label="Nombre" field="name" selected={sortField} ascending={sortAscending} onPress={changeSort} /><SortChip label="Precio" field="price" selected={sortField} ascending={sortAscending} onPress={changeSort} /><SortChip label="Expansión" field="expansion" selected={sortField} ascending={sortAscending} onPress={changeSort} /></View>
      </ThemedView>
      <ThemedText type="small" style={styles.muted}>{visibleCards.length} de {cards.length} cartas · Hits: más de {formatUsd(HIT_PRICE_THRESHOLD)}</ThemedText>
      {loading ? <ActivityIndicator /> : cards.length ? (visibleCards.length ? <><CardGrid cards={displayedCards} onSelect={setSelectedCard} />{displayedCards.length < visibleCards.length ? <Pressable onPress={() => setRenderLimit((current) => current + RENDER_INCREMENT)} style={styles.moreButton}><ThemedText type="smallBold">Mostrar {Math.min(RENDER_INCREMENT, visibleCards.length - displayedCards.length)} más</ThemedText></Pressable> : null}</> : <ThemedView type="backgroundElement" style={styles.empty}><ThemedText type="small">No encontramos cartas con esos filtros.</ThemedText></ThemedView>) : <ThemedView type="backgroundElement" style={styles.empty}><ThemedText type="small">Aún no hay cartas. Configura la URL de tu API y pulsa actualizar.</ThemedText></ThemedView>}
    </ScrollView>
    <CardDetailsModal card={selectedCard} onClose={() => setSelectedCard(null)} />
  </ThemedView>;
}

function Summary({ label, value }: { label: string; value: string }) { return <ThemedView type="backgroundElement" style={styles.summaryCard}><ThemedText type="small" style={styles.muted}>{label}</ThemedText><ThemedText type="smallBold">{value}</ThemedText></ThemedView>; }

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress(): void }) { return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><ThemedText type="smallBold" style={active ? styles.chipTextActive : undefined}>{label}</ThemedText></Pressable>; }

function SortChip({ label, field, selected, ascending, onPress }: { label: string; field: 'name' | 'price' | 'expansion'; selected: string; ascending: boolean; onPress(field: 'name' | 'price' | 'expansion'): void }) { const active = selected === field; return <FilterChip label={`${label}${active ? (ascending ? ' ↑' : ' ↓') : ''}`} active={active} onPress={() => onPress(field)} />; }

const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { padding: Spacing.four, gap: Spacing.three }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refresh: { padding: Spacing.two }, muted: { color: Colors.dark.textSecondary }, summary: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.one },
  summaryCard: { width: '48%', margin: '1%', padding: Spacing.two, borderRadius: Spacing.three, gap: Spacing.one }, section: { marginTop: Spacing.two },
  notice: { padding: Spacing.two, borderRadius: Spacing.two }, empty: { padding: Spacing.four, borderRadius: Spacing.three },
  filters: { padding: Spacing.two, borderRadius: Spacing.three, gap: Spacing.two }, input: { color: Colors.dark.text, borderWidth: 1, borderColor: '#3b4350', borderRadius: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one }, chip: { borderWidth: 1, borderColor: '#4b5563', borderRadius: 999, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one }, chipActive: { backgroundColor: '#7e3ff2', borderColor: '#9b5de5' }, chipTextActive: { color: '#fff' }, filterLabel: { color: Colors.dark.textSecondary, marginTop: Spacing.one },
  moreButton: { alignItems: 'center', borderWidth: 1, borderColor: '#7e3ff2', borderRadius: Spacing.three, padding: Spacing.two },
});
