import { ColorTheme } from '@/constants/Colors';
import { useWordTranslation } from '@/hooks/useWordTranslation';
import React, { useMemo } from 'react';
import { ActivityIndicator, Button, Dimensions, StyleSheet, Text, View } from 'react-native';

type TranslationPopoverProps = {
  isVisible: boolean;
  selectedWord: string;
  contentLanguage: string;
  translationLanguage: string;
  context: string | null;
  onLearnMore: () => void;
  colors: ColorTheme;
};

export function TranslationPopover({
  isVisible,
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
      top: Dimensions.get('window').height * 0.1,
      width: Dimensions.get('window').width * 0.8,
      alignSelf: 'center',
      backgroundColor: colors.popover,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 10,
    },
    content: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      gap: 4,
    },
    originalWordText: {
      color: colors.mutedForeground,
      fontSize: 18,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
      marginHorizontal: 12,
    },
    translationText: {
      color: colors.popoverForeground,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    errorText: {
      color: colors.destructive,
      textAlign: 'center',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 4,
    },
  }), [colors]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.popover}>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.foreground} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {translation && (
          <>
            <Text style={styles.originalWordText}>{selectedWord}</Text>
            <View style={styles.separator} />
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