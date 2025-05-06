import { useSelector } from "react-redux";
import { selectChannels } from "@/redux/slices/posts.slice";
import GridPostCard from "./GridPostCard";
import { DashboardPostType } from "@/redux/slices/dashboardPosts.slice";
import { useMemo } from "react";

const PostGridView = ({ posts }: { posts: DashboardPostType[] }) => {
  const channels = useSelector(selectChannels);

  const renderedPosts = useMemo(() => {
    return posts.map((post) => {
      // Find associated channel
      const channel = channels.find(
        (ch) => ch.id === post.channelId || ch.channelId === post.channelId,
      );

      if (!channel) return null;

      return (
        <GridPostCard
          key={`${post._id}-${channel.id}`}
          platform={channel.type}
          profileImage={channel.profileImage}
          username={channel.username || channel.id}
          displayName={channel.name}
          date={post.createdAt}
          content={post.text || ""}
          imageUrl={post.media && post.media.length > 0 ? post.media[0] : ""}
          likes={0}
          retweets={0}
          comments={0}
          impressions={0}
          engagementRate={0}
          clicks={0}
          createdDaysAgo={0}
          isGrid
        />
      );
    });
  }, [posts, channels]);

  return (
    <>
      {posts?.length === 0 ? (
        <div className="flex justify-center items-center h-full bg-white shadow-sm border border-gray-200 p-2 md:p-4 rounded-lg">
          <span className="text-muted-foreground">No posts found</span>
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
