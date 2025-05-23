import { setIsModalOpen } from "@/redux/slices/templateGeneration.slice";

import { setSelectedTemplate } from "@/redux/slices/templateGeneration.slice";

import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import PostTemplatePreview from "../../PostTemplatePreview";

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

const TemplateCards = () => {
  const dispatch = useDispatch();

  const handleUseTemplate = (template: any) => {
    dispatch(setSelectedTemplate(template));
    dispatch(setIsModalOpen(true));
  };

  return (
    <div className="flex flex-col gap-2 h-[65dvh] overflow-y-auto">
      {previewData.map((data, index) => {
        return (
          <div
            key={index}
            className="h-full w-full border p-2 flex flex-col gap-2 rounded-xl bg-gray-50"
          >
            <div className="flex justify-between">
              <p>{data?.name}</p>

              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-blue-600 hover:text-white bg-white"
                onClick={() => handleUseTemplate(data)}
              >
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

export default TemplateCards;
