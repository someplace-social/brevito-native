import { ColorTheme } from '@/constants/Colors';
import { MeaningAnalysis, useWordAnalysis } from '@/hooks/useWordAnalysis';
import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
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
  colors,
}: WordAnalysisDrawerProps) {
  const { analysis, isLoading, error } = useWordAnalysis({
    word: selectedText,
    sourceLanguage,
    targetLanguage,
    enabled: isOpen,
  });

  // --- DIAGNOSTIC LOGGING ---
  useEffect(() => {
    if (isOpen) {
      console.log('--- Word Analysis Drawer ---');
      console.log('Is Loading:', isLoading);
      console.log('Error:', error);
      console.log('Analysis Data:', JSON.stringify(analysis, null, 2));
      console.log('--------------------------');
    }
  }, [isOpen, isLoading, error, analysis]);
  // -------------------------

  const styles = useMemo(() => StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    safeArea: {
      height: '90%',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      overflow: 'hidden',
    },
    contentWrapper: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.foreground,
      textTransform: 'capitalize',
    },
    closeButton: {
      position: 'absolute',
      right: 16,
      top: 16,
    },
    scrollContent: {
      padding: 16,
    },
    analysisContainer: {
      gap: 32,
    },
    rootWordContainer: {
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
      marginBottom: 4,
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
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }
  }), [colors]);

  return (
    <Modal animationType="slide" transparent visible={isOpen} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentWrapper}>
            <View style={styles.header}>
              <Text style={styles.title}>{selectedText}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {isLoading && (
                <View style={styles.centered}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
              {error && <Text style={styles.errorText}>{error}</Text>}
              {analysis && (
                <View style={styles.analysisContainer}>
                  {analysis.rootWord && selectedText.toLowerCase() !== analysis.rootWord.toLowerCase() && (
                    <View style={styles.rootWordContainer}>
                      <Text style={styles.sectionTitle}>ROOT</Text>
                      <Text style={styles.rootWordText}>{analysis.rootWord}</Text>
                    </View>
                  )}
                  {analysis.analysis?.map((item: MeaningAnalysis, index: number) => (
                    <View key={index} style={styles.meaningBlock}>
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
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}