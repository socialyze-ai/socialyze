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
import { Loader2, LayoutTemplate } from "lucide-react";
import { setContent, setMediaUrls } from "@/redux/slices/postCreation.slice";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const TemplateGenerationModal = () => {
  const dispatch = useDispatch();
  const { isModalOpen, selectedTemplate, generatedContent, prompt, isGenerating, suggestions } =
    useSelector((state: RootState) => state.templateGeneration);

  const [generatedPostData, setGeneratedPostData] = useState<any>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("prompt");

  useEffect(() => {
    if (generatedContent && selectedTemplate) {
      setGeneratedPostData({
        ...selectedTemplate,
        content: generatedContent,
      });
      // Automatically switch to preview tab when content is generated
      setActiveTab("preview");
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
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-primary" />
              Generate Post from Template: {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 gap-4 h-full overflow-hidden">
            {/* Left Side - Controls */}
            <div className="w-1/2 h-full flex flex-col gap-3 overflow-y-auto pr-2">
              <Card className="flex-1">
                <CardContent className="p-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="prompt">Prompt</TabsTrigger>
                      <TabsTrigger value="selectedTemplate">Selected Template</TabsTrigger>
                    </TabsList>

                    <TabsContent value="prompt" className="h-full">
                      <div className="flex flex-col gap-3">
                        <Textarea
                          placeholder="Enter a prompt to generate content based on this template..."
                          className="min-h-[150px] resize-y"
                          value={prompt}
                          onChange={handlePromptChange}
                        />

                        <div className="flex flex-wrap gap-2">
                          <p className="text-sm text-muted-foreground w-full">Suggestions:</p>
                          {suggestions.map((suggestion, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-secondary"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Badge>
                          ))}
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
                    </TabsContent>

                    <TabsContent
                      value="selectedTemplate"
                      className="h-full w-full flex justify-center items-center"
                    >
                      <div className="flex flex-col gap-3">
                        <PostTemplatePreview
                          content={selectedTemplate.text}
                          channel={selectedTemplate.channel}
                          mediaUrls={selectedTemplate.media}
                          isTemplate
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Preview */}
            <div className="w-1/2 h-full border rounded-md shadow-sm bg-card hidden md:block">
              <div className="h-full flex flex-col justify-between">
                <div className="p-4 flex-1 overflow-y-auto">
                  <h3 className="font-medium text-lg mb-4 text-card-foreground">
                    Generated Post Preview
                  </h3>
                  {generatedPostData ? (
                    <PostTemplatePreview
                      content={generatedPostData.text}
                      channel={generatedPostData.channel}
                      mediaUrls={generatedPostData.mediaUrls}
                      isTemplate
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">
                        {isGenerating ? "Generating post..." : "Generated post will appear here"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="w-full border-t p-4 flex gap-2 justify-end bg-card">
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
