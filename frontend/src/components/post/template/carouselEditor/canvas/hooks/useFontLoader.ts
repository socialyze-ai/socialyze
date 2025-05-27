import { useEffect } from "react";
import { TextItem } from "../types";

export const useFontLoader = (texts: TextItem[]) => {
  // Load Google Fonts for all text items
  useEffect(() => {
    // Create a set to avoid duplicate font loading
    const fontsToLoad = new Set<string>();

    // Collect all unique font family and weight combinations
    texts.forEach((text) => {
      if (text.style.fontFamily && text.style.fontWeight) {
        fontsToLoad.add(`${text.style.fontFamily}:wght@${text.style.fontWeight}`);
      } else if (text.style.fontFamily) {
        fontsToLoad.add(`${text.style.fontFamily}:wght@400`);
      }
    });

    // Load each font
    const fontLinks: HTMLLinkElement[] = [];
    fontsToLoad.forEach((fontString) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontString.replace(
        / /g,
        "+",
      )}&display=swap`;
      document.head.appendChild(link);
      fontLinks.push(link);
    });

    // Clean up function to remove all font links
    return () => {
      fontLinks.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [texts]);
};
