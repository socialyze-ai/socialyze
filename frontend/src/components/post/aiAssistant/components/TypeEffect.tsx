import React from "react";

interface TypeEffectProps {
  typedContent: string;
}

const TypeEffect: React.FC<TypeEffectProps> = ({ typedContent }) => {
  return (
    <span className="text-gray-800 font-medium inline-block">
      {typedContent}
      <span
        className="inline-block ml-0.5"
        style={{
          height: "16px",
          width: "2px",
          backgroundColor: "#1f2937",
          animation: "blink 1s ease-in-out infinite",
        }}
      ></span>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </span>
  );
};

export default TypeEffect;
