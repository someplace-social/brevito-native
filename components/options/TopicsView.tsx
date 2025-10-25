import { Colors } from '@/constants/Colors';
import { Button, StyleSheet, View } from 'react-native';
import { Toggle } from '../ui/Toggle';

const availableCategories = ["Science", "Technology", "Health", "History", "Business", "Society", "Art", "Sports", "Environment", "Culture", "Food", "Geography", "Psychology", "Animals", "Space", "Language", "Unusual"];

type TopicsViewProps = {
  stagedCategories: string[];
  setStagedCategories: React.Dispatch<React.SetStateAction<string[]>>;
};

export function TopicsView({ stagedCategories, setStagedCategories }: TopicsViewProps) {
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

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        {availableCategories.map((category) => (
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
        <Button title="Select All" onPress={() => setStagedCategories(availableCategories)} color={Colors.dark.primary} />
        <Button title="Deselect All" onPress={handleDeselectAll} color={Colors.dark.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
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
    borderTopColor: Colors.dark.border,
  },
});