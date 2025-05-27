import React from "react";

interface ReferenceLinesProps {
  canvasCount: number;
  canvasWidth: number;
}

const ReferenceLines: React.FC<ReferenceLinesProps> = ({ canvasCount, canvasWidth }) => {
  if (canvasCount <= 1) return null;

  const lines = [];

  // Calculate section width
  const sectionWidth = canvasWidth / canvasCount;

  // Draw vertical lines separating sections
  for (let i = 1; i < canvasCount; i++) {
    lines.push(
      <div
        key={`line-${i}`}
        className="absolute border-l border-dashed border-gray-400 z-40"
        style={{
          left: `${sectionWidth * i}px`,
          height: "100%",
          top: 0,
        }}
      />,
    );
  }

  return <>{lines}</>;
};

export default ReferenceLines;
