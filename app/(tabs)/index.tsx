import { ExtendedFactSheet } from '@/components/ExtendedFactSheet';
import { FactCard } from '@/components/FactCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useFactFeed } from '@/hooks/useFactFeed';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { settingsKey, selectedCategories, contentLanguage, level, showImages } = useAppSettings();
  const { facts, isLoading, hasMore, loadMore, error } = useFactFeed({
    settingsKey,
    selectedCategories,
    contentLanguage,
  });
  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const [extendedFactId, setExtendedFactId] = useState<string | null>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems: items }: { viewableItems: ViewToken[] }) => {
    setViewableItems(items.map((item) => item.key as string));
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

  const renderFooter = () => {
    if (!hasMore && facts.length > 0) {
      return <Text style={styles.footerText}>You've reached the end!</Text>;
    }
    if (isLoading && facts.length > 0) {
      return <ActivityIndicator size="large" color={Colors.dark.primary} style={styles.spinner} />;
    }
    return null;
  };

  if (isLoading && facts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Brevito</Text>
            <Text style={styles.subtitle}>Learn while you doomscroll</Text>
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/settings' as any)}>
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
                showImages={showImages}
                isIntersecting={viewableItems.includes(item.id)}
                contentLanguage={contentLanguage}
                level={level}
                onReadMore={setExtendedFactId}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          />
        )}
      </View>
      <ExtendedFactSheet
        factId={extendedFactId}
        isVisible={!!extendedFactId}
        onClose={() => setExtendedFactId(null)}
        language={contentLanguage}
        level={level}
        showImages={showImages}
      />
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