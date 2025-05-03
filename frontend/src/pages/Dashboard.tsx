import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ActiveChannels from "@/components/dashboard/ActiveChannels";
import LayoutSelector, { LayoutType } from "@/components/dashboard/LayoutSelector";
import PostStatusSelector, { StatusFilter } from "@/components/dashboard/PostStatusSelector";
import PostListView from "@/components/dashboard/PostListView";
import PostGridView from "@/components/dashboard/PostGridView";
import PostCalendarView from "@/components/dashboard/PostCalendarView";
import FilterSelectors from "@/components/dashboard/FilterSelectors";
import { useSelector } from "react-redux";
import { PostStatus, selectPosts } from "@/redux/slices/posts.slice";
import { useGetPost } from "@/api/apiHooks/usePost";

const Dashboard = () => {
  const posts = useSelector(selectPosts);
  const { data: postssss } = useGetPost({
    filters: {
      channel: [],
      postStatus: [],
      label: [],
      limit: 10,
      offset: 0,
    },
  });

  console.log("postsssspostssss", postssss);

  // State for filters and layout
  const [activeLayout, setActiveLayout] = useState<LayoutType>("list");
  const [activeStatuses, setActiveStatuses] = useState<StatusFilter>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>("UTC");

  // Count posts by status
  const postCounts = {
    scheduled: (posts || []).filter((post) => post.status === "scheduled").length,
    sent: (posts || []).filter((post) => post.status === "sent").length,
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
              selectedChannels={selectedChannels || []}
              onChannelFilterChange={setSelectedChannels}
              selectedLabels={selectedLabels || []}
              onLabelFilterChange={setSelectedLabels}
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
              tagFilter={selectedLabels}
            />
          )}

          {activeLayout === "grid" && (
            <PostGridView
              statusFilter={activeStatuses}
              channelFilter={selectedChannels}
              tagFilter={selectedLabels}
            />
          )}

          {activeLayout === "calendar" && (
            <PostCalendarView
              statusFilter={activeStatuses}
              channelFilter={selectedChannels}
              tagFilter={selectedLabels}
              timezone={timezone}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
