import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const availableCategories = ["Science", "Technology", "Health", "History", "Business", "Society", "Art", "Sports", "Environment", "Culture", "Food", "Geography", "Psychology", "Animals", "Space", "Language", "Unusual"];
const fontSizes = ["text-sm", "text-base", "text-lg", "text-xl", "text-2xl"];

export function useAppSettings() {
  const [contentLanguage, setContentLanguage] = useState("Spanish");
  const [translationLanguage, setTranslationLanguage] = useState("English");
  const [level, setLevel] = useState("Beginner");
  const [fontSize, setFontSize] = useState("text-lg");
  const [selectedCategories, setSelectedCategories] = useState(availableCategories);
  const [showImages, setShowImages] = useState(true);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [settingsKey, setSettingsKey] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedContentLang = await AsyncStorage.getItem("brevito-content-language");
        const savedTranslationLang = await AsyncStorage.getItem("brevito-translation-language");
        const savedLevel = await AsyncStorage.getItem("brevito-level");
        const savedFontSize = await AsyncStorage.getItem("brevito-font-size");
        const savedCategories = await AsyncStorage.getItem("brevito-categories");
        const savedShowImages = await AsyncStorage.getItem("brevito-show-images");

        if (savedContentLang) setContentLanguage(savedContentLang);
        if (savedTranslationLang) setTranslationLanguage(savedTranslationLang);
        if (savedLevel) setLevel(savedLevel);
        if (savedFontSize && fontSizes.includes(savedFontSize)) setFontSize(savedFontSize);
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories);
          if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
            setSelectedCategories(parsedCategories);
          }
        }
        if (savedShowImages) {
          setShowImages(JSON.parse(savedShowImages));
        }
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
        await AsyncStorage.setItem("brevito-content-language", contentLanguage);
        await AsyncStorage.setItem("brevito-translation-language", translationLanguage);
        await AsyncStorage.setItem("brevito-level", level);
        await AsyncStorage.setItem("brevito-font-size", fontSize);
        await AsyncStorage.setItem("brevito-categories", JSON.stringify(selectedCategories));
        await AsyncStorage.setItem("brevito-show-images", JSON.stringify(showImages));
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