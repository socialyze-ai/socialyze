import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Instagram, Linkedin, X } from "lucide-react";
import { useChannelAuth } from "@/api/apiHooks/useChannel";
import { useQueryClient } from "@tanstack/react-query";
import { SocialChannel } from "@/redux/slices/posts.slice";

interface AddChannelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddChannelDialog = ({ isOpen, onOpenChange }: AddChannelDialogProps) => {
  const { mutate: handleChannelAuth } = useChannelAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleChannelAuthMutation = (handle: string) => {
    handleChannelAuth(
      { handle: handle },
      {
        onSuccess: (data) => {
          console.log(data);
          const authWindow = window.open(data.url, "_blank", "width=600,height=600");

          if (!authWindow) {
            toast({
              title: "Popup blocked or failed to open.",
              description: "Please try again.",
            });
            return;
          }
          const handleMessage = (response: MessageEvent) => {
            queryClient.invalidateQueries({ queryKey: ["channels"] });
          };

          window.addEventListener("message", handleMessage);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect a new channel</DialogTitle>
          <DialogDescription>
            Link your social media account to start posting from Socialyze
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a platform to connect. You'll be redirected to authorize Socialyze.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleChannelAuthMutation("facebook")}
            >
              <Facebook className="h-5 w-5 text-blue-600 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleChannelAuthMutation("x")}
            >
              <X className="h-5 w-5 text-sky-500 mr-2" />X
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleChannelAuthMutation("instagram")}
            >
              <Instagram className="h-5 w-5 text-pink-600 mr-2" />
              Instagram
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleChannelAuthMutation("linkedin")}
            >
              <Linkedin className="h-5 w-5 text-blue-700 mr-2" />
              LinkedIn
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddChannelDialog;
