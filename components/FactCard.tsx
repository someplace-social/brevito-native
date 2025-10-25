import { Colors } from '@/constants/Colors';
import { useFactContent } from '@/hooks/useFactContent';
import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

type FactCardProps = {
  factId: string;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  showImages: boolean;
  isIntersecting: boolean;
};

export function FactCard({ factId, category, subcategory, imageUrl, showImages, isIntersecting }: FactCardProps) {
  const { content, error, isLoading } = useFactContent({
    factId,
    language: 'Spanish', // Hardcoded for now
    level: 'Beginner', // Hardcoded for now
    isIntersecting,
  });

  return (
    <View style={styles.card}>
      {showImages && imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
      )}
      <View style={styles.contentContainer}>
        {category && (
          <View style={styles.categoryContainer}>
            <TouchableOpacity>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
            {subcategory && (
              <>
                <Text style={styles.categoryText}> &gt; </Text>
                <TouchableOpacity>
                  <Text style={styles.categoryText}>{subcategory}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        {isLoading && <ActivityIndicator color={Colors.dark.primary} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {content && <Text style={styles.contentText}>{content}</Text>}
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Read More</Text>
          <IconSymbol name="arrow.up.right" size={12} color={Colors.dark.mutedForeground} />
        </TouchableOpacity>
      </View>
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