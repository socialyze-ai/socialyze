import { useCallback } from "react";
import { ImageItem, TextItem } from "../types";
import { CELL_SIZE_PX, getCellCoordinates, isItemVisibleInCell } from "../utils";

export const useGridCapture = (
  canvasRef: React.RefObject<HTMLDivElement>,
  images: ImageItem[],
  texts: TextItem[],
  backgroundColor: string,
  columns: number,
  rows: number,
) => {
  const captureCanvasContent = useCallback(
    async (cellIndex: number): Promise<Blob | null> => {
      if (!canvasRef.current) return null;

      try {
        // Calculate cell position
        const { row, column } = getCellCoordinates(cellIndex, columns);

        // Create a new canvas for this cell
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // Set high resolution
        const scale = 4; // Higher quality
        canvas.width = CELL_SIZE_PX * scale;
        canvas.height = CELL_SIZE_PX * scale;

        // Set background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);

        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Translate context to offset the cell
        const cellOffsetX = column * CELL_SIZE_PX;
        const cellOffsetY = row * CELL_SIZE_PX;
        ctx.translate(-cellOffsetX, -cellOffsetY);

        // Draw all images
        for (const img of images) {
          // Check if image is visible in this cell
          if (!isItemVisibleInCell(img.position, img.size, cellIndex, columns, rows)) continue;

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
          // Check if text is visible in this cell
          // Estimate text width based on content and font size
          const estimatedWidth = txt.content.length * txt.style.fontSize * 0.6;
          // Ensure we're working with a number for calculations
          const txtWidth = typeof txt.size?.width === "number" ? txt.size.width : estimatedWidth;
          const txtHeight =
            typeof txt.size?.height === "number" ? txt.size.height : txt.style.fontSize;

          if (
            !isItemVisibleInCell(
              txt.position,
              { width: txtWidth as number, height: txtHeight as number },
              cellIndex,
              columns,
              rows,
            )
          )
            continue;

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
        console.error(`Error capturing canvas content for cell ${cellIndex}:`, error);
        return null;
      }
    },
    [canvasRef, images, texts, backgroundColor, columns, rows],
  );

  const getTotalCells = useCallback(() => columns * rows, [columns, rows]);

  return { captureCanvasContent, getTotalCells };
};
