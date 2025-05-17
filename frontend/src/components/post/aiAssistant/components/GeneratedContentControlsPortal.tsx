import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface GeneratedContentControlsPortalProps {
  targetId: string;
  controls: React.ReactNode;
  type?: "text" | "image"; // Allow specifying the type of content for specific handling
}

const GeneratedContentControlsPortal: React.FC<GeneratedContentControlsPortalProps> = ({
  targetId,
  controls,
  type = "text",
}) => {
  const [mounted, setMounted] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const portalInstanceRef = useRef<number>(Date.now()); // Unique instance ID for debugging

  // This is critical - keep the controls mounted even if target temporarily disappears
  const [shouldRender, setShouldRender] = useState(false);
  const lastKnownTargetRef = useRef<{ element: HTMLElement | null; parent: HTMLElement | null }>({
    element: null,
    parent: null,
  });

  useEffect(() => {
    setMounted(true);

    const findAndSetTarget = () => {
      const element = document.getElementById(targetId);
      if (element) {
        lastKnownTargetRef.current.element = element;
        lastKnownTargetRef.current.parent = element.parentElement;
        setTargetElement(element);
        setShouldRender(true);
        return true;
      }
      return false;
    };

    // Initial attempt to find the target
    const found = findAndSetTarget();

    // Set up a mutation observer that's more focused and efficient
    if (!observerRef.current) {
      observerRef.current = new MutationObserver((mutations) => {
        // If we already have a target, check if it's still in the DOM
        if (targetElement && !document.body.contains(targetElement)) {
          findAndSetTarget();
        }
        // If we don't have a target yet, try to find it
        else if (!targetElement) {
          findAndSetTarget();
        }
      });

      // Observe the whole document for changes but with a more specific config
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: type === "text", // Only observe text changes for text content
        attributes: true,
        attributeFilter: ["style", "class", "id"],
      });
    }

    // Clean up observer on unmount (but keep the component mounted until explicitly dismissed)
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [targetId, targetElement, type]);

  // Track resize events on the target's container elements
  useEffect(() => {
    if (!targetElement) return;

    // Set up a resize observer to handle changes to the target's container
    if (!resizeObserverRef.current && targetElement.parentElement) {
      const modalContent = document.getElementById("create-post-modal-content");
      const elementsToObserve = [targetElement.parentElement, modalContent].filter(
        Boolean,
      ) as HTMLElement[];

      resizeObserverRef.current = new ResizeObserver(() => {
        // Recheck if our element is still valid after layout changes
        const element = document.getElementById(targetId);
        if (element && element !== targetElement) {
          setTargetElement(element);
        }
      });

      // Observe both the direct parent and modal content
      elementsToObserve.forEach((el) => resizeObserverRef.current?.observe(el));
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [targetElement, targetId]);

  // Keep component mounted even when parent changes layout
  useEffect(() => {
    const handleResize = () => {
      // Check if our element is still in the DOM
      const element = document.getElementById(targetId);
      if (!element && shouldRender) {
        // If element is missing but we were rendering before, try to use last known parent
      } else if (element) {
        setTargetElement(element);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [targetId, shouldRender]);

  // Do not unmount unless component is explicitly unmounted
  if (!mounted) return null;

  // If we should render and have an element or fallback, create portal
  if (shouldRender) {
    if (targetElement && targetElement.parentElement) {
      return createPortal(
        <span className="inline-block ml-1 align-middle">{controls}</span>,
        targetElement.parentElement,
      );
    }

    // Fallback to last known parent if available
    if (lastKnownTargetRef.current.parent) {
      return createPortal(
        <span className="inline-block ml-1 align-middle">{controls}</span>,
        lastKnownTargetRef.current.parent,
      );
    }

    // Last resort: render to body
    return createPortal(
      <span className="inline-block ml-1 align-middle">{controls}</span>,
      document.body,
    );
  }

  // Return null only if we explicitly shouldn't render
  return null;
};

export default GeneratedContentControlsPortal;
