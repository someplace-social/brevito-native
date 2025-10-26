import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppSettingsProvider } from '../contexts/AppSettingsContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}