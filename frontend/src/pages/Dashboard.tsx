import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { usePosts } from "@/context/PostsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Calendar, Clock, PenTool, Send, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SelectedChannels from "@/components/post/SelectedChannels";

const Dashboard = () => {
  const { posts, channels } = usePosts();

  const scheduledPosts = posts.filter((post) => post.status === "scheduled");
  const draftPosts = posts.filter((post) => post.status === "draft");
  const sentPosts = posts.filter((post) => post.status === "sent");

  const stats = [
    {
      label: "Scheduled Posts",
      value: scheduledPosts.length,
      icon: Clock,
      color: "text-amber-500",
    },
    { label: "Connected Channels", value: channels.length, icon: Send, color: "text-green-500" },
    { label: "Draft Posts", value: draftPosts.length, icon: PenTool, color: "text-blue-500" },
    { label: "Posts Sent", value: sentPosts.length, icon: BarChart2, color: "text-purple-500" },
  ];

  const formatPostDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(date));
  };

  return (
    <MainLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Posts</CardTitle>
                <Link to="/create">
                  <Button size="sm">Create New</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scheduled">
                <TabsList className="mb-4">
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>
                <TabsContent value="scheduled">
                  {scheduledPosts.length > 0 ? (
                    <div className="space-y-4">
                      {scheduledPosts.slice(0, 5).map((post) => (
                        <div
                          key={post.id}
                          className="border rounded-lg p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="line-clamp-2">{post.content}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                {post.channels.map((channelId) => {
                                  const channel = channels.find((c) => c.id === channelId);
                                  if (!channel) return null;
                                  return (
                                    <div
                                      key={channelId}
                                      className={`flex items-center text-xs text-muted-foreground social-icon-${channel.type}`}
                                    >
                                      <span>{channel.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">
                                  {post.scheduledAt && formatPostDate(post.scheduledAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No scheduled posts</p>
                      <Link to="/create">
                        <Button variant="link">Create your first post</Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="sent">
                  {sentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {sentPosts.slice(0, 5).map((post) => (
                        <div
                          key={post.id}
                          className="border rounded-lg p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="line-clamp-2">{post.content}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                {post.channels.map((channelId) => {
                                  const channel = channels.find((c) => c.id === channelId);
                                  if (!channel) return null;
                                  return (
                                    <div
                                      key={channelId}
                                      className={`flex items-center text-xs text-muted-foreground social-icon-${channel.type}`}
                                    >
                                      <span>{channel.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">{formatPostDate(post.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No sent posts</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="draft">
                  {draftPosts.length > 0 ? (
                    <div className="space-y-4">
                      {draftPosts.slice(0, 5).map((post) => (
                        <div
                          key={post.id}
                          className="border rounded-lg p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="line-clamp-2">{post.content}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                {post.channels.map((channelId) => {
                                  const channel = channels.find((c) => c.id === channelId);
                                  if (!channel) return null;
                                  return (
                                    <div
                                      key={channelId}
                                      className={`flex items-center text-xs text-muted-foreground social-icon-${channel.type}`}
                                    >
                                      <span>{channel.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                <PenTool className="h-3 w-3" />
                                <span className="text-xs">Draft</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No draft posts</p>
                      <Link to="/create">
                        <Button variant="link">Create a draft</Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg ">Connected Channels</CardTitle>

                <Link to="/channels">
                  <Button variant="outline" size="icon">
                    <Settings />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <SelectedChannels isDashboard />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
