import { ColorTheme } from '@/constants/Colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useFactContent } from '@/hooks/useFactContent';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { theme } = useAppSettings();
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isVisible: false,
    position: null,
    selectedWord: '',
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [wordToAnalyze, setWordToAnalyze] = useState('');

  const { content, error, isLoading } = useFactContent({
    factId,
    language: contentLanguage,
    level: level,
    isIntersecting,
  });

  const handleWordSelect = (word: string, wordRef: React.RefObject<View | null>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cardRef.current?.measure((_fx, _fy, _width, _height, px, py) => {
      wordRef.current?.measure((_wfx, _wfy, _wWidth, wHeight, wpx, wpy) => {
        setPopoverState({
          isVisible: true,
          selectedWord: word,
          position: {
            top: wpy - py - wHeight - 10,
            left: wpx - px,
          },
        });
      });
    });
  };

  const handleClosePopover = () => {
    setPopoverState({ isVisible: false, position: null, selectedWord: '' });
  };

  const handleLearnMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWordToAnalyze(popoverState.selectedWord);
    handleClosePopover();
    setIsDrawerOpen(true);
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
      borderWidth: theme === 'light' ? 0 : 1,
      borderColor: colors.border,
      overflow: 'hidden',
      minHeight: 100,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === 'light' ? 0.1 : 0,
          shadowRadius: 4,
        },
        android: {
          elevation: theme === 'light' ? 4 : 0,
        },
      }),
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
    },
    errorText: {
      color: colors.destructive,
      fontSize: 16,
    },
    footerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
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
  }), [colors, theme]);

  return (
    <View ref={cardRef}>
      <Pressable onPress={handleClosePopover} style={styles.card}>
        {popoverState.isVisible && (
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
        )}
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
              text={content}
              onWordSelect={handleWordSelect}
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
      </Pressable>
      <WordAnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        selectedText={wordToAnalyze}
        sourceLanguage={contentLanguage}
        targetLanguage={translationLanguage}
        colors={colors}
      />
    </View>
  );
}