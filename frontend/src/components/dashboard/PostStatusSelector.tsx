
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostStatus } from '@/context/PostsContext';

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
  counts 
}) => {
  const toggleStatus = (status: PostStatus) => {
    if (activeStatuses.includes(status)) {
      onStatusChange(activeStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...activeStatuses, status]);
    }
  };

  return (
    <Card>
      <CardContent className="p-2 flex flex-wrap gap-2">
        <Badge 
          variant={activeStatuses.includes('scheduled') ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/90"
          onClick={() => toggleStatus('scheduled')}
        >
          Scheduled ({counts.scheduled})
        </Badge>
        <Badge 
          variant={activeStatuses.includes('sent') ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/90"
          onClick={() => toggleStatus('sent')}
        >
          Posted ({counts.sent})
        </Badge>
        <Badge 
          variant={activeStatuses.includes('draft') ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/90"
          onClick={() => toggleStatus('draft')}
        >
          Drafts ({counts.draft})
        </Badge>
        <Badge 
          variant={activeStatuses.includes('failed') ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/90"
          onClick={() => toggleStatus('failed')}
        >
          Failed ({counts.failed})
        </Badge>
      </CardContent>
    </Card>
  );
};

export default PostStatusSelector;
