import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { initDb, insertCard } from '@/db/sqlite';
import { ROUTES } from '@/navigation/routes';

export default function ManualAddScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [boughtPrice, setBoughtPrice] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');

  useEffect(() => {
    void initDb();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validateAmount = (value: string, label: string) => {
    if (!value.trim()) {
      return `${label} es obligatorio`;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return `${label} debe ser un número mayor que 0`;
    }

    return null;
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Ingrese el nombre de la carta');
      return;
    }

    if (!imageUri.trim()) {
      Alert.alert('Imagen requerida', 'Selecciona una imagen para la carta');
      return;
    }

    const priceError = validateAmount(boughtPrice, 'Precio de compra') ?? validateAmount(estimatedPrice, 'Precio estimado de venta');
    if (priceError) {
      Alert.alert('Datos inválidos', priceError);
      return;
    }

    const card = {
      id: Date.now().toString(),
      name: name.trim(),
      imageUri,
      boughtPrice: Number(boughtPrice),
      soldPrice: Number(estimatedPrice),
      currency: 'USD' as const,
      createdAt: Date.now(),
    };

    try {
      await insertCard(card);
      router.push(ROUTES.PORTFOLIO);
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la carta');
      console.error(err);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Añadir carta manualmente</ThemedText>

      <ThemedView type="backgroundElement" style={styles.field}>
        <ThemedText type="subtitle">Nombre</ThemedText>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.field}>
        <ThemedText type="subtitle">URI de imagen</ThemedText>
        <TextInput style={styles.input} value={imageUri} onChangeText={setImageUri} />
        <Pressable style={styles.secondaryButton} onPress={pickImage}>
          <ThemedText type="link">Elegir imagen</ThemedText>
        </Pressable>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.field}>
        <ThemedText type="subtitle">Precio de compra (USD)</ThemedText>
        <TextInput style={styles.input} value={boughtPrice} onChangeText={setBoughtPrice} keyboardType="numeric" />
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.field}>
        <ThemedText type="subtitle">Precio estimado de venta (USD)</ThemedText>
        <TextInput style={styles.input} value={estimatedPrice} onChangeText={setEstimatedPrice} keyboardType="numeric" />
      </ThemedView>

      <Pressable style={styles.saveButton} onPress={onSave}>
        <ThemedText type="link">Guardar</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  field: { padding: Spacing.two, borderRadius: Spacing.four },
  input: { borderWidth: 1, padding: 8, borderRadius: 6, marginTop: 8 },
  saveButton: { marginTop: Spacing.four, padding: Spacing.three, borderRadius: Spacing.four },
  secondaryButton: { marginTop: Spacing.two, paddingVertical: Spacing.two },
  preview: { width: '100%', height: 180, borderRadius: Spacing.three, marginTop: Spacing.three },
});
