import { useState, CSSProperties } from "react";
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
}

const Preview = () => {
  const { canvasCount, aspectRatio, backgroundColor, images, texts } = useSelector(
    (state: RootState) => state.template,
  );

  const [currentSlide, setCurrentSlide] = useState(0);

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

          // Check if text is at least partially visible in this box
          const textWidth = txt.content.length * scaledFontSize * 0.6; // Approximate width based on content
          const textLeft = txt.position.x;
          const textRight = textLeft + textWidth;

          if (textRight < boxStartX || textLeft > boxEndX) {
            return null;
          }

          return (
            <div
              key={`preview-${txt.id}`}
              className="absolute whitespace-nowrap"
              style={{
                ...txtPositionStyle,
              }}
            >
              <div
                style={{
                  fontSize: `${scaledFontSize}px`,
                  color: style.color,
                  wordWrap: "normal",
                  whiteSpace: "nowrap",
                  textAlign: style.textAlign || "left",
                  fontWeight: style.fontWeight || "normal",
                  fontStyle: style.fontStyle || "normal",
                  lineHeight: style.lineHeight || "normal",
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
};

export default Preview;
