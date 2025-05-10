import { useSelector } from "react-redux";
import { selectChannels } from "@/redux/slices/posts.slice";
import GridPostCard from "./GridPostCard";
import { DashboardPostType } from "@/redux/slices/dashboardPosts.slice";
import { useMemo, useState } from "react";
import { SocialPlatform } from "./ListPostCard";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import CreatePostModal from "../post/CreatePostModal";

const PostGridView = ({ posts }: { posts: DashboardPostType[] }) => {
  const channels = useSelector(selectChannels);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Function to get platform from channel type
  const getPlatform = useMemo(() => {
    return (channelId: string): SocialPlatform => {
      const channel = channels.find((ch) => ch.id === channelId || ch.channelId === channelId);
      if (!channel) return "x"; // Default fallback

      const type = channel.type.toLowerCase();
      if (type.includes("facebook")) return "facebook";
      if (type.includes("instagram")) return "instagram";
      if (type.includes("linkedin")) return "linkedin";
      return "x"; // Default fallback
    };
  }, [channels]);

  // Function to calculate days ago
  const calculateDaysAgo = useMemo(() => {
    return (dateString: string | undefined): number => {
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
  }, []);

  const renderedPosts = useMemo(() => {
    return posts.map((post) => {
      // Find associated channel
      const channel = channels.find(
        (ch) => ch.id === post.channelId || ch.channelId === post.channelId,
      );

      return (
        <GridPostCard
          key={post?._id || Math.random().toString()}
          id={post?._id}
          platform={getPlatform(post?.channelId)}
          profileImage={channel?.profileImage}
          username={channel?.username || channel?.id}
          displayName={channel?.name}
          date={post?.createdAt}
          content={post?.text || ""}
          imageUrl={post?.media && post?.media?.length > 0 ? post?.media[0] : ""}
          storyUrl={post?.media && post?.media?.length > 0 ? post?.media[0] : ""}
          likes={0}
          retweets={0}
          comments={0}
          impressions={0}
          engagementRate={0}
          clicks={0}
          createdDaysAgo={calculateDaysAgo(post.scheduledTime)}
          isGrid
        />
      );
    });
  }, [posts, channels]);

  return (
    <>
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {!channels || channels?.length === 0 || !posts || posts?.length === 0 ? (
        <div className="flex justify-center items-center h-full bg-white shadow-sm border border-gray-200 p-2 md:p-4 rounded-lg">
          <div className="flex flex-col gap-1 items-center justify-center">
            <Avatar className="h-52 w-full">
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/woman-have-no-post-yet-so-she-is-in-pose-to-click-photo-for-illustration-download-svg-png-gif-file-formats--posts-empty-states-pack-network-communication-illustrations-3309945.png"
                alt="fallback"
              />
            </Avatar>

            <span className="text-muted-foreground">No posts found</span>

            <Button
              className={"mb-4 w-full"}
              variant="default"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Post
            </Button>
          </div>
        </div>
      ) : (
        <div className="columns-1 md:columns-3 gap-2 md:gap-4 bg-white shadow-2xl border border-gray-200 p-2 md:p-4 rounded-lg">
          {renderedPosts}
        </div>
      )}
    </>
  );
};

export default PostGridView;
