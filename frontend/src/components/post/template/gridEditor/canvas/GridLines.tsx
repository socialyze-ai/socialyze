import React from "react";
import { CELL_SIZE_PX } from "./utils";

interface GridLinesProps {
  columns: number;
  rows: number;
}

const GridLines: React.FC<GridLinesProps> = ({ columns, rows }) => {
  const verticalLines = [];
  const horizontalLines = [];

  // Create vertical lines
  for (let i = 1; i < columns; i++) {
    verticalLines.push(
      <div
        key={`vline-${i}`}
        className="absolute border-l border-dashed border-gray-400 z-10"
        style={{
          left: `${CELL_SIZE_PX * i}px`,
          height: "100%",
          top: 0,
        }}
      />,
    );
  }

  // Create horizontal lines
  for (let i = 1; i < rows; i++) {
    horizontalLines.push(
      <div
        key={`hline-${i}`}
        className="absolute border-t border-dashed border-gray-400 z-10"
        style={{
          top: `${CELL_SIZE_PX * i}px`,
          width: "100%",
          left: 0,
        }}
      />,
    );
  }

  return (
    <>
      {verticalLines}
      {horizontalLines}
    </>
  );
};

export default GridLines;
