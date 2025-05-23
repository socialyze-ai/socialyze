import { Button } from "@/components/ui/button";
import MediaUploader, { Media } from "../../MediaUploader";
import { Type } from "lucide-react";
import ImageGallery from "./ImageGallery";
import { Separator } from "@/components/ui/separator";

const ContentAndMediaManager = ({
  handleMediaChange,
  handleAddText,
}: {
  handleMediaChange: (media: Media[]) => void;
  handleAddText: () => void;
}) => {
  return (
    <div className="w-full flex flex-col bg-white rounded-lg shadow">
      <div className="flex gap-2 w-fit self-end p-2">
        <MediaUploader onlyTriggerButton={true} onMediaChange={handleMediaChange} />

        <Button variant="outline" className="flex-1" onClick={handleAddText}>
          <Type className="w-4 h-4 mr-2" />
          Add Text
        </Button>
      </div>
      <Separator />

      <ImageGallery />
    </div>
  );
};

export default ContentAndMediaManager;
