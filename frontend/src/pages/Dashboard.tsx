import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { usePosts } from "@/context/PostsContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import ActiveChannels from "@/components/dashboard/ActiveChannels";
import LayoutSelector, { LayoutType } from "@/components/dashboard/LayoutSelector";
import PostStatusSelector, { StatusFilter } from "@/components/dashboard/PostStatusSelector";
import FilterSelectors from "@/components/dashboard/FilterSelectors";
import PostListView from "@/components/dashboard/PostListView";
import PostGridView from "@/components/dashboard/PostGridView";
import PostCalendarView from "@/components/dashboard/PostCalendarView";

const Dashboard = () => {
  const { posts } = usePosts();

  // State for filters and layout
  const [activeLayout, setActiveLayout] = useState<LayoutType>("list");
  const [activeStatuses, setActiveStatuses] = useState<StatusFilter>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>("UTC");

  // Count posts by status
  const postCounts = {
    scheduled: posts.filter((post) => post.status === "scheduled").length,
    sent: posts.filter((post) => post.status === "sent").length,
    draft: posts.filter((post) => post.status === "draft").length,
    failed: posts.filter((post) => post.status === "failed").length,
  };

  return (
    <MainLayout title="Dashboard">
      <div className="flex flex-col gap-2">
        {/* Top row with active channels and layout selector */}

        <div className="flex justify-between gap-2">
          <div className="flex flex-col gap-2 flex-1">
            {/* <div className="lg:col-span-8"> */}
            <ActiveChannels />
            {/* </div> */}

            {/* <div className="lg:col-span-8"> */}
            <PostStatusSelector
              activeStatuses={activeStatuses}
              onStatusChange={setActiveStatuses}
              counts={postCounts}
            />
            {/* </div> */}
          </div>

          {/* Second row with post status selector and filters */}
          <div className="flex flex-col gap-2">
            {/* <div className="lg:col-span-3"> */}
            <LayoutSelector activeLayout={activeLayout} onLayoutChange={setActiveLayout} />
            {/* </div> */}

            {/* <div className="lg:col-span-4"> */}
            <FilterSelectors
              selectedChannels={selectedChannels}
              onChannelFilterChange={setSelectedChannels}
              selectedTags={selectedTags}
              onTagFilterChange={setSelectedTags}
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
            {/* </div> */}
          </div>
        </div>

        {/* Content area */}
        <div className="lg:col-span-12 overflow-y-scroll h-[65dvh]">
          {activeLayout === "list" && (
            <PostListView
              statusFilter={activeStatuses}
              channelFilter={selectedChannels}
              tagFilter={selectedTags}
            />
          )}

          {activeLayout === "grid" && (
            <PostGridView
              statusFilter={activeStatuses}
              channelFilter={selectedChannels}
              tagFilter={selectedTags}
            />
          )}

          {activeLayout === "calendar" && (
            <PostCalendarView
              statusFilter={activeStatuses}
              channelFilter={selectedChannels}
              tagFilter={selectedTags}
              timezone={timezone}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
