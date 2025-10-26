import { ThemeName } from '@/constants/Colors';
import { FONT_SIZES, useAppSettings } from '@/hooks/useAppSettings';
import { Image } from 'expo-image';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { CustomPicker } from '../ui/CustomPicker';
import { FontSizeSlider } from '../ui/FontSizeSlider';

const themeItems = [
  { label: 'Day', value: 'light' },
  { label: 'Night', value: 'dark' },
  { label: 'Honey', value: 'theme-honey' },
  { label: 'Sage', value: 'theme-sage' },
  { label: 'Eggplant', value: 'theme-eggplant' },
  { label: 'Brick', value: 'theme-brick' },
  { label: 'River', value: 'theme-river' },
  { label: 'Granite', value: 'theme-granite' },
];

type AppearanceViewProps = {
  stagedFontSize: number;
  setStagedFontSize: (value: number) => void;
  stagedShowImages: boolean;
  setStagedShowImages: (value: boolean) => void;
  stagedTheme: ThemeName;
  setGlobalTheme: (value: ThemeName) => void;
};

export function AppearanceView({
  stagedFontSize,
  setStagedFontSize,
  stagedShowImages,
  setStagedShowImages,
  stagedTheme,
  setGlobalTheme,
}: AppearanceViewProps) {
  const { colors } = useAppSettings();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        {stagedShowImages && (
          <Image
            source="https://cdn.pixabay.com/photo/2021/03/11/02/57/mountain-6086083_640.jpg"
            style={styles.image}
          />
        )}
        <View style={styles.cardContent}>
          <Text style={[styles.previewText, { fontSize: stagedFontSize, color: colors.foreground }]}>
            This is how the text will look. Adjust the slider below to change the size.
          </Text>
          <View style={styles.buttonPreviewContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Primary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.buttonText, { color: colors.secondaryForeground }]}>Secondary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.accent }]}>
              <Text style={[styles.buttonText, { color: colors.accentForeground }]}>Accent</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <FontSizeSlider
          currentSize={stagedFontSize}
          onSizeChange={setStagedFontSize}
          sizeOptions={FONT_SIZES}
        />
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.foreground }]}>Show Images</Text>
          <Switch
            value={stagedShowImages}
            onValueChange={setStagedShowImages}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor={stagedShowImages ? colors.card : ''}
          />
        </View>
        <CustomPicker
          label="Theme"
          selectedValue={stagedTheme}
          onValueChange={(value) => setGlobalTheme(value as ThemeName)}
          items={themeItems}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 32,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  previewText: {},
  controls: {
    gap: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  buttonPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});