import { AVAILABLE_CATEGORIES, useAppSettings } from '@/hooks/useAppSettings';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Toggle } from '../ui/Toggle';

type TopicsViewProps = {
  stagedCategories: string[];
  setStagedCategories: React.Dispatch<React.SetStateAction<string[]>>;
};

export function TopicsView({ stagedCategories, setStagedCategories }: TopicsViewProps) {
  const { colors } = useAppSettings();

  const handleCategoryToggle = (category: string) => {
    setStagedCategories((currentCategories) => {
      const isCurrentlySelected = currentCategories.includes(category);
      if (isCurrentlySelected && currentCategories.length === 1) {
        return currentCategories;
      }
      if (isCurrentlySelected) {
        return currentCategories.filter((c) => c !== category);
      } else {
        return [...currentCategories, category];
      }
    });
  };

  const handleDeselectAll = () => {
    setStagedCategories((currentCategories) => {
      return currentCategories.length > 1 ? [currentCategories[0]] : currentCategories;
    });
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },
    toggleContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 16,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: colors.secondary,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.secondaryForeground,
      fontSize: 16,
      fontWeight: '600',
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        {AVAILABLE_CATEGORIES.map((category) => (
          <Toggle
            key={category}
            pressed={stagedCategories.includes(category)}
            disabled={stagedCategories.length === 1 && stagedCategories.includes(category)}
            onPressedChange={() => handleCategoryToggle(category)}>
            {category}
          </Toggle>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setStagedCategories(AVAILABLE_CATEGORIES)}>
          <Text style={styles.buttonText}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDeselectAll}>
          <Text style={styles.buttonText}>Deselect All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}