"use client";

import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { DraggableComponent } from "../../types/builder";

interface ComponentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ELEMENTS: DraggableComponent[] = [
  // Structure Elements
  { type: "section", label: "Section", icon: "⬛" },
  { type: "div", label: "Container", icon: "▢" },
  // Basic Elements
  { type: "div", label: "Div Block", icon: "⬜" },
  { type: "list", label: "List", icon: "📋" },
  { type: "list-item", label: "List Item", icon: "•" },
  { type: "button", label: "Button", icon: "☐" },
  // Typography Elements
  { type: "h1", label: "Heading", icon: "H" },
  { type: "p", label: "Paragraph", icon: "¶" },
  { type: "a", label: "Text Link", icon: "🔗" },
  { type: "text", label: "Text Block", icon: "T" },
  { type: "blockquote", label: "Block Quote", icon: "❝" },
  { type: "rich-text", label: "Rich Text", icon: "📝" },
  // Media Elements
  { type: "image", label: "Image", icon: "🖼️" },
  { type: "video", label: "Video", icon: "🎥" },
  { type: "youtube", label: "YouTube", icon: "▶️" },
  // Form Elements
  { type: "form", label: "Form Block", icon: "📝" },
  { type: "label", label: "Label", icon: "🏷️" },
  { type: "input", label: "Input", icon: "⌨️" },
  { type: "textarea", label: "Text Area", icon: "📄" },
  { type: "file", label: "File Upload", icon: "📎" },
  { type: "checkbox", label: "Checkbox", icon: "☑️" },
  { type: "radio", label: "Radio Button", icon: "⚪" },
  { type: "select", label: "Select", icon: "▼" },
  { type: "form-button", label: "Form Button", icon: "📤" },
];

const DraggableItem: React.FC<{
  element: DraggableComponent;
  onDragEnd: () => void;
}> = ({ element, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag<
    DraggableComponent,
    void,
    { isDragging: boolean }
  >(() => ({
    type: "component",
    item: () => {
      return element;
    },
    end: () => {
      onDragEnd();
    },
    previewOptions: {
      captureDraggingState: true,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      // @ts-expect-error: drag is not typed
      ref={drag}
      className="draggable-item w-full text-left px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] rounded text-sm"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <span className="inline-block w-6 text-center mr-2">{element.icon}</span>
      {element.label}
    </div>
  );
};

interface CategoryProps {
  title: string;
  elements: DraggableComponent[];
  onDragEnd: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Category: React.FC<CategoryProps> = ({
  title,
  elements,
  onDragEnd,
  isCollapsed,
  onToggle,
}) => {
  return (
    <div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-full flex items-center justify-between text-gray-400 hover:text-gray-200 group mb-2"
      >
        <span className="text-xs uppercase">{title}</span>
        <span
          className={`material-icons text-[18px] transition-transform ${
            isCollapsed ? "" : "rotate-90"
          }`}
        >
          chevron_right
        </span>
      </button>
      <div
        className={`space-y-1 overflow-hidden transition-all ${
          isCollapsed ? "h-0" : "h-auto"
        }`}
      >
        {elements.map((element) => (
          <DraggableItem
            key={element.type}
            element={element}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

const ElementsDrawer: React.FC<ComponentsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({
    Structure: true,
    Typography: true,
    Basic: true,
    Media: true,
    Form: true,
  });

  useEffect(() => {
    if (isOpen) {
      setCollapsedCategories({
        Structure: true,
        Typography: true,
        Basic: true,
        Media: true,
        Form: true,
      });
    }
  }, [isOpen]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <>
      {isOpen && (
        <div
          className={`absolute top-0 left-10 h-full bg-[#2c2c2c] transition-all duration-300 z-10 overflow-hidden ${
            isOpen ? "w-[240px] border-r border-[#3c3c3c]" : "w-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-200 text-sm font-medium">
                Elements
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <span className="material-icons text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-4 p-4 overflow-y-auto hide-scrollbar flex-1">
              <Category
                title="Structure"
                elements={ELEMENTS.slice(0, 2)}
                onDragEnd={onClose}
                isCollapsed={collapsedCategories.Structure}
                onToggle={() => toggleCategory("Structure")}
              />

              <Category
                title="Basic"
                elements={ELEMENTS.slice(2, 6)}
                onDragEnd={onClose}
                isCollapsed={collapsedCategories.Basic}
                onToggle={() => toggleCategory("Basic")}
              />

              <Category
                title="Typography"
                elements={ELEMENTS.slice(6, 12)}
                onDragEnd={onClose}
                isCollapsed={collapsedCategories.Typography}
                onToggle={() => toggleCategory("Typography")}
              />

              <Category
                title="Media"
                elements={ELEMENTS.slice(12, 15)}
                onDragEnd={onClose}
                isCollapsed={collapsedCategories.Media}
                onToggle={() => toggleCategory("Media")}
              />

              <Category
                title="Form"
                elements={ELEMENTS.slice(15)}
                onDragEnd={onClose}
                isCollapsed={collapsedCategories.Form}
                onToggle={() => toggleCategory("Form")}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ElementsDrawer;
