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
  NativeSyntheticEvent,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { TranslationPopover } from './TranslationPopover';
import { IconSymbol } from './ui/icon-symbol';
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
  const sheetRef = useRef<View>(null);
  const { translationLanguage } = useAppSettings();
  const { data, isLoading, error } = useExtendedFact({ factId, language, level });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const lastValidSelection = useRef<{ start: number; end: number } | undefined>();
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isVisible: false,
    position: null,
    selectedWord: '',
  });

  const handleOpenSource = () => {
    if (data?.source_url) {
      WebBrowser.openBrowserAsync(data.source_url);
    }
  };

  const handleSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    const currentSelection = event.nativeEvent.selection;
    if (currentSelection.start !== currentSelection.end) {
      lastValidSelection.current = currentSelection;
    }
  };

  const handlePressOut = (event: NativeSyntheticEvent<any>) => {
    const finalSelection = lastValidSelection.current;
    if (finalSelection && finalSelection.start !== finalSelection.end && data?.content) {
      const selectedText = data.content.substring(finalSelection.start, finalSelection.end).trim();
      if (selectedText) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        sheetRef.current?.measure((_fx, _fy, _width, _height, px, py) => {
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
      padding: 0,
      margin: 0,
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
                <View style={styles.content} ref={sheetRef}>
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
                    <TextInput
                      // @ts-ignore
                      value={data.content}
                      multiline
                      onSelectionChange={handleSelectionChange}
                      onPressOut={handlePressOut}
                      style={[styles.contentText, { fontSize }]}
                      scrollEnabled={false}
                      contextMenuHidden
                      editable={Platform.OS !== 'ios'}
                      selectable
                      caretHidden={Platform.OS !== 'ios'}
                      showSoftInputOnFocus={Platform.OS === 'ios' ? undefined : false}
                    />
                  )}
                  {data.source && data.source_url && (
                    <TouchableOpacity onPress={handleOpenSource} style={styles.sourceButton}>
                      <Text style={styles.sourceText}>Source: {data.source}</Text>
                      <IconSymbol name="arrow.up.right" size={14} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
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
                </View>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
      <WordAnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        selectedText={popoverState.selectedWord}
        sourceLanguage={language}
        targetLanguage={translationLanguage}
        context={data?.content ?? null}
        colors={colors}
      />
    </Modal>
  );
}