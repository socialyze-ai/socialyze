import { useMutation, useQuery } from "@tanstack/react-query";
import { HARD_CODED_TOKEN } from "./utils";
import { BACKEND_URL } from "@/config/config";
import { makeRequest } from "./utils";

export const useAddPost = () => {
  const addPost = async (body: any): Promise<any> => {
    const { data } = await makeRequest(BACKEND_URL + "post", "POST", body, HARD_CODED_TOKEN);
    return data;
  };

  return useMutation({
    mutationFn: addPost,
  });
};

interface PostType {
  channelId: string;
  text: string;
  label: string[];
  media: string[];
  postType: "postnow" | "draft" | "schedule";
  postStatus: "queued" | "sent" | "failed" | "published";
  scheduledTime?: string;
}

const mockPosts: PostType[] = [
  {
    channelId: "1745785359059",
    text: "Marketing is all about understanding your target audience and creating valuable content that resonates with them. #Marketing #Audience #Content",
    label: ["125", "12"],
    media: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/4220bd73-12a4-4bfa-975a-8c6add8e3bde/30b9dd86-5e55-41c7-a807-7dc2f10dee49_unsplash-media.jpeg",
    ],
    postType: "postnow",
    postStatus: "queued",
  },
  {
    channelId: "1745785359059",
    text: "Marketing is all about understanding your target audience and creating valuable content that resonates with them. #Marketing #Audience #Content",
    label: ["78", "55"],
    media: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/4220bd73-12a4-4bfa-975a-8c6add8e3bde/30b9dd86-5e55-41c7-a807-7dc2f10dee49_unsplash-media.jpeg",
    ],
    postType: "draft",
    postStatus: "queued",
  },
  {
    channelId: "1745785359059",
    text: "Marketing is all about understanding your target audience and creating valuable content that resonates with them. #Marketing #Audience #Content",
    scheduledTime: "2025-04-30T06:30:00.000Z",
    label: ["78", "55"],
    media: [
      "https://storage.googleapis.com/socialyze/67e2415f2f273b7d4db9e64f/4220bd73-12a4-4bfa-975a-8c6add8e3bde/30b9dd86-5e55-41c7-a807-7dc2f10dee49_unsplash-media.jpeg",
    ],
    postType: "schedule",
    postStatus: "queued",
  },
  {
    channelId: "1745785359060",
    text: "Social media engagement is key to building brand loyalty. Respond to comments and messages promptly! #SocialMedia #Engagement #Branding",
    label: ["42", "33"],
    media: ["https://example.com/images/social-media-engagement.jpg"],
    postType: "schedule",
    scheduledTime: "2025-05-02T09:15:00.000Z",
    postStatus: "queued",
  },
  {
    channelId: "1745785359061",
    text: "New product launch coming next week! Stay tuned for exciting updates. #ProductLaunch #Innovation #Tech",
    label: ["89", "67"],
    media: ["https://example.com/images/product-teaser.png"],
    postType: "draft",
    postStatus: "queued",
  },
  {
    channelId: "1745785359062",
    text: "Just published our latest blog post about content marketing strategies. Check it out! #ContentMarketing #Blogging #DigitalMarketing",
    label: ["56", "23"],
    media: [],
    postType: "postnow",
    postStatus: "published",
  },
  {
    channelId: "1745785359063",
    text: "Behind-the-scenes look at our team working on the new campaign! #BTS #Teamwork #Creativity",
    label: ["112", "45"],
    media: ["https://example.com/videos/team-bts.mp4", "https://example.com/images/team-photo.jpg"],
    postType: "schedule",
    scheduledTime: "2025-05-05T11:00:00.000Z",
    postStatus: "queued",
  },
  {
    channelId: "1745785359064",
    text: "Customer testimonials are the best way to build trust. Here's what our clients say about us! #Testimonials #Trust #CustomerSatisfaction",
    label: ["76", "34"],
    media: ["https://example.com/images/customer-review.jpg"],
    postType: "draft",
    postStatus: "queued",
  },
  {
    channelId: "1745785359065",
    text: "Join our webinar next Thursday about digital transformation in your industry! #Webinar #DigitalTransformation #Learning",
    label: ["203", "87"],
    media: [],
    postType: "schedule",
    scheduledTime: "2025-05-07T14:30:00.000Z",
    postStatus: "queued",
  },
  {
    channelId: "1745785359066",
    text: "Celebrating 5 years in business! Thank you to all our customers and team members. #Anniversary #Milestone #Gratitude",
    label: ["310", "156"],
    media: ["https://example.com/images/anniversary-celebration.jpg"],
    postType: "postnow",
    postStatus: "published",
  },
  {
    channelId: "1745785359067",
    text: "Limited time offer: 20% off all services this weekend only! #Sale #Discount #SpecialOffer",
    label: ["98", "43"],
    media: ["https://example.com/images/sale-banner.png"],
    postType: "schedule",
    scheduledTime: "2025-05-08T08:00:00.000Z",
    postStatus: "queued",
  },
];

export const useGetPost = (isMockData: boolean = true) => {
  const query = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      if (isMockData) {
        return mockPosts;
      }
      return await makeRequest(BACKEND_URL + "post", "GET", "", HARD_CODED_TOKEN);
    },
  });

  return query;
};
