import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppSettings } from '@/hooks/useAppSettings';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MainViewProps = {
  setActiveView: (view: "topics" | "language" | "appearance") => void;
};

export function MainView({ setActiveView }: MainViewProps) {
  const { colors } = useAppSettings();

  const handlePress = (view: "topics" | "language" | "appearance") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveView(view);
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      gap: 8,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.secondary,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    buttonText: {
      color: colors.secondaryForeground,
      fontSize: 18,
    },
    icon: {
      color: colors.secondaryForeground,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => handlePress("topics")}>
        <View style={styles.buttonContent}>
          <IconSymbol name="grid" size={24} color={styles.icon.color} />
          <Text style={styles.buttonText}>Topics</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={styles.icon.color} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handlePress("language")}>
        <View style={styles.buttonContent}>
          <IconSymbol name="globe" size={24} color={styles.icon.color} />
          <Text style={styles.buttonText}>Language</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={styles.icon.color} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handlePress("appearance")}>
        <View style={styles.buttonContent}>
          <IconSymbol name="paintpalette" size={24} color={styles.icon.color} />
          <Text style={styles.buttonText}>Appearance</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={styles.icon.color} />
      </TouchableOpacity>
    </View>
  );
}