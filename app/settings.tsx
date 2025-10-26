import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppearanceView } from '../components/options/AppearanceView';
import { LanguageView } from '../components/options/LanguageView';
import { MainView } from '../components/options/MainView';
import { TopicsView } from '../components/options/TopicsView';
import { IconSymbol } from '../components/ui/icon-symbol';
import { useAppSettings } from '../hooks/useAppSettings';

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
    colors,
    contentLanguage, setContentLanguage,
    translationLanguage, setTranslationLanguage,
    level, setLevel,
    fontSize, setFontSize,
    selectedCategories, setSelectedCategories,
    showImages, setShowImages,
    theme, setTheme,
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

  const handleClose = () => {
    handleSaveChanges();
    router.back();
  };

  const handleBack = () => {
    if (activeView !== 'main') {
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={activeView === 'main' ? handleClose : handleBack} style={styles.backButton}>
            <IconSymbol name={'arrow.left'} size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>{viewTitles[activeView]}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.foreground} />
          </TouchableOpacity>
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
              stagedTheme={theme}
              setGlobalTheme={setTheme}
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
  },
  container: {
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
  },
  content: {
    flex: 1,
    padding: 16,
  },
});