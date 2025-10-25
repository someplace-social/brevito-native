import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export const FONT_SIZES = [14, 16, 18, 20, 22] as const;
export const AVAILABLE_CATEGORIES = ["Science", "Technology", "Health", "History", "Business", "Society", "Art", "Sports", "Environment", "Culture", "Food", "Geography", "Psychology", "Animals", "Space", "Language", "Unusual"];

export function useAppSettings() {
  const [contentLanguage, setContentLanguage] = useState("Spanish");
  const [translationLanguage, setTranslationLanguage] = useState("English");
  const [level, setLevel] = useState("Beginner");
  const [fontSize, setFontSize] = useState<number>(18);
  const [selectedCategories, setSelectedCategories] = useState(AVAILABLE_CATEGORIES);
  const [showImages, setShowImages] = useState(true);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [settingsKey, setSettingsKey] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await AsyncStorage.multiGet([
          "brevito-content-language",
          "brevito-translation-language",
          "brevito-level",
          "brevito-font-size",
          "brevito-categories",
          "brevito-show-images",
        ]);

        const settingsMap = new Map(settings);
        
        setContentLanguage(settingsMap.get("brevito-content-language") || "Spanish");
        setTranslationLanguage(settingsMap.get("brevito-translation-language") || "English");
        setLevel(settingsMap.get("brevito-level") || "Beginner");
        
        const savedFontSize = settingsMap.get("brevito-font-size");
        if (savedFontSize) setFontSize(JSON.parse(savedFontSize));

        const savedCategories = settingsMap.get("brevito-categories");
        if (savedCategories) {
          const parsed = JSON.parse(savedCategories);
          if (Array.isArray(parsed) && parsed.length > 0) setSelectedCategories(parsed);
        }

        const savedShowImages = settingsMap.get("brevito-show-images");
        if (savedShowImages) setShowImages(JSON.parse(savedShowImages));

      } catch (error) {
        console.error("Failed to load settings from storage", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    const saveSettings = async () => {
      try {
        const settings: [string, string][] = [
          ["brevito-content-language", contentLanguage],
          ["brevito-translation-language", translationLanguage],
          ["brevito-level", level],
          ["brevito-font-size", JSON.stringify(fontSize)],
          ["brevito-categories", JSON.stringify(selectedCategories)],
          ["brevito-show-images", JSON.stringify(showImages)],
        ];
        await AsyncStorage.multiSet(settings);
      } catch (error) {
        console.error("Failed to save settings to storage", error);
      }
    };

    saveSettings();
  }, [contentLanguage, translationLanguage, level, fontSize, selectedCategories, showImages, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    setSettingsKey(prevKey => prevKey + 1);
  }, [contentLanguage, selectedCategories, isInitialized]);

  return {
    isInitialized,
    settingsKey,
    contentLanguage, setContentLanguage,
    translationLanguage, setTranslationLanguage,
    level, setLevel,
    fontSize, setFontSize,
    selectedCategories, setSelectedCategories,
    showImages, setShowImages,
  };
}