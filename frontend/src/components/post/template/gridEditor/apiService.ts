import { ImageItem, TextItem } from "@/redux/slices/template.slice";

interface TemplateData {
  canvasCount: number;
  aspectRatio: string;
  backgroundColor: string;
  gridSize: { columns: number; rows: number };
  images: ImageItem[];
  texts: TextItem[];
  outputUrls?: string[];
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Helper to estimate text width based on content and font size
const estimateTextWidth = (text: string, fontSize: number): number => {
  // Approximate width: average character is ~0.6x font size wide
  return text.length * fontSize * 0.6;
};

// This is a mock API service for demo purposes
export const apiService = {
  // Process template and generate output
  processTemplate: async (templateData: TemplateData): Promise<ApiResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      console.log("Processing template with data:", templateData);

      // Each cell size in mm (50mm x 50mm per cell)
      const CELL_SIZE_MM = 50;
      // Approximate conversion factor from mm to pixels for processing
      const PX_PER_MM = 3.78;
      // Cell size in pixels
      const CELL_SIZE_PX = CELL_SIZE_MM * PX_PER_MM;

      // Calculate cell dimensions based on grid size and aspect ratio
      let cellWidth, cellHeight;
      const { columns, rows } = templateData.gridSize;

      // Calculate cell dimensions based on aspect ratio
      switch (templateData.aspectRatio) {
        case "16:9":
          cellWidth = CELL_SIZE_PX * (16 / 9);
          cellHeight = CELL_SIZE_PX;
          break;
        case "1:1":
          cellWidth = CELL_SIZE_PX;
          cellHeight = CELL_SIZE_PX;
          break;
        case "4:5":
          cellWidth = CELL_SIZE_PX * (4 / 5);
          cellHeight = CELL_SIZE_PX;
          break;
        default:
          // Default to 1:1
          cellWidth = CELL_SIZE_PX;
          cellHeight = CELL_SIZE_PX;
      }

      // Calculate total canvas dimensions
      const totalWidth = cellWidth * columns;
      const totalHeight = cellHeight * rows;

      // Deduplicate images based on ID
      const uniqueImages = [];
      const imageIds = new Set();

      for (const image of templateData.images) {
        if (!imageIds.has(image.id)) {
          imageIds.add(image.id);
          uniqueImages.push(image);
        }
      }

      // Simulate API processing for each grid cell
      const sections = [];

      for (let i = 0; i < templateData.canvasCount; i++) {
        // Calculate row and column for this cell
        const row = Math.floor(i / columns);
        const col = i % columns;

        // Calculate cell boundaries
        const cellStartX = col * cellWidth;
        const cellEndX = cellStartX + cellWidth;
        const cellStartY = row * cellHeight;
        const cellEndY = cellStartY + cellHeight;

        // Find images that are at least partially in this cell
        const cellImages = uniqueImages
          .filter((img) => {
            const imgStartX = img.position.x;
            const imgEndX = img.position.x + img.size.width;
            const imgStartY = img.position.y;
            const imgEndY = img.position.y + img.size.height;

            // Check if image overlaps with this cell
            return (
              imgStartX < cellEndX &&
              imgEndX > cellStartX &&
              imgStartY < cellEndY &&
              imgEndY > cellStartY
            );
          })
          .map((img) => {
            const imgStartX = img.position.x;
            const imgEndX = img.position.x + img.size.width;
            const imgStartY = img.position.y;
            const imgEndY = img.position.y + img.size.height;

            // Calculate if and how the image should be clipped in this cell
            const clippingX =
              imgStartX < cellStartX
                ? { start: true, clipAmount: cellStartX - imgStartX }
                : imgEndX > cellEndX
                ? { end: true, clipAmount: imgEndX - cellEndX }
                : null;

            const clippingY =
              imgStartY < cellStartY
                ? { start: true, clipAmount: cellStartY - imgStartY }
                : imgEndY > cellEndY
                ? { end: true, clipAmount: imgEndY - cellEndY }
                : null;

            return {
              ...img,
              clipping: {
                x: clippingX,
                y: clippingY,
              },
            };
          });

        // Find texts that are at least partially visible in this cell
        const cellTexts = templateData.texts
          .filter((txt) => {
            const txtX = txt.position.x;
            const txtY = txt.position.y;
            // Estimate text width based on content and font size
            const estimatedWidth = estimateTextWidth(txt.content, txt.style.fontSize);
            const txtEndX = txtX + estimatedWidth;
            const txtEndY = txtY + txt.style.fontSize * 1.2; // Approximate height

            // Check if text overlaps with this cell
            return (
              txtX < cellEndX && txtEndX > cellStartX && txtY < cellEndY && txtEndY > cellStartY
            );
          })
          .map((txt) => {
            // Calculate if and how the text should be clipped in this cell
            const estimatedWidth = estimateTextWidth(txt.content, txt.style.fontSize);
            const txtEndX = txt.position.x + estimatedWidth;
            const txtEndY = txt.position.y + txt.style.fontSize * 1.2;

            const clippingX =
              txt.position.x < cellStartX
                ? { start: true, clipAmount: cellStartX - txt.position.x }
                : txtEndX > cellEndX
                ? { end: true, clipAmount: txtEndX - cellEndX }
                : null;

            const clippingY =
              txt.position.y < cellStartY
                ? { start: true, clipAmount: cellStartY - txt.position.y }
                : txtEndY > cellEndY
                ? { end: true, clipAmount: txtEndY - cellEndY }
                : null;

            return {
              ...txt,
              clipping: {
                x: clippingX,
                y: clippingY,
              },
            };
          });

        sections.push({
          index: i,
          row,
          col,
          images: cellImages,
          texts: cellTexts,
        });
      }

      // Simulate processed output
      const output = {
        template: {
          aspectRatio: templateData.aspectRatio,
          backgroundColor: templateData.backgroundColor,
          canvasCount: templateData.canvasCount,
          gridSize: templateData.gridSize,
          sections,
        },
        outputUrls: templateData.outputUrls,
      };

      return {
        success: true,
        data: output,
      };
    } catch (error) {
      console.error("Error processing template:", error);
      return {
        success: false,
        error: "Failed to process template. Please try again.",
      };
    }
  },

  // Save template for future use
  saveTemplate: async (templateData: TemplateData): Promise<ApiResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      console.log("Saving template with data:", templateData);

      // Simulate successful save
      return {
        success: true,
        data: {
          templateId: `template-${Date.now()}`,
          message: "Template saved successfully",
        },
      };
    } catch (error) {
      console.error("Error saving template:", error);
      return {
        success: false,
        error: "Failed to save template. Please try again.",
      };
    }
  },
};
