import { ColorTheme } from '@/constants/Colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useExtendedFact } from '@/hooks/useExtendedFact';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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
  View
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
  const { translationLanguage } = useAppSettings();
  const { data, isLoading, error } = useExtendedFact({ factId, language, level });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const lastValidSelection = useRef<{ start: number; end: number } | undefined>(undefined);
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

  const handleClosePopover = () => {
    setPopoverState({ isVisible: false, position: null, selectedWord: '' });
    lastValidSelection.current = undefined;
  };

  const handlePressOut = (event: NativeSyntheticEvent<any>) => {
    const finalSelection = lastValidSelection.current;

    if (finalSelection && finalSelection.start !== finalSelection.end && data?.content) {
      const selectedText = data.content.substring(finalSelection.start, finalSelection.end).trim();
      if (selectedText) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const POPOVER_MAX_WIDTH = 250;
        const POPOVER_ESTIMATED_HEIGHT = 100;
        const VERTICAL_MARGIN = 10;
        const HORIZONTAL_MARGIN = 16;
        const HEADER_HEIGHT = Platform.OS === 'android' ? 80 : 96;

        const touchX = event.nativeEvent.pageX;
        const touchY = event.nativeEvent.pageY;

        let left = touchX - POPOVER_MAX_WIDTH / 2;
        if (left < HORIZONTAL_MARGIN) {
          left = HORIZONTAL_MARGIN;
        }
        if (left + POPOVER_MAX_WIDTH > screenWidth - HORIZONTAL_MARGIN) {
          left = screenWidth - POPOVER_MAX_WIDTH - HORIZONTAL_MARGIN;
        }

        let top = touchY - POPOVER_ESTIMATED_HEIGHT - VERTICAL_MARGIN;
        if (top < HEADER_HEIGHT) {
          top = touchY + 20;
        }
        if (top + POPOVER_ESTIMATED_HEIGHT > screenHeight) {
          top = screenHeight - POPOVER_ESTIMATED_HEIGHT - VERTICAL_MARGIN;
        }

        setPopoverState({ isVisible: true, selectedWord: selectedText, position: { top, left } });
      }
      lastValidSelection.current = undefined;
    } else if (popoverState.isVisible) {
      handleClosePopover();
    }
  };

  const handleLearnMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsDrawerOpen(true);
    setPopoverState(prev => ({ ...prev, isVisible: false }));
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setPopoverState({ isVisible: false, position: null, selectedWord: '' });
    lastValidSelection.current = undefined;
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

  const textInputProps = {
    value: data?.content,
    multiline: true,
    onSelectionChange: handleSelectionChange,
    onPressOut: handlePressOut,
    style: [styles.contentText, { fontSize }],
    scrollEnabled: false,
    contextMenuHidden: true,
    editable: true,
    showSoftInputOnFocus: false,
    selectable: true,
    caretHidden: true,
    cursorColor: 'transparent',
  };

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
                <View style={styles.content}>
                  {showImages && data.image_url && (
                    <Image source={{ uri: data.image_url }} style={styles.image} />
                  )}
                  {data.category && (
                    <Text style={styles.categoryText}>
                      {data.category}
                      {data.subcategory && ` > ${data.subcategory}`}
                    </Text>
                  )}
                  {data.content && <TextInput {...(textInputProps as any)} />}
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
        {data && (
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