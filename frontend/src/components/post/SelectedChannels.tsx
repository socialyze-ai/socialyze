import React, { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { getSocialIcon } from "./ChannelSelector";
import { usePosts } from "@/context/PostsContext";
import { useSelector } from "react-redux";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import { cn } from "@/lib/utils";

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
              <div
                key={channel.id}
                className={cn(
                  "h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center",
                  isDashboard && "h-12 w-12",
                )}
              >
                {getSocialIcon(channel.type)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectedChannels;
