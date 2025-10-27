import { ColorTheme } from '@/constants/Colors';
import { useWordTranslation } from '@/hooks/useWordTranslation';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type TranslationPopoverProps = {
  isVisible: boolean;
  selectedWord: string;
  contentLanguage: string;
  translationLanguage: string;
  context: string | null;
  onLearnMore: () => void;
  onClose: () => void;
  colors: ColorTheme;
};

export function TranslationPopover({
  isVisible,
  selectedWord,
  contentLanguage,
  translationLanguage,
  context,
  onLearnMore,
  onClose,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
      justifyContent: 'flex-start',
      paddingTop: 96,
    },
    popover: {
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
      overflow: 'hidden',
    },
    content: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      gap: 4,
    },
    originalWordText: {
      color: colors.mutedForeground,
      fontSize: 18,
      fontStyle: 'italic',
      textAlign: 'left',
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    translationText: {
      color: colors.popoverForeground,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    errorText: {
      color: colors.destructive,
      textAlign: 'center',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    learnMoreButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
    },
    learnMoreButtonText: {
      color: colors.primaryForeground,
      fontWeight: '600',
      fontSize: 16,
      textAlign: 'center',
    },
  }), [colors]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable>
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
              <TouchableOpacity onPress={onLearnMore} style={styles.learnMoreButton}>
                <Text style={styles.learnMoreButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}