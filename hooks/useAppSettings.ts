import { useContext } from 'react';
import { AppSettingsContext } from '../contexts/AppSettingsContext';

// This hook now just consumes the context.
// The provider logic is in AppSettingsContext.tsx
export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

// Export these from here as well for convenience
export { AVAILABLE_CATEGORIES, FONT_SIZES } from '../contexts/AppSettingsContext';
