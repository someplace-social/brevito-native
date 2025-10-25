import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppearanceView } from '../components/options/AppearanceView';
import { LanguageView } from '../components/options/LanguageView';
import { MainView } from '../components/options/MainView';
import { TopicsView } from '../components/options/TopicsView';

type SettingsView = "main" | "topics" | "language" | "appearance";

const categoriesAreEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

export default function SettingsScreen() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<SettingsView>("main");
  const {
    contentLanguage, setContentLanguage,
    translationLanguage, setTranslationLanguage,
    level, setLevel,
    fontSize, setFontSize,
    selectedCategories, setSelectedCategories,
    showImages, setShowImages,
  } = useAppSettings();

  const [stagedContentLanguage, setStagedContentLanguage] = useState(contentLanguage);
  const [stagedTranslationLanguage, setStagedTranslationLanguage] = useState(translationLanguage);
  const [stagedLevel, setStagedLevel] = useState(level);
  const [stagedCategories, setStagedCategories] = useState(selectedCategories);
  const [stagedFontSize, setStagedFontSize] = useState(fontSize);
  const [stagedShowImages, setStagedShowImages] = useState(showImages);

  const handleSaveChanges = () => {
    const hasChanges =
      stagedContentLanguage !== contentLanguage ||
      stagedTranslationLanguage !== translationLanguage ||
      stagedLevel !== level ||
      !categoriesAreEqual(stagedCategories, selectedCategories) ||
      stagedFontSize !== fontSize ||
      stagedShowImages !== showImages;

    if (hasChanges) {
      setContentLanguage(stagedContentLanguage);
      setTranslationLanguage(stagedTranslationLanguage);
      setLevel(stagedLevel);
      setSelectedCategories(stagedCategories);
      setFontSize(stagedFontSize);
      setShowImages(stagedShowImages);
    }
  };

  const handleBack = () => {
    if (activeView === 'main') {
      handleSaveChanges();
      router.back();
    } else {
      setActiveView('main');
    }
  };

  const viewTitles: Record<SettingsView, string> = {
    main: "Settings",
    topics: "Topics",
    language: "Language",
    appearance: "Appearance",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol name={activeView === 'main' ? 'xmark' : 'arrow.left'} size={24} color={Colors.dark.foreground} />
          </TouchableOpacity>
          <Text style={styles.title}>{viewTitles[activeView]}</Text>
        </View>
        <View style={styles.content}>
          {activeView === 'main' && <MainView setActiveView={setActiveView} />}
          {activeView === 'topics' && <TopicsView stagedCategories={stagedCategories} setStagedCategories={setStagedCategories} />}
          {activeView === 'language' && (
            <LanguageView
              stagedContentLanguage={stagedContentLanguage}
              setStagedContentLanguage={setStagedContentLanguage}
              stagedTranslationLanguage={stagedTranslationLanguage}
              setStagedTranslationLanguage={setStagedTranslationLanguage}
              stagedLevel={stagedLevel}
              setStagedLevel={setStagedLevel}
            />
          )}
          {activeView === 'appearance' && (
            <AppearanceView
              stagedFontSize={stagedFontSize}
              setStagedFontSize={setStagedFontSize}
              stagedShowImages={stagedShowImages}
              setStagedShowImages={setStagedShowImages}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
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
  content: {
    flex: 1,
    padding: 16,
  },
});