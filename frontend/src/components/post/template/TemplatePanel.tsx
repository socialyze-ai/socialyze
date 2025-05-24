import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Book, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setIsTemplateSectionOpen } from "@/redux/slices/postCreation.slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import TemplateGenerationModal from "./TemplateGenerationModal";
import TemplateCards from "./carouselEditor/TemplateCards";
import CarouselTemplate from "./carouselEditor/CarouselTemplate";
import GridTemplate from "./gridEditor/GridTemplate";
import GridTemplateEditModal from "./gridEditor/TemplateEditModal";
import CarouselTemplateEditModal from "./carouselEditor/TemplateEditModal";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { setSocialPlatform } from "@/redux/slices/template.slice";

const linkedinSuggestions = ["Wisdom", "Advice", "Growth", "Content Marketing"];
const instagramAndFacebookSuggestions = ["Grid", "Carousal", "Traveling", "Motivating"];
const xSuggestions = ["Storytelling", "News"];

const TemplatePanel = () => {
  const dispatch = useDispatch();
  const [activeSuggestion, setActiveSuggestion] = useState({
    facebook: instagramAndFacebookSuggestions[0],
    instagram: instagramAndFacebookSuggestions[0],
    linkedin: linkedinSuggestions[0],
    x: xSuggestions[0],
  });
  const [activeTab, setActiveTab] = useState("facebook");

  const handleClose = () => {
    dispatch(setIsTemplateSectionOpen(false));
    setActiveSuggestion({
      facebook: instagramAndFacebookSuggestions[0],
      instagram: instagramAndFacebookSuggestions[0],
      linkedin: linkedinSuggestions[0],
      x: xSuggestions[0],
    });
  };

  const handleSuggestionClick = (suggestion, tab) => {
    setActiveSuggestion({
      ...activeSuggestion,
      [tab]: suggestion,
    });
  };

  const renderTemplateComponent = (tab, suggestion) => {
    if ((tab === "facebook" || tab === "instagram") && suggestion === "Grid") {
      return <GridTemplate socialPlatform={tab} />;
    } else if ((tab === "facebook" || tab === "instagram") && suggestion === "Carousal") {
      return <CarouselTemplate socialPlatform={tab} />;
    } else {
      return <TemplateCards socialPlatform={tab} />;
    }
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

      <TemplateGenerationModal />

      <CardContent className="h-full w-full p-0">
        <Tabs
          defaultValue="facebook"
          className="flex flex-col justify-center"
          onValueChange={(value) => {
            setActiveTab(value);
            dispatch(setSocialPlatform(value));
          }}
        >
          <TabsList className="flex gap-1 overflow-x-auto">
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="linkedin">Linkedin</TabsTrigger>
            <TabsTrigger value="x">X</TabsTrigger>
          </TabsList>

          <div className="h-full pb-2 px-2">
            {activeTab === "facebook" && (
              <TabsContent value="facebook" className="h-full flex flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                  {instagramAndFacebookSuggestions?.map((sug, index) => {
                    return (
                      <Badge
                        key={cn(sug + "-" + index)}
                        className="cursor-pointer"
                        variant={activeSuggestion.facebook === sug ? "default" : "outline"}
                        onClick={() => handleSuggestionClick(sug, "facebook")}
                      >
                        {sug}
                      </Badge>
                    );
                  })}
                </div>

                {renderTemplateComponent("facebook", activeSuggestion.facebook)}
              </TabsContent>
            )}

            {activeTab === "instagram" && (
              <TabsContent value="instagram" className="h-full flex flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                  {instagramAndFacebookSuggestions?.map((sug, index) => {
                    return (
                      <Badge
                        key={cn(sug + "-" + index)}
                        className="cursor-pointer"
                        variant={activeSuggestion.instagram === sug ? "default" : "outline"}
                        onClick={() => handleSuggestionClick(sug, "instagram")}
                      >
                        {sug}
                      </Badge>
                    );
                  })}
                </div>

                {renderTemplateComponent("instagram", activeSuggestion.instagram)}
              </TabsContent>
            )}

            {activeTab === "linkedin" && (
              <TabsContent value="linkedin" className="h-full flex flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                  {linkedinSuggestions?.map((sug, index) => {
                    return (
                      <Badge
                        key={cn(sug + "-" + index)}
                        className="cursor-pointer"
                        variant={activeSuggestion.linkedin === sug ? "default" : "outline"}
                        onClick={() => handleSuggestionClick(sug, "linkedin")}
                      >
                        {sug}
                      </Badge>
                    );
                  })}
                </div>

                <TemplateCards socialPlatform="linkedin" />
              </TabsContent>
            )}

            {activeTab === "x" && (
              <TabsContent value="x" className="h-full flex flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                  {xSuggestions?.map((sug, index) => {
                    return (
                      <Badge
                        key={cn(sug + "-" + index)}
                        className="cursor-pointer"
                        variant={activeSuggestion.x === sug ? "default" : "outline"}
                        onClick={() => handleSuggestionClick(sug, "x")}
                      >
                        {sug}
                      </Badge>
                    );
                  })}
                </div>

                <TemplateCards socialPlatform="x" />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </CardContent>

      {(activeTab === "facebook" || activeTab === "instagram") &&
        (activeSuggestion[activeTab] === "Grid" || activeSuggestion[activeTab] === "Carousal") && (
          <CardFooter className="flex gap-2 justify-end p-3 border-t border-gray-200 bg-white rounded-b">
            {activeSuggestion[activeTab] === "Grid" ? (
              <GridTemplateEditModal socialPlatform={activeTab} />
            ) : (
              <CarouselTemplateEditModal socialPlatform={activeTab} />
            )}
          </CardFooter>
        )}
    </Card>
  );
};

export default TemplatePanel;
