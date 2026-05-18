import { Stack } from 'expo-router';
import React from 'react';

export default function OptionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="register" />
      <Stack.Screen name="detailed-card" />
      <Stack.Screen name="manual" />
    </Stack>
  );
}
