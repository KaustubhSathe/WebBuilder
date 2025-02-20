'use client';

import React, { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addElement, moveElement } from '@/store/builderSlice';
import BuilderComponent from './BuilderComponent';
import { ComponentType } from '@/types/builder';

interface ZoomableCanvasProps {
  children?: React.ReactNode;
}

const ZoomableCanvas: React.FC<ZoomableCanvasProps> = ({ children }) => {
  const dispatch = useDispatch();
  const component = useSelector((state: RootState) => state.builder.component);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop(() => ({
    accept: ['element', 'COMPONENT'],
    drop: (item: { id?: string; type: ComponentType }, monitor) => {
      if (!containerRef.current) return;

      const canvasRect = containerRef.current.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      
      if (offset) {
        // Calculate position relative to canvas and zoom
        let x = (offset.x - canvasRect.left) / zoom;
        let y = (offset.y - canvasRect.top) / zoom;

        // If it's an existing component being moved
        if (item.id) {
          dispatch(moveElement({
            id: item.id,
            position: { x, y }
          }));
        } else {
          // If it's a new element being added
          dispatch(addElement({
            parentId: component.id, // Root component id
            type: item.type,
            position: { x, y }
          }));
        }
      }
    },
  }), [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) { // Middle or right click
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(0.1, prev * delta), 5));
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gray-100 relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        ref={drop}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          position: 'relative',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <BuilderComponent component={component} />
      </div>
    </div>
  );
};

export default ZoomableCanvas; 



