'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface ResizeHandleProps {
  position: string;
  onResize: (deltaX: number, deltaY: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ 
  position, 
  onResize,
  onResizeStart,
  onResizeEnd
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    e.stopPropagation();
    setIsResizing(true);
    onResizeStart();
    setStartPos({ x: e.clientX, y: e.clientY });
  }, [onResizeStart]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!e.buttons) {
        setIsResizing(false);
        onResizeEnd();
        return;
      }

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      onResize(deltaX, deltaY);
      setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onResizeEnd();
    };

    const handleMouseLeave = () => {
      setIsResizing(false);
      onResizeEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isResizing, onResize, onResizeEnd, startPos]);

  const getPosition = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize';
      case 'right':
        return 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize';
      case 'bottom':
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize';
      case 'left':
        return 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize';
      default:
        return '';
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute w-2 h-2 bg-black rounded-full hover:bg-gray-700 ${
        isResizing ? 'bg-gray-700 ring-1 ring-gray-400' : ''
      } ${getPosition()}`}
    />
  );
};

export default ResizeHandle; 