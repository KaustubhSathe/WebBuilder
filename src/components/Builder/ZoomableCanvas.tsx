"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGesture } from "react-use-gesture";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Component, DraggableComponent } from "../../types/builder";
import {
  addElement,
  moveElement,
  setSelectedComponent,
} from "../../store/builderSlice";
import { RootState } from "../../store/store";
import BuilderComponent from "./BuilderComponent";
import CommentBubble from "../Comments/CommentBubble";
import CommentBox from "../Comments/CommentBox";
import { addComment, removeComment } from "@/store/commentsSlice";
import { supabase } from "@/lib/supabase";
import { setUser } from "@/store/userSlice";
import { getInitials } from "@/utils/utils";
import { CommentData } from "@/services/commentService";
import { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const component = useSelector((state: RootState) => state.builder.component);
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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
