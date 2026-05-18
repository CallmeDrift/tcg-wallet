import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

export default function AddCardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const navigateToRegister = () => {
    router.push('/add-card/register');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Agregar carta
      </ThemedText>

      <View style={styles.optionsContainer}>
        <Pressable
          style={[styles.optionButton, { borderColor: colors.accent }]}
          onPress={navigateToRegister}
        >
          <View style={styles.optionButtonIcon}>
            <ThemedText style={[styles.optionIcon, { color: colors.accent }]}>+</ThemedText>
          </View>
          <ThemedText type="subtitle">Añadir manualmente</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Registra los datos de tu carta
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.optionButton, { borderColor: colors.backgroundSelected, opacity: 0.5 }]}
          disabled
        >
          <View style={styles.optionButtonIcon}>
            <ThemedText style={[styles.optionIcon, { color: colors.textSecondary }]}>🔌</ThemedText>
          </View>
          <ThemedText type="subtitle">Registrar con API</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Próximamente
          </ThemedText>
        </Pressable>
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
    textAlign: 'center',
  },
  optionsContainer: {
    gap: Spacing.three,
  },
  optionButton: {
    borderWidth: 2,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  optionButtonIcon: {
    width: Spacing.four,
    height: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  optionIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
});
