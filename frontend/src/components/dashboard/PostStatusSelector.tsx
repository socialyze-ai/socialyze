import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostStatus } from "@/context/PostsContext";
import { CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";

export type StatusFilter = PostStatus[];

interface PostStatusSelectorProps {
  activeStatuses: StatusFilter;
  onStatusChange: (statuses: StatusFilter) => void;
  counts: {
    scheduled: number;
    sent: number;
    draft: number;
    failed: number;
  };
}

const PostStatusSelector: React.FC<PostStatusSelectorProps> = ({
  activeStatuses,
  onStatusChange,
  counts,
}) => {
  const toggleStatus = (status: PostStatus) => {
    if (activeStatuses.includes(status)) {
      onStatusChange(activeStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...activeStatuses, status]);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-3 py-2 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">Post Status</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2 flex flex-wrap gap-2">
        <Badge
          variant={activeStatuses.includes("scheduled") ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 flex items-center gap-1 px-3 py-1"
          onClick={() => toggleStatus("scheduled" as PostStatus)}
        >
          <Clock className="h-3 w-3" />
          <span>Scheduled ({counts.scheduled})</span>
        </Badge>
        <Badge
          variant={activeStatuses.includes("sent") ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 flex items-center gap-1 px-3 py-1"
          onClick={() => toggleStatus("sent" as PostStatus)}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Posted ({counts.sent})</span>
        </Badge>
        <Badge
          variant={activeStatuses.includes("draft") ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 flex items-center gap-1 px-3 py-1"
          onClick={() => toggleStatus("draft" as PostStatus)}
        >
          <FileText className="h-3 w-3" />
          <span>Drafts ({counts.draft})</span>
        </Badge>
        <Badge
          variant={activeStatuses.includes("failed") ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 flex items-center gap-1 px-3 py-1"
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
