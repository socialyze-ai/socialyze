import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setImages } from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";

interface TemplateImage {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  canvasIndex: number;
}

const ImageGallery: React.FC = () => {
  const dispatch = useDispatch();
  const { images } = useSelector((state: RootState) => state.template);

  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter((image) => image.id !== id);
    dispatch(setImages(updatedImages));
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h3 className="font-medium mb-2">Added Images</h3>
      <div className="flex flex-wrap gap-2">
        {images.map((image: TemplateImage) => (
          <div
            key={image.id}
            className="relative group border border-gray-200 rounded-md overflow-hidden"
          >
            <img src={image.src} alt={`Image ${image.id}`} className="h-16 w-16 object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(image.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
