'use client';

import React, { useState, useRef } from 'react';
import { useGesture } from 'react-use-gesture';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { ComponentType } from '../types/builder';
import { addElement, setSelectedComponent, moveElement } from '../store/builderSlice';
import { RootState } from '../store/store';
import BuilderComponent from './BuilderComponent';

interface ZoomableCanvasProps {
  children?: React.ReactNode;
}

const ZoomableCanvas: React.FC<ZoomableCanvasProps> = () => {
  const dispatch = useDispatch();
  const component = useSelector((state: RootState) => state.builder.component);
  console.log(component);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['element', 'COMPONENT'],
    drop: (item: { id?: string; type: ComponentType }, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        let x = (offset.x - canvasRect.left) / zoom;
        let y = (offset.y - canvasRect.top) / zoom;

        if (item.id) {
          dispatch(moveElement({
            id: item.id,
            position: { x, y }
          }));
        } else {
          dispatch(addElement({
            parentId: component.id,
            type: item.type,
            position: { x, y }
          }));
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [zoom]);

  const bind = useGesture({
    onWheel: ({ event, delta: [_x, dy], ctrlKey }) => {
      if (ctrlKey || event.metaKey) {
        event.preventDefault();
        setZoom(z => {
          const newZoom = z - dy * 0.005;
          return Math.min(Math.max(0.25, newZoom), 2);
        });
      }
    },
    onDragStart: ({ event }) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        setIsDragging(true);
      }
    },
    onDrag: ({ delta: [dx, dy], event }) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        setPosition(pos => ({
          x: pos.x + dx / zoom,
          y: pos.y + dy / zoom
        }));
      }
    },
    onDragEnd: () => {
      setIsDragging(false);
    }
  });

  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(z - 0.1, 0.25));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full bg-[#1a1a1a] p-8 overflow-hidden relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#2c2c2c] rounded px-2 py-1 z-10">
        <button 
          onClick={handleZoomOut}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span className="material-icons text-[18px]">remove</span>
        </button>
        <button 
          onClick={handleReset}
          className="text-gray-400 hover:text-gray-200 transition-colors px-2 text-sm"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button 
          onClick={handleZoomIn}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span className="material-icons text-[18px]">add</span>
        </button>
      </div>

      <div 
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        {...bind()}
        className={`w-full h-full bg-white rounded relative touch-none select-none ${
          isOver ? 'bg-opacity-90' : ''
        } ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
        style={{
          transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out'
        }}
        onClick={() => dispatch(setSelectedComponent(null))}
      >
        <div className="absolute inset-0 border-2 border-gray-300">
          <BuilderComponent component={component} />
        </div>
      </div>
    </div>
  );
};

export default ZoomableCanvas; 



