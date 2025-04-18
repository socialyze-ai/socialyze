import React, { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { getSocialIcon } from "./ChannelSelector";
import { usePosts } from "@/context/PostsContext";
import { useSelector } from "react-redux";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const SelectedChannels = ({ isDashboard = false }: { isDashboard?: boolean }) => {
  const { channels } = usePosts();
  const { selectedChannels } = useSelector(selectPostCreation);

  const selectedPostChannels = isDashboard
    ? channels
    : useMemo(
        () => channels.filter((channel) => selectedChannels.includes(channel.id)),
        [channels, selectedChannels],
      );

  console.log("selectedChannels", selectedChannels);

  return (
    <div className="grid gap-2">
      {!isDashboard && <Label>Channels</Label>}

      <Card className="bg-transparent">
        <CardContent className="p-1.5">
          <div className="flex flex-wrap gap-2">
            {selectedPostChannels.map((channel) => (
              <div key={channel.id} className={"relative rounded-full p-1.5"}>
                <Avatar className="w-10 h-10 rounded-full">
                  <AvatarImage src={channel.profileImage} />
                  <AvatarFallback className="capitalize font-semibold text-xl">
                    {channel.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "absolute bottom-1.5 -right-1 rounded-full overflow-hidden border border-gray-200 w-5 h-5 p-0.5 flex items-center justify-center bg-white z-50",
                    selectedChannels.includes(channel.id) && "shadow-blue-500",
                  )}
                >
                  {getSocialIcon(channel.type)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectedChannels;
