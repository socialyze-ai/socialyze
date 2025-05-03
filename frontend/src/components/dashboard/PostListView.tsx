import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { selectPosts } from "@/redux/slices/posts.slice";
import PostPreviewDemo from "./PostPreviewDemo";
import { RootState } from "@/redux/store";

const PostListView = () => {
  const posts = useSelector(selectPosts);
  const statusFilter = useSelector((state: RootState) => state.dashboardPosts.filters.postStatus);
  const channelFilter = useSelector((state: RootState) => state.dashboardPosts.filters.channel);
  const tagFilter = useSelector((state: RootState) => state.dashboardPosts.filters.label);

  const getTagsFromContent = (content: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = content.match(regex);
    return matches ? matches.map((tag) => tag.substring(1)) : [];
  };

  const filteredPosts = (posts || []).filter((post) => {
    if (statusFilter.length > 0 && !statusFilter.includes(post.status)) return false;
    if (
      channelFilter.length > 0 &&
      !post.channels.some((channelId) => channelFilter.includes(channelId))
    )
      return false;
    if (tagFilter.length > 0) {
      const postTags = getTagsFromContent(post.content || "");
      if (!tagFilter.some((tag) => postTags.includes(tag))) return false;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = a.scheduledAt ? new Date(a.scheduledAt) : new Date(a.createdAt);
    const dateB = b.scheduledAt ? new Date(b.scheduledAt) : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-4 flex flex-col justify-center items-center w-full">
      {sortedPosts.length === 0 ? (
        <Card className="w-full md:w-[80%] lg:w-[70%]">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No posts match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <PostPreviewDemo />
      )}
    </div>
  );
};

export default PostListView;
