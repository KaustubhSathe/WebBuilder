'use client';

import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { selectElement, moveElement, updateElementSize } from '../store/builderSlice';
import { ElementType } from '../types/builder';
import ResizeHandle from './ResizeHandle';

interface BuilderElementProps {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  isSelected: boolean;
}

const BuilderElement: React.FC<BuilderElementProps> = ({ id, type, position, isSelected }) => {
  const dispatch = useDispatch();
  const [size, setSize] = useState({ width: 100, height: 40 });
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'placed-element',
    item: { id, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !isResizing,
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        dispatch(moveElement({
          id: item.id,
          position: {
            x: position.x + delta.x,
            y: position.y + delta.y
          }
        }));
      }
    },
  }), [id, position, isResizing]);

  const handleResize = (direction: string, deltaX: number, deltaY: number) => {
    const newSize = { ...size };
    
    switch (direction) {
      case 'right':
        const newRightWidth = Math.max(100, size.width + deltaX * 2);
        const rightDelta = newRightWidth - size.width;
        newSize.width = newRightWidth;
        dispatch(moveElement({
          id,
          position: {
            x: position.x + rightDelta/2,
            y: position.y
          }
        }));
        break;
      case 'left':
        const newWidth = Math.max(100, size.width - deltaX * 2);
        const widthDelta = newWidth - size.width;
        newSize.width = newWidth;
        dispatch(moveElement({
          id,
          position: {
            x: position.x - widthDelta/2,
            y: position.y
          }
        }));
        break;
      case 'bottom':
        const newBottomHeight = Math.max(40, size.height + deltaY * 2);
        const bottomDelta = newBottomHeight - size.height;
        newSize.height = newBottomHeight;
        dispatch(moveElement({
          id,
          position: {
            x: position.x,
            y: position.y + bottomDelta/2
          }
        }));
        break;
      case 'top':
        const newHeight = Math.max(40, size.height - deltaY * 2);
        const heightDelta = newHeight - size.height;
        newSize.height = newHeight;
        dispatch(moveElement({
          id,
          position: {
            x: position.x,
            y: position.y - heightDelta/2
          }
        }));
        break;
    }

    setSize(newSize);
    dispatch(updateElementSize({ id, size: newSize }));
  };

  const getElementContent = () => {
    switch (type) {
      case 'div':
        return <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300" />;
      case 'text':
        return <div className="absolute inset-0 flex items-center px-2">
          <p className="text-gray-600 w-full h-full">Text Block</p>
        </div>;
      case 'link':
        return <div className="absolute inset-0 flex items-center px-2">
          <a href="#" className="text-blue-500 hover:underline w-full h-full">Link</a>
        </div>;
      case 'input':
        return <div className="absolute inset-0 flex items-center p-2">
          <input 
            type="text" 
            className="w-full h-full border border-gray-300 rounded px-2" 
            placeholder="Input" 
          />
        </div>;
      case 'button':
        return <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-blue-500 text-white px-4 py-2 rounded w-full h-full">Button</button>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div
      ref={drag}
      className={`absolute ${
        isResizing ? 'cursor-auto' : 'cursor-move'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: 'translate(-50%, -50%)',
        transition: isResizing ? 'none' : 'all 0.1s ease-out',
        touchAction: 'none',
        opacity: 1,
        outline: isSelected ? '1px solid black' : 'none'
      }}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(selectElement(id));
      }}
    >
      {getElementContent()}
      {isSelected && (
        <>
          <ResizeHandle 
            position="top" 
            onResize={(_, dy) => handleResize('top', 0, dy)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle 
            position="right" 
            onResize={(dx) => handleResize('right', dx, 0)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle 
            position="bottom" 
            onResize={(_, dy) => handleResize('bottom', 0, dy)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle 
            position="left" 
            onResize={(dx) => handleResize('left', dx, 0)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
        </>
      )}
    </div>
  );
};

export default BuilderElement; 