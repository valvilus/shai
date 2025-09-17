import React from 'react';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

export function ResizeHandle({ onMouseDown, isResizing }: ResizeHandleProps) {
  return (
    <div
      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group-hover:bg-gray-300 transition-colors ${
        isResizing ? 'bg-blue-500' : 'bg-transparent'
      }`}
      onMouseDown={onMouseDown}
      style={{ 
        right: '-2px',
        width: '4px',
        zIndex: 10
      }}
    >
      <div className="h-full w-full hover:bg-gray-400 transition-colors" />
    </div>
  );
}


