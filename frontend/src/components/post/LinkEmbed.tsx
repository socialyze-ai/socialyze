
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Link2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface LinkEmbedProps {
  onLinkAdd: (url: string, title: string) => void;
  embeddedLink?: { url: string; title: string };
  onClearLink?: () => void;
}

const LinkEmbed: React.FC<LinkEmbedProps> = ({ onLinkAdd, embeddedLink, onClearLink }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddLink = () => {
    if (url) {
      onLinkAdd(url, title || url);
      setUrl('');
      setTitle('');
      setIsOpen(false);
    }
  };

  return (
    <div>
      {embeddedLink ? (
        <Card className="relative mt-4 mb-4">
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6 z-10"
            onClick={onClearLink}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-md p-2 mr-3">
                <Link2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{embeddedLink.title}</h3>
                <a 
                  href={embeddedLink.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate block"
                >
                  {embeddedLink.url}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Link2 className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add a link</h3>
              
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Input
                  placeholder="Title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleAddLink}>Add Link</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default LinkEmbed;
