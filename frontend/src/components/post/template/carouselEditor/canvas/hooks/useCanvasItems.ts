import { useState, useEffect, useRef, useCallback } from "react";
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

export const useCanvasItems = () => {
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
      setIsDragging(true);
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
    [],
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
    },
    [],
  );

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedItemId) return;

      if (isDragging) {
        // Update local position immediately for smooth visual feedback
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };

        // Update only the selected item's drag position
        setItemDragPositions((prev) => ({
          ...prev,
          [selectedItemId]: newPosition,
        }));

        // Throttle Redux updates
        if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = setTimeout(() => {
          // Only dispatch to Redux every 16ms (60fps)
          const selectedImage = images.find((img) => img.id === selectedItemId);
          const selectedText = texts.find((txt) => txt.id === selectedItemId);

          if (selectedImage) {
            dispatch(updateImagePosition({ id: selectedItemId, position: newPosition }));
          } else if (selectedText) {
            dispatch(updateTextPosition({ id: selectedItemId, position: newPosition }));
          }
        }, 16);
      }

      if (isResizing) {
        const selectedImage = images.find((img) => img.id === selectedItemId);
        const selectedText = texts.find((txt) => txt.id === selectedItemId);

        if (selectedImage) {
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;

          // Determine if we want to maintain aspect ratio
          const maintainAspectRatio = true; // Can be made into a user toggle option

          if (maintainAspectRatio) {
            const aspectRatioValue = selectedImage.size.height / selectedImage.size.width;
            let newWidth = Math.max(20, resizeStart.width + deltaX);
            let newHeight = Math.max(20, newWidth * aspectRatioValue);

            dispatch(
              updateImageSize({ id: selectedItemId, size: { width: newWidth, height: newHeight } }),
            );
          } else {
            // Free-form resize (not maintaining aspect ratio)
            const newWidth = Math.max(20, resizeStart.width + deltaX);
            const newHeight = Math.max(20, resizeStart.height + deltaY);

            dispatch(
              updateImageSize({ id: selectedItemId, size: { width: newWidth, height: newHeight } }),
            );
          }
        } else if (selectedText) {
          // Handle text resizing
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;

          // Calculate new width and height
          const newWidth = Math.max(
            50,
            typeof resizeStart.width === "number" ? resizeStart.width + deltaX : 100 + deltaX,
          );
          const newHeight = Math.max(
            20,
            typeof resizeStart.height === "number" ? resizeStart.height + deltaY : 50 + deltaY,
          );

          // Update text size
          dispatch(
            updateTextSize({
              id: selectedItemId,
              size: {
                width: newWidth as number,
                height: newHeight as number,
              },
            }),
          );

          // Optionally adjust font size based on width change
          const fontSizeAdjustment = deltaX * 0.05; // Subtle adjustment based on width change
          if (Math.abs(fontSizeAdjustment) > 0.5) {
            // Only adjust if change is significant
            const currentFontSize = selectedText.style.fontSize;
            const newFontSize = Math.max(8, Math.min(72, currentFontSize + fontSizeAdjustment));

            // Update font size if it changed
            if (newFontSize !== currentFontSize) {
              dispatch(
                updateTextStyle({
                  id: selectedItemId,
                  style: {
                    ...selectedText.style,
                    fontSize: newFontSize,
                  },
                }),
              );
            }
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        // On mouse up, ensure the final position is correctly updated in Redux
        const selectedImage = images.find((img) => img.id === selectedItemId);
        const selectedText = texts.find((txt) => txt.id === selectedItemId);

        if (selectedImage && selectedItemId && itemDragPositions[selectedItemId]) {
          dispatch(
            updateImagePosition({
              id: selectedItemId,
              position: itemDragPositions[selectedItemId],
            }),
          );
        } else if (selectedText && selectedItemId && itemDragPositions[selectedItemId]) {
          dispatch(
            updateTextPosition({
              id: selectedItemId,
              position: itemDragPositions[selectedItemId],
            }),
          );
        }
      }

      setIsDragging(false);
      setIsResizing(false);
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
  };
};
