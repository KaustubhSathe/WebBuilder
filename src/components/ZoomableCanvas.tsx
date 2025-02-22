"use client";

import React, { useCallback, useRef, useState } from "react";
import { useGesture } from "react-use-gesture";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Component, DraggableComponent } from "../types/builder";
import {
  addElement,
  moveElement,
  setSelectedComponent,
} from "../store/builderSlice";
import { RootState } from "../store/store";
import BuilderComponent from "./BuilderComponent";

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

  const findComponentAtPosition = (
    root: Component,
    x: number,
    y: number,
    canvasRect: DOMRect,
    excludeId?: string,
  ): Component | null => {
    if (root.id === excludeId) return null;
    // Check children first (reverse order to check front-to-back)
    for (let i = root.children.length - 1; i >= 0; i--) {
      const child = root.children[i];
      if (child.id === excludeId) continue;

      if (child.styles) {
        const left = parseInt(child.styles.left?.replace("px", "") || "0", 10);
        const top = parseInt(child.styles.top?.replace("px", "") || "0", 10);
        const width = parseInt(
          child.styles.width?.replace("px", "") || "0",
          10,
        );
        const height = parseInt(
          child.styles.height?.replace("px", "") || "0",
          10,
        );

        if (
          x >= left &&
          x <= left + width &&
          y >= top &&
          y <= top + height
        ) {
          // Check if any of this child's children contain the point
          const childResult = findComponentAtPosition(
            child,
            x,
            y,
            canvasRect,
            excludeId,
          );
          return childResult || child;
        }
      }
    }

    // If no children contain the point, return the root if it contains the point
    return root;
  };

  const [{ isOver }, drop] = useDrop({
    accept: ["component", "placed-component"],
    drop: (item: DraggableComponent & { id?: string }, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;

      const offset = monitor.getClientOffset();
      const initialOffset = monitor.getInitialClientOffset();
      const initialSourceOffset = monitor.getInitialSourceClientOffset();

      if (
        !offset || !initialOffset || !initialSourceOffset || !canvasRef.current
      ) {
        return;
      }

      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Calculate the offset from grab point to component's top-left
      const grabOffset = {
        x: initialOffset.x - initialSourceOffset.x,
        y: initialOffset.y - initialSourceOffset.y,
      };

      // Calculate final position, accounting for grab offset
      const x =
        (offset.x - canvasRect.left - position.x * zoom - grabOffset.x) / zoom;
      const y = (offset.y - canvasRect.top - position.y * zoom - grabOffset.y) /
        zoom;

      // Find the component at drop position, excluding the dragged component
      const targetComponent = findComponentAtPosition(
        component,
        x,
        y,
        canvasRect,
        item.id,
      );
      if (!targetComponent) return;

      // Calculate position relative to target component
      const targetLeft = parseInt(
        targetComponent.styles?.left?.replace("px", "") || "0",
        10,
      );
      const targetTop = parseInt(
        targetComponent.styles?.top?.replace("px", "") || "0",
        10,
      );
      const relativeX = x - targetLeft;
      const relativeY = y - targetTop;

      if (monitor.getItemType() === "component") {
        dispatch(addElement({
          parentId: targetComponent.id,
          type: item.type,
          position: { x: relativeX, y: relativeY },
        }));
      } else if (monitor.getItemType() === "placed-component" && item.id) {
        dispatch(moveElement({
          id: item.id,
          position: { x: relativeX, y: relativeY },
          newParentId: targetComponent.id,
        }));
      }

      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const bind = useGesture(
    {
      onWheel: ({ event, delta: [_x, dy], ctrlKey }) => {
        if (ctrlKey || event.metaKey) {
          event.preventDefault();
          setZoom((z) => {
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
          setPosition((pos) => ({
            x: pos.x + dx / zoom,
            y: pos.y + dy / zoom,
          }));
        }
      },
      onDragEnd: () => {
        setIsDragging(false);
      },
    },
    {
      eventOptions: {
        passive: false,
      },
    },
  );

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.1, 0.25));
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
        className={`zoomable-canvas w-full h-full bg-white rounded relative touch-none select-none
            ${isOver ? "bg-opacity-90" : ""}
            ${
          isDragging
            ? "cursor-grabbing"
            : isOver
            ? "cursor-grabbing"
            : "cursor-default"
        }`}
        style={{
          transform:
            `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: "center center",
          transition: "transform 0.1s ease-out",
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
