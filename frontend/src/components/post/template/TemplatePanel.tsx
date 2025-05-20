import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import TemplateEditModal from "./TemplateEditModal";
import { Book, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setIsTemplateSectionOpen } from "@/redux/slices/postCreation.slice";

const TemplatePanel = () => {
  const handleClose = () => {
    setIsTemplateSectionOpen(false);
  };

  return (
    <Card className="w-full h-full border-gray-200">
      <div className="h-full flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
          <div className="flex items-center">
            <span className="text-blue-600 font-medium flex items-center text-sm">
              <Book className="h-4 w-4 mr-1" /> Templates
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-3">
          <p className="text-sm text-gray-700 mb-2">What do you want to write about?</p>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end p-3 border-t border-gray-200">
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            hello world
          </Button>
          <TemplateEditModal />
        </CardFooter>
      </div>
    </Card>
  );
};

export default TemplatePanel;
