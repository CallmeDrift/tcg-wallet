import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { deleteCard, getCard, updateCard } from '@/db/sqlite';
import type { Card } from '@/models/card';

export default function DetailedCardScreen() {
	console.log('DetailedCardScreen RENDERIZADO');
	const params = useLocalSearchParams();
	const id = params.id as string;
	const [card, setCard] = useState<Card | null>(null);
	const [quantity, setQuantity] = useState(1);
	const router = useRouter();
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

	useEffect(() => {
		console.log('DetailedCard useEffect - params:', params);
		console.log('DetailedCard useEffect - id:', id);
		if (id) {
			loadCard();
		}
	}, [id, params]);

	const loadCard = async () => {
		console.log('loadCard iniciado con id:', id);
		if (!id) {
			console.log('No hay ID, retornando');
			return;
		}
		try {
			console.log('Obteniendo tarjeta con ID:', id);
			const result = await getCard(id);
			console.log('Resultado de getCard:', result);
			if (result) {
				console.log('Tarjeta obtenida exitosamente');
				setCard(result);
				setQuantity(result.quantity ?? 1);
			} else {
				console.log('No se encontró tarjeta');
			}
		} catch (error) {
			console.error('Error loading card:', error);
			Alert.alert('Error', 'No se pudo cargar la carta');
			router.back();
		}
	};

	const handleQuantityChange = async (newQuantity: number) => {
		if (newQuantity < 1) return;
		setQuantity(newQuantity);
		if (card) {
			await updateCard({ ...card, quantity: newQuantity });
		}
	};

	const handleDeleteCard = () => {
		Alert.alert('Eliminar carta', `¿Borrar "${card?.name}" del portfolio?`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Borrar',
				style: 'destructive',
				onPress: async () => {
					if (card?.id) {
						await deleteCard(card.id);
						router.back();
					}
				},
			},
		]);
	};

	if (!card) {
		return (
			<ThemedView style={styles.container}>
				<ThemedText>Cargando...</ThemedText>
			</ThemedView>
		);
	}

	const profit = ((card.soldPrice ?? 0) - (card.boughtPrice ?? 0)) * (card.quantity ?? 1);
	const totalValue = (card.soldPrice ?? 0) * (card.quantity ?? 1);

	return (
		<ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}>
			<ThemedView style={styles.container}>
				<View style={styles.header}>
					<Pressable onPress={() => router.back()}>
						<MaterialIcons name="arrow-back" size={24} color={colors.text} />
					</Pressable>
					<ThemedText type="title" style={styles.headerTitle}>
						Detalle
					</ThemedText>
					<View style={{ width: 24 }} />
				</View>

				<View style={styles.imageContainer}>
					{card.imageUri ? (
						<Image source={{ uri: card.imageUri }} style={styles.cardImage} />
					) : (
						<View style={[styles.cardImage, { backgroundColor: colors.backgroundSelected }]} />
					)}
				</View>

				<ThemedText type="subtitle" style={styles.cardName}>
					{card.name}
				</ThemedText>
				<ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.three }}>
					{card.expansion}
				</ThemedText>

				<View style={styles.infoGrid}>
					<View style={styles.infoItem}>
						<ThemedText type="small" style={{ color: colors.textSecondary }}>
							Rareza
						</ThemedText>
						<ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>
							{card.rarity ?? 'N/A'}
						</ThemedText>
					</View>

					<View style={styles.infoItem}>
						<ThemedText type="small" style={{ color: colors.textSecondary }}>
							Cantidad
						</ThemedText>
						<View style={styles.quantityControl}>
							<Pressable
								style={styles.quantityButton}
								onPress={() => handleQuantityChange(quantity - 1)}
							>
								<ThemedText style={styles.quantityButtonText}>−</ThemedText>
							</Pressable>
							<ThemedText type="smallBold" style={styles.quantityValue}>
								{quantity}
							</ThemedText>
							<Pressable
								style={styles.quantityButton}
								onPress={() => handleQuantityChange(quantity + 1)}
							>
								<ThemedText style={styles.quantityButtonText}>+</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>

				{/* Price Info Row */}
				<View style={styles.infoGrid}>
					<View style={styles.infoItem}>
						<ThemedText type="small" style={{ color: colors.textSecondary }}>
							Valor compra
						</ThemedText>
						<ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>
							${(card.boughtPrice ?? 0).toFixed(2)} {card.currency ?? 'USD'}
						</ThemedText>
					</View>

					<View style={styles.infoItem}>
						<ThemedText type="small" style={{ color: colors.textSecondary }}>
							Valor venta
						</ThemedText>
						<ThemedText
							type="smallBold"
							style={{
								marginTop: Spacing.one,
								color: profit >= 0 ? '#10b981' : '#ef4444',
							}}
						>
							${(card.soldPrice ?? 0).toFixed(2)} {card.currency ?? 'USD'}
						</ThemedText>
					</View>
				</View>

				{/* Profit Info */}
				<View style={[styles.profitCard, { backgroundColor: colors.backgroundSelected }]}>
					<View>
						<ThemedText type="small" style={{ color: colors.textSecondary }}>
							Ganancia/Pérdida total
						</ThemedText>
						<ThemedText
							type="smallBold"
							style={{
								fontSize: 18,
								marginTop: Spacing.one,
								color: profit >= 0 ? '#10b981' : '#ef4444',
							}}
						>
							${profit.toFixed(2)} {card.currency ?? 'USD'}
						</ThemedText>
					</View>
					<View>
						<ThemedText type="small" style={{ color: colors.textSecondary }}>
							Valor total
						</ThemedText>
						<ThemedText type="smallBold" style={{ fontSize: 18, marginTop: Spacing.one }}>
							${totalValue.toFixed(2)} {card.currency ?? 'USD'}
						</ThemedText>
					</View>
				</View>

				{/* Action Buttons */}
				<View style={styles.actions}>
					<Pressable
						style={[styles.actionButton, { backgroundColor: colors.accent }]}
						onPress={() =>
							router.push(`/options/register?id=${card.id}` as any)
						}
					>
						<MaterialIcons name="edit" size={20} color="#fff" />
						<ThemedText style={styles.actionButtonText}>Editar</ThemedText>
					</Pressable>

					<Pressable
						style={[styles.actionButton, { backgroundColor: '#d11a2a' }]}
						onPress={handleDeleteCard}
					>
						<MaterialIcons name="delete" size={20} color="#fff" />
						<ThemedText style={styles.actionButtonText}>Eliminar</ThemedText>
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
		gap: Spacing.three,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: Spacing.two,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
	},
	imageContainer: {
		width: '100%',
		borderRadius: Spacing.three,
		overflow: 'hidden',
		marginBottom: Spacing.two,
	},
	cardImage: {
		width: '100%',
		height: 300,
		borderRadius: Spacing.three,
	},
	cardName: {
		fontSize: 20,
		fontWeight: '700',
	},
	infoGrid: {
		flexDirection: 'row',
		gap: Spacing.two,
	},
	infoItem: {
		flex: 1,
		padding: Spacing.two,
		backgroundColor: 'rgba(128, 128, 128, 0.1)',
		borderRadius: Spacing.two,
	},
	quantityControl: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.one,
		marginTop: Spacing.one,
	},
	quantityButton: {
		width: 32,
		height: 32,
		borderRadius: 6,
		backgroundColor: 'rgba(128, 128, 128, 0.2)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	quantityButtonText: {
		fontSize: 18,
		fontWeight: '700',
	},
	quantityValue: {
		flex: 1,
		textAlign: 'center',
		fontSize: 16,
	},
	profitCard: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: Spacing.three,
		borderRadius: Spacing.three,
		marginVertical: Spacing.two,
	},
	actions: {
		flexDirection: 'row',
		gap: Spacing.two,
		marginTop: Spacing.three,
	},
	actionButton: {
		flex: 1,
		flexDirection: 'row',
		paddingVertical: Spacing.three,
		borderRadius: Spacing.three,
		alignItems: 'center',
		justifyContent: 'center',
		gap: Spacing.one,
	},
	actionButtonText: {
		fontWeight: '600',
		fontSize: 14,
		color: '#fff',
	},
});
