import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Component, BuilderState, ComponentType } from '../types/builder';
import { v4 as uuidv4 } from 'uuid';

const initialState: BuilderState = {
  component: {
    id: 'root',
    type: 'main',
    children: [],
    styles: {
      position: 'absolute',
      left: '0px',
      top: '0px',
      backgroundColor: 'blue',
      width: '100px',
      height: '100px',
    },
  },
  selectedComponent: null,
};

const findComponentById = (root: Component, id: string): Component | null => {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findComponentById(child, id);
    if (found) return found;
  }
  return null;
};

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    setComponent: (state, action: PayloadAction<Component>) => {
      state.component = action.payload;
    },
    setSelectedComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponent = action.payload;
    },
    deleteComponent: (state, action: PayloadAction<string>) => {
      const deleteFromChildren = (children: Component[]): Component[] => {
        return children.filter(child => {
          if (child.id === action.payload) return false;
          child.children = deleteFromChildren(child.children);
          return true;
        });
      };

      state.component.children = deleteFromChildren(state.component.children);
      if (state.selectedComponent === action.payload) {
        state.selectedComponent = null;
      }
    },
    selectElement: (state, action: PayloadAction<string>) => {
      const elementId = action.payload;
      // Only set selected if element exists in the tree
      const element = findComponentById(state.component, elementId);
      if (element) {
        state.selectedComponent = elementId;
      }
    },
    addElement: (state, action: PayloadAction<{
      parentId: string;
      type: ComponentType;
      position: { x: number; y: number };
    }>) => {
      const { parentId, type, position } = action.payload;
      
      const newComponent: Component = {
        id: uuidv4(),
        type,
        children: [],
        styles: {
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '100px',
          height: '40px',
        },
      };

      const parent = findComponentById(state.component, parentId);
      if (parent) {
        parent.children.push(newComponent);
        state.selectedComponent = newComponent.id; // Select the new component
      }
    },
    moveElement: (state, action: PayloadAction<{
      id: string;
      position: { x: number; y: number };
    }>) => {
      const { id, position } = action.payload;
      const element = findComponentById(state.component, id);
      if (element) {
        if (element.styles) {
          element.styles.left = `${position.x}px`;
          element.styles.top = `${position.y}px`;
        }
      }
    },
    updateElementSize: (state, action: PayloadAction<{
      id: string;
      size: { width: number; height: number };
    }>) => {
      const { id, size } = action.payload;
      const element = findComponentById(state.component, id);
      if (element && element.styles) {
        element.styles.width = `${size.width}px`;
        element.styles.height = `${size.height}px`;
      }
    },
    updateComponent: (state, action: PayloadAction<{ 
      id: string; 
      updates: Partial<Component> 
    }>) => {
      const component = findComponentById(state.component, action.payload.id);
      if (component) {
        Object.assign(component, action.payload.updates);
      }
    },
  },
});

export const {
  setComponent,
  setSelectedComponent,
  deleteComponent,
  selectElement,
  addElement,
  moveElement,
  updateElementSize,
  updateComponent,
} = builderSlice.actions;

export default builderSlice.reducer; 