import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ProfitValueScreen() {
	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title" style={styles.title}>
				Value
			</ThemedText>

			{/* Chart Placeholder */}
			<View style={styles.chartContainer}>
				<ThemedText style={styles.chartPlaceholder}>
					GRÁFICA/LÍNEA DE TIEMPO
					{'\n'}
					GANADO VS GASTADO
				</ThemedText>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: Spacing.four,
		justifyContent: 'center',
		gap: Spacing.four,
	},
	title: {
		marginBottom: Spacing.four,
	},
	chartContainer: {
		padding: Spacing.four,
		borderRadius: Spacing.four,
		minHeight: 400,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#2D2D2D',
	},
	chartPlaceholder: {
		textAlign: 'center',
		color: '#666',
		fontSize: 16,
		fontWeight: '600',
	},
});
