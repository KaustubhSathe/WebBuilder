"use client";

import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Component } from "@/types/builder";
import {
  moveComponent,
  setSelectedComponent,
  updateComponentSize,
} from "@/store/builderSlice";
import { RootState } from "@/store/store";
import ComponentToolbar from "./ComponentToolbar";
import ResizeHandle from "./ResizeHandle";
import Image from "next/image";

/**
 * Props interface for the BuilderComponent
 * 
 * @property {Component} component - The component data to render, including its type, styles, content, and children
 */
interface BuilderComponentProps {
  component: Component;
}

/**
 * BuilderComponent
 * 
 * A versatile component that renders different HTML elements based on the component type.
 * It handles:
 * - Rendering various component types (div, section, headings, form elements, media, etc.)
 * - Drag and drop functionality for component positioning
 * - Resize functionality with handles
 * - Selection and highlighting of components
 * - Rendering child components recursively
 * 
 * This is a core component of the builder interface that visualizes the component tree
 * and allows users to interact with it.
 */
const BuilderComponent: React.FC<BuilderComponentProps> = ({
  component,
}: BuilderComponentProps) => {
  const dispatch = useDispatch();
  
  /**
   * Get the currently selected component from Redux store
   * Used to highlight the selected component and show its toolbar/resize handles
   */
  const selectedComponent = useSelector(
    (state: RootState) => state.builder.selectedComponent
  );
  
  /**
   * State to track if the component is currently being resized
   * Used to disable dragging during resize operations
   */
  const [isResizing, setIsResizing] = useState(false);

  /**
   * Set up drag functionality using react-dnd
   * 
   * - type: Identifies this as a placed component for the drag and drop system
   * - item: The data that will be available to the drop target
   * - collect: Extracts the isDragging state from the monitor
   * - canDrag: Prevents dragging while resizing is in progress
   */
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "placed-component",
      item: { id: component.id, type: component.type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => !isResizing,
    }),
    [component.id, component.type, isResizing]
  );

  /**
   * Handle click on the component
   * 
   * Sets this component as the selected component in the Redux store
   * Stops propagation to prevent parent components from also being selected
   * 
   * @param {React.MouseEvent} e - The click event
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedComponent(component));
  };

  /**
   * Handle resize operations for the component
   * 
   * This function:
   * 1. Parses the current style values and their units
   * 2. Calculates new dimensions and positions based on the resize direction and delta
   * 3. Dispatches actions to update the component size and position in the Redux store
   * 
   * @param {string} direction - The resize direction ('top', 'right', 'bottom', or 'left')
   * @param {number} deltaX - The horizontal change in pixels
   * @param {number} deltaY - The vertical change in pixels
   */
  const handleResize = (direction: string, deltaX: number, deltaY: number) => {
    const currentStyles = component.styles;

    /**
     * Parse a CSS value string into its numeric value and unit
     * 
     * @param {string} value - The CSS value string (e.g., "100px", "50%")
     * @returns {Object} An object containing the numeric value and unit
     */
    const parseStyleValue = (value: string) => {
      const match = value.match(/^(-?\d+\.?\d*)(.*)$/);
      return match
        ? { value: parseFloat(match[1]), unit: match[2] || "px" }
        : { value: 0, unit: "px" };
    };

    const width = parseStyleValue(currentStyles.width);
    const height = parseStyleValue(currentStyles.height);
    const left = parseStyleValue(currentStyles.left || "0px");
    const top = parseStyleValue(currentStyles.top || "0px");

    let newWidth = width;
    let newHeight = height;
    let newX = left;
    let newY = top;

    // Calculate new dimensions and position based on resize direction
    switch (direction) {
      case "right":
        newWidth = { value: width.value + deltaX, unit: width.unit };
        break;
      case "left":
        const widthChange = deltaX;
        newWidth = { value: width.value - widthChange, unit: width.unit };
        newX = { value: left.value + widthChange, unit: left.unit };
        break;
      case "bottom":
        newHeight = { value: height.value + deltaY, unit: height.unit };
        break;
      case "top":
        const heightChange = deltaY;
        newHeight = { value: height.value - heightChange, unit: height.unit };
        newY = { value: top.value + heightChange, unit: top.unit };
        break;
    }

    // Update component size in Redux store
    dispatch(
      updateComponentSize({
        id: component.id,
        size: {
          width: newWidth,
          height: newHeight,
        },
      })
    );

    /**
     * Compare two position values to check if they're different
     * 
     * @param {Object} pos1 - First position with value and unit
     * @param {Object} pos2 - Second position with value and unit
     * @returns {boolean} True if positions are different
     */
    const hasPositionChanged = (
      pos1: { value: number; unit: string },
      pos2: { value: number; unit: string }
    ) => {
      return pos1.value !== pos2.value || pos1.unit !== pos2.unit;
    };

    // Only dispatch move action if position actually changed
    if (hasPositionChanged(newX, left) || hasPositionChanged(newY, top)) {
      dispatch(
        moveComponent({
          id: component.id,
          position: {
            x: newX,
            y: newY,
          },
        })
      );
    }
  };

  /**
   * Handle mouse over event for hover highlighting
   * 
   * This function:
   * 1. Stops event propagation to prevent parent components from also being highlighted
   * 2. Skips if this is already the selected component
   * 3. Removes hover highlighting from all parent builder components
   * 4. Adds hover highlighting to the current component
   * 
   * @param {React.MouseEvent} e - The mouse over event
   */
  const handleMouseOver = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If this is the selected component, return early
    if (selectedComponent?.id === component.id) return;

    // Remove hover from all parent builder components
    const currentTarget = e.currentTarget as HTMLElement;
    let parent = currentTarget.parentElement;

    while (parent) {
      const parentBuilderComponent = parent.querySelector(
        '[data-is-builder-component="true"]'
      );
      if (parentBuilderComponent) {
        parentBuilderComponent.classList.remove("builder-component-hover");
      }
      parent = parent.parentElement;
    }

    // Add hover to current component
    currentTarget.classList.add("builder-component-hover");
  };

  /**
   * Handle mouse leave event to remove hover highlighting
   * 
   * @param {React.MouseEvent} e - The mouse leave event
   */
  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove(
      "builder-component-hover"
    );
  };

  /**
   * Render the appropriate HTML element based on component type
   * 
   * This function:
   * 1. Extracts positioning styles to apply them separately to the wrapper
   * 2. Renders different HTML elements based on the component.type
   * 3. Recursively renders child components
   * 4. Applies appropriate styles and content to each element type
   * 
   * @returns {JSX.Element} The rendered component
   */
  const renderComponent = () => {
    // Create a copy of styles without position properties
    // These will be applied to the wrapper div instead
    const {
      position: _position,
      left: _left,
      top: _top,
      width: _width,
      minWidth: _minWidth,
      maxWidth: _maxWidth,
      height: _height,
      minHeight: _minHeight,
      maxHeight: _maxHeight,
      float: _float,
      margin: _margin,
      marginTop: _marginTop,
      marginRight: _marginRight,
      marginBottom: _marginBottom,
      marginLeft: _marginLeft,
      ...otherStyles
    } = component.styles || {};

    // Render different elements based on component type
    switch (component.type) {
      // Layout components
      case "main":
        return (
          <div
            onClick={handleClick}
            className={`w-full h-full relative ${
              selectedComponent?.id === component.id
                ? "border-2 border-blue-500"
                : "hover:border-2 hover:border-blue-200"
            }`}
          >
            {/* Component Type Tooltip */}
            {selectedComponent?.id === component.id && (
              <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-br z-50 whitespace-nowrap">
                Main Container
              </div>
            )}

            <main
              id={component.id}
              className="w-full h-full"
              style={otherStyles}
            >
              {component.children?.map((child) => (
                <BuilderComponent key={child.id} component={child} />
              ))}
            </main>
          </div>
        );

      case "section":
        return (
          <section
            id={component.id}
            style={otherStyles}
            className="h-full w-full border border-slate-200"
            {...component.customAttributes}
          >
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </section>
        );
      
      case 'container':
        return (
          <div
          id={component.id}
          style={otherStyles}
          className="min-h-[100px] rounded-lg border border-slate-200"
        >
          {component.children?.map((child) => (
            <BuilderComponent key={child.id} component={child} />
          ))}
        </div>
        );

      case "div":
        return (
          <div
            id={component.id}
            style={otherStyles}
            className="h-full w-full border border-slate-200 text-clip"
            {...component.customAttributes}
          >
            {component.content}
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </div>
        );

      case "footer":
        return (
          <footer
            id={component.id}
            style={otherStyles}
            className="h-full w-full border border-slate-200"
            {...component.customAttributes}
          >
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </footer>
        );
      
      case "nav":
        return (
          <nav
            id={component.id}
            style={otherStyles}
            className="h-full w-full border border-slate-200"
            {...component.customAttributes}
          >
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </nav>
        );
      
      case "article":
        return (
          <article
            id={component.id}
            style={otherStyles}
            className="h-full w-full border border-slate-200"
            {...component.customAttributes}
          >
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </article>
        );


      // Typography components
      case "h1":
        return (
          <h1 id={component.id} style={otherStyles}>
            {component.content}
          </h1>
        );
      case "h2":
        return (
          <h2 id={component.id} style={otherStyles}>
            {component.content}
          </h2>
        );
      case "h3":
        return (
          <h3 id={component.id} style={otherStyles}>
            {component.content}
          </h3>
        );
      case "h4":
        return (
          <h4 id={component.id} style={otherStyles}>
            {component.content}
          </h4>
        );
      case "h5":
        return (
          <h5 id={component.id} style={otherStyles}>
            {component.content}
          </h5>
        );
      case "h6":
        return (
          <h6 id={component.id} style={otherStyles}>
            {component.content}
          </h6>
        );
      case "p":
        return (
          <p id={component.id} style={otherStyles}>
            {component.content}
          </p>
        );
      case "a":
        return (
          <a href={component.content} id={component.id} style={otherStyles}>
            {component.content}
          </a>
        );
      case "text":
        return (
          <span id={component.id} style={otherStyles}>
            {component.content}
          </span>
        );
      case "blockquote":
        return (
          <blockquote id={component.id} style={otherStyles}>
            {component.content}
          </blockquote>
        );
      case "rich-text":
        return (
          <div
            id={component.id}
            style={otherStyles}
            dangerouslySetInnerHTML={{ __html: component.content || "" }}
          />
        );

      // List components
      case "list":
        return (
          <ul
            id={component.id}
            style={otherStyles}
            className="list-disc list-inside"
          >
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </ul>
        );
      case "list-item":
        return (
          <li id={component.id} style={otherStyles}>
            {component.content}
          </li>
        );

      // Form components
      case "form":
        return (
          <form id={component.id} style={otherStyles} className="space-y-4">
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </form>
        );
      case "input":
        return (
          <input
            id={component.id}
            type="text"
            style={otherStyles}
            placeholder={component.content}
            className="border rounded px-3 py-2"
          />
        );
      case "textarea":
        return (
          <textarea
            id={component.id}
            style={otherStyles}
            placeholder={component.content}
            className="border rounded px-3 py-2"
          />
        );
      case "label":
        return (
          <label id={component.id} style={otherStyles}>
            {component.content}
          </label>
        );
      case "button":
        return (
          <button
            id={component.id}
            style={otherStyles}
            className="px-4 py-2 rounded text-white"
          >
            {component.content}
          </button>
        );
      case "checkbox":
        return <input id={component.id} type="checkbox" style={otherStyles} />;
      case "radio":
        return <input id={component.id} type="radio" style={otherStyles} />;
      case "select":
        return (
          <select
            id={component.id}
            style={otherStyles}
            className="border rounded px-3 py-2"
          />
        );
      case "file":
        return <input id={component.id} type="file" style={otherStyles} />;
      case "form-button":
        return (
          <button
            type="submit"
            id={component.id}
            style={otherStyles}
            className="px-4 py-2 rounded bg-blue-500 text-white"
          >
            {component.content}
          </button>
        );

      // Media components
      case "image":
        return (
          <Image
            id={component.id}
            src={component.src || ""}
            alt={component.content || ""}
            style={otherStyles}
            className="rounded-lg"
          />
        );
      case "video":
        return (
          <video
            id={component.id}
            src={component.src}
            controls
            style={otherStyles}
            className="rounded-lg"
          />
        );
      case "youtube":
        return (
          <iframe
            id={component.id}
            src={component.src}
            style={otherStyles}
            className="rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );

      // Fallback for unknown component types
      default:
        return (
          <div id={component.id} style={otherStyles}>
            {component.content || `Unknown component type: ${component.type}`}
          </div>
        );
    }
  };

  // Special case for the main container component
  if (component.type === "main") {
    return renderComponent();
  }

  /**
   * Main component render
   * 
   * For all components except "main", we wrap the rendered component in a div that:
   * 1. Handles drag and drop functionality
   * 2. Applies positioning and dimension styles
   * 3. Handles selection and hover states
   * 4. Renders resize handles and toolbar when selected
   */
  return (
    <div
      // @ts-expect-error: dragRef is not typed
      ref={dragRef}
      data-is-builder-component="true"
      data-component-id={component.id}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      style={{
        position: component.styles?.position as React.CSSProperties["position"],
        left: component.styles?.left || 0,
        top: component.styles?.top || 0,
        float:
          (component.styles?.float as React.CSSProperties["float"]) || "none",
        width: component.styles?.width || "100px",
        minWidth: component.styles?.minWidth,
        maxWidth: component.styles?.maxWidth,
        height: component.styles?.height || "40px",
        minHeight: component.styles?.minHeight,
        maxHeight: component.styles?.maxHeight,
        opacity: isDragging ? 0.5 : 1,
        cursor: isResizing ? "auto" : "pointer",
        transition: isResizing ? "none" : "all 0.1s ease-out",
        touchAction: "none",
        marginTop: component.styles?.marginTop,
        marginRight: component.styles?.marginRight,
        marginBottom: component.styles?.marginBottom,
        marginLeft: component.styles?.marginLeft,
      }}
      className={`
        ${selectedComponent?.id === component.id ? "border-2 border-blue-500" : ""}
        transition-all duration-200
      `}
    >
      {/* Render the actual component based on its type */}
      {renderComponent()}
      
      {/* Render toolbar and resize handles when component is selected */}
      {selectedComponent?.id === component.id && !isDragging && (
        <>
          <ComponentToolbar component={component} />
          <ResizeHandle
            position="top"
            onResize={(_, dy) => handleResize("top", 0, dy)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            position="right"
            onResize={(dx) => handleResize("right", dx, 0)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            position="bottom"
            onResize={(_, dy) => handleResize("bottom", 0, dy)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            position="left"
            onResize={(dx) => handleResize("left", dx, 0)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
        </>
      )}
    </div>
  );
};

export default BuilderComponent;
