import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, X, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImageEditor from "./editor/ImageEditor";
import { v4 as uuidv4 } from "uuid";
import ModalWrapper from "../generic/ModalWrapper";
import UnsplashMediaModalContent from "./mediaUpload/UnsplashMediaModalContent";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  selectPostCreation,
  setMediaUrls,
  selectActiveChannel,
  selectIsContentSynced,
  syncMediaAcrossChannels,
  setMediaForChannel,
  selectMediaByChannel,
} from "@/redux/slices/postCreation.slice";
import { useUploadMedia } from "@/api/apiHooks/useMedia";
import { toast } from "@/components/ui/use-toast";

export interface Media {
  id: string;
  url: string;
  type: "image" | "video";
}

interface MediaUploaderProps {
  onlyTriggerButton?: boolean;
  mediaUrls?: Media[];
  onMediaChange?: (media: Media[]) => void;
  modalMode?: boolean;
  channelId?: string; // Add channelId prop to identify which channel this uploader is for
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onlyTriggerButton = false,
  mediaUrls: externalMediaUrls,
  onMediaChange,
  modalMode = false,
  channelId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const dispatch = useDispatch();
  const { mediaUrls: globalMediaUrls } = useSelector(selectPostCreation);
  const activeChannel = useSelector(selectActiveChannel);
  const isContentSynced = useSelector(selectIsContentSynced);
  const mediaByChannel = useSelector(selectMediaByChannel);

  // Use external media if provided, otherwise use global state
  const mediaUrls = externalMediaUrls !== undefined ? externalMediaUrls : globalMediaUrls;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMediaArray: Media[] = Array.from(files).map((file) => ({
        id: uuidv4(),
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      }));

      // If external media handling is provided, use that
      if (onMediaChange) {
        // Add new media to existing array without replacing
        onMediaChange([...mediaUrls, ...newMediaArray]);
      } else {
        // Handle media update based on sync state and active channel
        const updatedMedia = [...mediaUrls, ...newMediaArray];

        // If we're in a specific channel context and unsynced
        if (channelId && !isContentSynced) {
          dispatch(
            setMediaForChannel({
              channelId,
              media: updatedMedia,
            }),
          );
        }
        // If we have an active channel and not synced
        else if (activeChannel && !isContentSynced) {
          dispatch(
            setMediaForChannel({
              channelId: activeChannel,
              media: updatedMedia,
            }),
          );
        }
        // If we're synced, use the sync action to update all channels
        else if (isContentSynced && activeChannel) {
          dispatch(
            syncMediaAcrossChannels({
              sourceChannelId: activeChannel,
              media: updatedMedia,
            }),
          );
        }
        // Fallback for global context
        else {
          dispatch(setMediaUrls(updatedMedia));
        }
      }

