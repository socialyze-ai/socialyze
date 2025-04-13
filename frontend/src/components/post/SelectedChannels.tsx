import React, { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { getSocialIcon } from "./ChannelSelector";
import { usePosts } from "@/context/PostsContext";
import { useSelector } from "react-redux";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";

const SelectedChannels = () => {
  const { channels } = usePosts();
  const { selectedChannels } = useSelector(selectPostCreation);

  const selectedPostChannels = useMemo(
    () => channels.filter((channel) => selectedChannels.includes(channel.id)),
    [channels, selectedChannels],
  );

  console.log("selectedChannels", selectedChannels);

  return (
    <div className="grid gap-2">
      <Label>Channels</Label>

      <Card className="bg-transparent">
        <CardContent className="p-1.5">
          <div className="flex flex-wrap gap-2">
            {selectedPostChannels.map((channel) => (
              <div
                key={channel.id}
                className={
                  "h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center"
                }
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
