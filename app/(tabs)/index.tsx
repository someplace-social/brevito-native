import { FactCard } from '@/components/FactCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { useFactFeed } from '@/hooks/useFactFeed';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { facts, isLoading, hasMore, loadMore, error } = useFactFeed();

  const renderFooter = () => {
    if (!hasMore && facts.length > 0) {
      return (
        <Text style={styles.footerText}>You've reached the end!</Text>
      );
    }
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.dark.primary} style={styles.spinner} />;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Brevito</Text>
            <Text style={styles.subtitle}>Learn while you doomscroll</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <IconSymbol name="line.3.horizontal" size={32} color={Colors.dark.foreground} />
          </TouchableOpacity>
        </View>
        {error ? (
          <View style={styles.centeredMessage}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={facts}
            renderItem={({ item }) => (
              <FactCard
                factId={item.id}
                category={item.category}
                subcategory={item.subcategory}
                imageUrl={item.image_url}
                showImages={true}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        )}
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
  spinner: {
    marginVertical: 20,
  },
  footerText: {
    textAlign: 'center',
    color: Colors.dark.mutedForeground,
    marginVertical: 20,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});