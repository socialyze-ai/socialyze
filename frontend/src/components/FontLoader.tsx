import React, { useEffect } from "react";
import { useFontLoader } from "@/hooks/useFontLoader";

interface FontLoaderProps {
  specificFont?: string;
  withEvents?: boolean;
  loadOnMount?: boolean;
  children?: React.ReactNode;
}

/**
 * Component that loads fonts and provides font loading utilities via context
 * Can be used standalone or as a wrapper component
 */
const FontLoader: React.FC<FontLoaderProps> = ({
  specificFont,
  withEvents = false,
  loadOnMount = true,
  children,
}) => {
  const { isLoaded, loadAllFonts, loadFont, availableFonts } = useFontLoader({
    loadOnMount,
    specificFont,
    withEvents,
  });

  // Component that only loads fonts, nothing to render
  if (!children) {
    return null;
  }

  // If used as a wrapper component, render children
  return <>{children}</>;
};

export default FontLoader;
