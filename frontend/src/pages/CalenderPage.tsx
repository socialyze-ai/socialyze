import PostCalendarView from "@/components/dashboard/PostCalendarView";
import MainLayout from "@/components/layout/MainLayout";

const CalenderPage = () => {
  return (
    <MainLayout title="Calendar">
      <PostCalendarView />
    </MainLayout>
  );
};

export default CalenderPage;
