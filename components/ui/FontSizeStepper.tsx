import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FontSizeStepperProps = {
  currentSize: number;
  onSizeChange: (size: number) => void;
  sizeOptions: readonly number[];
};

export function FontSizeStepper({ currentSize, onSizeChange, sizeOptions }: FontSizeStepperProps) {
  const currentIndex = sizeOptions.indexOf(currentSize);

  const handleDecrement = () => {
    if (currentIndex > 0) {
      onSizeChange(sizeOptions[currentIndex - 1]);
    }
  };

  const handleIncrement = () => {
    if (currentIndex < sizeOptions.length - 1) {
      onSizeChange(sizeOptions[currentIndex + 1]);
    }
  };

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

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: Colors.dark.foreground,
    fontSize: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallA: {
    color: Colors.dark.foreground,
    fontSize: 14,
  },
  largeA: {
    color: Colors.dark.foreground,
    fontSize: 20,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.dark.secondary,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progress: {
    position: 'absolute',
    height: 4,
    backgroundColor: Colors.dark.primary,
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
    backgroundColor: Colors.dark.secondary,
    zIndex: 1,
  },
  activeDot: {
    backgroundColor: Colors.dark.primary,
  },
});