import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import TemplateEditModal from "./carouselEditor/TemplateEditModal";
import { Book, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setIsTemplateSectionOpen } from "@/redux/slices/postCreation.slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PostTemplatePreview from "../PostTemplatePreview";
import { useDispatch } from "react-redux";
import { setIsModalOpen, setSelectedTemplate } from "@/redux/slices/templateGeneration.slice";
import TemplateGenerationModal from "./TemplateGenerationModal";
import TemplateCards from "./carouselEditor/TemplateCards";
import CarouselTemplate from "./carouselEditor/CarouselTemplate";

const mockSuggestions = [
  {
    id: 1,
    name: "Product Launch",
  },
  {
    id: 2,
    name: "Holiday Promotion",
  },
  {
    id: 3,
    name: "Weekly Update",
  },
  {
    id: 4,
    name: "Event Announcement",
  },
  {
    id: 5,
    name: "Customer Success Story",
  },
];

const TemplatePanel = () => {
  const dispatch = useDispatch();

  const handleClose = () => {
    setIsTemplateSectionOpen(false);
  };

  return (
    <Card className="w-full h-full flex flex-col border-gray-200">
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

      <CardContent className="h-full w-full p-0">
        <Tabs defaultValue="facebook" className="flex flex-col justify-center">
          <TabsList className="flex gap-1 overflow-x-auto">
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="linkedin">Linkedin</TabsTrigger>
            <TabsTrigger value="x">X</TabsTrigger>
          </TabsList>

          <div className="h-full pb-2 px-2">
            <TabsContent value="facebook" className="h-full flex flex-col gap-2">
              <div className="flex flex-wrap gap-1">
                {mockSuggestions?.map((sug) => {
                  return (
                    <Badge key={sug?.id} className="cursor-pointer" variant="outline">
                      {sug?.name}
                    </Badge>
                  );
                })}
              </div>

              <TemplateEditModal />

              <TemplateGenerationModal />

              <TemplateCards />
            </TabsContent>

            <TabsContent value="instagram">
              <p>I</p>
              <div className="flex flex-wrap gap-2">
                {mockSuggestions?.map((sug) => {
                  return (
                    <Badge key={sug?.id} className="cursor-pointer" variant="outline">
                      {sug?.name}
                    </Badge>
                  );
                })}
              </div>

              <CarouselTemplate />
            </TabsContent>

            <TabsContent value="linkedin">
              <p>L</p>
              <div className="flex flex-wrap gap-2">
                {mockSuggestions?.map((sug) => {
                  return (
                    <Badge key={sug?.id} className="cursor-pointer" variant="outline">
                      {sug?.name}
                    </Badge>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="x">
              <p>X</p>
              <div className="flex flex-wrap gap-2">
                {mockSuggestions?.map((sug) => {
                  return (
                    <Badge key={sug?.id} className="cursor-pointer" variant="outline">
                      {sug?.name}
                    </Badge>
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      <CardFooter className="flex gap-2 justify-end p-3 border-t border-gray-200 bg-white rounded-b">
        <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
          Create Custom
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplatePanel;
