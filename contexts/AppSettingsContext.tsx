import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { Colors, ColorTheme, ThemeName } from '../constants/Colors';

export const FONT_SIZES = [14, 16, 18, 20, 22] as const;
export const AVAILABLE_CATEGORIES = ["Science", "Technology", "Health", "History", "Business", "Society", "Art", "Sports", "Environment", "Culture", "Food", "Geography", "Psychology", "Animals", "Space", "Language", "Unusual"];

interface AppSettingsContextType {
  isInitialized: boolean;
  settingsKey: number;
  colors: ColorTheme;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  contentLanguage: string;
  setContentLanguage: (lang: string) => void;
  translationLanguage: string;
  setTranslationLanguage: (lang: string) => void;
  level: string;
  setLevel: (level: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
}

export const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [contentLanguage, setContentLanguage] = useState("Spanish");
  const [translationLanguage, setTranslationLanguage] = useState("English");
  const [level, setLevel] = useState("Beginner");
  const [fontSize, setFontSize] = useState<number>(18);
  const [selectedCategories, setSelectedCategories] = useState(AVAILABLE_CATEGORIES);
  const [showImages, setShowImages] = useState(true);
  const [theme, setTheme] = useState<ThemeName>('black');
  const [isInitialized, setIsInitialized] = useState(false);
  const [settingsKey, setSettingsKey] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await AsyncStorage.multiGet([
          "brevito-content-language", "brevito-translation-language", "brevito-level",
          "brevito-font-size", "brevito-categories", "brevito-show-images", "brevito-theme",
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
        const savedTheme = settingsMap.get("brevito-theme") as ThemeName;
        if (savedTheme && Colors[savedTheme]) setTheme(savedTheme);
      } catch (error) {
        console.error("Failed to load settings", error);
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
          ["brevito-content-language", contentLanguage], ["brevito-translation-language", translationLanguage],
          ["brevito-level", level], ["brevito-font-size", JSON.stringify(fontSize)],
          ["brevito-categories", JSON.stringify(selectedCategories)], ["brevito-show-images", JSON.stringify(showImages)],
          ["brevito-theme", theme],
        ];
        await AsyncStorage.multiSet(settings);
      } catch (error) {
        console.error("Failed to save settings", error);
      }
    };
    saveSettings();
    setSettingsKey(prev => prev + 1);
  }, [contentLanguage, translationLanguage, level, fontSize, selectedCategories, showImages, theme, isInitialized]);

  const value = {
    isInitialized, settingsKey, colors: Colors[theme], theme, setTheme,
    contentLanguage, setContentLanguage, translationLanguage, setTranslationLanguage,
    level, setLevel, fontSize, setFontSize, selectedCategories, setSelectedCategories,
    showImages, setShowImages,
  };

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};