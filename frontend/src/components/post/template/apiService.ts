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

// This is a mock API service for demo purposes
export const apiService = {
  // Process template and generate output
  processTemplate: async (templateData: TemplateData): Promise<ApiResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      console.log("Processing template with data:", templateData);

      // Simulate API processing
      const sections = [];

      for (let i = 0; i < templateData.canvasCount; i++) {
        const sectionImages = templateData.images.filter((img) => img.canvasIndex === i);
        const sectionTexts = templateData.texts.filter((txt) => txt.canvasIndex === i);

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
