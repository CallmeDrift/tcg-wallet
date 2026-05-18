import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { deleteCard, getCards, initDb } from '@/db/sqlite';
import type { Card } from '@/models/card';

export default function PortfolioScreen() {
	const [cards, setCards] = useState<Card[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

	useEffect(() => {
		void initDb();
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			void loadCards();
		}, [])
	);

	const loadCards = async () => {
		try {
			const storedCards = await getCards();
			setCards(storedCards);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteCard = (card: Card) => {
		Alert.alert('Eliminar carta', `¿Borrar "${card.name}" del portfolio?`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Borrar',
				style: 'destructive',
				onPress: async () => {
					await deleteCard(card.id);
					await loadCards();
				},
			},
		]);
	};

	const totalCards = cards.reduce((sum, card) => sum + (card.quantity ?? 1), 0);
	const totalInvested = cards.reduce((sum, card) => sum + ((card.boughtPrice ?? 0) * (card.quantity ?? 1)), 0);
	const profit = cards.reduce((sum, card) => sum + (((card.soldPrice ?? 0) - (card.boughtPrice ?? 0)) * (card.quantity ?? 1)), 0);
	const estimatedValue = cards.reduce((sum, card) => sum + ((card.soldPrice ?? 0) * (card.quantity ?? 1)), 0);

	return (
		<ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}>
			<ThemedView style={styles.container}>
				<ThemedText type="title" style={styles.title}>
					Portfolio
				</ThemedText>

				{/* Stats Grid */}
				<View style={styles.statsGrid}>
					<View style={styles.statItem}>
						<ThemedText type="small" style={[styles.statLabel, { color: colors.textSecondary }]}>
							Total de cartas
						</ThemedText>
						<ThemedText type="smallBold" style={styles.statValue}>
							{totalCards}
						</ThemedText>
					</View>

					<View style={styles.statItem}>
						<ThemedText type="small" style={[styles.statLabel, { color: colors.textSecondary }]}>
							Total ganado:
						</ThemedText>
						<ThemedText
							type="smallBold"
							style={{
								fontSize: 13,
								marginTop: Spacing.one,
								color: profit >= 0 ? '#10b981' : '#ef4444',
							}}
						>
							${profit.toFixed(2)} USD
						</ThemedText>
					</View>

					<View style={styles.statItem}>
						<ThemedText type="small" style={[styles.statLabel, { color: colors.textSecondary }]}>
							Valor total:
						</ThemedText>
						<ThemedText type="smallBold" style={styles.statValue}>
							${estimatedValue.toFixed(2)} USD
						</ThemedText>
					</View>

					<View style={styles.statItem}>
						<ThemedText type="small" style={[styles.statLabel, { color: colors.textSecondary }]}>
							Total gastado:
						</ThemedText>
						<ThemedText type="smallBold" style={styles.statValue}>
							${totalInvested.toFixed(2)} USD
						</ThemedText>
					</View>
				</View>

				{/* Cards */}
				<ThemedText type="subtitle">Mis cartas</ThemedText>

				{loading ? (
					<ActivityIndicator />
				) : cards.length > 0 ? (
					<View style={styles.cardGridContainer}>
						{cards.map((card) => (
							<TouchableOpacity
								key={card.id}
								style={styles.cardGridItem}
								onPress={async () => {
									console.log('Presionado card:', card.id);
									try {
										// Intento usando objeto pathname+params (más robusto con expo-router)
										await router.push({ pathname: '/options/detailed-card', params: { id: card.id } } as any);
										console.log('router.push(object) successful for', card.id);
									} catch (e) {
										console.error('router.push(object) error:', e);
										// fallback a querystring
										try {
											await router.push(`/options/detailed-card?id=${card.id}` as any);
											console.log('router.push(fallback) successful for', card.id);
										} catch (e2) {
											console.error('router.push(fallback) error:', e2);
										}
									}
								}}
							>
								<ThemedView type="backgroundElement" style={styles.cardGrid}>
									{card.imageUri ? (
										<Image source={{ uri: card.imageUri }} style={styles.cardGridImage} />
									) : (
										<View style={[styles.cardGridImage, { backgroundColor: colors.backgroundSelected }]} />
									)}
									<ThemedText type="small" numberOfLines={2} style={styles.cardGridName}>
										{card.name}
									</ThemedText>
									<ThemedText
										type="small"
										style={{ color: colors.textSecondary }}
										numberOfLines={1}
									>
										Venta: ${((card.soldPrice ?? 0) * (card.quantity ?? 1)).toFixed(2)}
									</ThemedText>
									<ThemedText
										type="small"
										style={{ color: colors.textSecondary }}
										numberOfLines={1}
									>
										Cantidad: {card.quantity ?? 1}
									</ThemedText>
									<Pressable
										style={styles.deleteSmallButton}
										onPress={() => handleDeleteCard(card)}
									>
										<MaterialIcons name="close" size={16} color="#fff" />
									</Pressable>
								</ThemedView>
							</TouchableOpacity>
						))}
					</View>
				) : (
					<ThemedText type="small">Todavía no hay cartas registradas.</ThemedText>
				)}
			</ThemedView>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
	},
	container: {
		padding: Spacing.four,
		gap: Spacing.three,
	},
	title: {
		marginBottom: Spacing.one,
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: Spacing.three,
	},
	statItem: {
		width: '50%',
		paddingRight: Spacing.two,
		paddingBottom: Spacing.two,
	},
	statLabel: {
		fontSize: 12,
	},
	statValue: {
		fontSize: 14,
		marginTop: Spacing.one,
	},
	cardGridContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		paddingBottom: Spacing.four,
	},
	cardGridItem: {
		width: '50%',
		padding: Spacing.one,
	},
	cardGrid: {
		borderRadius: Spacing.three,
		padding: Spacing.two,
		position: 'relative',
	},
	cardGridImage: {
		width: '100%',
		height: 140,
		borderRadius: Spacing.two,
		marginBottom: Spacing.two,
	},
	cardGridName: {
		fontWeight: '600',
		marginBottom: Spacing.one,
	},
	deleteSmallButton: {
		position: 'absolute',
		top: Spacing.two,
		right: Spacing.two,
		width: 28,
		height: 28,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#d11a2a',
	},
});
