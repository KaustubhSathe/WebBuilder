"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { v4 as uuidv4 } from 'uuid';
import { 
  setSelectedComponent, 
  setClipboardComponent,
  deleteComponent, 
  addChildComponent,
  addClassToComponent,
  removeClassFromComponent,
  renameClassInComponent,
  duplicateClassInComponent,
  createComponentFromElement
} from "@/store/builderSlice";
import { Component } from "@/types/builder";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
}) => {
  const dispatch = useDispatch();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const selectedComponent = useSelector(
    (state: RootState) => state.builder.selectedComponent
  );
  const component = useSelector((state: RootState) => state.builder.component);
  const clipboardComponent = useSelector(
    (state: RootState) => state.builder.clipboardComponent
  );

  // Adjust position after the menu is rendered and we know its dimensions
  useEffect(() => {
    if (menuRef.current) {
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;
      
      // Ensure menu doesn't go off the right edge
      if (x + menuWidth > windowWidth) {
        adjustedX = windowWidth - menuWidth - 10;
      }
      
      // Ensure menu doesn't go off the left edge
      if (adjustedX < 10) {
        adjustedX = 10;
      }
      
      // Ensure menu doesn't go off the bottom edge
      if (y + menuHeight > windowHeight) {
        adjustedY = windowHeight - menuHeight - 10;
      }
      
      // Ensure menu doesn't go off the top edge
      if (adjustedY < 10) {
        adjustedY = 10;
      }
      
      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  
  // Close menu when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Context menu actions
  const handleSelectParent = () => {
    if (!selectedComponent) return;
    
    // Find parent of selected component
    const findParent = (comp: Component, targetId: string, parent: Component | null = null): Component | null => {
      if (comp.id === targetId) return parent;
      if (comp.children) {
        for (const child of comp.children) {
          const found = findParent(child, targetId, comp);
          if (found) return found;
        }
      }
      return null;
    };
    
    const parent = findParent(component, selectedComponent.id);
    if (parent) {
      dispatch(setSelectedComponent(parent));
    }
    onClose();
  };
  
  const handleCut = () => {
    if (!selectedComponent) return;
    
    // Find the component to cut
    const findComponent = (comp: Component, id: string): Component | null => {
      if (comp.id === id) return { ...comp };
      if (comp.children) {
        for (const child of comp.children) {
          const found = findComponent(child, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const componentToCut = findComponent(component, selectedComponent.id);
    if (componentToCut) {
      // Add to clipboard
      dispatch(setClipboardComponent(componentToCut));
      
      // Remove from tree
      dispatch(deleteComponent(selectedComponent.id));
    }
    onClose();
  };
  
  const handleCopy = () => {
    if (!selectedComponent) return;
    
    // Find the component to copy
    const findComponent = (comp: Component, id: string): Component | null => {
      if (comp.id === id) return { ...comp };
      if (comp.children) {
        for (const child of comp.children) {
          const found = findComponent(child, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const componentToCopy = findComponent(component, selectedComponent.id);
    if (componentToCopy) {
      // Add to clipboard
      dispatch(setClipboardComponent(componentToCopy));
    }
    onClose();
  };
  
  const handlePaste = () => {
    if (!clipboardComponent || !selectedComponent) return;
    
    // Generate new IDs for the component and its children
    const generateNewIds = (comp: Component): Component => {
      const newComp = { ...comp, id: uuidv4() };
      if (newComp.children) {
        newComp.children = newComp.children.map(generateNewIds);
      }
      return newComp;
    };
    
    const componentToInsert = generateNewIds(clipboardComponent);
    
    // Add to the selected component's children
    dispatch(addChildComponent({ 
      parentId: selectedComponent.id, 
      component: componentToInsert 
    }));
    
    onClose();
  };
  
  const handleDuplicate = () => {
    if (!selectedComponent) return;
    
    // Find the component to duplicate
    const findComponent = (comp: Component, id: string): Component | null => {
      if (comp.id === id) return { ...comp };
      if (comp.children) {
        for (const child of comp.children) {
          const found = findComponent(child, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    // Find the parent of the selected component
    const findParent = (comp: Component, targetId: string, parent: string | null = null): string | null => {
      if (comp.id === targetId) return parent;
      if (comp.children) {
        for (const child of comp.children) {
          const found = findParent(child, targetId, comp.id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const componentToDuplicate = findComponent(component, selectedComponent.id);
    const parentId = findParent(component, selectedComponent.id);
    
    if (componentToDuplicate && parentId) {
      // Generate new IDs for the component and its children
      const generateNewIds = (comp: Component): Component => {
        const newComp = { ...comp, id: uuidv4() };
        if (newComp.children) {
          newComp.children = newComp.children.map(generateNewIds);
        }
        return newComp;
      };
      
      const duplicatedComponent = generateNewIds(componentToDuplicate);
      
      // Add to the parent component's children
      dispatch(addChildComponent({ 
        parentId, 
        component: duplicatedComponent 
      }));
    }
    onClose();
  };
  
  const handleDelete = () => {
    if (!selectedComponent) return;
    dispatch(deleteComponent(selectedComponent.id));
    onClose();
  };
  
  const handleAddClass = () => {
    if (!selectedComponent) return;
    
    // Open a dialog to add a class
    const className = prompt("Enter class name:");
    if (className) {
      dispatch(addClassToComponent({ 
        componentId: selectedComponent.id, 
        className 
      }));
    }
    onClose();
  };
  
  const handleDuplicateClass = () => {
    if (!selectedComponent) return;
    
    // Open a dialog to select a class to duplicate
    const className = prompt("Enter class to duplicate:");
    const newClassName = prompt("Enter new class name:");
    if (className && newClassName) {
      dispatch(duplicateClassInComponent({ 
        componentId: selectedComponent.id, 
        className,
        newClassName
      }));
    }
    onClose();
  };
  
  const handleRemoveClass = () => {
    if (!selectedComponent) return;
    
    // Open a dialog to select a class to remove
    const className = prompt("Enter class to remove:");
    if (className) {
      dispatch(removeClassFromComponent({ 
        componentId: selectedComponent.id, 
        className 
      }));
    }
    onClose();
  };
  
  const handleRenameClass = () => {
    if (!selectedComponent) return;
    
    // Open a dialog to select a class to rename
    const className = prompt("Enter class to rename:");
    const newClassName = prompt("Enter new class name:");
    if (className && newClassName) {
      dispatch(renameClassInComponent({ 
        componentId: selectedComponent.id, 
        className,
        newClassName
      }));
    }
    onClose();
  };
  
  const handleCreateComponent = () => {
    if (!selectedComponent) return;
    
    // Open a dialog to name the new component
    const componentName = prompt("Enter component name:");
    if (componentName) {
      // Extract the selected component as a reusable component
      dispatch(createComponentFromElement({ 
        componentId: selectedComponent.id, 
        name: componentName 
      }));
    }
    onClose();
  };

  const MenuItem = ({ 
    icon, 
    label, 
    onClick, 
    disabled = false,
    shortcut = null
  }: { 
    icon: string; 
    label: string; 
    onClick: () => void; 
    disabled?: boolean;
    shortcut?: string | null;
  }) => (
    <div 
      className={`flex items-center px-2 py-1 hover:bg-[#3c3c3c] ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <span className="material-icons text-gray-300 text-sm mr-2">{icon}</span>
      <span className="text-gray-300 text-sm flex-grow">{label}</span>
      {shortcut && (
        <span className="text-gray-500 text-xs ml-4">{shortcut}</span>
      )}
    </div>
  );
  
  const Divider = () => <div className="border-t border-[#3c3c3c] my-1"></div>;
  
  return (
    <div
      ref={menuRef}
      className="fixed bg-[#242424] rounded shadow-lg z-[9999] w-75 overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      <MenuItem 
        icon="arrow_upward" 
        label="Select Parent Element" 
        onClick={handleSelectParent}
        disabled={!selectedComponent}
        shortcut="Esc"
      />
      <Divider />
      <MenuItem 
        icon="content_cut" 
        label="Cut" 
        onClick={handleCut}
        disabled={!selectedComponent}
        shortcut="Ctrl+X"
      />
      <MenuItem 
        icon="content_copy" 
        label="Copy" 
        onClick={handleCopy}
        disabled={!selectedComponent}
        shortcut="Ctrl+C"
      />
      <MenuItem 
        icon="content_paste" 
        label="Paste" 
        onClick={handlePaste}
        disabled={!clipboardComponent || !selectedComponent}
        shortcut="Ctrl+V"
      />
      <MenuItem 
        icon="file_copy" 
        label="Duplicate" 
        onClick={handleDuplicate}
        disabled={!selectedComponent}
        shortcut="Ctrl+D"
      />
      <MenuItem 
        icon="delete" 
        label="Delete" 
        onClick={handleDelete}
        disabled={!selectedComponent}
        shortcut="Del"
      />
      <Divider />
      <MenuItem 
        icon="add" 
        label="Add Class" 
        onClick={handleAddClass}
        disabled={!selectedComponent}
      />
      <MenuItem 
        icon="file_copy" 
        label="Duplicate Class" 
        onClick={handleDuplicateClass}
        disabled={!selectedComponent}
      />
      <MenuItem 
        icon="remove" 
        label="Remove Class" 
        onClick={handleRemoveClass}
        disabled={!selectedComponent}
      />
      <MenuItem 
        icon="edit" 
        label="Rename Class" 
        onClick={handleRenameClass}
        disabled={!selectedComponent}
      />
      <Divider />
      <MenuItem 
        icon="widgets" 
        label="Create Component" 
        onClick={handleCreateComponent}
        disabled={!selectedComponent}
      />
    </div>
  );
};

export default ContextMenu; 