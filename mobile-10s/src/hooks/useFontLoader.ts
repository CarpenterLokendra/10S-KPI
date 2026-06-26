import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export const useFontLoader = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Rajdhani': require('../../assets/fonts/Rajdhani-Regular.ttf'),
          'Rajdhani-500': require('../../assets/fonts/Rajdhani-SemiBold.ttf'),
          'Rajdhani-700': require('../../assets/fonts/Rajdhani-Bold.ttf'),
          'Inter': require('../../assets/fonts/Inter-Regular.ttf'),
          'Inter-500': require('../../assets/fonts/Inter-SemiBold.ttf'),
          'Inter-700': require('../../assets/fonts/Inter-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontError(error instanceof Error ? error.message : 'Unknown error');
        // Still mark as loaded to prevent infinite loading state
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return { fontsLoaded, fontError };
};
