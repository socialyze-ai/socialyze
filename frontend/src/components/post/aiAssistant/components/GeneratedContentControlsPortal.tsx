import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface GeneratedContentControlsPortalProps {
  targetId: string;
  controls: React.ReactNode;
}

const GeneratedContentControlsPortal: React.FC<GeneratedContentControlsPortalProps> = ({
  targetId,
  controls,
}) => {
  const [mounted, setMounted] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);

    // Find the target element when component mounts
    const element = document.getElementById(targetId);
    if (element) {
      setTargetElement(element);
    }

    // Set up a mutation observer to find the element if it doesn't exist yet
    if (!element) {
      const observer = new MutationObserver((mutations) => {
        const newElement = document.getElementById(targetId);
        if (newElement) {
          setTargetElement(newElement);
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [targetId]);

  // Do not render on the server or if not mounted
  if (!mounted || !targetElement) return null;

  // Create a portal to render next to the target element
  return createPortal(
    <span className="inline-block ml-1 align-middle">{controls}</span>,
    targetElement.parentElement || document.body,
  );
};

export default GeneratedContentControlsPortal;
