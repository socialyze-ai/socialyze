import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setContent, setMediaUrls } from "@/redux/slices/postCreation.slice";
import { toast } from "sonner";

const TemplateGenerationModal = () => {
  const dispatch = useDispatch();
  const { isModalOpen, selectedTemplate, generatedContent, prompt, isGenerating, suggestions } =
    useSelector((state: RootState) => state.templateGeneration);

  const [generatedPostData, setGeneratedPostData] = useState<any>(null);

  useEffect(() => {
    if (generatedContent && selectedTemplate) {
      setGeneratedPostData({
        ...selectedTemplate,
        content: generatedContent,
      });
    }
  }, [generatedContent, selectedTemplate]);

  const handleClose = () => {
    dispatch(setIsModalOpen(false));
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
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Post from Template: {selectedTemplate?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 h-full overflow-hidden">
          {/* Left Side */}
          <div className="w-1/2 flex flex-col gap-4">
            <ScrollArea className="h-[250px] border rounded-md">
              <div className="p-3">
                <PostTemplatePreview
                  content={selectedTemplate?.content}
                  channel={selectedTemplate?.channel}
                  mediaUrls={selectedTemplate?.mediaUrls}
                  isTemplate
                />
              </div>
            </ScrollArea>

            <div className="flex flex-col gap-2 flex-1">
              <Textarea
                placeholder="Enter a prompt to generate content based on this template..."
                className="flex-1 min-h-[100px]"
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

              <Button onClick={handleGenerate} disabled={!prompt || isGenerating} className="mt-2">
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
          </div>

          {/* Right Side */}
          <div className="w-1/2 border rounded-md">
            <ScrollArea className="h-full">
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
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleUseGeneratedPost} disabled={!generatedContent || isGenerating}>
            Use Generated Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateGenerationModal;
