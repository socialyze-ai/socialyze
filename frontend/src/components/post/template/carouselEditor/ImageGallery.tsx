import React, { useState } from "react";
import { X, Pencil, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setImages } from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ImageEditor from "../../editor/ImageEditor";
import { Media } from "../../MediaUploader";
import MediaUploader from "../../MediaUploader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<TemplateImage | null>(null);
  const [imageToReplace, setImageToReplace] = useState<string | null>(null);

  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter((image) => image.id !== id);
    dispatch(setImages(updatedImages));
  };

  const handleEditImage = (image: TemplateImage) => {
    setSelectedImage(image);
    setIsEditDialogOpen(true);
  };

  const handleReplaceImage = (id: string) => {
    setImageToReplace(id);
    setIsReplaceDialogOpen(true);
  };

  const handleSaveEditedImage = (editedImageUrl: string, selectedMedia: Media) => {
    if (!selectedImage) return;

    // Update the image with edited version
    const updatedImages = images.map((img) =>
      img.id === selectedImage.id ? { ...img, src: editedImageUrl } : img,
    );

    dispatch(setImages(updatedImages));
    setIsEditDialogOpen(false);
    setSelectedImage(null);
  };

  const handleMediaSelect = (selectedMedia: Media[]) => {
    if (!imageToReplace || selectedMedia.length === 0) return;

    // Get the last selected media (most recently added)
    const newMedia = selectedMedia[selectedMedia.length - 1];

    // Update the image with the new media while keeping position and size
    const updatedImages = images.map((img) =>
      img.id === imageToReplace
        ? {
            ...img,
            id: newMedia.id, // Update ID to the new media ID
            src: newMedia.url, // Update source to the new media URL
          }
        : img,
    );

    dispatch(setImages(updatedImages));
    setIsReplaceDialogOpen(false);
    setImageToReplace(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow mt-4">
        <h3 className="font-medium mb-2">Added Images</h3>
        <div className="flex flex-wrap gap-2">
          {images.map((image: TemplateImage) => (
            <div
              key={image.id}
              className="relative group border border-gray-200 rounded-md overflow-hidden"
            >
              <img src={image.src} alt={`Image ${image.id}`} className="h-16 w-16 object-cover" />
              <div className="absolute top-1 right-1 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditImage(image)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Image</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove Image</TooltipContent>
                  </Tooltip>
                </div>

                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleReplaceImage(image.id)}
                    >
                      <ImagePlus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Replace Image</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <ImageEditor
              selectedImage={{
                id: selectedImage.id,
                url: selectedImage.src,
                type: "image",
              }}
              onSave={handleSaveEditedImage}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Replace Image Dialog */}
      <Dialog open={isReplaceDialogOpen} onOpenChange={setIsReplaceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Replace Image</DialogTitle>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Select a new image to replace the current one. Position and size will be maintained.
            </p>
            <MediaUploader
              onlyTriggerButton={false}
              onMediaChange={handleMediaSelect}
              modalMode={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
