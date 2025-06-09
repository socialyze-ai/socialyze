import { setIsModalOpen } from "@/redux/slices/templateGeneration.slice";

import { setSelectedTemplate } from "@/redux/slices/templateGeneration.slice";

import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import TemplatePreview from "@/components/post/template/TemplatePreview";
import { setSocialPlatform } from "@/redux/slices/template.slice";
import PostTemplatePreview, { SocialChannel } from "@/components/post/PostTemplatePreview";
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

const TemplateCards = ({ socialPlatform }: { socialPlatform: string }) => {
  const dispatch = useDispatch();

  const handleUseTemplate = (template: any) => {
    dispatch(setSelectedTemplate(template));
    dispatch(setIsModalOpen(true));
    dispatch(setSocialPlatform(socialPlatform));
  };

  return (
    <div className="flex flex-col gap-2 h-[65dvh] overflow-y-auto">
      {previewData.map((data, index) => {
        return (
          <div key={index} className="relative h-fit w-full">
            <Badge
              variant="outline"
              className="absolute top-2 right-2 w-fit z-20 cursor-pointer hover:bg-blue-600 hover:text-white bg-white"
              onClick={() => handleUseTemplate(data)}
            >
              Use Template
            </Badge>

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

export default TemplateCards;
