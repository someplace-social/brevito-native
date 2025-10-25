import { Colors } from '@/constants/Colors';
import { useFactContent } from '@/hooks/useFactContent';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { TranslationPopover } from './TranslationPopover';
import { IconSymbol } from './ui/icon-symbol';
import { SelectableText } from './ui/SelectableText';

type FactCardProps = {
  factId: string;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  showImages: boolean;
  isIntersecting: boolean;
  contentLanguage: string;
  level: string;
};

type PopoverState = {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  selectedWord: string;
};

export function FactCard({ factId, category, subcategory, imageUrl, showImages, isIntersecting, contentLanguage, level }: FactCardProps) {
  const cardRef = useRef<View>(null);
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isVisible: false,
    position: null,
    selectedWord: '',
  });

  const { content, error, isLoading } = useFactContent({
    factId,
    language: contentLanguage,
    level: level,
    isIntersecting,
  });

  const handleWordSelect = (word: string, wordRef: React.RefObject<View>) => {
    cardRef.current?.measure((fx, fy, width, height, px, py) => {
      wordRef.current?.measure((wfx, wfy, wWidth, wHeight, wpx, wpy) => {
        setPopoverState({
          isVisible: true,
          selectedWord: word,
          position: {
            top: wpy - py - wHeight - 10, // Position above the word
            left: wpx - px,
          },
        });
      });
    });
  };

  const handleClosePopover = () => {
    setPopoverState({ isVisible: false, position: null, selectedWord: '' });
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
            translationLanguage={'English'} // Hardcoded for now
            context={content}
            onLearnMore={() => console.log('Learn More')}
          />
        )}
        {showImages && imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        )}
        <View style={styles.contentContainer}>
          {category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{category}</Text>
              {subcategory && <Text style={styles.categoryText}> &gt; {subcategory}</Text>}
            </View>
          )}
          {isLoading && <ActivityIndicator color={Colors.dark.primary} />}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {content && (
            <SelectableText
              text={content}
              onWordSelect={handleWordSelect}
              style={styles.contentText}
            />
          )}
        </View>
        <View style={styles.footerContainer}>
          <View style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read More</Text>
            <IconSymbol name="arrow.up.right" size={12} color={Colors.dark.mutedForeground} />
          </View>
        </View>
      </Pressable>
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
    fontSize: 18,
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