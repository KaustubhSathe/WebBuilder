"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGesture } from "react-use-gesture";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Component, DraggableComponent } from "../../types/builder";
import {
  addElement,
  deleteComponent,
  moveElement,
  setSelectedComponent,
} from "../../store/builderSlice";
import { RootState } from "../../store/store";
import BuilderComponent from "./BuilderComponent";
import CommentBubble from "../Comments/CommentBubble";
import CommentBox from "../Comments/CommentBox";
import { addComment, removeComment } from "@/store/commentsSlice";
import { supabase } from "@/lib/supabase";
import { getInitials } from "@/utils/utils";
import { CommentData } from "@/services/commentService";
import { User } from "@supabase/supabase-js";

interface ZoomableCanvasProps {
  children?: React.ReactNode;
  isCommentsOpen?: boolean;
  responsiveMode: "desktop" | "tablet" | "mobile" | "none"; // Current device viewport mode
}

// Predefined canvas dimensions for different device viewports (in pixels)
const CANVAS_SIZES = {
  desktop: { width: "1920", height: "1080" }, // Standard desktop layout
  tablet: { width: "768", height: "1024" }, // Vertical tablet layout
  mobile: { width: "375", height: "667" }, // Mobile phone layout
  none: { width: "", height: "" }, // No canvas
};

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

const ZoomableCanvas = (
  { isCommentsOpen, responsiveMode }: ZoomableCanvasProps,
) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const component = useSelector((state: RootState) => state.builder.component);
  const selectedComponent = useSelector((state: RootState) =>
    state.builder.selectedComponent
  );
  const project = useSelector((state: RootState) =>
    state.project.currentProject
  );
  const selectedPage = useSelector((state: RootState) =>
    state.pages.pages.find((p) => p.id === state.pages.selectedPageId)
  );
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [commentBox, setCommentBox] = useState<
    { id: string; x: number; y: number } | null
  >(null);
  const comments = useSelector((state: RootState) => state.comments.comments);
  const [selectedComment, setSelectedComment] = useState<CommentData | null>(
    null,
  );

  // Current canvas dimensions based on the selected responsive mode
  const canvasSize = CANVAS_SIZES[responsiveMode];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Add keyboard event handler for delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Delete key is pressed and there's a selected component
      if (e.key === "Delete" && selectedComponent) {
        // Prevent default browser behavior
        e.preventDefault();

        // Delete the selected component
        dispatch(deleteComponent(selectedComponent));

        // Clear the selection
        dispatch(setSelectedComponent(null));
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, selectedComponent]);

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

  const handleDrop = (
    item: DraggableComponent & { id?: string },
    monitor: DropTargetMonitor,
  ) => {
    if (!monitor.isOver({ shallow: true })) return;

    const offset = monitor.getClientOffset();
    const sourceOffset = monitor.getSourceClientOffset();
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

    // Calculate final position, accounting for canvas position, zoom, and pan
    let x = (offset.x - canvasRect.left - position.x * zoom - grabOffset.x) /
      zoom;
    let y = (offset.y - canvasRect.top - position.y * zoom - grabOffset.y) /
      zoom;

    // Apply boundary constraints if using responsive mode
    if (responsiveMode !== "none" && canvasSize.width && canvasSize.height) {
      const width = parseInt(canvasSize.width);
      const height = parseInt(canvasSize.height);
      x = Math.max(0, Math.min(x, width - 100)); // 100 is minimum component width
      y = Math.max(0, Math.min(y, height - 40)); // 40 is minimum component height
    }

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
  };

  const [{ isOver }, drop] = useDrop({
    accept: ["component", "placed-component"],
    drop: handleDrop,
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
    setPosition({ x: 110, y: 110 });
  };

  const handleCommentBubbleClick = (
    e: React.MouseEvent,
    comment: CommentData,
  ) => {
    e.stopPropagation(); // Prevent canvas click
    setSelectedComment(comment);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isCommentsOpen) return;

    // If clicking outside bubbles/boxes, clear selection
    const target = e.target as HTMLElement;
    if (!target.closest(".comment-bubble") && !target.closest(".comment-box")) {
      setSelectedComment(null);
    }

    // Only create new comment if not clicking on existing elements
    if (target.classList.contains("cursor-comment")) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // If there's an existing temporary comment, remove it first
      if (commentBox) {
        dispatch(removeComment(commentBox.id));
        setCommentBox(null);
        return;
      }

      const newCommentId = Date.now().toString();

      // Add temporary bubble immediately
      dispatch(addComment({
        id: newCommentId,
        content: "",
        position_x: x,
        position_y: y,
        project_id: project?.id,
        page_id: selectedPage?.id,
        user: user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_resolved: false,
        parent_id: null,
        replies: [],
      }));

      setCommentBox({ id: newCommentId, x, y });
    }
  };

  const handleCommentSubmit = () => {
    if (!commentBox || !project?.id || !selectedPage?.id) return;
    // If there's an existing temporary comment, remove it first
    dispatch(removeComment(commentBox.id));
    setCommentBox(null);
  };

  const handleCommentCancel = () => {
    if (!commentBox) return;

    // Remove the temporary bubble
    dispatch(removeComment(commentBox.id));
    setCommentBox(null);
  };

  return (
    <div className="relative w-full h-full">
      {/* Canvas Content */}
      <div className={`w-full h-full`}>
        <div className="w-full h-full bg-[#1a1a1a] overflow-hidden relative">
          {/* Zoom Controls */}
          <div className="absolute top-4 left-[calc((100vw-300px)/2)]
           -translate-x-1/2 flex items-center gap-2 bg-[#2c2c2c] rounded px-2 py-1 z-[5]">
            <button
              onClick={handleZoomOut}
              className="text-gray-400 hover:text-gray-200 transition-colors flex items-center justify-center"
            >
              <span className="material-icons text-[18px] mb-auto mt-auto">
                remove
              </span>
            </button>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-gray-200 transition-colors px-2 text-sm flex items-center justify-center"
            >
              <span className="mb-auto mt-auto text-center items-center justify-center">
                {Math.round(zoom * 100)}%
              </span>
            </button>
            <button
              onClick={handleZoomIn}
              className="text-gray-400 hover:text-gray-200 transition-colors flex items-center justify-center"
            >
              <span className="material-icons text-[18px] mb-auto mt-auto">
                add
              </span>
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
              width: responsiveMode === "none" ? "" : `${canvasSize.width}px`,
              height: responsiveMode === "none" ? "" : `${canvasSize.height}px`,
            }}
            onClick={() => dispatch(setSelectedComponent(null))}
          >
            <div className="absolute inset-0 border-2 border-gray-300">
              <BuilderComponent component={component} />
            </div>
          </div>
        </div>
      </div>

      {/* Comment Bubbles */}
      {isCommentsOpen &&
        comments.map((comment: CommentData) => {
          return (
            <CommentBubble
              key={comment.id}
              position={{ x: comment.position_x, y: comment.position_y }}
              userInitials={getInitials(
                comment.user?.user_metadata?.name || "Unknown",
              )}
              onClick={(e) => handleCommentBubbleClick(e, comment)}
            />
          );
        })}

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
          onClose={() => setCommentBox(null)}
        />
      )}

      {selectedComment && isCommentsOpen && (
        <CommentBox
          position={{
            x: selectedComment.position_x,
            y: selectedComment.position_y,
          }}
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
        />
      )}
    </div>
  );
};

export default ZoomableCanvas;
