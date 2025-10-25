import { FactCard } from '@/components/FactCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_FACTS = [
  {
    id: '1',
    category: 'Science',
    subcategory: 'Physics',
    imageUrl: 'https://cdn.pixabay.com/photo/2021/03/11/02/57/mountain-6086083_640.jpg',
    content: 'The speed of light in a vacuum is exactly 299,792,458 meters per second.',
  },
  {
    id: '2',
    category: 'History',
    subcategory: null,
    imageUrl: 'https://cdn.pixabay.com/photo/2017/08/06/12/02/people-2591874_640.jpg',
    content: 'The Great Wall of China is not a single continuous wall but a system of fortifications.',
  },
  {
    id: '3',
    category: 'Animals',
    subcategory: 'Marine Life',
    imageUrl: 'https://cdn.pixabay.com/photo/2016/11/29/04/19/ocean-1867285_640.jpg',
    content: 'An octopus has three hearts; two pump blood through the gills, and the third pumps it to the rest of the body.',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Brevito</Text>
            <Text style={styles.subtitle}>Learn while you doomscroll</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <IconSymbol name="menu" size={32} color={Colors.dark.foreground} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={MOCK_FACTS}
          renderItem={({ item }) => (
            <FactCard
              category={item.category}
              subcategory={item.subcategory}
              imageUrl={item.imageUrl}
              content={item.content}
              showImages={true}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.mutedForeground,
  },
  menuButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
});