import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostStatus } from "@/redux/slices/posts.slice";
import { CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateFilter } from "@/redux/slices/dashboardPosts.slice";

export type StatusFilter = PostStatus[];

interface PostStatusSelectorProps {
  counts: {
    scheduled: number;
    sent: number;
    draft: number;
    failed: number;
  };
}

const PostStatusSelector: React.FC<PostStatusSelectorProps> = ({ counts }) => {
  const dispatch = useDispatch();
  const activeStatuses = useSelector(
    (state: RootState) => state.dashboardPosts.filters.postStatus,
  ) as StatusFilter;

  const toggleStatus = (status: PostStatus) => {
    let newStatuses: string[];

    if (activeStatuses.includes(status)) {
      newStatuses = activeStatuses.filter((s) => s !== status);
    } else {
      newStatuses = [...activeStatuses, status];
    }

    dispatch(
      updateFilter({
        postStatus: newStatuses,
      }),
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-3 py-2 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">Post Status</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2 flex flex-wrap gap-2">
        <Badge
          variant={activeStatuses.includes("scheduled") ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 hover:text-white flex items-center gap-1 px-3 py-1"
          onClick={() => toggleStatus("scheduled" as PostStatus)}
        >
          <Clock className="h-3 w-3" />
          <span>Scheduled ({counts.scheduled})</span>
        </Badge>
        <Badge
          variant={activeStatuses.includes("sent") ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 hover:text-white flex items-center gap-1 px-3 py-1"
          onClick={() => toggleStatus("sent" as PostStatus)}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Posted ({counts.sent})</span>
        </Badge>
        <Badge
          variant={activeStatuses.includes("draft") ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 hover:text-white flex items-center gap-1 px-3 py-1"
          onClick={() => toggleStatus("draft" as PostStatus)}
        >
          <FileText className="h-3 w-3" />
          <span>Drafts ({counts.draft})</span>
        </Badge>
        <Badge
          variant={activeStatuses.includes("failed") ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 hover:text-white flex items-center gap-1 px-3 py-1"
          onClick={() => toggleStatus("failed" as PostStatus)}
        >
          <AlertCircle className="h-3 w-3" />
          <span>Failed ({counts.failed})</span>
        </Badge>
      </CardContent>
    </Card>
  );
};

export default PostStatusSelector;
