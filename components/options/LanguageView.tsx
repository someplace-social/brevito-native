import { StyleSheet, View } from 'react-native';
import { CustomPicker } from '../ui/CustomPicker';

const languageItems = [
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Italian', value: 'Italian' },
];

const levelItems = [
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
];

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
      <CustomPicker
        label="Content"
        selectedValue={stagedContentLanguage}
        onValueChange={setStagedContentLanguage}
        items={languageItems}
      />
      <CustomPicker
        label="Translate To"
        selectedValue={stagedTranslationLanguage}
        onValueChange={setStagedTranslationLanguage}
        items={languageItems}
      />
      <CustomPicker
        label="Level"
        selectedValue={stagedLevel}
        onValueChange={setStagedLevel}
        items={levelItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
});