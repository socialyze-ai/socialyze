import React from "react";
import { Post, SocialChannel, usePosts } from "@/context/PostsContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, PenTool } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusFilter } from "./PostStatusSelector";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PostPreview from "@/components/post/PostPreview";

interface PostGridViewProps {
  statusFilter: StatusFilter;
  channelFilter: string[];
  tagFilter: string[];
}

const PostGridView: React.FC<PostGridViewProps> = ({ statusFilter, channelFilter, tagFilter }) => {
  const { posts = [], channels = [] } = usePosts();
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [selectedChannel, setSelectedChannel] = React.useState<SocialChannel | null>(null);

  const getTagsFromContent = (content: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = content.match(regex);
    return matches ? matches.map((tag) => tag.substring(1)) : [];
  };

  const filteredPosts = (posts || []).filter((post) => {
    // Filter by status
    if (statusFilter.length > 0 && !statusFilter.includes(post.status)) return false;

    // Filter by channel
    if (
      channelFilter.length > 0 &&
      !post.channels.some((channelId) => channelFilter.includes(channelId))
    )
      return false;

    // Filter by tag
    if (tagFilter.length > 0) {
      const postTags = getTagsFromContent(post.content || "");
      if (!tagFilter.some((tag) => postTags.includes(tag))) return false;
    }

    return true;
  });

  // Sort posts by scheduledAt or createdAt date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = a.scheduledAt ? new Date(a.scheduledAt) : new Date(a.createdAt);
    const dateB = b.scheduledAt ? new Date(b.scheduledAt) : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const formatPostDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(date));
  };

  const openPostPreview = (post: Post, channelId: string) => {
    const channel = channels.find((c) => c.id === channelId);
    if (channel) {
      setSelectedPost(post);
      setSelectedChannel(channel);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <Card key={post.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex-1">
              <div className="space-y-2">
                <p className="text-sm line-clamp-3">{post.content}</p>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="mt-2 aspect-video w-full rounded-md overflow-hidden bg-muted">
                    <img
                      src={post.mediaUrls[0]}
                      alt="Post media"
                      className="h-full w-full object-cover"
                    />
                    {post.mediaUrls.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        +{post.mediaUrls.length - 1}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span
                    className={`
                    px-2 py-0.5 rounded-full
                    ${
                      post.status === "scheduled"
                        ? "bg-amber-100 text-amber-800"
                        : post.status === "sent"
                        ? "bg-green-100 text-green-800"
                        : post.status === "draft"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }
                  `}
                  >
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>

                  <div className="flex items-center">
                    {post.status === "scheduled" ? (
                      <>
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{post.scheduledAt && formatPostDate(post.scheduledAt)}</span>
                      </>
                    ) : post.status === "draft" ? (
                      <>
                        <PenTool className="h-3 w-3 mr-1" />
                        <span>Draft</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatPostDate(post.createdAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 border-t">
              <div className="flex flex-wrap gap-1 w-full">
                {post.channels.map((channelId) => {
                  const channel = channels.find((c) => c.id === channelId);
                  return channel ? (
                    <Dialog key={channelId}>
                      <DialogTrigger asChild>
                        <button
                          className="flex items-center gap-1 bg-muted hover:bg-muted/80 px-1.5 py-0.5 rounded-full text-xs"
                          onClick={() => openPostPreview(post, channelId)}
                        >
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={channel.profileImage} alt={channel.name} />
                            <AvatarFallback>{channel.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[80px]">{channel.name}</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        {selectedPost && selectedChannel && (
                          <div className="py-4">
                            <h3 className="font-medium mb-4">Post Preview</h3>
                            <PostPreview
                              content={selectedPost.content}
                              channel={selectedChannel}
                              mediaUrls={selectedPost.mediaUrls}
                            />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ) : null;
                })}
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="bg-muted/50 rounded-lg p-8 text-center col-span-full">
          <p className="text-muted-foreground">No posts match your filters</p>
        </div>
      )}
    </div>
  );
};

export default PostGridView;
