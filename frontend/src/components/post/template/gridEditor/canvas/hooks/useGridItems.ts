import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setSelectedItem,
  updateItemZIndex,
  updateImagePosition,
  updateTextPosition,
  updateImageSize,
  updateTextSize,
  updateTextStyle,
} from "@/redux/slices/template.slice";
import { TextItem, TextStyle } from "../types";
import { calculateOptimalFontSize } from "../utils";
import debounce from "lodash/debounce";

export const useGridItems = () => {
  const dispatch = useDispatch();
  const { images, texts, selectedItemId, nextZIndex } = useSelector(
    (state: RootState) => state.template,
  );

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  // Track separate position for each item during dragging
  const [itemDragPositions, setItemDragPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // Track which kind of element we're interacting with
  const [draggedItemType, setDraggedItemType] = useState<"image" | "text" | null>(null);

  // Local resize state for smoother visual feedback
  const [localResizeState, setLocalResizeState] = useState<{
    itemId: string | null;
    size: { width: number; height: number };
    fontSize: number;
  }>({ itemId: null, size: { width: 0, height: 0 }, fontSize: 0 });

  // Local image resize state for smooth image resizing
  const [localImageResizeState, setLocalImageResizeState] = useState<{
    itemId: string | null;
    size: { width: number; height: number };
  }>({ itemId: null, size: { width: 0, height: 0 } });

  const dragTimeoutRef = useRef<NodeJS.Timeout>();

  // Keep track of previous image and text counts to detect new additions
  const prevImagesLengthRef = useRef<number>(images.length);
  const prevTextsLengthRef = useRef<number>(texts.length);

  // Keep track of currently selected item type
  const selectedItemRef = useRef<{
    type: "image" | "text" | null;
  }>({
    type: null,
  });

  // Create debounced update functions for better performance
  const debouncedResizeUpdate = useMemo(
    () =>
      debounce((itemId: string, size: any, fontSize: number, originalStyle: TextStyle) => {
        dispatch(updateTextSize({ id: itemId, size }));
        dispatch(
          updateTextStyle({
            id: itemId,
            style: {
              ...originalStyle,
              fontSize,
            },
          }),
        );
      }, 16), // 60fps rate
    [dispatch],
  );

  // Create debounced image resize update with lower frequency to improve performance
  const debouncedImageResizeUpdate = useMemo(
    () =>
      debounce((itemId: string, size: any) => {
        dispatch(updateImageSize({ id: itemId, size }));
      }, 100), // Less frequent Redux updates (100ms) for better performance
    [dispatch],
  );

  // Create debounced drag update with optimal frequency
  const debouncedDragUpdate = useMemo(
    () =>
      debounce((itemId: string, position: { x: number; y: number }, itemType: "image" | "text") => {
        // Update the Redux store based on item type
        if (itemType === "image") {
          dispatch(updateImagePosition({ id: itemId, position }));
        } else {
          dispatch(updateTextPosition({ id: itemId, position }));
        }
      }, 50), // 50ms for better performance during dragging
    [dispatch],
  );

  // Handle item selection with useCallback
  const handleSelectItem = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setSelectedItem(id));
    },
    [dispatch],
  );

  // Handle canvas click (deselect all items) with useCallback
  const handleCanvasClick = useCallback(() => {
    dispatch(setSelectedItem(null));
  }, [dispatch]);

  // Start dragging an item with useCallback
  const handleDragStart = useCallback(
    (e: React.MouseEvent, position: { x: number; y: number }, itemId: string) => {
      e.stopPropagation();

      // If the item being dragged is not the currently selected item, select it
      if (selectedItemId !== itemId) {
        dispatch(setSelectedItem(itemId));
      }

      // Set flag for dragging
      setIsDragging(true);

      // Determine item type
      const isImage = images.some((img) => img.id === itemId);
      setDraggedItemType(isImage ? "image" : "text");

      // Store the initial mouse position relative to the element
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });

      // Initialize or update this item's drag position
      setItemDragPositions((prev) => ({
        ...prev,
        [itemId]: position,
      }));
    },
    [selectedItemId, dispatch, images],
  );

  // Start resizing an item with useCallback
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, size: { width: number; height: number }) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        width: size.width,
        height: size.height,
      });
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });

      // Initialize local resize state
      if (selectedItemId) {
        const selectedText = texts.find((txt) => txt.id === selectedItemId);
        const selectedImage = images.find((img) => img.id === selectedItemId);

        if (selectedText) {
          setLocalResizeState({
            itemId: selectedItemId,
            size: {
              width: typeof size.width === "number" ? size.width : parseInt(String(size.width)),
              height: typeof size.height === "number" ? size.height : parseInt(String(size.height)),
            },
            fontSize: selectedText.style.fontSize,
          });
        } else if (selectedImage) {
          setLocalImageResizeState({
            itemId: selectedItemId,
            size: {
              width: typeof size.width === "number" ? size.width : parseInt(String(size.width)),
              height: typeof size.height === "number" ? size.height : parseInt(String(size.height)),
            },
          });
        }
      }
    },
    [selectedItemId, texts, images],
  );

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedItemId) return;

      if (isDragging) {
        // Update local position immediately for smooth visual feedback
        const newPosition = {
          x: Math.round(e.clientX - dragStart.x), // Round to avoid subpixel rendering
          y: Math.round(e.clientY - dragStart.y),
        };

        // Update only the selected item's drag position
        setItemDragPositions((prev) => ({
          ...prev,
          [selectedItemId]: newPosition,
        }));

        // Throttle Redux updates using our debounced function
        debouncedDragUpdate(selectedItemId, newPosition, draggedItemType || "text");
      }

      if (isResizing) {
        const selectedImage = images.find((img) => img.id === selectedItemId);
        const selectedText = texts.find((txt) => txt.id === selectedItemId);

        if (selectedImage) {
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;

          // Determine if we want to maintain aspect ratio
          const maintainAspectRatio = true; // Can be made into a user toggle option

          let finalWidth, finalHeight;

          if (maintainAspectRatio) {
            const aspectRatioValue = selectedImage.size.height / selectedImage.size.width;
            finalWidth = Math.max(20, resizeStart.width + deltaX);
            finalHeight = Math.max(20, finalWidth * aspectRatioValue);
          } else {
            // Free-form resize (not maintaining aspect ratio)
            finalWidth = Math.max(20, resizeStart.width + deltaX);
            finalHeight = Math.max(20, resizeStart.height + deltaY);
          }

          // Update local image resize state for smooth visual feedback
          // This runs on every mouse movement for smooth UI updates
          if (selectedItemId) {
            setLocalImageResizeState({
              itemId: selectedItemId,
              size: {
                width: Math.round(finalWidth), // Round to avoid subpixel rendering issues
                height: Math.round(finalHeight),
              },
            });

            // Debounce the Redux update (less frequent)
            debouncedImageResizeUpdate(selectedItemId, {
              width: Math.round(finalWidth),
              height: Math.round(finalHeight),
            });
          }
        } else if (selectedText) {
          // Handle text resizing with improved algorithm
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;

          // Calculate new width and height
          const newWidth =
            typeof resizeStart.width === "number" ? resizeStart.width + deltaX : 100 + deltaX;

          const newHeight =
            typeof resizeStart.height === "number" ? resizeStart.height + deltaY : 50 + deltaY;

          // Prevent negative dimensions (but don't enforce minimum size)
          const finalWidth = Math.max(5, newWidth);
          const finalHeight = Math.max(5, newHeight);

          // Update local resize state for smooth feedback
          if (localResizeState.itemId === selectedItemId) {
            // Calculate optimal font size based on new dimensions
            const optimalFontSize = calculateOptimalFontSize(
              selectedText.content,
              finalWidth,
              finalHeight,
              selectedText.style.fontFamily || "Arial",
            );

            // Update local state immediately for smooth visual feedback
            setLocalResizeState({
              itemId: selectedItemId,
              size: { width: finalWidth, height: finalHeight },
              fontSize: optimalFontSize,
            });

            // Update Redux store with debounced function to avoid performance issues
            debouncedResizeUpdate(
              selectedItemId,
              { width: finalWidth, height: finalHeight },
              optimalFontSize,
              selectedText.style,
            );
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        // On mouse up, ensure the final position is correctly updated in Redux
        if (selectedItemId && itemDragPositions[selectedItemId]) {
          const position = itemDragPositions[selectedItemId];
          if (draggedItemType === "image") {
            dispatch(
              updateImagePosition({
                id: selectedItemId,
                position: {
                  x: Math.round(position.x), // Round for crisp rendering
                  y: Math.round(position.y),
                },
              }),
            );
          } else {
            dispatch(
              updateTextPosition({
                id: selectedItemId,
                position: {
                  x: Math.round(position.x),
                  y: Math.round(position.y),
                },
              }),
            );
          }
        }
      }

      // Final text resize update on mouse up to ensure latest state is saved
      if (isResizing && localResizeState.itemId) {
        const { itemId, size, fontSize } = localResizeState;
        const selectedText = texts.find((txt) => txt.id === itemId);

        if (selectedText) {
          // Force immediate update on mouse up to ensure resize changes are applied
          dispatch(updateTextSize({ id: itemId, size }));

          // Keep all the original style properties, only update fontSize
          dispatch(
            updateTextStyle({
              id: itemId,
              style: {
                ...selectedText.style,
                fontSize,
              },
            }),
          );
        }

        // Reset local resize state
        setLocalResizeState({ itemId: null, size: { width: 0, height: 0 }, fontSize: 0 });
      }

      // Final image resize update on mouse up
      if (isResizing && localImageResizeState.itemId) {
        const { itemId, size } = localImageResizeState;

        // Force immediate update on mouse up to ensure resize changes are applied
        dispatch(updateImageSize({ id: itemId, size }));

        // Reset local image resize state
        setLocalImageResizeState({ itemId: null, size: { width: 0, height: 0 } });
      }

      setIsDragging(false);
      setIsResizing(false);
      setDraggedItemType(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    selectedItemId,
    dragStart,
    resizeStart,
    images,
    texts,
    dispatch,
    itemDragPositions,
    localResizeState,
    localImageResizeState,
    debouncedResizeUpdate,
    debouncedImageResizeUpdate,
    draggedItemType,
    debouncedDragUpdate,
  ]);

  // Update item drag positions when items change in Redux store
  useEffect(() => {
    // Update drag positions map when images or texts change in Redux
    const updatedDragPositions = { ...itemDragPositions };
    let changed = false;

    // Update image positions
    images.forEach((img) => {
      if (
        !itemDragPositions[img.id] ||
        itemDragPositions[img.id].x !== img.position.x ||
        itemDragPositions[img.id].y !== img.position.y
      ) {
        updatedDragPositions[img.id] = img.position;
        changed = true;
      }
    });

    // Update text positions
    texts.forEach((txt) => {
      if (
        !itemDragPositions[txt.id] ||
        itemDragPositions[txt.id].x !== txt.position.x ||
        itemDragPositions[txt.id].y !== txt.position.y
      ) {
        updatedDragPositions[txt.id] = txt.position;
        changed = true;
      }
    });

    if (changed && !isDragging) {
      setItemDragPositions(updatedDragPositions);
    }
  }, [images, texts, isDragging]);

  // Update selected item ref when selection changes
  useEffect(() => {
    if (selectedItemId) {
      const selectedImage = images.find((img) => img.id === selectedItemId);
      const selectedText = texts.find((txt) => txt.id === selectedItemId);

      if (selectedImage) {
        selectedItemRef.current = {
          type: "image",
        };
      } else if (selectedText) {
        selectedItemRef.current = {
          type: "text",
        };
      }
    }
  }, [selectedItemId, images, texts]);

  // Add document click handler to deselect when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Check if the click target is not an image or text element
      const target = e.target as HTMLElement;
      if (!target.closest(".absolute")) {
        dispatch(setSelectedItem(null));
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [dispatch]);

  // Auto-select newly added items and ensure they are at top layer
  useEffect(() => {
    // Check for new image
    if (images.length > prevImagesLengthRef.current) {
      const newImage = images[images.length - 1];

      // Select the new image
      dispatch(setSelectedItem(newImage.id));

      // Set it to the highest z-index
      const allItems = [...images, ...texts];
      const highestZIndex =
        allItems.length > 0 ? Math.max(...allItems.map((item) => item.zIndex)) : 0;

      dispatch(updateItemZIndex({ id: newImage.id, zIndex: highestZIndex + 1 }));

      prevImagesLengthRef.current = images.length;
    }

    // Check for new text
    if (texts.length > prevTextsLengthRef.current) {
      const newText = texts[texts.length - 1];

      // Select the new text
      dispatch(setSelectedItem(newText.id));

      // Set it to the highest z-index
      const allItems = [...images, ...texts];
      const highestZIndex =
        allItems.length > 0 ? Math.max(...allItems.map((item) => item.zIndex)) : 0;

      dispatch(updateItemZIndex({ id: newText.id, zIndex: highestZIndex + 1 }));

      prevTextsLengthRef.current = texts.length;
    }
  }, [images, texts, dispatch]);

  return {
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    hoveredImageId,
    setHoveredImageId,
    handleSelectItem,
    handleCanvasClick,
    handleDragStart,
    handleResizeStart,
    itemDragPositions,
    localResizeState,
    localImageResizeState,
  };
};
