import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, X, Pencil } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImageEditor from "./editor/ImageEditor";
import { v4 as uuidv4 } from "uuid";
import ModalWrapper from "../generic/ModalWrapper";
import UnsplashMediaModalContent from "./mediaUpload/UnsplashMediaModalContent";
import GiphyMediaModalContent from "./mediaUpload/GiphyMediaModalContent";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  selectPostCreation,
  setMediaUrls,
} from "@/redux/slices/postCreation.slice";

export interface Media {
  id: string;
  url: string;
  type: "image" | "video";
}

interface MediaUploaderProps {
  onlyTriggerButton?: boolean;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onlyTriggerButton = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const dispatch = useDispatch();
  const { mediaUrls } = useSelector(selectPostCreation);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const mediaArray: Media[] = Array.from(files).map((file) => ({
        id: uuidv4(),
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      }));
      dispatch(setMediaUrls([...mediaUrls, ...mediaArray]));
      setIsOpen(false);
    }
  };

  // const handleConfirmSelection = () => {
  //   onMediaSelect(selectedMediaContent); // Pass selected demo media to parent
  //   setIsOpen(false);
  //   setSelectedMediaContent([]); // Reset selection after confirming
  // };

  const handleEditMedia = (media: Media) => {
    // Open edit dialog for specific media
    setSelectedMedia(media);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedMedia = (
    editedMediaUrl: string,
    selectedImage: Media
  ) => {
    const editedMediaId = selectedImage?.id;
    const updatedMediaUrls = mediaUrls.map((media) =>
      media.id === editedMediaId ? { ...media, url: editedMediaUrl } : media
    );
    dispatch(setMediaUrls(updatedMediaUrls));
    setIsEditDialogOpen(false);
  };

  const handleRemoveMedia = (id: string) => {
    if (mediaUrls) {
      const updatedMedia = mediaUrls.filter((media) => media.id !== id);
      dispatch(setMediaUrls(updatedMedia)); // Update the media selection
    }
  };

  console.log("selectedMedia", mediaUrls);
  return (
    <div>
      <div>
        {onlyTriggerButton ? (
          <MediaModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            // handleConfirmSelection={handleConfirmSelection}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <MediaModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              // handleConfirmSelection={handleConfirmSelection}
            />

            {mediaUrls && mediaUrls?.length > 0 && (
              <Card className="relative">
                <CardContent className="p-0 overflow-hidden">
                  <div className="flex flex-wrap">
                    {mediaUrls.map((media) => (
                      <div key={media.id} className="relative m-1">
                        {media.type === "video" ? (
                          <video
                            src={media.url}
                            controls
                            className="h-20 w-20 rounded object-cover"
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={`Selected ${media.id}`}
                            className="h-20 w-20 rounded object-cover"
                          />
                        )}
                        <div className="absolute top-0 right-0 flex space-x-1">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
                            onClick={() => handleEditMedia(media)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => handleRemoveMedia(media.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          {mediaUrls && mediaUrls?.length > 0 && (
            <ImageEditor
              selectedImage={selectedMedia}
              onSave={handleSaveEditedMedia}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaUploader;

const MediaModal = ({
  isOpen,
  setIsOpen,
  fileInputRef,
  handleFileChange,
}: // handleConfirmSelection,
{
  isOpen: boolean;
  setIsOpen: any;
  fileInputRef: any;
  handleFileChange: any;
  // handleConfirmSelection: () => void;
}) => {
  const dispatch = useDispatch();
  const { mediaUrls } = useSelector(selectPostCreation);
  const [selectedMediaContent, setSelectedMediaContent] = useState<Media[]>([]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <ImagePlus className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="start">
        <div className="flex flex-col gap-2">
          <div>
            <Button
              variant="outline"
              className="w-fit"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload from computer
            </Button>
            <input
              type="file"
              accept="image/*, video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
            />
          </div>

          <ModalWrapper
            title="Unsplash"
            description="Add media to your post"
            triggerButtonText="Unsplash"
            submitButtonText="Confirm"
            onSubmit={() => {
              dispatch(setMediaUrls(selectedMediaContent));
            }}
            children={
              <UnsplashMediaModalContent
                selectedMediaContent={selectedMediaContent}
                setSelectedMediaContent={setSelectedMediaContent}
              />
            }
          />

          <ModalWrapper
            title="Giphy"
            description="Add media to your post"
            triggerButtonText="Giphy"
            submitButtonText="Confirm"
            onSubmit={() => {
              dispatch(setMediaUrls(selectedMediaContent));
            }}
            children={
              <GiphyMediaModalContent
                selectedMediaContent={selectedMediaContent}
                setSelectedMediaContent={setSelectedMediaContent}
              />
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
