import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Configure Reanimated logger to disable strict mode warnings
if (typeof global !== 'undefined') {
  // Disable Reanimated strict mode warnings
  (global as any)._WORKLET = false;
  (global as any).__reanimatedLoggerConfig = {
    strict: false,
    loggerLevel: 'warn',
  };
}

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Additional Reanimated configuration
    if ((global as any).__reanimatedLoggerConfig) {
      (global as any).__reanimatedLoggerConfig.strict = false;
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}