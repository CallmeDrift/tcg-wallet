import { ROUTES } from '@/navigation/routes';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { getCards, initDb } from '@/db/sqlite';
import type { Card } from '@/models/card';

export default function Dashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    void initDb();
    void loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const storedCards = await getCards();
      setCards(storedCards);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals from cards
  const totalInvested = cards.reduce((sum, card) => sum + ((card.boughtPrice ?? 0) * (card.quantity ?? 1)), 0);
  const estimatedValue = cards.reduce((sum, card) => sum + ((card.soldPrice ?? 0) * (card.quantity ?? 1)), 0);

  // Get last 4 cards
  const recentCards = cards.slice(0, 4);

  const navigate = (to: string) => () => router.push(to as any);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image source={require('@/assets/images/buizel.jpeg')} style={styles.logo} />
          <ThemedText type="title" style={styles.title}>
            TCG WALLET
          </ThemedText>
        </View>

        {/* Total Value Card */}
        <ThemedView type="backgroundElement" style={styles.totalCard}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            VALOR TOTAL DE MIS CARTAS:
          </ThemedText>
          <ThemedText style={[styles.totalValue, { color: colors.accent }]}>
            ${estimatedValue.toFixed(2)} USD
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
            Invertido: ${totalInvested.toFixed(2)} USD
          </ThemedText>
        </ThemedView>

        {/* Chart Placeholder */}
        <ThemedView type="backgroundElement" style={styles.chartContainer}>
          <ThemedText style={styles.chartPlaceholder}>
            GRÁFICA/LÍNEA DE TIEMPO
            {'\n'}
            GANADO VS GASTADO
          </ThemedText>
        </ThemedView>

        {/* Recent Cards */}
        <View>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Últimas cartas añadidas
          </ThemedText>

          {loading ? (
            <ActivityIndicator />
          ) : recentCards.length > 0 ? (
            <View style={styles.cardGrid}>
              {recentCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.cardGridItem}
                  onPress={async () => {
                      console.log('Dashboard card presionado:', card.id);
                      try {
                        await router.push({ pathname: '/options/detailed-card', params: { id: card.id } } as any);
                        console.log('router.push(object) successful for', card.id);
                      } catch (e) {
                        console.error('router.push(object) error:', e);
                        try {
                          await router.push(`/options/detailed-card?id=${card.id}` as any);
                          console.log('router.push(fallback) successful for', card.id);
                        } catch (e2) {
                          console.error('router.push(fallback) error:', e2);
                        }
                      }
                    }}
                >
                  <ThemedView type="backgroundElement" style={styles.cardItem}>
                    {card.imageUri ? (
                      <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
                    ) : (
                      <View style={[styles.cardImage, { backgroundColor: colors.backgroundSelected }]} />
                    )}
                    <ThemedText type="small" numberOfLines={1} style={styles.cardName}>
                      {card.name}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: colors.textSecondary }}
                      numberOfLines={1}
                    >
                      ${((card.soldPrice ?? 0) * (card.quantity ?? 1)).toFixed(2)}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <ThemedText type="small">No hay cartas registradas aún.</ThemedText>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={navigate(ROUTES.ADD_CARD)}>
            <ThemedText type="link" style={styles.actionButtonText}>
              Agregar carta
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.backgroundSelected }]}
            onPress={() => router.push('/explore' as any)}
          >
            <ThemedText type="link" style={styles.actionButtonText}>
              Buscar cartas
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  totalCard: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: Spacing.one,
  },
  chartContainer: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.four,
  },
  cardGridItem: {
    width: '50%',
    paddingHorizontal: Spacing.one,
    marginBottom: Spacing.three,
  },
  cardItem: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    paddingBottom: Spacing.two,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
  cardName: {
    paddingHorizontal: Spacing.two,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
