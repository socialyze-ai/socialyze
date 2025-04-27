import React from "react";
import { Post, SocialChannel, usePosts } from "@/context/PostsContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  BarChart2,
  Share2,
  MoreVertical,
  MessageCircle,
  RefreshCw,
  Heart,
  Eye,
  Repeat,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusFilter } from "./PostStatusSelector";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PostListViewProps {
  statusFilter: StatusFilter;
  channelFilter: string[];
  tagFilter: string[];
}

const PostListView: React.FC<PostListViewProps> = ({ statusFilter, channelFilter, tagFilter }) => {
  const { posts = [], channels = [] } = usePosts();

  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [selectedChannel, setSelectedChannel] = React.useState<SocialChannel | null>(null);

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

  const getTagsFromContent = (content: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = content.match(regex);
    return matches ? matches.map((tag) => tag.substring(1)) : [];
  };

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

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case "twitter":
        return <Repeat className="h-4 w-4" />;
      case "instagram":
        return <Heart className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 flex flex-col justify-center items-center w-full">
      {sortedPosts.length === 0 ? (
        <Card className="w-full md:w-[80%] lg:w-[70%]">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No posts match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        sortedPosts.map((post) => (
          <Card key={post.id} className="overflow-visible w-full md:w-[60%]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {post.channels.map((channelId) => {
                    const channel = channels.find((c) => c.id === channelId);
                    return channel ? (
                      <Avatar key={channelId} className="w-10 h-10">
                        <AvatarImage src={channel.profileImage} alt={channel.name} />
                        <AvatarFallback>{channel.name[0]}</AvatarFallback>
                      </Avatar>
                    ) : null;
                  })}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {post.status === "scheduled" ? (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {post.scheduledAt &&
                                formatDistanceToNow(post.scheduledAt, { addSuffix: true })}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                            </span>
                          )}
                        </p>
                        <Badge
                          variant={post.status === "sent" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      {getTagsFromContent(post.content || "").length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getTagsFromContent(post.content || "").map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {post.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative h-20 w-20 rounded-md overflow-hidden">
                            <img
                              src={url}
                              alt="Post media"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {post.channels.map((channelId) => {
                          const channel = channels.find((c) => c.id === channelId);
                          return channel ? (
                            <Avatar key={channelId} className="w-6 h-6 border-2 border-background">
                              <AvatarImage src={channel.profileImage} alt={channel.name} />
                              <AvatarFallback>{channel.name[0]}</AvatarFallback>
                            </Avatar>
                          ) : null;
                        })}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" /> 0
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" /> 0
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat className="h-3.5 w-3.5" /> 0
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> 0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>View Analytics</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PostListView;
