import { Stack } from 'expo-router';
import React from 'react';

export default function AddCardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register" />
    </Stack>
  );
}
