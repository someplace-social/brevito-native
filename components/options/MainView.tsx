import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MainViewProps = {
  setActiveView: (view: "topics" | "language" | "appearance") => void;
};

export function MainView({ setActiveView }: MainViewProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setActiveView("topics")}>
        <View style={styles.buttonContent}>
          <IconSymbol name="grid" size={24} color={Colors.dark.mutedForeground} />
          <Text style={styles.buttonText}>Topics</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={Colors.dark.mutedForeground} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setActiveView("language")}>
        <View style={styles.buttonContent}>
          <IconSymbol name="globe" size={24} color={Colors.dark.mutedForeground} />
          <Text style={styles.buttonText}>Language</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={Colors.dark.mutedForeground} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setActiveView("appearance")}>
        <View style={styles.buttonContent}>
          <IconSymbol name="paintpalette" size={24} color={Colors.dark.mutedForeground} />
          <Text style={styles.buttonText}>Appearance</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={Colors.dark.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.dark.accent,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  buttonText: {
    color: Colors.dark.foreground,
    fontSize: 18,
  },
});