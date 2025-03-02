import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BuilderState, Component, ComponentType } from "../types/builder";
import { generateComponentId } from "@/utils/idGenerator";

const initialState: BuilderState = {
  component: {
    id: "root",
    customAttributes: {},
    type: "main",
    children: [],
    styles: {
      position: "static",
      width: "100%",
      height: "100%",
    },
  },
  selectedComponent: null,
  clipboardComponent: null,
};

// Move findComponentById outside the slice and export it
export const findComponentById = (
  root: Component,
  id: string
): Component | null => {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findComponentById(child, id);
    if (found) return found;
  }
  return null;
};

// Helper function to remove component from its current parent
const removeComponentFromParent = (
  root: Component,
  componentId: string
): boolean => {
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].id === componentId) {
      root.children.splice(i, 1);
      return true;
    }
    if (removeComponentFromParent(root.children[i], componentId)) {
      return true;
    }
  }
  return false;
};

interface Size {
  width: { value: number; unit: string };
  height: { value: number; unit: string };
}

interface Position {
  x: { value: number; unit: string };
  y: { value: number; unit: string };
}

// Helper function to update a component in the tree
const updateComponentInTree = (component: Component, id: string, updater: (comp: Component) => Component): Component => {
  if (component.id === id) {
    return updater(component);
  }
  
  if (component.children) {
    return {
      ...component,
      children: component.children.map(child => updateComponentInTree(child, id, updater))
    };
  }
  
  return component;
};

// Helper function to delete a component from the tree
const deleteComponentFromTree = (component: Component, id: string): Component => {
  if (component.children) {
    return {
      ...component,
      children: component.children
        .filter(child => child.id !== id)
        .map(child => deleteComponentFromTree(child, id))
    };
  }
  
  return component;
};

