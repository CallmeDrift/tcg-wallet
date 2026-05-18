import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import Picker from '@/components/picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { initDb, insertCard } from '@/db/sqlite';
import type { Card } from '@/models/card';
import { ROUTES } from '@/navigation/routes';

export default function RegisterCardScreen() {
  const router = useRouter();
  useEffect(() => {
    console.log('RegisterCardScreen mounted');
  }, []);
  const [name, setName] = useState('');
  const [expansion, setExpansion] = useState('');
  const [rarity, setRarity] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [currency, setCurrency] = useState<'USD' | 'COP'>('USD');
  const [currencyBought, setCurrencyBought] = useState<'USD' | 'COP'>('USD');
  const [currencySold, setCurrencySold] = useState<'USD' | 'COP'>('USD');
  const [imageUri, setImageUri] = useState('');
  const [boughtPrice, setBoughtPrice] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const rarityOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Reverse holo', value: 'reverse_holo' },
    { label: 'Patterned Reverse holo', value: 'patterned_holo' },
    { label: 'Holographic', value: 'holographic' },
    { label: 'Full Art', value: 'fa' },
    { label: 'Secret Illustration Rare', value: 'sir' },
    { label: "Golden", value: "golden"},
  ];

  const currencyOptions = [
    { label: 'USD', value: 'USD' as const },
    { label: 'COP', value: 'COP' as const },
  ];

  const validateFields = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Ingrese el nombre de la carta');
      return false;
    }

    if (!imageUri.trim()) {
      Alert.alert('Imagen requerida', 'Seleccione una imagen para la carta');
      return false;
    }

    const boughtNum = Number(boughtPrice);
    if (!boughtPrice.trim() || Number.isNaN(boughtNum) || boughtNum <= 0) {
      Alert.alert('Precio de compra inválido', 'Ingrese un número mayor que 0');
      return false;
    }

    const qty = Number(quantity);
    if (!quantity.trim() || Number.isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      Alert.alert('Cantidad inválida', 'Ingrese una cantidad entera mayor o igual a 1');
      return false;
    }

    const estimatedNum = Number(estimatedPrice);
    if (!estimatedPrice.trim() || Number.isNaN(estimatedNum) || estimatedNum <= 0) {
      Alert.alert('Precio estimado inválido', 'Ingrese un número mayor que 0');
      return false;
    }

    return true;
  };

  const onRegisterCard = async () => {
    if (!validateFields() || saving) return;

    setSaving(true);
    try {
      await initDb();

      const card: Card = {
        id: Date.now().toString(),
        name: name.trim(),
        expansion: expansion.trim() || undefined,
        // rarity stored as string identifier
        rarity: rarity ?? undefined,
        quantity: Number(quantity) || 1,
        imageUri,
        boughtPrice: Number(boughtPrice),
        soldPrice: Number(estimatedPrice),
        currency: currencyBought,
        createdAt: Date.now(),
      };

      await insertCard(card);

      // limpiar formulario inmediatamente después de guardar
      setName('');
      setExpansion('');
      setQuantity('1');
      setRarity(null);
      setCurrencyBought('USD');
      setCurrencySold('USD');
      setImageUri('');
      setBoughtPrice('');
      setEstimatedPrice('');

      Alert.alert('Éxito', `Carta "${card.name}" registrada correctamente`, [
        {
          text: 'Volver a Agregar',
          onPress: () => router.push(ROUTES.ADD_CARD as any),
        },
        {
          text: 'Agregar otra',
          onPress: () => {
            /* ya está limpio */
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'No se pudo registrar la carta. Intente nuevamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">Registrar carta</ThemedText>
        <ThemedText type="small">Ingresa los datos de tu carta coleccionable</ThemedText>
      </ThemedView>

      {/* Nombre */}
      <ThemedView type="backgroundElement" style={styles.field}>
        <ThemedText type="subtitle">Nombre de la carta *</ThemedText>
        <TextInput
          style={[styles.input, { color: '#fff' }]}
          placeholder="ej: Charizard Holo 1st Edition"
          value={name}
          onChangeText={setName}
          editable={!saving}
          placeholderTextColor="#fff"
          selectionColor="#fff"
          keyboardAppearance="dark"
        />
      </ThemedView>

      {/* Seleccionar imagen */}
      <ThemedView type="backgroundElement" style={styles.field}>
        <ThemedText type="subtitle">Imagen de la carta *</ThemedText>
        <Pressable style={styles.imagePicker} onPress={pickImage} disabled={saving}>
          <ThemedText type="link">{imageUri ? 'Cambiar imagen' : 'Seleccionar imagen'}</ThemedText>
        </Pressable>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      </ThemedView>

      {/* Precio de compra y Precio de venta */}
      <View style={styles.fieldRow}>
        <ThemedView type="backgroundElement" style={[styles.field, styles.fieldHalf]}>
          <ThemedText type="subtitle">Precio de compra *</ThemedText>
          <TextInput
            style={[styles.input, { color: '#fff' }]}
            placeholder="ej: 250.00"
            value={boughtPrice}
            onChangeText={setBoughtPrice}
            keyboardType="decimal-pad"
            editable={!saving}
            placeholderTextColor="#fff"
            selectionColor="#fff"
            keyboardAppearance="dark"
          />
        </ThemedView>

        <ThemedView type="backgroundElement" style={[styles.field, styles.fieldHalf]}>
          <ThemedText type="subtitle">Precio de venta *</ThemedText>
          <TextInput
            style={[styles.input, { color: '#fff' }]}
            placeholder="ej: 500.00"
            value={estimatedPrice}
            onChangeText={setEstimatedPrice}
            keyboardType="decimal-pad"
            editable={!saving}
            placeholderTextColor="#fff"
            selectionColor="#fff"
            keyboardAppearance="dark"
          />
        </ThemedView>
      </View>

      {/* Moneda de compra y Moneda de venta */}
      <View style={styles.fieldRow}>
        <ThemedView type="backgroundElement" style={[styles.field, styles.fieldHalf]}>
          <ThemedText type="subtitle">Moneda de compra</ThemedText>
          <Picker
            value={currencyBought}
            options={currencyOptions}
            onChange={(v) => setCurrencyBought(v as 'USD' | 'COP')}
            placeholder="Selecciona moneda"
            disabled={saving}
          />
        </ThemedView>

        <ThemedView type="backgroundElement" style={[styles.field, styles.fieldHalf]}>
          <ThemedText type="subtitle">Moneda de venta</ThemedText>
          <Picker
            value={currencySold}
            options={currencyOptions}
            onChange={(v) => setCurrencySold(v as 'USD' | 'COP')}
            placeholder="Selecciona moneda"
            disabled={saving}
          />
        </ThemedView>
      </View>

      {/* Rareza y Expansión */}
      <View style={styles.fieldRow}>
        <ThemedView type="backgroundElement" style={[styles.field, styles.fieldHalf]}>
          <ThemedText type="subtitle">Rareza</ThemedText>
          <Picker
            value={rarity}
            options={rarityOptions}
            onChange={(v) => setRarity(v as string)}
            placeholder="Selecciona rareza"
            disabled={saving}
          />
        </ThemedView>

        <ThemedView type="backgroundElement" style={[styles.field, styles.fieldHalf]}>
          <ThemedText type="subtitle">Expansión</ThemedText>
          <TextInput
            style={[styles.input, { color: '#fff' }]}
            placeholder="ej: Base Set"
            value={expansion}
            onChangeText={setExpansion}
            editable={!saving}
            placeholderTextColor="#fff"
            selectionColor="#fff"
            keyboardAppearance="dark"
          />
        </ThemedView>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.backButton, saving && styles.backButtonDisabled]}
          onPress={() => router.push(ROUTES.ADD_CARD as any)}
          disabled={saving}
        >
          <ThemedText type="link" style={styles.buttonText}>
            Volver
          </ThemedText>
        </Pressable>
        
        <Pressable
          style={[styles.registerButton, saving && styles.registerButtonDisabled]}
          onPress={onRegisterCard}
          disabled={saving}
        >
          <ThemedText type="link" style={styles.buttonText}>
            {saving ? 'Guardando...' : 'Registrar carta'}
          </ThemedText>
        </Pressable>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <ThemedText type="small">* Campos obligatorios</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  field: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  fieldHalf: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    fontSize: 16,
  },
  imagePicker: {
    paddingVertical: Spacing.two,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  registerButton: {
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    backgroundColor: '#6b7280',
    alignItems: 'center',
    flex: 1,
  },
  backButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    padding: Spacing.two,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
});
