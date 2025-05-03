import DashboardPostPreview, { SocialPlatform } from "./DashboardPostPreview";

const PostPreviewDemo = () => {
  const postData = [
    {
      platform: "twitter",
      displayName: "socialyze_ai",
      username: "socialyze_ai",
      date: "Saturday, April 26",
      content:
        "Seville served arches, oranges & magic 🍊 Posted it while I was already off exploring the next one 🐝 Crafted, queued, synced — like it just knew. #SpainTravel #VisitSpain #SpainVacation #DiscoverSpain",
      imageUrl: "https://images.unsplash.com/photo-1558642084-fd07fae5282e",
      likes: 0,
      retweets: 0,
      comments: 0,
      impressions: 2,
      engagementRate: 0,
      createdDaysAgo: 20,
    },
    {
      platform: "instagram",
      displayName: "socialyze.ai",
      username: "socialyze.ai",
      date: "Thursday, April 17",
      content: "Story",
      storyUrl: "https://images.unsplash.com/photo-1558642084-fd07fae5282e",
      likes: 0,
      comments: 0,
      impressions: 0,
      engagementRate: 0,
      createdDaysAgo: 19,
      isCustom: true,
    },
    {
      platform: "linkedin",
      displayName: "Socialyze Ai",
      username: "socialyze-ai",
      date: "Tuesday, April 15",
      content: "Posted from paradise. Ibiza's beach knows how to vibe — and so does my feed.",
      imageUrl: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383",
      likes: 0,
      comments: 0,
      impressions: 0,
      engagementRate: 0,
      createdDaysAgo: 18,
      isCustom: true,
    },
    {
      platform: "facebook",
      displayName: "Socialyze AI",
      username: "socialyzeai",
      date: "Monday, April 14",
      content:
        "Join us for our next webinar on social media automation strategies for small businesses!",
      likes: 0,
      comments: 0,
      impressions: 0,
      engagementRate: 0,
      createdDaysAgo: 17,
    },
  ];

  return (
    <div className="space-y-4 p-4 w-[70%] mx-auto">
      {postData?.map((post) => (
        <DashboardPostPreview
          key={post.platform}
          platform={post.platform as SocialPlatform}
          displayName={post.displayName}
          username={post.username}
          date={post.date}
          content={post.content}
          imageUrl={post.imageUrl}
          storyUrl={post.storyUrl}
          likes={post.likes}
          retweets={post.retweets}
          comments={post.comments}
          impressions={post.impressions}
          engagementRate={post.engagementRate}
          createdDaysAgo={post.createdDaysAgo}
        />
      ))}
    </div>
  );
};

export default PostPreviewDemo;
