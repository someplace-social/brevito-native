import { Colors } from '@/constants/Colors';
import { useFactContent } from '@/hooks/useFactContent';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TranslationPopover } from './TranslationPopover';
import { IconSymbol } from './ui/icon-symbol';
import { SelectableText } from './ui/SelectableText';
import { WordAnalysisDrawer } from './WordAnalysisDrawer';

type FactCardProps = {
  factId: string;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  showImages: boolean;
  isIntersecting: boolean;
  contentLanguage: string;
  translationLanguage: string;
  level: string;
  onReadMore: (factId: string) => void;
  onCategoryFilter: (category: string) => void;
  fontSize: number;
};

type PopoverState = {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  selectedWord: string;
};

export function FactCard({
  factId,
  category,
  subcategory,
  imageUrl,
  showImages,
  isIntersecting,
  contentLanguage,
  translationLanguage,
  level,
  onReadMore,
  onCategoryFilter,
  fontSize,
}: FactCardProps) {
  const cardRef = useRef<View>(null);
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isVisible: false,
    position: null,
    selectedWord: '',
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { content, error, isLoading } = useFactContent({
    factId,
    language: contentLanguage,
    level: level,
    isIntersecting,
  });

  const handleWordSelect = (word: string, wordRef: React.RefObject<View | null>) => {
    cardRef.current?.measure((fx, fy, width, height, px, py) => {
      wordRef.current?.measure((wfx, wfy, wWidth, wHeight, wpx, wpy) => {
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
    handleClosePopover();
    setIsDrawerOpen(true);
  };

  return (
    <View ref={cardRef}>
      <Pressable onPress={handleClosePopover} style={styles.card}>
        {popoverState.isVisible && (
          <TranslationPopover
            isVisible={popoverState.isVisible}
            position={popoverState.position}
            selectedWord={popoverState.selectedWord}
            contentLanguage={contentLanguage}
            translationLanguage={translationLanguage}
            context={content}
            onLearnMore={handleLearnMore}
          />
        )}
        {showImages && imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        )}
        <View style={styles.contentContainer}>
          {category && (
            <View style={styles.categoryContainer}>
              <TouchableOpacity onPress={() => onCategoryFilter(category)}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
              {subcategory && (
                <>
                  <Text style={styles.categoryText}> &gt; </Text>
                  <TouchableOpacity onPress={() => onCategoryFilter(category)}>
                    <Text style={styles.categoryText}>{subcategory}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
          {isLoading && <ActivityIndicator color={Colors.dark.primary} />}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {content && (
            <SelectableText
              text={content}
              onWordSelect={handleWordSelect}
              style={[styles.contentText, { fontSize }]}
            />
          )}
        </View>
        <TouchableOpacity onPress={() => onReadMore(factId)} style={styles.footerContainer}>
          <View style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read More</Text>
            <IconSymbol name="arrow.up.right" size={12} color={Colors.dark.mutedForeground} />
          </View>
        </TouchableOpacity>
      </Pressable>
      <WordAnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedText={popoverState.selectedWord}
        sourceLanguage={contentLanguage}
        targetLanguage={translationLanguage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    minHeight: 100,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    color: Colors.dark.mutedForeground,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentText: {
    color: Colors.dark.foreground,
    lineHeight: 26,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    color: Colors.dark.mutedForeground,
    fontSize: 14,
  },
});