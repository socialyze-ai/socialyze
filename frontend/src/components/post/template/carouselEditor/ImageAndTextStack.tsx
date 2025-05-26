import React, { useState } from "react";
import { X, Pencil, ImagePlus, Layers, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setImages, setSelectedItem, removeItem } from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ImageEditor from "../../editor/ImageEditor";
import { Media } from "../../MediaUploader";
import MediaUploader from "../../MediaUploader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import TextEditor from "./TextEditor";

interface TemplateImage {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  canvasIndex: number;
  zIndex: number;
}

interface TemplateText {
  id: string;
  content: string;
  position: { x: number; y: number };
  size?: { width: number | string; height: number | string };
  style: {
    fontSize: number;
    color: string;
    fontFamily?: string;
    fontWeight?: string;
    rotation?: number;
    textAlign?: string;
    fontStyle?: string;
    lineHeight?: string;
  };
  canvasIndex: number;
  zIndex: number;
}

const ImageAndTextStack: React.FC = () => {
  const dispatch = useDispatch();
  const { images, texts, selectedItemId } = useSelector((state: RootState) => state.template);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<TemplateImage | null>(null);
  const [imageToReplace, setImageToReplace] = useState<string | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Calculate total layers (needed for display purposes)
  const totalLayers = images.length + texts.length;

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

  // Handle item selection
  const handleSelectItem = (id: string) => {
    dispatch(setSelectedItem(id));
  };

  const handleEditText = (id: string) => {
    const textToEdit = texts.find((txt) => txt.id === id);
    if (textToEdit) {
      setEditingTextId(id);
      setShowTextEditor(true);
    }
  };

  const handleSaveEditedText = (
    content: string,
    style?: {
      fontSize: number;
      color: string;
      fontFamily?: string;
      fontWeight?: string;
      rotation?: number;
    },
  ) => {
    // Logic to save edited text will be handled by parent
    setShowTextEditor(false);
    setEditingTextId(null);
  };

  // Handle removing text
  const handleRemoveText = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeItem(id));
  };

  const hasImages = images.length > 0;
  const hasTexts = texts.length > 0;

  // Function to get layer position text
  const getLayerPositionText = (zIndex: number) => {
    if (zIndex === totalLayers) return "Top Layer";
    if (zIndex === 1) return "Bottom Layer";
    return `Layer ${zIndex} of ${totalLayers}`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-2 w-full">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4" />
          <h3 className="text-sm font-medium">Assets</h3>
        </div>

        <Separator className="my-2" />

        {/* Images section */}
        {hasImages && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              <ImagePlus className="h-3 w-3 mr-1" />
              Images
            </div>
            <div className="flex gap-2 w-fit h-fit flex-wrap">
              {images.map((image: TemplateImage) => (
                <div
                  key={image.id}
                  className={`relative group border rounded-md overflow-hidden ${
                    selectedItemId === image.id ? "border-blue-500" : "border-gray-200"
                  }`}
                  onClick={() => handleSelectItem(image.id)}
                >
                  <img
                    src={image.src}
                    alt={`Image ${image.id}`}
                    className="h-16 w-16 object-cover"
                  />
                  <div className="absolute top-1 right-1 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditImage(image);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(image.id);
                            }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplaceImage(image.id);
                          }}
                        >
                          <ImagePlus className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Replace Image</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Z-Index indicator */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white text-xs px-1">
                        {image.zIndex}/{totalLayers}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {getLayerPositionText(image.zIndex)}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separator between images and text if both exist */}
        {hasImages && hasTexts && <Separator className="my-2" />}

        {/* Text section */}
        {hasTexts && (
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              <Type className="h-3 w-3 mr-1" />
              Text
            </div>
            <div className="flex gap-2 w-fit h-fit flex-wrap">
              {texts.map((text: TemplateText) => (
                <div
                  key={text.id}
                  className={`relative group border rounded-md overflow-hidden p-2 min-w-[80px] min-h-[40px] flex items-center justify-center ${
                    selectedItemId === text.id ? "border-blue-500" : "border-gray-200"
                  }`}
                  style={{
                    color: text.style.color,
                    fontFamily: text.style.fontFamily || "inherit",
                  }}
                  onClick={() => handleSelectItem(text.id)}
                >
                  <div className="text-xs truncate max-w-[100px]">
                    {text.content.length > 10
                      ? `${text.content.substring(0, 10)}...`
                      : text.content}
                  </div>

                  <div className="absolute top-0 right-0 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditText(text.id);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Text</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => handleRemoveText(text.id, e)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove Text</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Z-Index indicator */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white text-xs px-1">
                        {text.zIndex}/{totalLayers}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {getLayerPositionText(text.zIndex)}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasImages && !hasTexts && (
          <div className="text-center py-4 text-sm text-gray-500">No images or text added yet</div>
        )}
      </div>

      {/* Image Editor Dialog */}
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

      {/* Text Editor Dialog */}
      {showTextEditor && editingTextId && (
        <TextEditor
          onSave={handleSaveEditedText}
          onCancel={() => {
            setShowTextEditor(false);
            setEditingTextId(null);
          }}
          initialText={texts.find((txt) => txt.id === editingTextId)?.content || ""}
          initialStyle={texts.find((txt) => txt.id === editingTextId)?.style}
        />
      )}
    </>
  );
};

export default ImageAndTextStack;
