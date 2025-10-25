import { Colors } from '@/constants/Colors';
import { useWordAnalysis } from '@/hooks/useWordAnalysis';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
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
};

const UnderlinedSentence = ({ sentence, word }: { sentence: string; word: string }) => {
  if (!word || !sentence) return <Text>{sentence}</Text>;
  const parts = sentence.split(new RegExp(`(${word})`, 'gi'));
  return (
    <Text>
      {parts.map((part, index) =>
        part.toLowerCase() === word.toLowerCase() ? (
          <Text key={index} style={styles.underline}>
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
}: WordAnalysisDrawerProps) {
  const { analysis, isLoading, error } = useWordAnalysis({
    word: selectedText,
    sourceLanguage,
    targetLanguage,
    enabled: isOpen,
  });

  return (
    <Modal animationType="slide" transparent={true} visible={isOpen} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>{selectedText}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color={Colors.dark.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {isLoading && <ActivityIndicator size="large" color={Colors.dark.primary} />}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {analysis && (
              <View style={styles.analysisContainer}>
                {analysis.rootWord && selectedText.toLowerCase() !== analysis.rootWord.toLowerCase() && (
                  <View style={styles.rootWordContainer}>
                    <Text style={styles.sectionTitle}>ROOT</Text>
                    <Text style={styles.rootWordText}>{analysis.rootWord}</Text>
                  </View>
                )}
                {analysis.analysis?.map((item, index) => (
                  <View key={index} style={styles.meaningBlock}>
                    <Text style={styles.translationText}>{item.translation}</Text>
                    <Text style={styles.posText}>{item.partOfSpeech}</Text>
                    <View style={styles.exampleContainer}>
                      <Text style={styles.exampleSentence}>
                        <UnderlinedSentence sentence={item.exampleSentence} word={selectedText} />
                      </Text>
                      <Text style={styles.exampleTranslation}>{item.exampleTranslation}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  safeArea: {
    height: '90%',
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
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
    borderBottomColor: Colors.dark.border,
  },
  sectionTitle: {
    color: Colors.dark.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rootWordText: {
    color: Colors.dark.foreground,
    fontSize: 18,
    fontStyle: 'italic',
  },
  meaningBlock: {
    gap: 8,
  },
  translationText: {
    color: Colors.dark.foreground,
    fontSize: 22,
    fontWeight: 'bold',
  },
  posText: {
    color: Colors.dark.mutedForeground,
    fontSize: 14,
    fontStyle: 'italic',
    textTransform: 'capitalize',
  },
  exampleContainer: {
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.dark.primary,
    gap: 4,
  },
  exampleSentence: {
    color: Colors.dark.foreground,
    fontSize: 16,
    fontStyle: 'italic',
  },
  exampleTranslation: {
    color: Colors.dark.mutedForeground,
    fontSize: 16,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});