import { ColorTheme } from '@/constants/Colors';
import { useWordTranslation } from '@/hooks/useWordTranslation';
import React, { useMemo } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

type PopoverPosition = {
  top: number;
  left: number;
};

type TranslationPopoverProps = {
  isVisible: boolean;
  position: PopoverPosition | null;
  selectedWord: string;
  contentLanguage: string;
  translationLanguage: string;
  context: string | null;
  onLearnMore: () => void;
  colors: ColorTheme;
};

export function TranslationPopover({
  isVisible,
  position,
  selectedWord,
  contentLanguage,
  translationLanguage,
  context,
  onLearnMore,
  colors,
}: TranslationPopoverProps) {
  const { translation, isLoading, error } = useWordTranslation({
    word: selectedWord,
    sourceLanguage: contentLanguage,
    targetLanguage: translationLanguage,
    context,
    enabled: isVisible,
  });

  const styles = useMemo(() => StyleSheet.create({
    popover: {
      position: 'absolute',
      backgroundColor: colors.popover,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      minWidth: 150,
      maxWidth: 250,
      zIndex: 10,
    },
    content: {
      padding: 12,
      gap: 4,
    },
    originalWordText: {
      color: colors.mutedForeground,
      fontSize: 16,
      fontStyle: 'italic',
    },
    translationText: {
      color: colors.popoverForeground,
      fontSize: 20,
      fontWeight: 'bold',
    },
    errorText: {
      color: colors.destructive,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 4,
    },
  }), [colors]);

  if (!isVisible || !position) {
    return null;
  }

  return (
    <View style={[styles.popover, { top: position.top, left: position.left }]}>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.foreground} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {translation && (
          <>
            <Text style={styles.originalWordText}>{selectedWord}</Text>
            <Text style={styles.translationText}>{translation}</Text>
          </>
        )}
      </View>
      <View style={styles.footer}>
        <Button title="Learn More" onPress={onLearnMore} color={colors.primary} />
      </View>
    </View>
  );
}