import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ActiveChannels from "@/components/dashboard/ActiveChannels";
import { LayoutType } from "@/components/dashboard/LayoutSelector";
import PostListView from "@/components/dashboard/PostListView";
import PostGridView from "@/components/dashboard/PostGridView";
import PostCalendarView from "@/components/dashboard/PostCalendarView";
import FilterSelectors from "@/components/dashboard/FilterSelectors";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Dashboard = () => {
  const posts = useSelector((state: RootState) => state.dashboardPosts.posts);

  const [activeLayout, setActiveLayout] = useState<LayoutType>("list");
  const [timezone, setTimezone] = useState<string>("UTC");

  return (
    <MainLayout title="Dashboard">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex-1 lg:flex-[4] flex flex-col gap-3">
            <ActiveChannels />
          </div>

          <div className="flex-1 lg:flex-[3] flex flex-col gap-3">
            <FilterSelectors
              timezone={timezone}
              onTimezoneChange={setTimezone}
              activeLayout={activeLayout}
              setActiveLayout={setActiveLayout}
            />
          </div>
        </div>

        {/* Content area */}
        <div className="rounded-lg overflow-y-scroll h-[calc(100vh-20rem)]">
          {activeLayout === "list" && <PostListView posts={posts} />}
          {activeLayout === "grid" && <PostGridView posts={posts} />}
          {activeLayout === "calendar" && <PostCalendarView posts={posts} />}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
