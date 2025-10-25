import { Colors } from '@/constants/Colors';
import { useExtendedFact } from '@/hooks/useExtendedFact';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
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

type ExtendedFactSheetProps = {
  factId: string | null;
  isVisible: boolean;
  onClose: () => void;
  language: string;
  level: string;
  showImages: boolean;
  fontSize: number;
};

export function ExtendedFactSheet({
  factId,
  isVisible,
  onClose,
  language,
  level,
  showImages,
  fontSize,
}: ExtendedFactSheetProps) {
  const { data, isLoading, error } = useExtendedFact({ factId, language, level });

  const handleOpenSource = () => {
    if (data?.source_url) {
      WebBrowser.openBrowserAsync(data.source_url);
    }
  };

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="arrow.left" size={24} color={Colors.dark.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>Details</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading && <ActivityIndicator size="large" color={Colors.dark.primary} />}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {data && (
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
              <Text style={[styles.contentText, { fontSize }]}>{data.content}</Text>
              {data.source && data.source_url && (
                <TouchableOpacity onPress={handleOpenSource} style={styles.sourceButton}>
                  <Text style={styles.sourceText}>Source: {data.source}</Text>
                  <IconSymbol name="arrow.up.right" size={14} color={Colors.dark.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
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
    color: Colors.dark.mutedForeground,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contentText: {
    color: Colors.dark.foreground,
    lineHeight: 28,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  sourceText: {
    color: Colors.dark.mutedForeground,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});