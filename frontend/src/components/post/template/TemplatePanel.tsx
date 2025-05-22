import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import TemplateEditModal from "./carouselEditor/TemplateEditModal";
import { Book, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setIsTemplateSectionOpen } from "@/redux/slices/postCreation.slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PostTemplatePreview from "../PostTemplatePreview";

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

const previewData = [
  {
    name: "H1 Template",
    content: `🚀 Exciting tech news alert! Stay tuned for the latest advancements in
artificial intelligence and machine learning. Which tech trend are you most
excited about? #AI #MachineLearning`,
    channel: {
      id: "6813820f342c0f13a7075c4c",
      type: "x",
      name: "socialyze_ai",
      username: "socialyze_ai",
      description: "",
      profileImage: "https://pbs.twimg.com/profile_images/1908610786013941760/U8r1QyfH_normal.jpg",
      connected: true,
      workspace: "6813820f1fa7761c19b81583",
      channelId: "1908608555869233153",
    },
    mediaUrls: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/d676c253-040c-4b48-a61e-96d3339abca2/ce47b389-2998-4e71-bb02-32fc1e5f213e_unsplash-media.jpeg",
    ],
  },
  {
    name: "H2 Template",
    content: `🌟 Join us for our upcoming webinar on the future of remote work! 
Discover tips and strategies to thrive in a virtual environment. #RemoteWork #Webinar`,
    channel: {
      id: "1234567890abcdef1234567890abcdef",
      type: "linkedin",
      name: "workplace_experts",
      username: "workplace_experts",
      description: "Experts in workplace solutions",
      profileImage: "https://example.com/profile_images/workplace_experts.jpg",
      connected: true,
      workspace: "abcdef1234567890abcdef1234567890",
      channelId: "abcdef1234567890abcdef1234567890",
    },
    mediaUrls: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/d676c253-040c-4b48-a61e-96d3339abca2/ce47b389-2998-4e71-bb02-32fc1e5f213e_unsplash-media.jpeg",
    ],
  },
  {
    name: "H3 Template",
    content: `🎉 Celebrate our anniversary with us! Enjoy exclusive discounts and offers 
on all our products. Don't miss out! #AnniversarySale #Discounts`,
    channel: {
      id: "abcdef1234567890abcdef1234567890",
      type: "instagram",
      name: "celebration_store",
      username: "celebration_store",
      description: "Your go-to store for celebrations",
      profileImage: "https://example.com/profile_images/celebration_store.jpg",
      connected: true,
      workspace: "1234567890abcdef1234567890abcdef",
      channelId: "1234567890abcdef1234567890abcdef",
    },
    mediaUrls: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/d676c253-040c-4b48-a61e-96d3339abca2/ce47b389-2998-4e71-bb02-32fc1e5f213e_unsplash-media.jpeg",
    ],
  },
];

const TemplatePanel = () => {
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

const TemplateCards = () => {
  return (
    <div className="flex flex-col gap-2 h-[47dvh] overflow-y-auto">
      {previewData.map((data) => {
        return (
          <div className="h-full w-full border p-2 flex flex-col gap-2 rounded-xl">
            <div className="flex justify-between">
              <p>{data?.name}</p>

              <Badge variant="outline" className="cursor-pointer" onClick={() => {}}>
                Use Template
              </Badge>
            </div>

            <PostTemplatePreview
              content={data?.content}
              channel={{
                ...data?.channel,
                type: "x" as const,
              }}
              mediaUrls={data?.mediaUrls}
              isTemplate
            />
          </div>
        );
      })}
    </div>
  );
};
