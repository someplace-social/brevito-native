import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { StyleSheet, Switch, Text, View } from 'react-native';
// We will create a custom Slider component later. For now, we'll use placeholders.

type AppearanceViewProps = {
  stagedFontSize: string;
  setStagedFontSize: (value: string) => void;
  stagedShowImages: boolean;
  setStagedShowImages: (value: boolean) => void;
};

export function AppearanceView({
  stagedFontSize,
  setStagedFontSize,
  stagedShowImages,
  setStagedShowImages,
}: AppearanceViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {stagedShowImages && (
          <Image
            source="https://cdn.pixabay.com/photo/2021/03/11/02/57/mountain-6086083_640.jpg"
            style={styles.image}
          />
        )}
        <View style={styles.cardContent}>
          <Text style={styles.previewText}>
            This is how the text will look. Adjust the slider below to change the size.
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.row}>
          <Text style={styles.label}>Font Size</Text>
          <Text style={styles.value}>{stagedFontSize}</Text>
        </View>
        <View style={[styles.row, styles.switchRow]}>
          <Text style={styles.label}>Show Images</Text>
          <Switch
            value={stagedShowImages}
            onValueChange={setStagedShowImages}
            trackColor={{ false: Colors.dark.muted, true: Colors.dark.primary }}
            thumbColor={Colors.dark.foreground}
          />
        </View>
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
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  cardContent: {
    padding: 16,
  },
  previewText: {
    color: Colors.dark.foreground,
    fontSize: 16,
  },
  controls: {
    gap: 24,
  },
  row: {
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: Colors.dark.foreground,
    fontSize: 16,
  },
  value: {
    color: Colors.dark.mutedForeground,
    fontSize: 16,
  },
});