// Helper function to add a child component to a parent
const addChildToParent = (component: Component, parentId: string, childComponent: Component): Component => {
  if (component.id === parentId) {
    return {
      ...component,
      children: [...(component.children || []), childComponent]
    };
  }
  
  if (component.children) {
    return {
      ...component,
      children: component.children.map(child => addChildToParent(child, parentId, childComponent))
    };
  }
  
  return component;
};

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    setComponent: {
      reducer: (
        state,
        action: PayloadAction<{ component: Component; updatePage?: boolean }>
      ) => {
        state.component = action.payload.component;
      },
      prepare: (component: Component, updatePage = true) => {
        return { payload: { component, updatePage } };
      },
    },
    setSelectedComponent: (state, action: PayloadAction<Component | null>) => {
      state.selectedComponent = action.payload;
    },
    deleteComponent: (state, action: PayloadAction<string>) => {
      state.component = deleteComponentFromTree(state.component, action.payload);
      if (state.selectedComponent?.id === action.payload) {
        state.selectedComponent = null;
      }
    },
    selectComponent: (state, action: PayloadAction<string>) => {
      const elementId = action.payload;
      // Only set selected if element exists in the tree
      const element = findComponentById(state.component, elementId);
      if (element) {
        state.selectedComponent = element;
      }
    },
    addComponent: (
      state,
      action: PayloadAction<{
        parentId: string;
        type: ComponentType;
        position: { x: number; y: number };
      }>
    ) => {
      const { parentId, type, position } = action.payload;

      const newComponent: Component = {
        id: generateComponentId(),
        type,
        children: [],
        customAttributes: {},
        styles: {
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "100px",
          height: "40px",
        },
      };

      const parent = findComponentById(state.component, parentId);
      if (parent) {
        parent.children.push(newComponent);
        state.selectedComponent = newComponent;
      }
    },
    moveComponent: (
      state,
      action: PayloadAction<{
        id: string;
        position: Position;
        newParentId?: string;
      }>
    ) => {
      const { id, position, newParentId } = action.payload;

      // First find and store the component
      const component = findComponentById(state.component, id);
      if (!component) return;

      // If there's a new parent, remove from old parent and add to new parent
      if (newParentId && newParentId !== id) {
        // Remove from old parent
        removeComponentFromParent(state.component, id);

        // Add to new parent
        const newParent = findComponentById(state.component, newParentId);
        if (newParent) {
          newParent.children.push(component);
        }
      }

      // Update position
      if (component.styles) {
        component.styles.position = "absolute";
        component.styles.left = `${position.x.value}px`;
        component.styles.top = `${position.y.value}px`;
        delete component.styles.bottom;
        delete component.styles.right;
      }
    },
    updateComponentSize: (
      state,
      action: PayloadAction<{
        id: string;
        size: Size;
      }>
    ) => {
      const { id, size } = action.payload;
      const element = findComponentById(state.component, id);
      if (element && element.styles) {
        element.styles.width = `${size.width.value}px`;
        element.styles.height = `${size.height.value}px`;
      }
    },
    updateComponent: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Component>;
      }>
    ) => {
      const component = findComponentById(state.component, action.payload.id);
      if (component) {
        Object.assign(component, action.payload.updates);
        // If we're updating the currently selected component, update it in the state
        if (state.selectedComponent?.id === action.payload.id) {
          state.selectedComponent = component;
        }
      }
    },
    updateInteractions: (state, action: PayloadAction<string>) => {
      state.component.interactions = action.payload;
    },
    addChildComponent: (state, action: PayloadAction<{ parentId: string; component: Component }>) => {
      const { parentId, component } = action.payload;
      state.component = addChildToParent(state.component, parentId, component);
    },
    addClassToComponent: (state, action: PayloadAction<{ componentId: string; className: string }>) => {
      const { componentId, className } = action.payload;
      state.component = updateComponentInTree(
        state.component,
        componentId,
        (comp) => {
          const currentClasses = comp.className ? comp.className.split(" ") : [];
          if (!currentClasses.includes(className)) {
            return {
              ...comp,
              className: currentClasses.length > 0 
                ? `${comp.className} ${className}` 
                : className
            };
          }
          return comp;
        }
      );
    },
    removeClassFromComponent: (state, action: PayloadAction<{ componentId: string; className: string }>) => {
      const { componentId, className } = action.payload;
      state.component = updateComponentInTree(
        state.component,
        componentId,
        (comp) => {
          if (comp.className) {
            const classes = comp.className.split(" ").filter(c => c !== className);
            return {
              ...comp,
              className: classes.join(" ")
            };
          }
          return comp;
        }
      );
    },
    renameClassInComponent: (state, action: PayloadAction<{ componentId: string; className: string; newClassName: string }>) => {
      const { componentId, className, newClassName } = action.payload;
      state.component = updateComponentInTree(
        state.component,
        componentId,
        (comp) => {
          if (comp.className) {
            const classes = comp.className.split(" ").map(c => c === className ? newClassName : c);
            return {
              ...comp,
              className: classes.join(" ")
            };
          }
          return comp;
        }
      );
    },
    duplicateClassInComponent: (state, action: PayloadAction<{ componentId: string; className: string; newClassName: string }>) => {
      const { componentId, className, newClassName } = action.payload;
      state.component = updateComponentInTree(
        state.component,
        componentId,
        (comp) => {
          if (comp.className && comp.className.includes(className)) {
            return {
              ...comp,
              className: `${comp.className} ${newClassName}`
            };
          }
          return comp;
        }
      );
    },
    createComponentFromElement: (state, action: PayloadAction<{ componentId: string; name: string }>) => {
      // This would typically involve more complex logic to extract a component
      // and register it in a component library
      const { componentId, name } = action.payload;
      // For now, we'll just log this action
      console.log(`Creating component "${name}" from element ${componentId}`);
    },
    setClipboardComponent: (state, action: PayloadAction<Component | null>) => {
      state.clipboardComponent = action.payload;
    },
  },
});

// Create a middleware to sync component updates with the selected page
export const builderMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    // List of actions that modify the component tree or interactions
    const componentModifyingActions = [
      "builder/setComponent",
      "builder/deleteComponent",
      "builder/addComponent",
      "builder/moveComponent",
      "builder/updateComponentSize",
      "builder/updateComponent",
      "builder/updateInteractions",
    ];

    if (componentModifyingActions.includes(action.type)) {
      const state = store.getState();
      const selectedPageId = state.pages.selectedPageId;
      if (selectedPageId) {
        // Get the updated component tree after the action has been processed
        const updatedComponent = state.builder.component;

        store.dispatch({
          type: "pages/updateCanvas",
          payload: {
            pageId: selectedPageId,
            component_tree: updatedComponent,
          },
        });
      }
    }

    return result;
  };

export const {
  setComponent,
  setSelectedComponent,
  setClipboardComponent,
  deleteComponent,
  selectComponent,
  addComponent,
  moveComponent,
  updateComponentSize,
  updateComponent,
  updateInteractions,
  addChildComponent,
  addClassToComponent,
  removeClassFromComponent,
  renameClassInComponent,
  duplicateClassInComponent,
  createComponentFromElement,
} = builderSlice.actions;

export default builderSlice.reducer;
