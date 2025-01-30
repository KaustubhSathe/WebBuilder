import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Component, BuilderState } from '../types/builder';

const initialState: BuilderState = {
  components: [],
  selectedComponent: null,
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
  },
});

export const {
  addComponent,
  updateComponent,
  moveComponent,
  selectComponent,
  deleteComponent,
} = builderSlice.actions;

export default builderSlice.reducer; 