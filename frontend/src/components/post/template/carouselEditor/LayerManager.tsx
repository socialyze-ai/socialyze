import React, { useState, useEffect } from "react";
import { Layers, Type, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setSelectedItem,
  moveForward,
  moveBackward,
  normalizeZIndices,
  reorderLayers,
} from "@/redux/slices/template.slice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DragState {
  isDragging: boolean;
  dragIndex: number | null;
  dragOverIndex: number | null;
  previewZIndices: Record<string, number> | null;
}

const LayerManager = () => {
  const dispatch = useDispatch();
  const { images, texts, selectedItemId } = useSelector((state: RootState) => state.template);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragIndex: null,
    dragOverIndex: null,
    previewZIndices: null,
  });

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

  const handleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Calculate preview z-indices during drag
  const calculatePreviewZIndices = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return null;

    // Create a copy of the sorted items to manipulate
    const itemsCopy = [...sortedItems];
    const [movedItem] = itemsCopy.splice(fromIndex, 1);
    itemsCopy.splice(toIndex, 0, movedItem);

    // Create a map of id -> preview z-index
    const previewMap: Record<string, number> = {};

    // Assign z-indices (highest at top)
    itemsCopy.forEach((item, index) => {
      previewMap[item.id] = itemsCopy.length - index;
    });

    return previewMap;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";

    setDragState({
      isDragging: true,
      dragIndex: index,
      dragOverIndex: null,
      previewZIndices: null,
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      dragIndex: null,
      dragOverIndex: null,
      previewZIndices: null,
    });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Only update if the dragOverIndex is changing
    if (dragState.dragOverIndex !== index) {
      const { dragIndex } = dragState;

      // Calculate preview z-indices
      const previewZIndices =
        dragIndex !== null ? calculatePreviewZIndices(dragIndex, index) : null;

      setDragState((prev) => ({
        ...prev,
        dragOverIndex: index,
        previewZIndices,
      }));
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear dragOverIndex if we're actually leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState((prev) => ({
        ...prev,
        dragOverIndex: null,
        previewZIndices: null,
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    const draggedItemId = e.dataTransfer.getData("text/plain");
    const { dragIndex } = dragState;

    if (dragIndex === null || dragIndex === dropIndex) {
      setDragState({
        isDragging: false,
        dragIndex: null,
        dragOverIndex: null,
        previewZIndices: null,
      });
      return;
    }

    // Dispatch reorder action
    dispatch(
      reorderLayers({
        itemId: draggedItemId,
        fromIndex: dragIndex,
        toIndex: dropIndex,
      }),
    );

    setDragState({
      isDragging: false,
      dragIndex: null,
      dragOverIndex: null,
      previewZIndices: null,
    });
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
      <div className="h-full max-h-[200px] overflow-y-auto">
        {sortedItems.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No layers yet. Add images or text to see them here.
          </div>
        ) : (
          <div className="space-y-1">
            {sortedItems.map((item, index) => (
              <div
                key={`layer-${item.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index, item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center p-1 rounded cursor-pointer transition-all ${
                  selectedItemId === item.id ? "bg-blue-50 ring-1 ring-blue-200" : ""
                } ${
                  dragState.isDragging && dragState.dragIndex === index
                    ? "opacity-50 transform scale-95"
                    : ""
                } ${
                  dragState.dragOverIndex === index && dragState.dragIndex !== index
                    ? "border-t-2 border-blue-400"
                    : ""
                } hover:bg-gray-100`}
                onClick={(e) => handleSelectItem(item.id, e)}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing mr-1">
                  <GripVertical className="h-3 w-3 text-gray-400" />
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
                        {item.content.substring(0, 10)}...
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
      </div>
    </div>
  );
};

export default LayerManager;
