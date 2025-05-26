import React from "react";
import { Layers, Type, ArrowUp, ArrowDown, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setSelectedItem,
  moveForward,
  moveBackward,
  normalizeZIndices,
} from "@/redux/slices/template.slice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const LayerManager = () => {
  const dispatch = useDispatch();
  const { images, texts, selectedItemId } = useSelector((state: RootState) => state.template);

  // Normalize z-indices when component mounts or when items change
  useEffect(() => {
    dispatch(normalizeZIndices());
  }, [images.length, texts.length, dispatch]);

  // Combine images and texts into a single array of items
  const allItems = [
    ...images.map((img) => ({
      ...img,
      type: "image" as const,
      displayName: `Image ${img.id.substring(0, 4)}...`,
    })),
    ...texts.map((txt) => ({
      ...txt,
      type: "text" as const,
      displayName:
        txt.content.length > 15 ? `${txt.content.substring(0, 15)}...` : txt.content || "Text",
    })),
  ];

  // Sort items by z-index (highest first for visual display)
  const sortedItems = [...allItems].sort((a, b) => b.zIndex - a.zIndex);

  // Calculate total layers
  const totalLayers = allItems.length;

  // Layer management handlers
  const handleSelectItem = (id: string) => {
    dispatch(setSelectedItem(id));
  };

  const handleMoveForward = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(moveForward(id));
  };

  const handleMoveBackward = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(moveBackward(id));
  };

  // Function to get layer position text
  const getLayerPositionText = (zIndex: number) => {
    if (zIndex === totalLayers) return "Top Layer";
    if (zIndex === 1) return "Bottom Layer";
    return `Layer ${zIndex} of ${totalLayers}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-2 w-full h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <h3 className="text-sm font-medium">Layers</h3>
        </div>
        <div className="text-xs text-gray-500">Total Layers: {totalLayers}</div>
      </div>

      {/* Layer Stack Visualization */}
      <ScrollArea className="h-[200px] pr-2">
        {sortedItems.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No layers yet. Add images or text to see them here.
          </div>
        ) : (
          <div className="space-y-1">
            {sortedItems.map((item) => (
              <div
                key={`layer-${item.id}`}
                className={`flex items-center p-1 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedItemId === item.id ? "bg-blue-50 ring-1 ring-blue-200" : ""
                }`}
                onClick={() => handleSelectItem(item.id)}
              >
                <div className="w-5 text-center">
                  <span className="text-xs font-medium">{item.zIndex}</span>
                </div>

                <div className="ml-2 flex items-center gap-1 flex-1">
                  {item.type === "image" ? (
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-sm overflow-hidden">
                          <img src={item.src} className="h-full w-full object-cover" alt="" />
                        </div>
                        <span className="text-xs">Image</span>
                      </TooltipTrigger>
                      <TooltipContent className="p-0 border-none">
                        <div className="h-40 w-40 bg-gray-200 rounded-sm overflow-hidden">
                          <img src={item.src} className="h-full w-full object-cover" alt="" />
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <Type className="h-4 w-4 text-green-500" />
                      <span className="text-xs truncate max-w-[100px]">
                        {(item as any).content.substring(0, 10)}...
                      </span>
                    </>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={item.zIndex === 1}
                    title="Move down"
                    onClick={(e) => handleMoveBackward(item.id, e)}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={item.zIndex === totalLayers}
                    title="Move up"
                    onClick={(e) => handleMoveForward(item.id, e)}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default LayerManager;
