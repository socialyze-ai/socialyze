import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const Preview = () => {
  const { canvasCount, aspectRatio, backgroundColor, images, texts } = useSelector(
    (state: RootState) => state.template,
  );

  // Calculate aspect ratio for preview
  const getAspectRatioStyle = () => {
    const previewHeight = 150; // Fixed height for preview
    let width;

    switch (aspectRatio) {
      case "16:9":
        width = `${(previewHeight * 16) / 9}px`;
        return { width, height: `${previewHeight}px` };
      case "1:1":
        width = `${previewHeight}px`;
        return { width, height: `${previewHeight}px` };
      case "4:5":
        width = `${(previewHeight * 4) / 5}px`;
        return { width, height: `${previewHeight}px` };
      default:
        width = `${(previewHeight * 16) / 9}px`;
        return { width, height: `${previewHeight}px` };
    }
  };

  // Generate preview sections
  const renderPreviewSections = () => {
    const sections = [];
    // Calculate the scale factor based on canvas height (384px) to preview height (150px)
    const scaleFactor = 150 / 384;

    for (let i = 0; i < canvasCount; i++) {
      sections.push(
        <div
          key={`preview-section-${i}`}
          className="border border-gray-300 relative"
          style={{
            flex: `1 0 ${100 / canvasCount}%`,
            minWidth: `${100 / canvasCount}%`,
            backgroundColor,
            overflow: "hidden",
          }}
        >
          {/* Section number indicator */}
          <div className="absolute top-1 left-1 bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-xs text-gray-700 z-10">
            {i + 1}
          </div>

          {/* Render preview images in this section */}
          {images
            .filter((img) => img.canvasIndex === i)
            .map((img) => {
              return (
                <div
                  key={`preview-${img.id}`}
                  className="absolute"
                  style={{
                    left: `${img.position.x * scaleFactor}px`,
                    top: `${img.position.y * scaleFactor}px`,
                    width: `${img.size.width * scaleFactor}px`,
                    height: `${img.size.height * scaleFactor}px`,
                  }}
                >
                  <img src={img.src} alt="Preview" className="w-full h-full object-cover" />
                </div>
              );
            })}

          {/* Render preview texts in this section */}
          {texts
            .filter((txt) => txt.canvasIndex === i)
            .map((txt) => {
              return (
                <div
                  key={`preview-${txt.id}`}
                  className="absolute"
                  style={{
                    left: `${txt.position.x * scaleFactor}px`,
                    top: `${txt.position.y * scaleFactor}px`,
                  }}
                >
                  <div
                    style={{
                      fontSize: `${txt.style.fontSize * scaleFactor}px`,
                      color: txt.style.color,
                    }}
                  >
                    {txt.content}
                  </div>
                </div>
              );
            })}
        </div>,
      );
    }

    return sections;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-sm font-medium mb-2">Preview</h3>
      <div className="bg-gray-50 rounded-lg p-2 flex justify-center">
        <div className="flex overflow-x-auto" style={getAspectRatioStyle()}>
          {renderPreviewSections()}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">Preview of your template</p>
    </div>
  );
};

export default Preview;
