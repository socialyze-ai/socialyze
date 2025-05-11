import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, LogOut, Edit, Trash2, X } from "lucide-react";
import { useChannelAuth } from "@/api/apiHooks/useChannel";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { SocialChannel, deleteChannel, selectChannels } from "@/redux/slices/posts.slice";
import AddChannelDialog from "@/components/generic/AddChannelDialog";
import { toast } from "sonner";

const Channels = () => {
  const channels = useSelector(selectChannels);
  const dispatch = useDispatch();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { mutate: handleChannelAuth } = useChannelAuth();
  const queryClient = useQueryClient();

  const handleDeleteChannel = (id: string, name: string) => {
    dispatch(deleteChannel(id));
    toast.success(`${name} has been disconnected.`, {
      position: "top-center",
    });
  };

  const handleChannelAuthMutation = (handle: string) => {
    handleChannelAuth(
      { handle: handle },
      {
        onSuccess: (data: any) => {
          console.log(data);
          const authWindow = window.open(data.url, "_blank", "width=600,height=600");

          if (!authWindow) {
            toast.error("Popup blocked or failed to open.", {
              position: "top-center",
            });
            return;
          }
          const handleMessage = (repsponse: MessageEvent) => {
            queryClient.invalidateQueries({ queryKey: ["channels"] });
          };

          window.addEventListener("message", handleMessage);
        },
        onError: (error) => {
          toast.error(error.message, {
            position: "top-center",
          });
        },
      },
    );
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case "facebook":
        return <Facebook className="h-6 w-6 text-blue-600" />;
      case "x":
        return <X className="h-6 w-6 text-sky-500" />;
      case "instagram":
        return <Instagram className="h-6 w-6 text-pink-600" />;
      case "linkedin":
        return <Linkedin className="h-6 w-6 text-blue-700" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout title="Social Channels">
      <AddChannelDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Channels</CardTitle>
              <CardDescription>Connect and manage your social media accounts</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>Connect Channel</Button>
          </div>
        </CardHeader>
        <CardContent>
          {channels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <Card key={channel.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 bg-muted/30 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={channel.profileImage}
                          alt={channel.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{channel.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {getSocialIcon(channel.type)}
                          <span className="ml-1">
                            {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          switch (channel.type) {
                            case "facebook":
                              handleChannelAuthMutation("facebook");
                              break;
                            case "x":
                              handleChannelAuthMutation("x");
                              break;
                            case "instagram":
                              handleChannelAuthMutation("instagram");
                              break;
                            case "linkedin":
                              handleChannelAuthMutation("linkedin");
                              break;
                            default:
                              break;
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteChannel(channel.id, channel.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No channels connected yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>Connect Your First Channel</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Social Networks</CardTitle>
          <CardDescription>Socialyze supports posting to these social networks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <X className="h-8 w-8 text-sky-500" />
                    <h3 className="font-semibold text-lg">X</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule tweets, threads, and engage with your audience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <Facebook className="h-8 w-8 text-blue-600" />
                    <h3 className="font-semibold text-lg">Facebook</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule posts to profiles, pages, and groups.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <Instagram className="h-8 w-8 text-pink-600" />
                    <h3 className="font-semibold text-lg">Instagram</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule posts, stories, and manage your Instagram presence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <Linkedin className="h-8 w-8 text-blue-700" />
                    <h3 className="font-semibold text-lg">LinkedIn</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule posts to your profile and company pages.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 relative">
                <ComingSoonTag />
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0a12 12 0 0 0-12 12 12 12 0 0 0 12 12 12 12 0 0 0 12-12 12 12 0 0 0-12-12zm0 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm2.5-14.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm-7 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm7-2.23c-.65-.86-1.68-1.45-2.5-1.87-.48-.25-1.4-.68-2-.9.54 1.07 1.32 2.42 1.5 3.5.52-.17 2.4-.78 3-1.5V13c0 .2-.1.27 0 .27z" />
                    </svg>
                    <h3 className="font-semibold text-lg">Pinterest</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule pins and organize your Pinterest marketing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 relative">
                <ComingSoonTag />
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                    <h3 className="font-semibold text-lg">TikTok</h3>
                    <p className="text-sm text-muted-foreground">
                      Plan and scheduled your TikTok content strategy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Channels;

const ComingSoonTag = () => {
  return (
    <div className="absolute top-0 right-0 bg-yellow-100 p-1 px-2 rounded-t-md text-center">
      <p className="text-yellow-800 font-semibold text-sm">Coming Soon!</p>
    </div>
  );
};
