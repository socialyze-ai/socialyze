import React from 'react';
import { Post, SocialChannel, usePosts } from '@/context/PostsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, BarChart2, Share2, MoreVertical, MessageCircle, RefreshCw, Heart } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StatusFilter } from './PostStatusSelector';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostListViewProps {
  statusFilter: StatusFilter;
  channelFilter: string[];
  tagFilter: string[];
}

const PostListView: React.FC<PostListViewProps> = ({ statusFilter, channelFilter, tagFilter }) => {
  const { posts, channels } = usePosts();
  
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [selectedChannel, setSelectedChannel] = React.useState<SocialChannel | null>(null);
  
  const filteredPosts = posts.filter(post => {
    if (statusFilter.length > 0 && !statusFilter.includes(post.status)) return false;
    if (channelFilter.length > 0 && !post.channels.some(channelId => channelFilter.includes(channelId))) return false;
    if (tagFilter.length > 0) {
      const postTags = getTagsFromContent(post.content);
      if (!tagFilter.some(tag => postTags.includes(tag))) return false;
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
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };
  
  const formatPostDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric' 
    }).format(new Date(date));
  };

  const openPostPreview = (post: Post, channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      setSelectedPost(post);
      setSelectedChannel(channel);
    }
  };

  return (
    <div className="space-y-6">
      {sortedPosts.map(post => (
        <Card key={post.id} className="overflow-visible">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {post.channels.map(channelId => {
                  const channel = channels.find(c => c.id === channelId);
                  return channel ? (
                    <Avatar key={channelId} className="w-10 h-10">
                      <AvatarImage src={channel.profileImage} alt={channel.name} />
                      <AvatarFallback>{channel.name[0]}</AvatarFallback>
                    </Avatar>
                  ) : null;
                })}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {post.status === 'scheduled' ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {post.scheduledAt && formatDistanceToNow(post.scheduledAt, { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                        </span>
                      )}
                    </p>
                    <p className="text-sm">{post.content}</p>
                  </div>

                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="flex gap-2">
                      {post.mediaUrls.map((url, idx) => (
                        <div key={idx} className="relative h-20 w-20 rounded-md overflow-hidden">
                          <img src={url} alt="Post media" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {post.channels.map(channelId => {
                        const channel = channels.find(c => c.id === channelId);
                        return channel ? (
                          <Avatar key={channelId} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={channel.profileImage} alt={channel.name} />
                            <AvatarFallback>{channel.name[0]}</AvatarFallback>
                          </Avatar>
                        ) : null;
                      })}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" /> 0
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" /> 0
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-4 w-4" /> 0
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
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PostListView;
