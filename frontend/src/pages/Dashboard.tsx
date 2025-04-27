import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { usePosts, PostStatus } from "@/context/PostsContext";
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
  const { posts = [] } = usePosts();

  // State for filters and layout
  const [activeLayout, setActiveLayout] = useState<LayoutType>("list");
  const [activeStatuses, setActiveStatuses] = useState<StatusFilter>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>("UTC");

  // Count posts by status
  const postCounts = {
    scheduled: (posts || []).filter((post) => post.status === ("scheduled" as PostStatus)).length,
    sent: (posts || []).filter((post) => post.status === ("sent" as PostStatus)).length,
    draft: (posts || []).filter((post) => post.status === "draft").length,
    failed: (posts || []).filter((post) => post.status === "failed").length,
  };

  return (
    <MainLayout title="Dashboard">
      <div className="flex flex-col gap-3">
        {/* Top section with filters and controls */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
          {/* Left column with channels and status filters */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <ActiveChannels />
            <PostStatusSelector
              activeStatuses={activeStatuses}
              onStatusChange={setActiveStatuses}
              counts={postCounts}
            />
          </div>

          {/* Right column with layout selector and other filters */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <LayoutSelector activeLayout={activeLayout} onLayoutChange={setActiveLayout} />
            <FilterSelectors
              selectedChannels={selectedChannels}
              onChannelFilterChange={setSelectedChannels}
              selectedTags={selectedTags}
              onTagFilterChange={setSelectedTags}
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          </div>
        </div>

        {/* Content area */}
        <div className="rounded-lg overflow-y-scroll h-[calc(100vh-21rem)]">
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
