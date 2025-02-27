"use client";

import React, { useState } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
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

interface BuilderComponentProps {
  component: Component;
}

const BuilderComponent: React.FC<BuilderComponentProps> = (
  { component }: BuilderComponentProps,
) => {
  const dispatch = useDispatch();
  const selectedComponent = useSelector((state: RootState) =>
    state.builder.selectedComponent
  );
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "placed-component",
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !isResizing,
  }), [component.id, component.type, isResizing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedComponent(component.id));
  };

  const handleResize = (direction: string, deltaX: number, deltaY: number) => {
    const currentStyles = component.styles;

    // Parse current values and units
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

    dispatch(updateComponentSize({
      id: component.id,
      size: {
        width: newWidth,
        height: newHeight,
      },
    }));

    // Helper function to compare position values
    const hasPositionChanged = (
      pos1: { value: number; unit: string },
      pos2: { value: number; unit: string },
    ) => {
      return pos1.value !== pos2.value || pos1.unit !== pos2.unit;
    };

    // Compare both x and y positions properly
    if (hasPositionChanged(newX, left) || hasPositionChanged(newY, top)) {
      dispatch(moveComponent({
        id: component.id,
        position: {
          x: newX,
          y: newY,
        },
      }));
    }
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If this is the selected component, return early
    if (selectedComponent === component.id) return;

    // Remove hover from all parent builder components
    const currentTarget = e.currentTarget as HTMLElement;
    let parent = currentTarget.parentElement;

    while (parent) {
      const parentBuilderComponent = parent.querySelector(
        '[data-is-builder-component="true"]',
      );
      if (parentBuilderComponent) {
        parentBuilderComponent.classList.remove("builder-component-hover");
      }
      parent = parent.parentElement;
    }

    // Add hover to current component
    currentTarget.classList.add("builder-component-hover");
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove(
      "builder-component-hover",
    );
  };

  const renderComponent = () => {
    // Create a copy of styles without position properties
    let {
      position,
      left,
      top,
      width,
      minWidth,
      maxWidth,
      height,
      minHeight,
      maxHeight,
      float,
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      ...otherStyles
    } = component.styles || {};

    switch (component.type) {
      case "main":
        return (
          <div
            onClick={handleClick}
            className={`w-full h-full relative ${
              selectedComponent === component.id
                ? "border-2 border-blue-500"
                : "hover:border-2 hover:border-blue-200"
            }`}
          >
            {/* Component Type Tooltip */}
            {selectedComponent === component.id && (
              <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-br z-50 whitespace-nowrap">
                Main Container
              </div>
            )}

            <main id={component.id} className="w-full h-full" style={otherStyles}>
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
            className="min-h-[100px] rounded-lg border border-slate-200"
          >
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </section>
        );

      case "div":
        return (
          <div
            id={component.id}
            style={otherStyles}
            className="h-full w-full border border-slate-200"
          >
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </div>
        );

      // Typography components
      case "h1":
        return <h1 id={component.id} style={otherStyles}>{component.content}</h1>;
      case "h2":
        return <h2 id={component.id} style={otherStyles}>{component.content}</h2>;
      case "h3":
        return <h3 id={component.id} style={otherStyles}>{component.content}</h3>;
      case "h4":
        return <h4 id={component.id} style={otherStyles}>{component.content}</h4>;
      case "h5":
        return <h5 id={component.id} style={otherStyles}>{component.content}</h5>;
      case "h6":
        return <h6 id={component.id} style={otherStyles}>{component.content}</h6>;
      case "p":
        return <p id={component.id} style={otherStyles}>{component.content}</p>;
      case "a":
        return (
          <a href={component.content} id={component.id} style={otherStyles}>
            {component.content}
          </a>
        );
      case "text":
        return <span id={component.id} style={otherStyles}>{component.content}</span>;
      case "blockquote":
        return <blockquote id={component.id} style={otherStyles}>{component.content}</blockquote>;
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
          <ul id={component.id} style={otherStyles} className="list-disc list-inside">
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </ul>
        );
      case "list-item":
        return <li id={component.id} style={otherStyles}>{component.content}</li>;

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
        return <label id={component.id} style={otherStyles}>{component.content}</label>;
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
          <img
            id={component.id}
            src={component.src}
            alt={component.content}
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

      default:
        return (
          <div id={component.id} style={otherStyles}>
            {component.content || `Unknown component type: ${component.type}`}
          </div>
        );
    }
  };

  if (component.type === "main") {
    return renderComponent();
  }

  return (
    <div
      //@ts-ignore
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
        float: component.styles?.float as React.CSSProperties["float"] ||
          "none",
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
        ${selectedComponent === component.id ? "border-2 border-blue-500" : ""}
        transition-all duration-200
      `}
    >
      {renderComponent()}
      {selectedComponent === component.id && !isDragging && (
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
