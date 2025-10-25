import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
// We will create a custom Picker component later. For now, we'll use placeholders.

type LanguageViewProps = {
  stagedContentLanguage: string;
  setStagedContentLanguage: (value: string) => void;
  stagedTranslationLanguage: string;
  setStagedTranslationLanguage: (value: string) => void;
  stagedLevel: string;
  setStagedLevel: (value: string) => void;
};

export function LanguageView({
  stagedContentLanguage,
  setStagedContentLanguage,
  stagedTranslationLanguage,
  setStagedTranslationLanguage,
  stagedLevel,
  setStagedLevel,
}: LanguageViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Content</Text>
        <Text style={styles.value}>{stagedContentLanguage}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Translate To</Text>
        <Text style={styles.value}>{stagedTranslationLanguage}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>{stagedLevel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  row: {
    gap: 8,
  },
  label: {
    color: Colors.dark.foreground,
    fontSize: 16,
  },
  value: {
    color: Colors.dark.mutedForeground,
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 6,
  },
});