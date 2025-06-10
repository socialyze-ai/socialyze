import { setIsModalOpen } from "@/redux/slices/templateGeneration.slice";

import { setSelectedTemplate } from "@/redux/slices/templateGeneration.slice";

import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import TemplatePreview from "@/components/post/template/TemplatePreview";
import { setSocialPlatform } from "@/redux/slices/template.slice";
import PostTemplatePreview, { SocialChannel } from "@/components/post/PostTemplatePreview";
const previewData = [
  {
    channelId: "683b93e3f26014a679ba3ea2",
    createdBy: "67e2415f2f273b7d4db9e64f",
    text: "Exciting news! 🌟 We have three amazing marketing campaigns in the works. Which one are you most looking forward to? #MarketingStrategy #DigitalMarketing",
    handle: "x",
    postType: "postnow",
    media: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/531bbba2-02f5-4b88-9eb2-a67d8470fb8f/35a38c13-202e-4b00-b687-e9db0be755b7_unsplash-media.jpeg",
    ],
    label: [],
    _id: "684890112e1cb4b5c8be1bdf",
    createdAt: "2025-06-10T20:05:37.495Z",
    updatedAt: "2025-06-10T20:05:37.632Z",
    __v: 0,
    scheduledTime: "2025-06-10T20:05:37.546Z",
    postStatus: "queued",
    jobId: "66",
  },
  {
    channelId: "683b93e3f26014a679ba3ea2",
    createdBy: "67e2415f2f273b7d4db9e64f",
    text: "Exciting news! 🌟 We have three amazing marketing campaigns in the works. Which one are you most looking forward to? #MarketingStrategy #DigitalMarketing",
    handle: "instagram",
    postType: "postnow",
    media: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/531bbba2-02f5-4b88-9eb2-a67d8470fb8f/35a38c13-202e-4b00-b687-e9db0be755b7_unsplash-media.jpeg",
    ],
    label: [],
    _id: "684890112e1cb4b5c8be1bdf",
    createdAt: "2025-06-10T20:05:37.495Z",
    updatedAt: "2025-06-10T20:05:37.632Z",
    __v: 0,
    scheduledTime: "2025-06-10T20:05:37.546Z",
    postStatus: "queued",
    jobId: "66",
  },
  {
    channelId: "683b93e3f26014a679ba3ea2",
    createdBy: "67e2415f2f273b7d4db9e64f",
    text: "Exciting news! 🌟 We have three amazing marketing campaigns in the works. Which one are you most looking forward to? #MarketingStrategy #DigitalMarketing",
    handle: "linkedin",
    postType: "postnow",
    media: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/531bbba2-02f5-4b88-9eb2-a67d8470fb8f/35a38c13-202e-4b00-b687-e9db0be755b7_unsplash-media.jpeg",
    ],
    label: [],
    _id: "684890112e1cb4b5c8be1bdf",
    createdAt: "2025-06-10T20:05:37.495Z",
    updatedAt: "2025-06-10T20:05:37.632Z",
    __v: 0,
    scheduledTime: "2025-06-10T20:05:37.546Z",
    postStatus: "queued",
    jobId: "66",
  },
  {
    channelId: "683b93e3f26014a679ba3ea2",
    createdBy: "67e2415f2f273b7d4db9e64f",
    text: "Exciting news! 🌟 We have three amazing marketing campaigns in the works. Which one are you most looking forward to? #MarketingStrategy #DigitalMarketing",
    handle: "facebook",
    postType: "postnow",
    media: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/531bbba2-02f5-4b88-9eb2-a67d8470fb8f/35a38c13-202e-4b00-b687-e9db0be755b7_unsplash-media.jpeg",
    ],
    label: [],
    _id: "684890112e1cb4b5c8be1bdf",
    createdAt: "2025-06-10T20:05:37.495Z",
    updatedAt: "2025-06-10T20:05:37.632Z",
    __v: 0,
    scheduledTime: "2025-06-10T20:05:37.546Z",
    postStatus: "queued",
    jobId: "66",
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
      {previewData
        ?.filter((data) => data?.handle === socialPlatform)
        .map((data, index) => {
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
                content={data?.text}
                channel={data as unknown as SocialChannel}
                mediaUrls={data?.media}
                handle={data?.handle}
                isTemplate
              />
            </div>
          );
        })}
    </div>
  );
};

export default TemplateCards;
