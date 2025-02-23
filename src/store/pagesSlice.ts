import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type { Component } from "@/types/builder";

export interface Page {
  id: string;
  name: string;
  path: string;
  isHome?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  component_tree: Component;
}

interface PagesState {
  pages: Page[];
  selectedPageId: string | null;
}

const createEmptyCanvas = (): Component => ({
  id: uuidv4(),
  type: "main",
  styles: {
    width: "100%",
    height: "100%",
    padding: "0",
    margin: "0",
  },
  children: [],
});

const initialState: PagesState = {
  pages: [
    {
      id: "1",
      name: "Home",
      path: "/",
      isHome: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      component_tree: createEmptyCanvas(),
    },
  ],
  selectedPageId: "1",
};

const pagesSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    addPage: (state, action: PayloadAction<{ name: string }>) => {
      const path = "/" + action.payload.name.toLowerCase().replace(/\s+/g, "-");
      const newPage: Page = {
        id: uuidv4(),
        name: action.payload.name,
        path,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        component_tree: createEmptyCanvas(),
      };
      state.pages.push(newPage);
    },
    deletePage: (state, action: PayloadAction<string>) => {
      state.pages = state.pages.filter((page) => page.id !== action.payload);
      if (state.selectedPageId === action.payload) {
        state.selectedPageId = state.pages[0].id;
      }
    },
    setSelectedPage: (state, action: PayloadAction<string>) => {
      state.selectedPageId = action.payload;
    },
    updateCanvas: (
      state,
      action: PayloadAction<{ pageId: string; component_tree: Component }>,
    ) => {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (page) {
        page.component_tree = action.payload.component_tree;
        page.updatedAt = new Date().toISOString();
      }
    },
    addElementToCanvas: (
      state,
      action: PayloadAction<{
        pageId: string;
        parentId: string;
        element: Omit<Component, "id" | "children">;
      }>,
    ) => {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (!page) return;

      const findParentAndAddElement = (node: Component): boolean => {
        if (node.id === action.payload.parentId) {
          const newElement: Component = {
            ...action.payload.element,
            id: uuidv4(),
            children: [],
          };
          node.children.push(newElement);
          return true;
        }
        for (const child of node.children) {
          if (findParentAndAddElement(child)) {
            return true;
          }
        }
        return false;
      };

      findParentAndAddElement(page.component_tree);
      page.updatedAt = new Date().toISOString();
    },
    setPagesFromServer: (state, action: PayloadAction<Page[]>) => {
      state.pages = action.payload;
      state.selectedPageId = action.payload[0]?.id || null;
    },
  },
});

export const {
  addPage,
  deletePage,
  setSelectedPage,
  updateCanvas,
  addElementToCanvas,
  setPagesFromServer,
} = pagesSlice.actions;

export default pagesSlice.reducer;
