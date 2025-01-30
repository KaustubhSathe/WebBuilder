import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Component, BuilderState, ElementType } from '../types/builder';

interface CanvasElement {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

interface BuilderState {
  components: Component[];
  selectedComponent: string | null;
  elements: CanvasElement[];
  selectedElementId: string | null;
}

const initialState: BuilderState = {
  components: [],
  selectedComponent: null,
  elements: [],
  selectedElementId: null,
};

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    addComponent: (state, action: PayloadAction<Component>) => {
      state.components.push(action.payload);
    },
    updateComponent: (state, action: PayloadAction<{ id: string; updates: Partial<Component> }>) => {
      const { id, updates } = action.payload;
      const component = state.components.find(comp => comp.id === id);
      if (component) {
        Object.assign(component, updates);
      }
    },
    moveComponent: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const { id, x, y } = action.payload;
      const component = state.components.find(comp => comp.id === id);
      if (component) {
        component.position = { x, y };
      }
    },
    selectComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponent = action.payload;
    },
    deleteComponent: (state, action: PayloadAction<string>) => {
      state.components = state.components.filter(comp => comp.id !== action.payload);
      if (state.selectedComponent === action.payload) {
        state.selectedComponent = null;
      }
    },
    addElement: (state, action: PayloadAction<{ type: ElementType; position: { x: number; y: number } }>) => {
      const id = `element-${Date.now()}`;
      state.elements.push({
        id,
        ...action.payload,
      });
      state.selectedElementId = id;
    },
    selectElement: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },
    moveElement: (state, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
      const element = state.elements.find(el => el.id === action.payload.id);
      if (element) {
        element.position = action.payload.position;
      }
    },
    updateElementSize: (state, action: PayloadAction<{ id: string; size: { width: number; height: number } }>) => {
      const element = state.elements.find(el => el.id === action.payload.id);
      if (element) {
        element.size = action.payload.size;
      }
    },
  },
});

export const {
  addComponent,
  updateComponent,
  moveComponent,
  selectComponent,
  deleteComponent,
  addElement,
  selectElement,
  moveElement,
  updateElementSize,
} = builderSlice.actions;

export default builderSlice.reducer; 