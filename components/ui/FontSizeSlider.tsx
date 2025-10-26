import { useAppSettings } from '@/hooks/useAppSettings';
import Slider from '@react-native-community/slider';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type FontSizeSliderProps = {
  currentSize: number;
  onSizeChange: (size: number) => void;
  sizeOptions: readonly number[];
};

export function FontSizeSlider({ currentSize, onSizeChange, sizeOptions }: FontSizeSliderProps) {
  const { colors } = useAppSettings();
  const minIndex = 0;
  const maxIndex = sizeOptions.length - 1;
  const currentIndex = sizeOptions.indexOf(currentSize);

  const handleValueChange = (index: number) => {
    onSizeChange(sizeOptions[Math.round(index)]);
  };

  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      gap: 8,
    },
    label: {
      color: colors.foreground,
      fontSize: 16,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    smallA: {
      color: colors.foreground,
      fontSize: 14,
    },
    largeA: {
      color: colors.foreground,
      fontSize: 20,
    },
    slider: {
      flex: 1,
      height: 40,
    },
  }), [colors]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Font Size</Text>
      <View style={styles.container}>
        <Text style={styles.smallA}>A</Text>
        <Slider
          style={styles.slider}
          minimumValue={minIndex}
          maximumValue={maxIndex}
          step={1}
          value={currentIndex}
          onValueChange={handleValueChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.secondary}
          thumbTintColor={colors.primary}
        />
        <Text style={styles.largeA}>A</Text>
      </View>
    </View>
  );
}