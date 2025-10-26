import { ColorTheme } from '@/constants/Colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useExtendedFact } from '@/hooks/useExtendedFact';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TranslationPopover } from './TranslationPopover';
import { IconSymbol } from './ui/icon-symbol';
import { SelectableText } from './ui/SelectableText';
import { WordAnalysisDrawer } from './WordAnalysisDrawer';

type ExtendedFactSheetProps = {
  factId: string | null;
  isVisible: boolean;
  onClose: () => void;
  language: string;
  level: string;
  showImages: boolean;
  fontSize: number;
  colors: ColorTheme;
};

type PopoverState = {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  selectedWord: string;
};

export function ExtendedFactSheet({
  factId,
  isVisible,
  onClose,
  language,
  level,
  showImages,
  fontSize,
  colors,
}: ExtendedFactSheetProps) {
  const contentRef = useRef<View>(null);
  const { translationLanguage } = useAppSettings();
  const { data, isLoading, error } = useExtendedFact({ factId, language, level });
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isVisible: false,
    position: null,
    selectedWord: '',
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [wordToAnalyze, setWordToAnalyze] = useState('');

  const handleOpenSource = () => {
    if (data?.source_url) {
      WebBrowser.openBrowserAsync(data.source_url);
    }
  };

  const handleWordSelect = (word: string, wordRef: React.RefObject<View | null>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    contentRef.current?.measure((_fx, _fy, _width, _height, px, py) => {
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
    },
    scrollContent: {
      padding: 16,
    },
    content: {
      gap: 24,
    },
    image: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: 12,
    },
    categoryText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    contentText: {
      color: colors.foreground,
      lineHeight: 28,
    },
    sourceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sourceText: {
      color: colors.mutedForeground,
      fontSize: 14,
    },
    errorText: {
      color: colors.destructive,
      textAlign: 'center',
    },
  }), [colors]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.title}>Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {isLoading && <ActivityIndicator size="large" color={colors.primary} />}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {data && (
              <Pressable onPress={handleClosePopover}>
                <View style={styles.content} ref={contentRef}>
                  {popoverState.isVisible && (
                    <TranslationPopover
                      isVisible={popoverState.isVisible}
                      position={popoverState.position}
                      selectedWord={popoverState.selectedWord}
                      contentLanguage={language}
                      translationLanguage={translationLanguage}
                      context={data.content}
                      onLearnMore={handleLearnMore}
                      colors={colors}
                    />
                  )}
                  {showImages && data.image_url && (
                    <Image source={{ uri: data.image_url }} style={styles.image} />
                  )}
                  {data.category && (
                    <Text style={styles.categoryText}>
                      {data.category}
                      {data.subcategory && ` > ${data.subcategory}`}
                    </Text>
                  )}
                  {data.content && (
                    <SelectableText
                      text={data.content}
                      onWordSelect={handleWordSelect}
                      style={[styles.contentText, { fontSize }]}
                    />
                  )}
                  {data.source && data.source_url && (
                    <TouchableOpacity onPress={handleOpenSource} style={styles.sourceButton}>
                      <Text style={styles.sourceText}>Source: {data.source}</Text>
                      <IconSymbol name="arrow.up.right" size={14} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
      <WordAnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        selectedText={wordToAnalyze}
        sourceLanguage={language}
        targetLanguage={translationLanguage}
        colors={colors}
      />
    </Modal>
  );
}