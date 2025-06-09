import { useEffect, useState } from "react";
import {
  loadFonts,
  cleanupFonts,
  loadSpecificFont,
  loadFontsWithEvents,
  GOOGLE_FONTS,
} from "@/utils/fontLoader";

interface UseFontLoaderOptions {
  loadOnMount?: boolean;
  specificFont?: string;
  withEvents?: boolean;
}

interface UseFontLoaderResult {
  loadAllFonts: () => void;
  loadFont: (fontFamily: string) => void;
  isLoaded: boolean;
  availableFonts: string[];
  cleanUp: () => void;
}

/**
 * Custom hook for loading Google Fonts
 * @param options Configuration options
 * @returns Font loading utility functions and state
 */
export function useFontLoader(options: UseFontLoaderOptions = {}): UseFontLoaderResult {
  const { loadOnMount = true, specificFont, withEvents = false } = options;
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle font loading on mount if specified
  useEffect(() => {
    if (!loadOnMount) return;

    let fontLink: HTMLLinkElement | undefined;

    if (specificFont) {
      fontLink = loadSpecificFont(specificFont);
      setIsLoaded(true);
    } else if (withEvents) {
      loadFontsWithEvents(
        () => setIsLoaded(true),
        () => setIsLoaded(false),
      );
    } else {
      fontLink = loadFonts();
      setIsLoaded(true);
    }

    // Cleanup on unmount
    return () => {
      cleanupFonts();
      setIsLoaded(false);
    };
  }, [loadOnMount, specificFont, withEvents]);

  // Load all fonts function
  const loadAllFonts = () => {
    cleanupFonts();
    loadFonts();
    setIsLoaded(true);
  };

  // Load specific font function
  const loadFont = (fontFamily: string) => {
    if (!GOOGLE_FONTS.includes(fontFamily)) {
      console.warn(`Font "${fontFamily}" is not in the predefined list of Google Fonts`);
    }
    cleanupFonts();
    loadSpecificFont(fontFamily);
    setIsLoaded(true);
  };

  // Cleanup function
  const cleanUp = () => {
    cleanupFonts();
    setIsLoaded(false);
  };

  return {
    loadAllFonts,
    loadFont,
    isLoaded,
    availableFonts: GOOGLE_FONTS,
    cleanUp,
  };
}
