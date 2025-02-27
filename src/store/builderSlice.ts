import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BuilderState, Component, ComponentType } from "../types/builder";
import { v4 as uuidv4 } from "uuid";
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
};

// Move findComponentById outside the slice and export it
export const findComponentById = (
  root: Component,
  id: string,
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
  componentId: string,
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

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    setComponent: {
      reducer: (
        state,
        action: PayloadAction<{ component: Component; updatePage?: boolean }>,
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
      const deleteFromChildren = (children: Component[]): Component[] => {
        return children.filter((child) => {
          if (child.id === action.payload) return false;
          child.children = deleteFromChildren(child.children);
          return true;
        });
      };

      state.component.children = deleteFromChildren(state.component.children);
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
      }>,
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
      }>,
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
      }>,
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
      }>,
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
        console.log("Updated component:", updatedComponent);
        console.log("Selected page ID:", selectedPageId);

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
  deleteComponent,
  selectComponent,
  addComponent,
  moveComponent,
  updateComponentSize,
  updateComponent,
  updateInteractions,
} = builderSlice.actions;

export default builderSlice.reducer;
