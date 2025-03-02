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

/**
 * Props for the ContextMenu component
 * @property {number} x - The x-coordinate where the context menu should appear
 * @property {number} y - The y-coordinate where the context menu should appear
 * @property {Function} onClose - Callback function to close the context menu
 */
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

/**
 * ContextMenu Component
 * 
 * Displays a context menu with various options for manipulating components
 * in the builder. The menu appears at the specified coordinates and
 * provides options like cut, copy, paste, delete, etc.
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
}) => {
  const dispatch = useDispatch();
  const menuRef = useRef<HTMLDivElement>(null);
  // State to track the adjusted position of the menu
  const [position, setPosition] = useState({ x, y });
  
  // Get the currently selected component from Redux store
  const selectedComponent = useSelector(
    (state: RootState) => state.builder.selectedComponent
  );
  
  // Get the root component (entire component tree) from Redux store
  const component = useSelector((state: RootState) => state.builder.component);
  
  // Get the component in clipboard (if any) from Redux store
  const clipboardComponent = useSelector(
    (state: RootState) => state.builder.clipboardComponent
  );

  /**
   * Adjust the position of the context menu after it renders
   * 
   * This ensures the menu stays within the viewport boundaries by:
   * 1. Measuring the actual dimensions of the rendered menu
   * 2. Checking if it would go beyond any edge of the viewport
   * 3. Adjusting the position to keep it fully visible
   * 4. Maintaining a 10px margin from any edge
   */
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
  
  /**
   * Close the context menu when clicking outside of it
   * 
   * Adds a global click event listener that checks if the click
   * occurred outside the menu, and if so, calls the onClose callback.
   * The listener is properly cleaned up when the component unmounts.
   */
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
  
  /**
   * Close the context menu when pressing the Escape key
   * 
   * Adds a global keydown event listener that checks for the Escape key
   * and calls the onClose callback when pressed.
   * The listener is properly cleaned up when the component unmounts.
   */
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

  /**
   * Select the parent of the currently selected component
   * 
   * This function:
   * 1. Recursively searches the component tree to find the parent of the selected component
   * 2. If found, updates the selected component in the Redux store to the parent
   * 3. Closes the context menu
   */
  const handleSelectParent = () => {
    if (!selectedComponent) return;
    
    /**
     * Recursively find the parent of a component in the component tree
     * 
     * @param comp - The component to search in (starting from root)
     * @param targetId - The ID of the component whose parent we're looking for
     * @param parent - The current parent in the recursion (null for root)
     * @returns The parent component if found, null otherwise
     */
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
  
  /**
   * Cut the selected component
   * 
   * This function:
   * 1. Finds the selected component in the component tree
   * 2. Copies it to the clipboard
   * 3. Removes it from the component tree
   * 4. Closes the context menu
   */
  const handleCut = () => {
    if (!selectedComponent) return;
    
    /**
     * Find a component by ID in the component tree
     * 
     * @param comp - The component to search in (starting from root)
     * @param id - The ID of the component to find
     * @returns A copy of the found component, or null if not found
     */
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
  
  /**
   * Copy the selected component to the clipboard
   * 
   * This function:
   * 1. Finds the selected component in the component tree
   * 2. Copies it to the clipboard
   * 3. Closes the context menu
   */
  const handleCopy = () => {
    if (!selectedComponent) return;
    
    /**
     * Find a component by ID in the component tree
     * 
     * @param comp - The component to search in (starting from root)
     * @param id - The ID of the component to find
     * @returns A copy of the found component, or null if not found
     */
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
  
  /**
   * Paste the component from clipboard as a child of the selected component
   * 
   * This function:
   * 1. Checks if there's a component in the clipboard and a selected component
   * 2. Generates new IDs for the clipboard component and all its children
   * 3. Adds the component as a child of the selected component
   * 4. Closes the context menu
   */
  const handlePaste = () => {
    if (!clipboardComponent || !selectedComponent) return;
    
    /**
     * Generate new IDs for a component and all its children
     * 
     * This ensures that pasted components have unique IDs and don't
     * conflict with existing components in the tree.
     * 
     * @param comp - The component to generate new IDs for
     * @returns A new component with fresh IDs
     */
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
  
  /**
   * Duplicate the selected component
   * 
   * This function:
   * 1. Finds the selected component and its parent in the component tree
   * 2. Creates a copy of the component with new IDs
   * 3. Adds the copy as a child of the parent component
   * 4. Closes the context menu
   */
  const handleDuplicate = () => {
    if (!selectedComponent) return;
    
    /**
     * Find a component by ID in the component tree
     * 
     * @param comp - The component to search in (starting from root)
     * @param id - The ID of the component to find
     * @returns A copy of the found component, or null if not found
     */
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
    
    /**
     * Find the parent ID of a component in the component tree
     * 
     * @param comp - The component to search in (starting from root)
     * @param targetId - The ID of the component whose parent we're looking for
     * @param parent - The current parent ID in the recursion (null for root)
     * @returns The parent ID if found, null otherwise
     */
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
      /**
       * Generate new IDs for a component and all its children
       * 
       * This ensures that duplicated components have unique IDs and don't
       * conflict with existing components in the tree.
       * 
       * @param comp - The component to generate new IDs for
       * @returns A new component with fresh IDs
       */
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
  
  /**
   * Delete the selected component
   * 
   * This function:
   * 1. Dispatches an action to remove the selected component from the tree
   * 2. Closes the context menu
   */
  const handleDelete = () => {
    if (!selectedComponent) return;
    dispatch(deleteComponent(selectedComponent.id));
    onClose();
  };
  
  /**
   * Add a CSS class to the selected component
   * 
   * This function:
   * 1. Prompts the user to enter a class name
   * 2. If provided, adds the class to the selected component
   * 3. Closes the context menu
   */
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
  
  /**
   * Duplicate a CSS class in the selected component
   * 
   * This function:
   * 1. Prompts the user to enter the name of a class to duplicate
   * 2. Prompts for a new class name
   * 3. If both are provided, duplicates the class with the new name
   * 4. Closes the context menu
   */
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
  
  /**
   * Remove a CSS class from the selected component
   * 
   * This function:
   * 1. Prompts the user to enter the name of a class to remove
   * 2. If provided, removes the class from the selected component
   * 3. Closes the context menu
   */
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
  
  /**
   * Rename a CSS class in the selected component
   * 
   * This function:
   * 1. Prompts the user to enter the name of a class to rename
   * 2. Prompts for a new class name
   * 3. If both are provided, renames the class
   * 4. Closes the context menu
   */
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
  
  /**
   * Create a reusable component from the selected element
   * 
   * This function:
   * 1. Prompts the user to enter a name for the new component
   * 2. If provided, extracts the selected component as a reusable component
   * 3. Closes the context menu
   */
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

  /**
   * MenuItem Component
   * 
   * Renders a single menu item in the context menu with an icon,
   * label, optional shortcut, and handles click events.
   * 
   * @param icon - Material icon name
   * @param label - Text to display for the menu item
   * @param onClick - Function to call when the item is clicked
   * @param disabled - Whether the item should be disabled
   * @param shortcut - Optional keyboard shortcut to display
   */
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
  
  /**
   * Divider Component
   * 
   * Renders a horizontal divider line between groups of menu items
   */
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