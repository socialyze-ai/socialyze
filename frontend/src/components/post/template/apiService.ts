import { ImageItem, TextItem } from "@/redux/slices/template.slice";

interface TemplateData {
  canvasCount: number;
  aspectRatio: string;
  backgroundColor: string;
  images: ImageItem[];
  texts: TextItem[];
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Helper to determine if an item should be clipped in a section
const getItemClipping = (
  itemPosition: { x: number; y: number },
  itemSize: { width: number; height: number },
  sectionIndex: number,
  sectionWidth: number,
) => {
  const itemStartX = itemPosition.x;
  const itemEndX = itemPosition.x + itemSize.width;

  const sectionStartX = sectionIndex * sectionWidth;
  const sectionEndX = (sectionIndex + 1) * sectionWidth;

  // If item is fully contained in section, no clipping needed
  if (itemStartX >= sectionStartX && itemEndX <= sectionEndX) {
    return null;
  }

  // Calculate clipping
  if (itemStartX < sectionStartX) {
    // Item starts before this section
    return {
      start: true,
      clipAmount: sectionStartX - itemStartX,
    };
  } else {
    // Item extends beyond this section
    return {
      end: true,
      clipAmount: itemEndX - sectionEndX,
    };
  }
};

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

      // Calculate canvas dimensions and section width
      let canvasWidth;
      const canvasHeight = 384; // Fixed canvas height

      switch (templateData.aspectRatio) {
        case "16:9":
          canvasWidth = (canvasHeight * 16) / 9;
          break;
        case "1:1":
          canvasWidth = canvasHeight;
          break;
        case "4:5":
          canvasWidth = (canvasHeight * 4) / 5;
          break;
        default:
          canvasWidth = (canvasHeight * 16) / 9;
      }

      const sectionWidth = canvasWidth / templateData.canvasCount;

      // Simulate API processing for each section
      const sections = [];

      for (let i = 0; i < templateData.canvasCount; i++) {
        // Find images that are at least partially in this section
        const sectionImages = templateData.images
          .filter((img) => {
            const imgStartX = img.position.x;
            const imgEndX = img.position.x + img.size.width;
            const sectionStartX = i * sectionWidth;
            const sectionEndX = (i + 1) * sectionWidth;

            // Check if image overlaps with this section
            return imgStartX < sectionEndX && imgEndX > sectionStartX;
          })
          .map((img) => {
            // Calculate if and how the image should be clipped in this section
            const clipping = getItemClipping(img.position, img.size, i, sectionWidth);

            return {
              ...img,
              clipping,
            };
          });

        // Find texts that are at least partially visible in this section
        const sectionTexts = templateData.texts
          .filter((txt) => {
            const txtX = txt.position.x;
            // Estimate text width based on content and font size
            const estimatedWidth = estimateTextWidth(txt.content, txt.style.fontSize);
            const txtEndX = txtX + estimatedWidth;

            const sectionStartX = i * sectionWidth;
            const sectionEndX = (i + 1) * sectionWidth;

            // Check if text overlaps with this section
            return txtX < sectionEndX && txtEndX > sectionStartX;
          })
          .map((txt) => {
            // Calculate if and how the text should be clipped in this section
            const estimatedWidth = estimateTextWidth(txt.content, txt.style.fontSize);
            const clipping = getItemClipping(
              txt.position,
              { width: estimatedWidth, height: txt.style.fontSize },
              i,
              sectionWidth,
            );

            return {
              ...txt,
              clipping,
            };
          });

        sections.push({
          index: i,
          images: sectionImages,
          texts: sectionTexts,
        });
      }

      // Simulate processed output
      const output = {
        template: {
          aspectRatio: templateData.aspectRatio,
          backgroundColor: templateData.backgroundColor,
          canvasCount: templateData.canvasCount,
          sections,
        },
        outputUrl: "https://example.com/generated-template-12345.jpg",
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
