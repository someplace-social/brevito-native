import { ColorTheme } from '@/constants/Colors';
import { useFactContent } from '@/hooks/useFactContent';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { WordAnalysisDrawer } from './WordAnalysisDrawer';

type FactCardProps = {
  factId: string;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  showImages: boolean;
  isIntersecting: boolean;
  contentLanguage: string;
  translationLanguage: string;
  level: string;
  onReadMore: (factId: string) => void;
  onCategoryFilter: (category: string) => void;
  fontSize: number;
  colors: ColorTheme;
};

// Type assertion to bypass incorrect official type definitions
const SelectableInput = TextInput as any;

export function FactCard({
  factId,
  category,
  subcategory,
  imageUrl,
  showImages,
  isIntersecting,
  contentLanguage,
  translationLanguage,
  level,
  onReadMore,
  onCategoryFilter,
  fontSize,
  colors,
}: FactCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [wordToAnalyze, setWordToAnalyze] = useState('');
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>();

  const { content, error, isLoading } = useFactContent({
    factId,
    language: contentLanguage,
    level: level,
    isIntersecting,
  });

  const handleSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    setSelection(event.nativeEvent.selection);
  };

  const handleTouchEnd = () => {
    if (selection && selection.start !== selection.end && content) {
      const selectedText = content.substring(selection.start, selection.end).trim();
      if (selectedText) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setWordToAnalyze(selectedText);
        setIsDrawerOpen(true);
      }
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setWordToAnalyze('');
  };

  const handleCategoryPress = (cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCategoryFilter(cat);
  };

  const handleReadMorePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReadMore(factId);
  };

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      minHeight: 100,
    },
    image: {
      width: '100%',
      aspectRatio: 16 / 9,
    },
    contentContainer: {
      padding: 16,
      gap: 12,
    },
    categoryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    contentText: {
      color: colors.foreground,
      lineHeight: 26,
      padding: 0, // Reset padding for TextInput
      margin: 0,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 16,
    },
    footerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 4,
    },
    readMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    readMoreText: {
      color: colors.mutedForeground,
      fontSize: 14,
    },
  }), [colors]);

  return (
    <View>
      <View style={styles.card}>
        {showImages && imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        )}
        <View style={styles.contentContainer}>
          {category && (
            <View style={styles.categoryContainer}>
              <TouchableOpacity onPress={() => handleCategoryPress(category)}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
              {subcategory && (
                <>
                  <Text style={styles.categoryText}> &gt; </Text>
                  <TouchableOpacity onPress={() => handleCategoryPress(category)}>
                    <Text style={styles.categoryText}>{subcategory}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
          {isLoading && <ActivityIndicator color={colors.primary} />}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {content && (
            <SelectableInput
              value={content}
              editable
              onChangeText={() => {}}
              multiline
              selectable
              contextMenuHidden
              onSelectionChange={handleSelectionChange}
              onTouchEnd={handleTouchEnd}
              style={[styles.contentText, { fontSize }]}
              scrollEnabled={false}
            />
          )}
        </View>
        <TouchableOpacity onPress={handleReadMorePress} style={styles.footerContainer}>
          <View style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read More</Text>
            <IconSymbol name="arrow.up.right" size={12} color={colors.mutedForeground} />
          </View>
        </TouchableOpacity>
      </View>
      <WordAnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        selectedText={wordToAnalyze}
        sourceLanguage={contentLanguage}
        targetLanguage={translationLanguage}
        context={content}
        colors={colors}
      />
    </View>
  );
}