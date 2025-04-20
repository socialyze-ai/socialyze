import React from "react";

interface TypeEffectProps {
  typedContent: string;
}

const TypeEffect: React.FC<TypeEffectProps> = ({ typedContent }) => {
  return (
    <div className="absolute bottom-2 left-2 right-2 bg-gray-50 p-2 rounded-md border border-gray-200 text-sm">
      <span className="text-gray-700">{typedContent}</span>
      <span className="animate-pulse">|</span>
    </div>
  );
};

export default TypeEffect;
