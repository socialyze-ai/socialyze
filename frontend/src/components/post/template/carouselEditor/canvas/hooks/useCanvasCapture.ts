import { useRef } from "react";
import { ImageItem, TextItem } from "../types";
import { getAspectRatioStyle } from "../utils";

export const useCanvasCapture = (
  canvasRef: React.RefObject<HTMLDivElement>,
  images: ImageItem[],
  texts: TextItem[],
  backgroundColor: string,
  canvasCount: number,
  aspectRatio: string,
) => {
  const captureCanvasContent = async (boxIndex: number): Promise<Blob | null> => {
    if (!canvasRef.current) return null;

    try {
      // Get canvas dimensions
      const canvasWidth = parseFloat(getAspectRatioStyle(aspectRatio, canvasCount).width);
      const canvasHeight = parseFloat(getAspectRatioStyle(aspectRatio, canvasCount).height);

      // Calculate section width
      const sectionWidth = canvasWidth / canvasCount;

      // Create a new canvas for this section
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Set high resolution
      const scale = 4; // Higher quality
      canvas.width = sectionWidth * scale;
      canvas.height = canvasHeight * scale;

      // Set background color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);

      // Enable high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Translate context to offset the section
      ctx.translate(-boxIndex * sectionWidth, 0);

      // Draw all images
      for (const img of images) {
        // Check if image is visible in this section
        const imgLeft = img.position.x;
        const imgRight = img.position.x + img.size.width;
        const sectionLeft = boxIndex * sectionWidth;
        const sectionRight = (boxIndex + 1) * sectionWidth;

        // Skip if image is not visible in this section
        if (imgRight < sectionLeft || imgLeft > sectionRight) continue;

        // Load image
        const imgElement = new Image();
        imgElement.crossOrigin = "anonymous";

        // Draw image when loaded
        await new Promise<void>((resolve, reject) => {
          imgElement.onload = () => {
            ctx.drawImage(
              imgElement,
              img.position.x,
              img.position.y,
              img.size.width,
              img.size.height,
            );
            resolve();
          };
          imgElement.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
          imgElement.src = img.src;
        });
      }

      // Draw all texts
      for (const txt of texts) {
        // Check if text is visible in this section
        const txtLeft = txt.position.x;
        // Estimate text width based on content and font size
        const estimatedWidth = txt.content.length * txt.style.fontSize * 0.6;
        // Ensure we're working with a number for calculations
        const txtWidth = typeof txt.size?.width === "number" ? txt.size.width : estimatedWidth;
        const txtRight = txtLeft + txtWidth;
        const sectionLeft = boxIndex * sectionWidth;
        const sectionRight = (boxIndex + 1) * sectionWidth;

        // Skip if text is not visible in this section
        if (txtRight < sectionLeft || txtLeft > sectionRight) continue;

        // Set text styles
        ctx.font = `${txt.style.fontWeight || "normal"} ${txt.style.fontSize}px ${
          txt.style.fontFamily || "Arial"
        }`;
        ctx.fillStyle = txt.style.color;
        ctx.textBaseline = "top";

        // Apply rotation if needed
        if (txt.style.rotation) {
          // Save context state
          ctx.save();
          // Get text height as a number
          const txtHeight =
            typeof txt.size?.height === "number" ? txt.size.height : txt.style.fontSize;
          // Translate to the center of text for rotation
          const centerX = txt.position.x + txtWidth / 2;
          const centerY = txt.position.y + txtHeight / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((txt.style.rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
        }

        // Draw text
        // Convert TextAlign to CanvasTextAlign, skipping 'justify' which isn't supported
        let textAlign: CanvasTextAlign = "left";
        if (txt.style.textAlign === "center" || txt.style.textAlign === "right") {
          textAlign = txt.style.textAlign;
        }
        ctx.textAlign = textAlign;

        // Handle multi-line text
        const lines = txt.content.split("\n");
        const lineHeight = txt.style.fontSize * 1.2;

        lines.forEach((line, i) => {
          let x = txt.position.x;
          if (textAlign === "center") {
            x += txtWidth / 2;
          } else if (textAlign === "right") {
            x += txtWidth;
          }
          ctx.fillText(line, x, txt.position.y + i * lineHeight);
        });

        // Restore context if rotation was applied
        if (txt.style.rotation) {
          ctx.restore();
        }
      }

      // Convert canvas to blob
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });
    } catch (error) {
      console.error(`Error capturing canvas content for box ${boxIndex}:`, error);
      return null;
    }
  };

  const getTotalBoxes = () => canvasCount;

  return { captureCanvasContent, getTotalBoxes };
};
