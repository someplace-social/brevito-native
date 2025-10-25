import { Colors } from '@/constants/Colors';
import { useWordTranslation } from '@/hooks/useWordTranslation';
import React from 'react';
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
};

export function TranslationPopover({
  isVisible,
  position,
  selectedWord,
  contentLanguage,
  translationLanguage,
  context,
  onLearnMore,
}: TranslationPopoverProps) {
  const { translation, isLoading, error } = useWordTranslation({
    word: selectedWord,
    sourceLanguage: contentLanguage,
    targetLanguage: translationLanguage,
    context,
    enabled: isVisible,
  });

  if (!isVisible || !position) {
    return null;
  }

  return (
    <View style={[styles.popover, { top: position.top, left: position.left }]}>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={Colors.dark.foreground} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {translation && <Text style={styles.translationText}>{translation}</Text>}
      </View>
      {selectedWord && !selectedWord.includes(' ') && (
        <View style={styles.footer}>
          <Button title="Learn More" onPress={onLearnMore} color={Colors.dark.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  popover: {
    position: 'absolute',
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
  },
  translationText: {
    color: Colors.dark.foreground,
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    padding: 4,
  },
});