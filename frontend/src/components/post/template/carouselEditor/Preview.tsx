import {
  useState,
  CSSProperties,
  forwardRef,
  useRef,
  useImperativeHandle,
  RefObject,
  useEffect,
} from "react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend the TextStyle interface to include optional properties
interface ExtendedTextStyle extends Record<string, any> {
  fontSize: number;
  color: string;
  textAlign?: CSSProperties["textAlign"];
  fontWeight?: CSSProperties["fontWeight"];
  fontStyle?: CSSProperties["fontStyle"];
  lineHeight?: CSSProperties["lineHeight"];
  fontFamily?: string;
}

// Add PreviewRef interface for external access to preview functions
export interface PreviewRef {
  getPreviewElement: () => HTMLDivElement | null;
  getCanvasContentElement: () => HTMLDivElement | null;
  getCurrentSlide: () => number;
  getTotalSlides: () => number;
  goToSlide: (index: number) => void;
}

const Preview = forwardRef<PreviewRef, {}>((props, ref) => {
  const { canvasCount, aspectRatio, backgroundColor, images, texts } = useSelector(
    (state: RootState) => state.template,
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);

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

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    getPreviewElement: () => previewBoxRef.current,
    getCanvasContentElement: () => canvasContentRef.current,
    getCurrentSlide: () => currentSlide,
    getTotalSlides: () => canvasCount,
    goToSlide: (index: number) => setCurrentSlide(index),
  }));

  // Base box size in pixels (MUST match Canvas component)
  const BOX_SIZE_MM = 50; // Base box size in mm - matching Canvas
  const PX_PER_MM = 3.78; // Approximate conversion factor
  const BOX_SIZE_PX = BOX_SIZE_MM * PX_PER_MM; // Base box size in pixels

  // Handle navigation between slides (each slide is a single box)
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === canvasCount - 1 ? 0 : prev + 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? canvasCount - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Calculate aspect ratio for a single box in the preview
  const getBoxAspectRatioStyle = () => {
    // Using a fixed preview width for better display
    const previewWidth = 200; // Base width for preview

    let boxWidth, boxHeight;

    switch (aspectRatio) {
      case "1:1":
        // For 1:1, height equals width for a single box
        boxWidth = previewWidth;
        boxHeight = previewWidth;
        return { width: `${boxWidth}px`, height: `${boxHeight}px` };

      case "16:9":
        // For 16:9, adjust height accordingly
        boxWidth = previewWidth;
        boxHeight = (boxWidth * 9) / 16;
        return { width: `${boxWidth}px`, height: `${boxHeight}px` };

      case "4:5":
        // For 4:5, adjust height accordingly
        boxWidth = previewWidth;
        boxHeight = (boxWidth * 5) / 4;
        return { width: `${boxWidth}px`, height: `${boxHeight}px` };

      default:
        // Default to 1:1 ratio
        boxWidth = previewWidth;
        boxHeight = previewWidth;
        return { width: `${boxWidth}px`, height: `${boxHeight}px` };
    }
  };

  // Get the scale factor for rendering items
  const getScaleFactor = () => {
    const previewStyle = getBoxAspectRatioStyle();
    const previewWidth = parseInt(previewStyle.width);

    // Calculate scale based on the box size in pixels
    return previewWidth / BOX_SIZE_PX;
  };

  // Generate a preview for the current box
  const renderBoxPreview = () => {
    const scaleFactor = getScaleFactor();

    // Calculate canvas width based on aspect ratio and box size
    const boxWidth = BOX_SIZE_PX;
    const boxStartX = currentSlide * boxWidth;
    const boxEndX = boxStartX + boxWidth;

    // Calculate adjusted position within the current box view
    const getAdjustedPosition = (position: { x: number; y: number }) => {
      // Adjust position relative to the current box and apply scaling
      const adjustedX = (position.x - boxStartX) * scaleFactor;
      const adjustedY = position.y * scaleFactor;

      return {
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
      };
    };

    return (
      <div
        ref={canvasContentRef}
        className="relative mobile-preview"
        style={{
          backgroundColor,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Render all images that are at least partially visible in the current box */}
        {images.map((img) => {
          // Check if image is at least partially visible in current box
          const imgLeft = img.position.x;
          const imgRight = img.position.x + img.size.width;

          // If the image is completely outside the current box, don't render it
          if (imgRight < boxStartX || imgLeft > boxEndX) {
            return null;
          }

          const positionStyle = getAdjustedPosition(img.position);

          // Calculate the scaled dimensions
          const scaledWidth = img.size.width * scaleFactor;
          const scaledHeight = img.size.height * scaleFactor;

          return (
            <div
              key={`preview-${img.id}`}
              className="absolute"
              style={{
                ...positionStyle,
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
              }}
            >
              <img src={img.src} alt="Preview" className="w-full h-full object-cover" />
            </div>
          );
        })}

        {/* Render all texts, including those that might overlap box boundaries */}
        {texts.map((txt) => {
          // Include text that might be partially visible or spans across boxes
          // Calculate what part of the text is visible in this box
          const txtPositionStyle = getAdjustedPosition(txt.position);

          // Calculate the scaled font size
          const scaledFontSize = txt.style.fontSize * scaleFactor;

          // Treat txt.style as an extended style object
          const style = txt.style as ExtendedTextStyle;

          // Get text size if defined, otherwise calculate based on content
          const textSize = txt.size || {
            width: txt.content.length * scaledFontSize * 0.6, // Approximate width based on content
            height: scaledFontSize * 1.2, // Approximate height based on font size
          };

          // Scale the text size
          const scaledWidth =
            typeof textSize.width === "number" ? textSize.width * scaleFactor : textSize.width;
          const scaledHeight =
            typeof textSize.height === "number" ? textSize.height * scaleFactor : textSize.height;

          // Check if text is at least partially visible in this box
          const textLeft = txt.position.x;
          const textRight =
            textLeft +
            (typeof textSize.width === "number"
              ? textSize.width
              : txt.content.length * txt.style.fontSize * 0.6);

          if (textRight < boxStartX || textLeft > boxEndX) {
            return null;
          }

          return (
            <div
              key={`preview-${txt.id}`}
              className="absolute"
              style={{
                ...txtPositionStyle,
                width: typeof scaledWidth === "number" ? `${scaledWidth}px` : scaledWidth,
                height: typeof scaledHeight === "number" ? `${scaledHeight}px` : scaledHeight,
              }}
            >
              <div
                style={{
                  fontSize: `${scaledFontSize}px`,
                  color: style.color,
                  fontFamily: style.fontFamily || "inherit",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  textAlign: style.textAlign || "left",
                  fontWeight: style.fontWeight || "normal",
                  fontStyle: style.fontStyle || "normal",
                  lineHeight: style.lineHeight || "normal",
                  width: "100%",
                  height: "100%",
                  overflowWrap: "break-word",
                }}
              >
                {txt.content}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Get dimensions in mm for display
  const getBoxDimensionsInMm = () => {
    switch (aspectRatio) {
      case "1:1":
        return { width: BOX_SIZE_MM, height: BOX_SIZE_MM };
      case "16:9":
        return { width: BOX_SIZE_MM, height: (BOX_SIZE_MM * 9) / 16 };
      case "4:5":
        return { width: BOX_SIZE_MM, height: (BOX_SIZE_MM * 5) / 4 };
      default:
        return { width: BOX_SIZE_MM, height: BOX_SIZE_MM };
    }
  };

  const boxDimensions = getBoxDimensionsInMm();

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-sm font-medium mb-2">
        Preview - Box {currentSlide + 1} of {canvasCount}
      </h3>

      <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
        {/* Box dimensions display */}
        <div className="text-xs text-gray-600 mb-2">
          Box Size: {boxDimensions.width}mm × {Math.round(boxDimensions.height * 10) / 10}mm (
          {aspectRatio})
        </div>

        {/* Mobile screen preview with border */}
        <div
          ref={previewBoxRef}
          className="border-2 border-gray-300 overflow-hidden relative"
          style={{
            ...getBoxAspectRatioStyle(),
            maxWidth: "100%",
          }}
        >
          {/* Box preview content */}
          {renderBoxPreview()}

          {/* Navigation arrows (only shown if more than one box) */}
          {canvasCount > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-full p-1 hover:bg-white/90 z-20"
                onClick={goToPrevSlide}
                aria-label="Previous box"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-full p-1 hover:bg-white/90 z-20"
                onClick={goToNextSlide}
                aria-label="Next box"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Slide indicators */}
        {canvasCount > 1 && (
          <div className="flex justify-center mt-2 gap-1">
            {Array.from({ length: canvasCount }).map((_, index) => (
              <button
                key={`indicator-${index}`}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? "w-4 bg-blue-500" : "w-2 bg-gray-300"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to box ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-1 text-center">
        {canvasCount > 1
          ? `Box ${currentSlide + 1}/${canvasCount} - Swipe to see all boxes`
          : "Preview of your box"}
      </p>
    </div>
  );
});

Preview.displayName = "Preview";

export default Preview;
