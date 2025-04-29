// FloatingOptionsBox Component Revamp
"use client";

import React from "react";

interface FloatingOptionsBoxProps {
  options: string[];
  onOptionSelect: (option: string) => void;
  position: { x: number; y: number };
}

const FloatingOptionsBox: React.FC<FloatingOptionsBoxProps> = ({
  options,
  onOptionSelect,
  position,
}) => {
  return (
    <div
      className="absolute bg-white border border-gray-300 rounded shadow-lg p-2 z-50"
      style={{ left: position.x, top: position.y }}
    >
      {options.map((option) => (
        <button
          key={option}
          className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-700 font-medium rounded-md"
          onClick={() => onOptionSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default FloatingOptionsBox;