      // Clear the file input for future uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsOpen(false);
    }
  };

  const handleEditMedia = (media: Media) => {
    // Open edit dialog for specific media
    setSelectedMedia(media);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedMedia = (editedMediaUrl: string, selectedImage: Media) => {
    if (!selectedImage) return;

    const editedMediaId = selectedImage.id;
    // Make sure we're updating the correct media array
    const updatedMediaUrls = mediaUrls.map((media) =>
      media.id === editedMediaId ? { ...media, url: editedMediaUrl } : media,
    );

    // If external media handling is provided, use that
    if (onMediaChange) {
      onMediaChange(updatedMediaUrls);
    } else {
      // Handle media update based on sync state and active channel
      if (channelId && !isContentSynced) {
        dispatch(
          setMediaForChannel({
            channelId,
            media: updatedMediaUrls,
          }),
        );
      }
      // If we have an active channel and not synced
      else if (activeChannel && !isContentSynced) {
        dispatch(
          setMediaForChannel({
            channelId: activeChannel,
            media: updatedMediaUrls,
          }),
        );
      }
      // If we're synced, use the sync action to update all channels
      else if (isContentSynced && activeChannel) {
        dispatch(
          syncMediaAcrossChannels({
            sourceChannelId: activeChannel,
            media: updatedMediaUrls,
          }),
        );
      }
      // Fallback for global context
      else {
        dispatch(setMediaUrls(updatedMediaUrls));
      }
    }

    setIsEditDialogOpen(false);
  };

  const handleRemoveMedia = (id: string) => {
    if (mediaUrls) {
      const updatedMedia = mediaUrls.filter((media) => media.id !== id);

      // If external media handling is provided, use that
      if (onMediaChange) {
        onMediaChange(updatedMedia);
      } else {
        // Handle media update based on sync state and active channel
        if (channelId && !isContentSynced) {
          dispatch(
            setMediaForChannel({
              channelId,
              media: updatedMedia,
            }),
          );
        }
        // If we have an active channel and not synced
        else if (activeChannel && !isContentSynced) {
          dispatch(
            setMediaForChannel({
              channelId: activeChannel,
              media: updatedMedia,
            }),
          );
        }
        // If we're synced, use the sync action to update all channels
        else if (isContentSynced && activeChannel) {
          dispatch(
            syncMediaAcrossChannels({
              sourceChannelId: activeChannel,
              media: updatedMedia,
            }),
          );
        }
        // Fallback for global context
        else {
          dispatch(setMediaUrls(updatedMedia));
        }
      }
    }
  };

  return (
    <div>
      <div>
        {onlyTriggerButton ? (
          <MediaModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            modalMode={modalMode}
            onMediaSelect={onMediaChange}
            channelId={channelId}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <MediaModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              modalMode={modalMode}
              onMediaSelect={onMediaChange}
              channelId={channelId}
            />

            {mediaByChannel[channelId] && mediaByChannel[channelId].length > 0 && (
              <Card className="relative">
                <CardContent className="p-0 overflow-hidden">
                  <div className="flex flex-wrap">
                    {mediaByChannel[channelId].map((media) => (
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
          {selectedMedia && (
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
  modalMode = false,
  onMediaSelect,
  channelId,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  modalMode?: boolean;
  onMediaSelect?: (media: Media[]) => void;
  channelId?: string;
}) => {
  const dispatch = useDispatch();
  const { mediaUrls } = useSelector(selectPostCreation);
  const activeChannel = useSelector(selectActiveChannel);
  const isContentSynced = useSelector(selectIsContentSynced);
  const [selectedMediaContent, setSelectedMediaContent] = useState<Media[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: uploadMedia, isPending: isPendingUploadMedia } = useUploadMedia();

  // Reset selected media content when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMediaContent([]);
    }
  }, [isOpen]);

  const handleConfirmSelection = () => {
    if (selectedMediaContent.length === 0) {
      setIsOpen(false);
      return;
    }

    if (onMediaSelect) {
      // Add to existing media without replacing
      onMediaSelect([...mediaUrls, ...selectedMediaContent]);
    } else {
      // Handle media update based on sync state and active channel
      const updatedMedia = [...mediaUrls, ...selectedMediaContent];

      // If we're in a specific channel context and unsynced
      if (channelId && !isContentSynced) {
        dispatch(
          setMediaForChannel({
            channelId,
            media: updatedMedia,
          }),
        );
      }
      // If we have an active channel and not synced
      else if (activeChannel && !isContentSynced) {
        dispatch(
          setMediaForChannel({
            channelId: activeChannel,
            media: updatedMedia,
          }),
        );
      }
      // If we're synced, use the sync action to update all channels
      else if (isContentSynced && activeChannel) {
        dispatch(
          syncMediaAcrossChannels({
            sourceChannelId: activeChannel,
            media: updatedMedia,
          }),
        );
      }
      // Fallback for global context
      else {
        dispatch(setMediaUrls(updatedMedia));
      }
    }
    setIsOpen(false);
    setSelectedMediaContent([]);
  };

  const uploadFilesToServer = async (files: FileList) => {
    setIsUploading(true);
    try {
      // Create an array from the FileList to handle multiple files
      const filesArray = Array.from(files);

      const formData = new FormData();
      formData.append("file", filesArray[0]);
      formData.append("postId", uuidv4());

      // Upload files to the server
      await uploadMedia(formData, {
        onSuccess: (response) => {
          if (response?.data?.url) {
            // Create media object from the server response
            const newMedia: Media = {
              id: uuidv4(),
              url: response.data.url,
              type: filesArray[0].type.startsWith("video/") ? "video" : "image",
            };

            console.log("newMedia", newMedia);

            // If external media handling is provided, use that
            if (onMediaSelect) {
              // Add new media to existing array without replacing
              onMediaSelect([...mediaUrls, newMedia]);
            } else {
              // Handle media update based on sync state and active channel
              const updatedMedia = [...mediaUrls, newMedia];

              // If we're in a specific channel context and unsynced
              if (channelId && !isContentSynced) {
                dispatch(
                  setMediaForChannel({
                    channelId,
                    media: updatedMedia,
                  }),
                );
              }
              // If we have an active channel and not synced
              else if (activeChannel && !isContentSynced) {
                dispatch(
                  setMediaForChannel({
                    channelId: activeChannel,
                    media: updatedMedia,
                  }),
                );
              }
              // If we're synced, use the sync action to update all channels
              else if (isContentSynced && activeChannel) {
                dispatch(
                  syncMediaAcrossChannels({
                    sourceChannelId: activeChannel,
                    media: updatedMedia,
                  }),
                );
              }
              // Fallback for global context
              else {
                dispatch(setMediaUrls(updatedMedia));
              }
            }

            toast({
              title: "Success",
              description: "Media uploaded successfully",
            });
          } else {
            throw new Error("Invalid response format");
          }
        },
        onError: (error) => {
          console.error("Error uploading media:", error);
          toast({
            title: "Error",
            description: "Failed to upload media",
            variant: "destructive",
          });
        },
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Override the file change handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFilesToServer(files);
    }

    // Clear the file input for future uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload from computer"}
            </Button>
            <input
              type="file"
              accept="image/*, video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
            />
          </div>

          <ModalWrapper
            title="Unsplash"
            description="Add media to your post"
            triggerButtonText="Unsplash"
            submitButtonText="Confirm"
            onSubmit={handleConfirmSelection}
            children={
              <UnsplashMediaModalContent
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
