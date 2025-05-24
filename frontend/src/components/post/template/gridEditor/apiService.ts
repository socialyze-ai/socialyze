import { ImageItem, TextItem } from "@/redux/slices/template.slice";

interface TemplateData {
  canvasCount: number;
  aspectRatio: string;
  backgroundColor: string;
  gridSize: { columns: number; rows: number };
  images: ImageItem[];
  texts: TextItem[];
  outputUrls?: string[];
  socialPlatform?: string | null;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Supported aspect ratios
const SUPPORTED_ASPECT_RATIOS = ["16:9", "1:1", "4:5"];

// Helper to validate template data
const validateTemplateData = (data: TemplateData): { valid: boolean; error?: string } => {
  // Validate canvasCount
  if (typeof data.canvasCount !== "number" || data.canvasCount <= 0) {
    return { valid: false, error: "Invalid canvas count" };
  }

  // Validate aspectRatio
  if (!SUPPORTED_ASPECT_RATIOS.includes(data.aspectRatio)) {
    return { valid: false, error: "Unsupported aspect ratio" };
  }

  // Validate backgroundColor
  if (
    typeof data.backgroundColor !== "string" ||
    !data.backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)
  ) {
    return { valid: false, error: "Invalid background color format" };
  }

  // Validate gridSize
  if (
    !data.gridSize ||
    typeof data.gridSize.columns !== "number" ||
    typeof data.gridSize.rows !== "number" ||
    data.gridSize.columns <= 0 ||
    data.gridSize.rows <= 0
  ) {
    return { valid: false, error: "Invalid grid size" };
  }

  // Validate that we have either images or texts
  if ((!data.images || data.images.length === 0) && (!data.texts || data.texts.length === 0)) {
    return { valid: false, error: "Template must contain at least one image or text element" };
  }

  return { valid: true };
};

// Helper to estimate text width based on content and font size
const estimateTextWidth = (text: string, fontSize: number): number => {
  if (!text) return 0;
  // Approximate width: average character is ~0.6x font size wide
  return text.length * fontSize * 0.6;
};

// This is a mock API service for demo purposes
export const apiService = {
  // Process template and generate output
  processTemplate: async (templateData: TemplateData): Promise<ApiResponse> => {
    try {
      console.log("Processing template with data:", templateData);

      // Validate template data
      const validation = validateTemplateData(templateData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "Invalid template data",
        };
      }

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

      for (const image of templateData.images || []) {
        // Validate image object
        if (!image || !image.id || !image.src) {
          continue; // Skip invalid images
        }

        if (!imageIds.has(image.id)) {
          imageIds.add(image.id);
          uniqueImages.push(image);
        }
      }

      // Simulate API processing for each grid cell
      const sections = [];
      const totalCells = columns * rows;

      // Validate that canvasCount matches grid size
      if (templateData.canvasCount !== totalCells) {
        console.warn(
          `Canvas count (${templateData.canvasCount}) doesn't match grid size (${totalCells}). Using grid size.`,
        );
      }

      for (let i = 0; i < totalCells; i++) {
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
            // Skip images without proper position or size
            if (!img.position || !img.size) return false;

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
        const cellTexts = (templateData.texts || [])
          .filter((txt) => {
            // Skip texts without proper position or content
            if (!txt.position || !txt.content || !txt.style) return false;

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

      // Validate outputUrls if provided
      if (templateData.outputUrls) {
        if (!Array.isArray(templateData.outputUrls)) {
          return {
            success: false,
            error: "Output URLs must be an array",
          };
        }

        if (templateData.outputUrls.length !== totalCells) {
          return {
            success: false,
            error: `Expected ${totalCells} output URLs, but got ${templateData.outputUrls.length}`,
          };
        }

        // Validate each URL
        for (const url of templateData.outputUrls) {
          if (typeof url !== "string" || !url.trim()) {
            return {
              success: false,
              error: "Invalid output URL",
            };
          }
        }
      }

      // Simulate processed output
      const output = {
        template: {
          aspectRatio: templateData.aspectRatio,
          backgroundColor: templateData.backgroundColor,
          canvasCount: totalCells,
          gridSize: templateData.gridSize,
          sections,
          socialPlatform: templateData.socialPlatform,
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
        error:
          error instanceof Error ? error.message : "Failed to process template. Please try again.",
      };
    }
  },

  // Save template for future use
  saveTemplate: async (templateData: TemplateData): Promise<ApiResponse> => {
    try {
      console.log("Saving template with data:", templateData);

      // Validate template data
      const validation = validateTemplateData(templateData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "Invalid template data",
        };
      }

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
        error:
          error instanceof Error ? error.message : "Failed to save template. Please try again.",
      };
    }
  },
};
