import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ActiveChannels from "@/components/dashboard/ActiveChannels";
import { LayoutType } from "@/components/dashboard/LayoutSelector";
import PostGridView from "@/components/dashboard/PostGridView";
import FilterSelectors from "@/components/dashboard/FilterSelectors";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { Loader2 } from "lucide-react";
import InitialDataLoader from "@/components/InitialDataLoader";
import PostListView from "@/components/dashboard/PostListView";
import PostCalendarView from "@/components/dashboard/PostCalendarView";
import { updateFilter } from "@/redux/slices/dashboardPosts.slice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, filters, hasMore } = useSelector(
    (state: RootState) => state.dashboardPosts,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeLayout, setActiveLayout] = useState<LayoutType>("list");
  const [timezone, setTimezone] = useState<string>("UTC");
  const [loadingMore, setLoadingMore] = useState(false);

  // Handle scroll for infinite loading
  useEffect(() => {
    const scrollContainer = contentRef.current;

    const handleScroll = () => {
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

        // Calculate the scroll percentage (0 to 1)
        const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

        // If scrolled to 80% or more of the container and not already loading
        // and there are more posts to fetch and not in calendar view
        if (
          scrollPercentage >= 0.8 &&
          !isLoading &&
          !loadingMore &&
          hasMore &&
          activeLayout !== "calendar"
        ) {
          setLoadingMore(true);
          // Update the offset in the filter to load next batch
          dispatch(
            updateFilter({
              offset: filters.offset + filters.limit,
            }),
          );
        }
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isLoading, loadingMore, activeLayout, dispatch, filters.offset, filters.limit, hasMore]);

  // Reset loadingMore when posts are updated
  useEffect(() => {
    if (loadingMore && !isLoading) {
      setLoadingMore(false);
    }
  }, [posts, isLoading, loadingMore]);

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
        <div ref={contentRef} className="rounded-lg overflow-y-auto h-[calc(100vh-20rem)]">
          {isLoading && posts.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {activeLayout === "list" && <PostListView posts={posts} />}
              {activeLayout === "grid" && <PostGridView posts={posts} />}
              {activeLayout === "calendar" && <PostCalendarView />}

              {loadingMore && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              )}

              {!hasMore && posts.length > 0 && activeLayout !== "calendar" && (
                <div className="text-center text-gray-500 py-4">No more posts to load</div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
