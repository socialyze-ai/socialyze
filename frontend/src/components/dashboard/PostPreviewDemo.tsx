import { useSelector } from "react-redux";
import { SocialPlatform } from "./DashboardPostPreview";

import { RootState } from "@/redux/store";
import { selectChannels } from "@/redux/slices/posts.slice";
import ListPostCard from "./ListPostCard";

const PostPreviewDemo = () => {
  const postData = [
    {
      platform: "x",
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

  // Get posts from Redux store
  const posts = useSelector((state: RootState) => state.dashboardPosts.posts);
  const channels = useSelector(selectChannels);

  // Function to get platform from channel type
  const getPlatform = (channelId: string): SocialPlatform => {
    const channel = channels.find((ch) => ch.id === channelId || ch.channelId === channelId);
    if (!channel) return "x"; // Default fallback

    const type = channel.type.toLowerCase();
    if (type.includes("facebook")) return "facebook";
    if (type.includes("instagram")) return "instagram";
    if (type.includes("linkedin")) return "linkedin";
    return "x"; // Default fallback
  };

  // Function to calculate days ago
  const calculateDaysAgo = (dateString: string | undefined): number => {
    if (!dateString) return 0;
    try {
      const postDate = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - postDate.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="w-full h-full bg-white shadow-2xl border border-gray-200 rounded-lg">
      <div className="space-y-4 p-4 w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] mx-auto">
        {posts.length === 0 ? (
          <div className="text-center text-muted-foreground">No posts found</div>
        ) : (
          posts.map((post) => {
            console.log("postpostpostpost", post);

            // Find associated channel
            const channel = channels.find(
              (ch) => ch.id === post.channelId || ch.channelId === post.channelId,
            );

            const isCustomSchedule = post.postType === "schedule"; // Assuming 'schedule' means manually scheduled

            return (
              <ListPostCard
                key={post._id || Math.random().toString()}
                id={post._id}
                platform={getPlatform(post.channelId)}
                profileImage={channel?.profileImage || ""}
                displayName={channel?.name || ""}
                username={channel?.username || channel?.name || ""}
                date={post.createdAt}
                content={post.text || ""}
                imageUrl={post.media && post.media.length > 0 ? post.media[0] : ""}
                storyUrl={post.media && post.media.length > 0 ? post.media[0] : ""}
                likes={0}
                retweets={0}
                comments={0}
                impressions={0}
                engagementRate={0}
                createdDaysAgo={calculateDaysAgo(post.scheduledTime)}
                isCustom={isCustomSchedule}
                clicks={0}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostPreviewDemo;
