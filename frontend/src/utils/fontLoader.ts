// Popular Google Fonts
export const GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Oswald",
  "Source Sans Pro",
  "Ubuntu",
  "Merriweather",
  "PT Sans",
  "Rubik",
  "Inter",
  "Lora",
  "Crimson Text",
  "Merriweather Sans",
  "Noto Sans",
  "Noto Serif",
];

// Font weight options
export const FONT_WEIGHTS = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

// Keep track of loaded fonts to avoid duplicate loading
let loadedFontsLink: HTMLLinkElement | null = null;

/**
 * Preloads all Google Fonts with all weights
 * @returns The created link element for cleanup
 */
export function loadFonts(): HTMLLinkElement {
  // Clean up any previously loaded fonts
  if (loadedFontsLink && document.head.contains(loadedFontsLink)) {
    document.head.removeChild(loadedFontsLink);
  }

  // Create a batch request for all fonts with all weights
  const weights = FONT_WEIGHTS.map((weight) => weight.value).join(";");
  const fontFamiliesParam = GOOGLE_FONTS.map(
    (font) => `${font.replace(/ /g, "+")}:wght@${weights}`,
  ).join("|");

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamiliesParam}&display=swap`;
  document.head.appendChild(link);

  // Store the link for later cleanup
  loadedFontsLink = link;

  return link;
}

/**
 * Cleans up the loaded fonts
 */
export function cleanupFonts(): void {
  if (loadedFontsLink && document.head.contains(loadedFontsLink)) {
    document.head.removeChild(loadedFontsLink);
    loadedFontsLink = null;
  }
}

/**
 * Loads a specific font with all weights
 * @param fontFamily The font family to load
 * @returns The created link element
 */
export function loadSpecificFont(fontFamily: string): HTMLLinkElement {
  if (!GOOGLE_FONTS.includes(fontFamily)) {
    console.warn(`Font "${fontFamily}" is not in the predefined list of Google Fonts`);
  }

  const weights = FONT_WEIGHTS.map((weight) => weight.value).join(";");
  const fontParam = `${fontFamily.replace(/ /g, "+")}:wght@${weights}`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
  document.head.appendChild(link);

  return link;
}

/**
 * Checks if the Web Font Loader API is available and loads fonts using it
 * This provides better control over font loading events
 */
export function loadFontsWithEvents(onActive?: () => void, onInactive?: () => void): void {
  // First load fonts the standard way as a fallback
  loadFonts();

  // Then try to use Web Font Loader if available in the global scope
  if (typeof window !== "undefined") {
    const WebFontScript = document.createElement("script");
    WebFontScript.src = "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js";
    WebFontScript.onload = () => {
      // @ts-ignore - WebFont is loaded dynamically
      window.WebFont.load({
        google: {
          families: GOOGLE_FONTS.map((font) =>
            FONT_WEIGHTS.map((weight) => `${font}:${weight.value}`),
          ).flat(),
        },
        active: onActive,
        inactive: onInactive,
        timeout: 2000, // 2 seconds timeout
      });
    };
    document.head.appendChild(WebFontScript);
  }
}
