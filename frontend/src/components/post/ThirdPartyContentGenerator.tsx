import {
  BookOpen,
  FileQuestion,
  Wand2,
  Youtube,
  RefreshCw,
  PlusCircle,
  Replace,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { setContent } from "@/redux/slices/postCreation.slice";
import { setContentForChannel } from "@/redux/slices/postCreation.slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";

type ContentType = "youtube" | "quora" | "article" | null;

const ThirdPartyContentGenerator = () => {
  const [selectedType, setSelectedType] = useState<ContentType>(null);
  const [link, setLink] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const dispatch = useDispatch();
  const { activeChannel } = useSelector((state: RootState) => state.postCreation);
  const { contentByChannel } = useSelector((state: RootState) => state.postCreation);
  const { content } = useSelector((state: RootState) => state.postCreation);
  const isCustomContent = activeChannel !== null;

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate content generation
    setTimeout(() => {
      setGeneratedContent(
        "This is a sample generated content based on your inputs. In a real implementation, this would be fetched from an API that processes your link and prompt.",
      );
      setIsGenerating(false);
    }, 1500);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    // Simulate content regeneration
    setTimeout(() => {
      setGeneratedContent(
        "This is a regenerated content sample. It would typically be different from the previous generation.",
      );
      setIsGenerating(false);
    }, 1500);
  };

  const resetSelection = () => {
    setSelectedType(null);
    setLink("");
    setPrompt("");
    setGeneratedContent("");
  };

  // Prompt suggestions based on content type
  const promptSuggestions = {
    youtube: [
      "Create an engaging summary of this video",
      "Extract the key points from this YouTube video",
      "Transform this video into a thread-style post",
    ],
    quora: [
      "Create a detailed answer based on this Quora thread",
      "Summarize the best answers from this Quora question",
      "Extract actionable insights from this Quora discussion",
    ],
    article: [
      "Create a concise summary of this article",
      "Extract the key takeaways from this article",
      "Transform this article into bite-sized insights",
    ],
  };

  const handleReplace = () => {
    if (isCustomContent) {
      dispatch(
        setContentForChannel({
          channelId: activeChannel,
          content: generatedContent,
        }),
      );
    } else {
      dispatch(setContent(generatedContent));
    }
  };

  const handleInsert = () => {
    if (isCustomContent) {
      const channelContent = contentByChannel[activeChannel] || "";
      const removedBreakLineFilterContent = channelContent.replace(/<br>/g, "");
      dispatch(
        setContentForChannel({
          channelId: activeChannel,
          content: removedBreakLineFilterContent + generatedContent,
        }),
      );
    } else {
      const removedBreakLineFilterContent = content.replace(/<br>/g, "");
      dispatch(setContent(removedBreakLineFilterContent + generatedContent));
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Sparkles className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-center">Content Generator</DialogTitle>
          </DialogHeader>

          {!selectedType ? (
            // Step 1: Content Type Selection
            <DialogDescription className="justify-start items-start">
              <div className="flex space-x-4">
                <div
                  className="border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all"
                  onClick={() => setSelectedType("youtube")}
                >
                  <Youtube className="h-8 w-8 mb-2" />
                  <div className="text-center">
                    <h3 className="font-bold">YouTube Content</h3>
                    <p className="text-sm">
                      Generate post content from YouTube methods for engaging video ideas.
                    </p>
                  </div>
                </div>
                <div
                  className="border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all"
                  onClick={() => setSelectedType("quora")}
                >
                  <FileQuestion className="h-8 w-8 mb-2" />
                  <div className="text-center">
                    <h3 className="font-bold">Quora Content</h3>
                    <p className="text-sm">
                      Generate post content from Quora methods to answer popular questions.
                    </p>
                  </div>
                </div>
                <div
                  className="border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all"
                  onClick={() => setSelectedType("article")}
                >
                  <BookOpen className="h-8 w-8 mb-2" />
                  <div className="text-center">
                    <h3 className="font-bold">Article Ideas</h3>
                    <p className="text-sm">
                      Generate post content from trending topics for your blog articles.
                    </p>
                  </div>
                </div>
              </div>
            </DialogDescription>
          ) : (
            // Step 2: Input Fields and Generated Content
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column - Input Form */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {selectedType === "youtube" && <Youtube className="h-5 w-5" />}
                  {selectedType === "quora" && <FileQuestion className="h-5 w-5" />}
                  {selectedType === "article" && <BookOpen className="h-5 w-5" />}
                  <h3 className="font-semibold capitalize">{selectedType} Content Generator</h3>
                </div>

                <div className="space-y-2">
                  <label htmlFor="link" className="text-sm font-medium">
                    Link
                  </label>
                  <Input
                    id="link"
                    placeholder={`Paste ${selectedType} link here`}
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-medium">
                    Prompt
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here"
                    className="resize-none h-20"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                {/* Prompt Suggestions */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedType &&
                      promptSuggestions[selectedType].map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setPrompt(suggestion)}
                          className="text-xs p-0.5 px-2"
                        >
                          {suggestion}
                        </Button>
                      ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2 w-full justify-end">
                  <Button variant="ghost" size="sm" onClick={resetSelection} className="w-fit">
                    Back to Options
                  </Button>
                  <Button
                    className="w-fit"
                    onClick={handleGenerate}
                    disabled={isGenerating || !link || !prompt}
                  >
                    {isGenerating ? "Generating..." : "Generate Content"}
                  </Button>
                </div>
              </div>

              {/* Right Column - Generated Content */}
              <div className="border rounded-lg p-4 flex flex-col">
                <h3 className="font-semibold mb-2">Generated Content</h3>

                <div className="flex-grow overflow-y-auto min-h-[200px] bg-slate-50 rounded-md p-3 mb-4">
                  {generatedContent ? (
                    <p className="text-sm">{generatedContent}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center pt-8">
                      Generated content will appear here
                    </p>
                  )}
                </div>

                {generatedContent && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleRegenerate}
                    >
                      <RefreshCw className={cn("h-4 w-4 mr-1", isGenerating && "animate-spin")} />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleInsert}>
                      <PlusCircle className="h-4 w-4 mr-1" /> Insert
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleReplace}>
                      <Replace className="h-4 w-4 mr-1" /> Replace
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThirdPartyContentGenerator;
