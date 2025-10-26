import { ColorTheme } from '@/constants/Colors';
import { useWordAnalysis } from '@/hooks/useWordAnalysis';
import { useWordTranslation } from '@/hooks/useWordTranslation';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

type WordAnalysisDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  context: string | null;
  colors: ColorTheme;
};

const UnderlinedSentence = ({ sentence, word, style }: { sentence: string; word: string; style: StyleProp<TextStyle> }) => {
  if (!word || !sentence) return <Text>{sentence}</Text>;
  const parts = sentence.split(new RegExp(`(${word})`, 'gi'));
  return (
    <Text>
      {parts.map((part, index) =>
        part.toLowerCase() === word.toLowerCase() ? (
          <Text key={index} style={style}>
            {part}
          </Text>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </Text>
  );
};

export function WordAnalysisDrawer({
  isOpen,
  onClose,
  selectedText,
  sourceLanguage,
  targetLanguage,
  context,
  colors,
}: WordAnalysisDrawerProps) {
  const {
    translation,
    isLoading: isTranslationLoading,
    error: translationError,
  } = useWordTranslation({
    word: selectedText,
    sourceLanguage,
    targetLanguage,
    context,
    enabled: isOpen,
  });

  const {
    analysis,
    isLoading: isAnalysisLoading,
    error: analysisError,
  } = useWordAnalysis({
    word: selectedText,
    sourceLanguage,
    targetLanguage,
    enabled: isOpen,
  });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: Platform.OS === 'android' ? 64 : 48,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      position: 'absolute',
      left: 16,
      top: Platform.OS === 'android' ? 64 : 48,
      zIndex: 1,
    },
    closeButton: {
      position: 'absolute',
      right: 16,
      top: Platform.OS === 'android' ? 64 : 48,
      zIndex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.foreground,
      textTransform: 'capitalize',
      textAlign: 'center',
      marginHorizontal: 48,
    },
    scrollContent: {
      padding: 16,
    },
    analysisContainer: {
      gap: 32,
    },
    translationContainer: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      color: colors.mutedForeground,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    mainTranslationText: {
      color: colors.primary,
      fontSize: 28,
      fontWeight: 'bold',
    },
    rootWordContainer: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rootWordText: {
      color: colors.foreground,
      fontSize: 18,
      fontStyle: 'italic',
    },
    meaningBlock: {
      gap: 8,
    },
    translationText: {
      color: colors.foreground,
      fontSize: 22,
      fontWeight: 'bold',
    },
    posText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontStyle: 'italic',
      textTransform: 'capitalize',
    },
    exampleContainer: {
      marginTop: 8,
      paddingLeft: 12,
      borderLeftWidth: 2,
      borderLeftColor: colors.primary,
      gap: 4,
    },
    exampleSentence: {
      color: colors.foreground,
      fontSize: 16,
      fontStyle: 'italic',
    },
    exampleTranslation: {
      color: colors.mutedForeground,
      fontSize: 16,
    },
    underline: {
      textDecorationLine: 'underline',
    },
    errorText: {
      color: colors.destructive,
      textAlign: 'center',
      padding: 8,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isOpen}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{selectedText}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.analysisContainer}>
              <View style={styles.translationContainer}>
                <Text style={styles.sectionTitle}>Translation</Text>
                {isTranslationLoading && <ActivityIndicator color={colors.primary} />}
                {translationError && <Text style={styles.errorText}>{translationError}</Text>}
                {translation && <Text style={styles.mainTranslationText}>{translation}</Text>}
              </View>

              {isAnalysisLoading && <ActivityIndicator color={colors.primary} />}
              {analysisError && <Text style={styles.errorText}>{analysisError}</Text>}
              {analysis && (
                <>
                  {analysis.rootWord && selectedText.toLowerCase() !== analysis.rootWord.toLowerCase() && (
                    <View>
                      <Text style={styles.sectionTitle}>ROOT</Text>
                      <Text style={styles.rootWordText}>{analysis.rootWord}</Text>
                    </View>
                  )}
                  {analysis.analysis?.map((item, index) => (
                    <View key={index} style={styles.meaningBlock}>
                      <Text style={styles.sectionTitle}>{`Meaning ${index + 1}`}</Text>
                      <Text style={styles.translationText}>{item.translation}</Text>
                      <Text style={styles.posText}>{item.partOfSpeech}</Text>
                      <View style={styles.exampleContainer}>
                        <Text style={styles.exampleSentence}>
                          <UnderlinedSentence sentence={item.exampleSentence} word={selectedText} style={styles.underline} />
                        </Text>
                        <Text style={styles.exampleTranslation}>{item.exampleTranslation}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}