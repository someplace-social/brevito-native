import { useAppSettings } from '@/hooks/useAppSettings';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FontSizeStepperProps = {
  currentSize: number;
  onSizeChange: (size: number) => void;
  sizeOptions: readonly number[];
};

export function FontSizeStepper({ currentSize, onSizeChange, sizeOptions }: FontSizeStepperProps) {
  const { colors } = useAppSettings();
  const currentIndex = sizeOptions.indexOf(currentSize);

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
    track: {
      flex: 1,
      height: 4,
      backgroundColor: colors.secondary,
      borderRadius: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progress: {
      position: 'absolute',
      height: 4,
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    step: {
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.secondary,
      zIndex: 1,
    },
    activeDot: {
      backgroundColor: colors.primary,
    },
  }), [colors]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Font Size</Text>
      <View style={styles.container}>
        <Text style={styles.smallA}>A</Text>
        <View style={styles.track}>
          {sizeOptions.map((size, index) => (
            <TouchableOpacity
              key={size}
              style={styles.step}
              onPress={() => onSizeChange(size)}
              hitSlop={{ top: 10, bottom: 10 }}>
              <View style={[styles.dot, index <= currentIndex && styles.activeDot]} />
            </TouchableOpacity>
          ))}
          <View
            style={[
              styles.progress,
              { width: `${(currentIndex / (sizeOptions.length - 1)) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.largeA}>A</Text>
      </View>
    </View>
  );
}