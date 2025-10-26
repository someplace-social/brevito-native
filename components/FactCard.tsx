import { ColorTheme } from '@/constants/Colors';
import { useFactContent } from '@/hooks/useFactContent';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { TranslationPopover } from './TranslationPopover';
import { IconSymbol } from './ui/icon-symbol';
import { SelectableText } from './ui/SelectableText';
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

type PopoverState = {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  selectedWord: string;
};

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
  const cardRef = useRef<View>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const lastValidSelection = useRef<{ start: number; end: number } | undefined>(undefined);
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isVisible: false,
    position: null,
    selectedWord: '',
  });

  const { content, error, isLoading } = useFactContent({
    factId,
    language: contentLanguage,
    level: level,
    isIntersecting,
  });

  const handleSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    const currentSelection = event.nativeEvent.selection;
    if (currentSelection.start !== currentSelection.end) {
      lastValidSelection.current = currentSelection;
    }
  };

  const handlePressOut = (event: NativeSyntheticEvent<any>) => {
    const finalSelection = lastValidSelection.current;
    if (finalSelection && finalSelection.start !== finalSelection.end && content) {
      const selectedText = content.substring(finalSelection.start, finalSelection.end).trim();
      if (selectedText) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        cardRef.current?.measure((_fx, _fy, _width, _height, px, py) => {
          setPopoverState({
            isVisible: true,
            selectedWord: selectedText,
            position: {
              top: event.nativeEvent.pageY - py - 60,
              left: event.nativeEvent.pageX - px,
            },
          });
        });
      }
      lastValidSelection.current = undefined;
    }
  };

  const handleClosePopover = () => {
    setPopoverState({ isVisible: false, position: null, selectedWord: '' });
  };

  const handleLearnMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleClosePopover();
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
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
      padding: 0,
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
    <View ref={cardRef}>
      <Pressable onPress={handleClosePopover}>
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
              <SelectableText
                value={content}
                onSelectionChange={handleSelectionChange}
                onPressOut={handlePressOut}
                style={[styles.contentText, { fontSize }]}
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
      </Pressable>
      <TranslationPopover
        isVisible={popoverState.isVisible}
        position={popoverState.position}
        selectedWord={popoverState.selectedWord}
        contentLanguage={contentLanguage}
        translationLanguage={translationLanguage}
        context={content}
        onLearnMore={handleLearnMore}
        colors={colors}
      />
      <WordAnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        selectedText={popoverState.selectedWord}
        sourceLanguage={contentLanguage}
        targetLanguage={translationLanguage}
        context={content}
        colors={colors}
      />
    </View>
  );
}