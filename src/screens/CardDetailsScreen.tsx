import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function CardDetailsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Detalles de la carta</ThemedText>
      <ThemedView type="backgroundElement" style={styles.content}>
        <ThemedText type="small">Imagen, nombre, historial de precios, notas.</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four },
  content: { padding: Spacing.three, borderRadius: Spacing.four },
});
