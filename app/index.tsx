import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
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
import { ExtendedFactSheet } from '../components/ExtendedFactSheet';
import { FactCard } from '../components/FactCard';
import { IconSymbol } from '../components/ui/icon-symbol';
import { useAppSettings } from '../hooks/useAppSettings';
import { useFactFeed } from '../hooks/useFactFeed';

export default function HomeScreen() {
  const router = useRouter();
  const {
    colors,
    settingsKey,
    selectedCategories,
    setSelectedCategories,
    contentLanguage,
    translationLanguage,
    level,
    showImages,
    fontSize,
  } = useAppSettings();

  const { facts, isLoading, hasMore, loadMore, error } = useFactFeed({
    settingsKey,
    selectedCategories,
    contentLanguage,
  });
  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const [extendedFactId, setExtendedFactId] = useState<string | null>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems: items }: { viewableItems: ViewToken[] }) => {
    setViewableItems(items.filter((item) => item.isViewable).map((item) => item.key as string));
  }, []);

  const itemsToPreload = useMemo(() => {
    if (viewableItems.length === 0 || facts.length === 0) {
      return [];
    }
    const lastViewableItemId = viewableItems[viewableItems.length - 1];
    const lastViewableIndex = facts.findIndex(fact => fact.id === lastViewableItemId);

    if (lastViewableIndex !== -1) {
      return facts
        .slice(lastViewableIndex + 1, lastViewableIndex + 1 + 3) // Preload next 3
        .map(fact => fact.id);
    }
    return [];
  }, [viewableItems, facts]);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

  const handleCategoryFilter = (category: string) => {
    if (category && (selectedCategories.length !== 1 || selectedCategories[0] !== category)) {
      setSelectedCategories([category]);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 32,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
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
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    menuButton: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: [{ translateY: 16 }],
    },
    listContent: {
      padding: 16,
      gap: 24,
    },
    spinner: {
      marginVertical: 20,
    },
    footerText: {
      textAlign: 'center',
      color: colors.mutedForeground,
      marginVertical: 20,
    },
    centeredMessage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    errorText: {
      color: colors.destructive,
      textAlign: 'center',
    },
  }), [colors]);

  const renderFooter = () => {
    if (!hasMore && facts.length > 0) {
      return <Text style={styles.footerText}>You've reached the end!</Text>;
    }
    if (isLoading && facts.length > 0) {
      return <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />;
    }
    return null;
  };

  if (isLoading && facts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color={colors.primary} />
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
            <IconSymbol name="line.3.horizontal" size={32} color={colors.foreground} />
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
                isIntersecting={viewableItems.includes(item.id) || itemsToPreload.includes(item.id)}
                contentLanguage={contentLanguage}
                translationLanguage={translationLanguage}
                level={level}
                onReadMore={setExtendedFactId}
                onCategoryFilter={handleCategoryFilter}
                fontSize={fontSize}
                colors={colors}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={1.5}
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
        fontSize={fontSize}
        colors={colors}
      />
    </SafeAreaView>
  );
}