import React from "react";
import {
  Wand2,
  X,
  ChevronLeft,
  RotateCcw,
  Copy,
  Heart,
  Check,
  PlusCircle,
  Scissors,
  Edit,
  FileText,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import {
  setContent,
  setIsAIAssistantOpen,
  setContentForChannel,
  selectActiveChannel,
  selectIsCustomContent,
} from "@/redux/slices/postCreation.slice";
import {
  selectAIAssistant,
  selectCurrentStage,
  selectPrompt,
  selectSelectedTone,
  selectSuggestions,
  selectSelectedSuggestion,
  selectIsFavorite,
  selectExamplePrompts,
  setCurrentStage,
  setPrompt,
  clearPrompt,
  setSelectedTone,
  setSelectedSuggestion,
  toggleFavorite,
  reset,
} from "@/redux/slices/aiAssistant.slice";
import { RootState } from "@/redux/store";

const AIAssistantPanel = () => {
  return <AIAssistantEditor />;
};

export default AIAssistantPanel;

const AIAssistantEditor = () => {
  const dispatch = useDispatch();

  const { content } = useSelector((state: RootState) => state.postCreation);
  const { contentByChannel } = useSelector((state: RootState) => state.postCreation);
  const activeChannel = useSelector(selectActiveChannel);
  const isCustomContent = useSelector(selectIsCustomContent);

  // Get state from Redux instead of local state
  const currentStage = useSelector(selectCurrentStage);
  const prompt = useSelector(selectPrompt);
  const selectedTone = useSelector(selectSelectedTone);
  const suggestions = useSelector(selectSuggestions);
  const selectedSuggestion = useSelector(selectSelectedSuggestion);
  const isFavorite = useSelector(selectIsFavorite);
  const examplePrompts = useSelector(selectExamplePrompts);

  const tones = [
    { id: "casual", label: "Casual", icon: "✦" },
    { id: "balanced", label: "Balanced", icon: "◆" },
    { id: "formal", label: "Formal", icon: "✧" },
  ];

  const handleClear = () => {
    dispatch(clearPrompt());
  };

  const handleNext = () => {
    if (currentStage < 3) {
      dispatch(setCurrentStage(currentStage + 1));
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      dispatch(setCurrentStage(currentStage - 1));
    }
  };

  const handleClose = () => {
    dispatch(reset());
    dispatch(setIsAIAssistantOpen(false));
  };

  const getCharacterCount = (text) => {
    return text.length;
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).length;
  };

  const handleReplace = () => {
    if (isCustomContent) {
      dispatch(
        setContentForChannel({
          channelId: activeChannel,
          content: suggestions[selectedSuggestion],
        }),
      );
    } else {
      dispatch(setContent(suggestions[selectedSuggestion]));
    }
  };

  const handleInsert = () => {
    if (isCustomContent) {
      const channelContent = contentByChannel[activeChannel] || "";
      dispatch(
        setContentForChannel({
          channelId: activeChannel,
          content: channelContent + "\n" + suggestions[selectedSuggestion],
        }),
      );
    } else {
      dispatch(setContent(content + "\n" + suggestions[selectedSuggestion]));
    }
  };

  const renderStage1 = () => (
    <div className="h-full flex flex-col justify-between">
      <div className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
          <div className="flex items-center">
            <span className="text-blue-600 font-medium flex items-center text-sm">
              <Wand2 className="h-4 w-4 mr-1" /> AI Assistant
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-3">
          <p className="text-sm text-gray-700 mb-2">What do you want to write about?</p>
          <div className="relative">
            <Input
              value={prompt}
              onChange={(e) => dispatch(setPrompt(e.target.value))}
              placeholder="Write something..."
              className="w-full pr-8"
            />
            {prompt && (
              <Button
                onClick={handleClear}
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {prompt === "" && (
            <div className="flex flex-wrap gap-2 mt-2">
              {examplePrompts.map((examplePrompt, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex w-fit items-center gap-1 pl-2 pr-1 py-1 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() => dispatch(setPrompt(examplePrompt))}
                >
                  {examplePrompt}
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1">
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">Select tone:</p>
            <div className="flex gap-2">
              {tones.map((tone) => (
                <Badge
                  key={tone.id}
                  variant={selectedTone === tone.id ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedTone === tone.id ? "bg-blue-600" : "bg-white"
                  }`}
                  onClick={() => dispatch(setSelectedTone(tone.id))}
                >
                  {tone.icon} {tone.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">Pro tip:</p>
            <p className="text-xs text-gray-500">
              Include key points, your target audience and your desired outcome for this post to get
              better results.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end p-3 border-t border-gray-200">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
            disabled={!prompt}
            onClick={handleNext}
          >
            <span className="text-xs">Generate</span>
          </Button>
        </CardFooter>
      </div>

      <AIAlert />
    </div>
  );

  const renderStage2 = () => (
    <>
      <div className="h-full flex flex-col justify-between">
        <div className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-blue-600 font-medium flex items-center text-sm">
                <Wand2 className="h-4 w-4 mr-1" /> AI Assistant
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-3">
            <div className="flex justify-between mb-3">
              <div className="text-sm text-gray-700">{prompt}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => dispatch(toggleFavorite())}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>

            <Tabs defaultValue="suggestion0" className="w-full">
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="suggestion0">Option 1</TabsTrigger>
                <TabsTrigger value="suggestion1">Option 2</TabsTrigger>
                <TabsTrigger value="suggestion2">Option 3</TabsTrigger>
              </TabsList>

              {suggestions.map((suggestion, index) => (
                <TabsContent key={index} value={`suggestion${index}`} className="mt-0">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">{suggestion}</p>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{getWordCount(suggestion)} words</span>
                      <span>{getCharacterCount(suggestion)} characters</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                      onClick={() => {
                        dispatch(setSelectedSuggestion(index));
                        handleNext();
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      <span className="text-xs">Select</span>
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </div>

        <AIAlert />
      </div>

      {/* <CardFooter className="flex flex-col p-3 border-t border-gray-200">
        <div className="flex flex-wrap justify-between gap-2 w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="text-sm">
                  <Undo className="h-3 w-3 mr-1" /> Back
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go back to editing prompt</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <Save className="h-3 w-3 mr-1" /> Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save to favorites</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <History className="h-3 w-3 mr-1" /> History
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View generation history</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardFooter> */}
    </>
  );

  const renderStage3 = () => (
    <div className="h-full flex flex-col justify-between">
      <div className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-blue-600 font-medium flex items-center text-sm">
              <Wand2 className="h-4 w-4 mr-1" /> AI Assistant
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Final Content</p>

          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <p className="text-sm text-gray-700">{suggestions[selectedSuggestion]}</p>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{getWordCount(suggestions[selectedSuggestion])} words</span>
              <span>{getCharacterCount(suggestions[selectedSuggestion])} characters</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-blue-600 border border-blue-600 hover:bg-blue-100 transition duration-200"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Rephrase
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rewrite with different wording</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-yellow-600 border border-yellow-600 hover:bg-yellow-100 transition duration-200"
                  >
                    <Scissors className="h-4 w-4 mr-1" /> Shorten
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Make the text more concise</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-green-600 border border-green-600 hover:bg-green-100 transition duration-200"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Expand
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add more detail to the text</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-purple-600 border border-purple-600 hover:bg-purple-100 transition duration-200"
                  >
                    <Smile className="h-4 w-4 mr-1" /> More Casual
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Use more casual language</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 border border-red-600 hover:bg-red-100 transition duration-200"
                  >
                    <FileText className="h-4 w-4 mr-1" /> More Formal
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Use more formal language</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col p-3 border-t border-gray-200">
          <div className="flex justify-between w-full mb-4">
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
              {/* <Button variant="outline" size="icon">
              <Save className="h-4 w-4" />
            </Button> */}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReplace}>
                <span className="text-xs">Replace</span>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={handleInsert}>
                <span className="text-xs">Insert</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </div>

      <AIAlert />
    </div>
  );

  return (
    <Card className="w-full h-full border-gray-200">
      {currentStage === 1 && renderStage1()}
      {currentStage === 2 && renderStage2()}
      {currentStage === 3 && renderStage3()}
    </Card>
  );
};

const AIAlert = () => {
  return (
    <Alert className="py-2">
      <AlertDescription className="flex items-center text-xs text-gray-500">
        <span className="mr-1">⚠</span>
        <p>
          AI responses can be inaccurate or misleading. Always review before publishing.{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Learn more
          </a>
        </p>
      </AlertDescription>
    </Alert>
  );
};
