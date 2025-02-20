import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface Page {
  id: string;
  name: string;
  path: string;
  isHome?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PagesState {
  pages: Page[];
  selectedPageId: string | null;
}

const initialState: PagesState = {
  pages: [
    {
      id: '1',
      name: 'Home',
      path: '/',
      isHome: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  selectedPageId: '1'
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    addPage: (state, action: PayloadAction<{ name: string }>) => {
      const path = '/' + action.payload.name.toLowerCase().replace(/\s+/g, '-');
      const newPage: Page = {
        id: uuidv4(),
        name: action.payload.name,
        path,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.pages.push(newPage);
    },
    deletePage: (state, action: PayloadAction<string>) => {
      state.pages = state.pages.filter(page => page.id !== action.payload);
      if (state.selectedPageId === action.payload) {
        state.selectedPageId = state.pages[0].id;
      }
    },
    setSelectedPage: (state, action: PayloadAction<string>) => {
      state.selectedPageId = action.payload;
    },
  },
});

export const { addPage, deletePage, setSelectedPage } = pagesSlice.actions;
export default pagesSlice.reducer; 