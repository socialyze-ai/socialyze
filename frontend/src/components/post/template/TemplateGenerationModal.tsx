import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setIsModalOpen,
  setPrompt,
  setGeneratedContent,
  setIsGenerating,
  resetTemplateGeneration,
} from "@/redux/slices/templateGeneration.slice";
import PostTemplatePreview from "../PostTemplatePreview";
import { Loader2, ChevronDown } from "lucide-react";
import { setContent, setMediaUrls } from "@/redux/slices/postCreation.slice";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const TemplateGenerationModal = () => {
  const dispatch = useDispatch();
  const { isModalOpen, selectedTemplate, generatedContent, prompt, isGenerating, suggestions } =
    useSelector((state: RootState) => state.templateGeneration);

  const [generatedPostData, setGeneratedPostData] = useState<any>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    if (generatedContent && selectedTemplate) {
      setGeneratedPostData({
        ...selectedTemplate,
        content: generatedContent,
      });
    }
  }, [generatedContent, selectedTemplate]);

  const handleClose = () => {
    if (prompt || generatedContent) {
      setShowConfirmClose(true);
    } else {
      dispatch(setIsModalOpen(false));
    }
  };

  const handleConfirmClose = () => {
    dispatch(setIsModalOpen(false));
    dispatch(resetTemplateGeneration());
    setShowConfirmClose(false);
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setPrompt(e.target.value));
  };

  const handleSuggestionClick = (suggestion: string) => {
    dispatch(setPrompt(suggestion));
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    dispatch(setIsGenerating(true));

    try {
      // Mock API call - replace with actual API integration
      setTimeout(() => {
        const mockGeneratedContent = `Generated post based on: ${prompt} - This is a placeholder for AI-generated content that would match the template's style and incorporate the user's prompt.`;
        dispatch(setGeneratedContent(mockGeneratedContent));
        dispatch(setIsGenerating(false));
      }, 1500);

      // Actual API call would be something like:
      // const response = await fetch("/api/generate-post", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ prompt, template: selectedTemplate }),
      // });
      // const data = await response.json();
      // dispatch(setGeneratedContent(data.content));
    } catch (error) {
      console.error("Failed to generate content:", error);
      dispatch(setIsGenerating(false));
    }
  };

  const handleUseGeneratedPost = () => {
    if (!generatedPostData) return;

    // Set the generated post content to the post creation form
    dispatch(setContent(generatedPostData.content));

    // Set the media if available
    if (generatedPostData.mediaUrls && generatedPostData.mediaUrls.length > 0) {
      dispatch(setMediaUrls(generatedPostData.mediaUrls));
    }

    // Close the modal and reset state
    dispatch(setIsModalOpen(false));
    dispatch(resetTemplateGeneration());

    toast.success("Template content applied to post");
  };

  if (!selectedTemplate) return null;

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl h-5/6 flex flex-col">
          <DialogHeader>
            <DialogTitle>Generate Post from Template: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 gap-4 h-full overflow-hidden">
            {/* Left Side */}
            <div className="w-1/2 h-full flex flex-col gap-2 overflow-y-auto p-1">
              <Popover open={isPreviewExpanded} onOpenChange={setIsPreviewExpanded}>
                <PopoverTrigger asChild className={cn(isPreviewExpanded && "ring-2 ring-blue-500")}>
                  <div className="h-fit w-full flex justify-between items-center border rounded-md p-2 cursor-pointer relative">
                    <p>{selectedTemplate?.name}</p>

                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isPreviewExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-fit p-0 flex justify-center items-center rounded-xl"
                  align="center"
                >
                  <PostTemplatePreview
                    content={selectedTemplate?.content}
                    channel={selectedTemplate?.channel}
                    mediaUrls={selectedTemplate?.mediaUrls}
                    isTemplate
                  />
                </PopoverContent>
              </Popover>

              <div className="h-full flex flex-col gap-2">
                <Textarea
                  placeholder="Enter a prompt to generate content based on this template..."
                  className="min-h-[100px] resize-y"
                  value={prompt}
                  onChange={handlePromptChange}
                />

                <div className="flex flex-wrap gap-2">
                  <p className="text-sm text-gray-500 w-full">Suggestions:</p>
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className="mt-2 w-fit self-end"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Post"
                )}
              </Button>
            </div>

            {/* Right Side */}
            <div className="h-full w-1/2 border rounded-md p-1">
              <div className="h-full flex flex-col justify-between overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-medium mb-2">Generated Post Preview</h3>
                  {generatedPostData ? (
                    <PostTemplatePreview
                      content={generatedPostData.content}
                      channel={generatedPostData.channel}
                      mediaUrls={generatedPostData.mediaUrls}
                      isTemplate
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] border rounded-md">
                      <p className="text-gray-400">
                        {isGenerating ? "Generating post..." : "Generated post will appear here"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="w-full justify-end border-t p-2 flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUseGeneratedPost}
                    disabled={!generatedContent || isGenerating}
                  >
                    Use Generated Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirmClose}
        onOpenChange={setShowConfirmClose}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to close this window and discard your changes?"
        confirmText="Discard"
        cancelText="Continue editing"
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        variant="destructive"
      />
    </>
  );
};

export default TemplateGenerationModal;
