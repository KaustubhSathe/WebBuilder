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
import CommentBubble from "./CommentBubble";
import CommentBox from "./CommentBox";

interface ZoomableCanvasProps {
  children?: React.ReactNode;
  isCommentsOpen?: boolean;
}
// find the parent of a component
// this is a recursive function that will return the parent of the component
// root is the root of the component tree
// node is the component to find the parent of
const findParent = (root: Component, node: Component): Component | null => {
  for (const child of root.children) {
    if (child.children.some((c) => c.id === node.id)) return root;
    const found = findParent(child, node);
    if (found) return found;
  }
  return null;
};

const ZoomableCanvas = ({ isCommentsOpen }: ZoomableCanvasProps) => {
  const dispatch = useDispatch();
  const component = useSelector((state: RootState) => state.builder.component);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [commentBox, setCommentBox] = useState<
    { id: string; x: number; y: number } | null
  >(null);
  const [comments, setComments] = useState<
    Array<
      {
        id: string;
        x: number;
        y: number;
        userInitials: string;
        content?: string;
      }
    >
  >([]);

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

  const getAbsolutePosition = (child: Component): { x: number; y: number } => {
    let x = parseInt(child.styles?.left?.replace("px", "") || "0", 10);
    let y = parseInt(child.styles?.top?.replace("px", "") || "0", 10);

    // Get parent's ID from the component tree
    let parent = findParent(component, child);
    while (parent) {
      x += parseInt(parent.styles?.left?.replace("px", "") || "0", 10);
      y += parseInt(parent.styles?.top?.replace("px", "") || "0", 10);

      parent = findParent(component, parent);
    }

    return { x, y };
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

      // Get absolute position of target component
      const targetAbsPos = getAbsolutePosition(targetComponent);

      // Calculate position relative to target component using absolute positions
      const relativeX = x - targetAbsPos.x;
      const relativeY = y - targetAbsPos.y;

      if (monitor.getItemType() === "component") {
        dispatch(addElement({
          parentId: targetComponent.id,
          type: item.type,
          position: { x: relativeX, y: relativeY },
        }));
      } else if (monitor.getItemType() === "placed-component" && item.id) {
        dispatch(moveElement({
          id: item.id,
          position: {
            x: { value: relativeX, unit: "px" },
            y: { value: relativeY, unit: "px" },
          },
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

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isCommentsOpen) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If there's an existing temporary comment, remove it first
    if (commentBox) {
      setComments((prev) =>
        prev.filter((comment) => comment.id !== commentBox.id)
      );
      setCommentBox(null);
      return;
    }

    const newCommentId = Date.now().toString();

    // Add temporary bubble immediately
    setComments((prev) => [...prev, {
      id: newCommentId,
      x,
      y,
      userInitials: "AS", // Get from user data
    }]);

    setCommentBox({ id: newCommentId, x, y });
  };

  const handleCommentSubmit = (content: string) => {
    if (!commentBox) return;

    // Update the existing comment with content
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentBox.id ? { ...comment, content } : comment
      )
    );

    setCommentBox(null);
  };

  const handleCommentCancel = () => {
    if (!commentBox) return;

    // Remove the temporary bubble
    setComments((prev) =>
      prev.filter((comment) => comment.id !== commentBox.id)
    );
    setCommentBox(null);
  };

  return (
    <div className="relative w-full h-full">
      {/* Canvas Content */}
      <div className={`zoomable-canvas w-full h-full bg-white overflow-auto`}>
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
            className={`w-full h-full bg-white rounded relative touch-none select-none
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

        {/* Comment Bubbles */}
        {isCommentsOpen &&
          comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              position={{ x: comment.x, y: comment.y }}
              userInitials={comment.userInitials}
            />
          ))}
      </div>

      {/* Overlay Layer - Captures clicks when comments mode is active */}
      {isCommentsOpen && (
        <div
          className="absolute inset-0 bg-transparent cursor-comment z-50"
          onClick={handleCanvasClick}
          aria-label="Comments Mode Active"
        />
      )}

      {/* Comment Box */}
      {isCommentsOpen && commentBox && (
        <CommentBox
          position={commentBox}
          onSubmit={handleCommentSubmit}
          onCancel={handleCommentCancel}
        />
      )}
    </div>
  );
};

export default ZoomableCanvas;
