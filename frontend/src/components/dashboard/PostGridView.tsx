import React from "react";
import { useSelector } from "react-redux";
import { selectChannels } from "@/redux/slices/posts.slice";
import { RootState } from "@/redux/store";
import GridPostCard from "./GridPostCard";

const PostGridView = () => {
  const posts = useSelector((state: RootState) => state.dashboardPosts.posts);
  const channels = useSelector(selectChannels);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.length > 0 ? (
        posts.map((post) => {
          console.log("postpostpostpost", post);

          // Find associated channel
          const channel = channels.find(
            (ch) => ch.id === post.channelId || ch.channelId === post.channelId,
          );

          const isCustomSchedule = post.postType === "schedule"; // Assuming 'schedule' means manually scheduled

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
              isCustom={false}
            />
          );
        })
      ) : (
        <div className="bg-muted/50 rounded-lg p-8 text-center col-span-full">
          <p className="text-muted-foreground">No posts match your filters</p>
        </div>
      )}
    </div>
  );
};

export default PostGridView;
