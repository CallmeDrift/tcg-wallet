import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { initializeCollectionRepository, saveCollectionCards } from '../repository/collection-repository';

export function ManualCardForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [expansion, setExpansion] = useState('');
  const [rarity, setRarity] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [marketPrice, setMarketPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setImageUrl(result.assets[0]?.uri ?? '');
  };

  const save = async () => {
    const parsedQuantity = Number(quantity);
    const parsedMarketPrice = Number(marketPrice);
    if (!name.trim() || !Number.isInteger(parsedQuantity) || parsedQuantity < 1 || Number.isNaN(parsedMarketPrice)) {
      Alert.alert('Revisa los datos', 'Nombre, cantidad válida y valor de mercado son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await initializeCollectionRepository();
      await saveCollectionCards([{
        id: `manual-${Date.now()}`, name: name.trim(), setName: expansion.trim() || null, rarity: rarity.trim() || null,
        quantity: parsedQuantity, imageUrl: imageUrl || null, marketPrice: parsedMarketPrice,
        purchasePrice: Number(purchasePrice) || null, currency: 'USD', source: 'manual', updatedAt: Date.now(),
      }]);
      router.replace('/');
    } catch {
      Alert.alert('Error', 'No fue posible guardar la carta.');
    } finally {
      setSaving(false);
    }
  };

  return <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <ThemedText type="title">Añadir carta</ThemedText>
    <ThemedText type="small" style={styles.muted}>Las cartas manuales y las de Collectr viven en la misma colección.</ThemedText>
    <Field label="Nombre *" value={name} onChangeText={setName} placeholder="Charizard ex" />
    <Field label="Expansión" value={expansion} onChangeText={setExpansion} placeholder="Obsidian Flames" />
    <View style={styles.row}><View style={styles.half}><Field label="Cantidad *" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" /></View><View style={styles.half}><Field label="Rareza" value={rarity} onChangeText={setRarity} placeholder="Rare" /></View></View>
    <View style={styles.row}><View style={styles.half}><Field label="Compra (USD)" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="decimal-pad" /></View><View style={styles.half}><Field label="Mercado (USD) *" value={marketPrice} onChangeText={setMarketPrice} keyboardType="decimal-pad" /></View></View>
    <ThemedView type="backgroundElement" style={styles.imageBlock}><Pressable onPress={pickImage}><ThemedText type="link">{imageUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}</ThemedText></Pressable>{imageUrl ? <Image source={{ uri: imageUrl }} style={styles.preview} /> : null}</ThemedView>
    <Pressable disabled={saving} onPress={save} style={[styles.save, saving && styles.disabled]}><ThemedText type="link" style={styles.saveText}>{saving ? 'Guardando…' : 'Guardar carta'}</ThemedText></Pressable>
  </ScrollView>;
}

function Field({ label, ...props }: { label: string; value: string; onChangeText(value: string): void; placeholder?: string; keyboardType?: 'default' | 'number-pad' | 'decimal-pad' }) {
  return <ThemedView type="backgroundElement" style={styles.field}><ThemedText type="smallBold">{label}</ThemedText><TextInput {...props} style={styles.input} placeholderTextColor={Colors.dark.textSecondary} /></ThemedView>;
}

const styles = StyleSheet.create({
  container: { padding: Spacing.four, gap: Spacing.three }, muted: { color: Colors.dark.textSecondary }, row: { flexDirection: 'row', gap: Spacing.two }, half: { flex: 1 },
  field: { borderRadius: Spacing.three, padding: Spacing.two, gap: Spacing.one }, input: { color: Colors.dark.text, fontSize: 16, paddingVertical: Spacing.one },
  imageBlock: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two }, preview: { width: '100%', height: 240, borderRadius: Spacing.two, resizeMode: 'contain' },
  save: { borderRadius: Spacing.three, padding: Spacing.three, alignItems: 'center', backgroundColor: Colors.dark.accent }, saveText: { color: '#fff', fontWeight: '700' }, disabled: { opacity: 0.6 },
});
