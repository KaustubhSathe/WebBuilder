import { configureStore, Middleware } from "@reduxjs/toolkit";
import builderReducer, { builderMiddleware } from "./builderSlice";
import pagesReducer from "./pagesSlice";
import projectReducer from "./projectSlice";
import saveStateReducer from "./saveStateSlice";

const saveStateMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  const modifyingActions = [
    "builder/setComponent",
    "builder/deleteComponent",
    "builder/addElement",
    "builder/moveElement",
    "builder/updateElementSize",
    "builder/updateComponent",
    "pages/updateCanvas",
    "pages/addElementToCanvas",
  ];

  if (modifyingActions.includes(action.type)) {
    store.dispatch({ type: "saveState/markUnsaved" });
  }

  return result;
};

export const store = configureStore({
  reducer: {
    builder: builderReducer,
    pages: pagesReducer,
    project: projectReducer,
    saveState: saveStateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([builderMiddleware, saveStateMiddleware]),
});

// Define RootState type with explicit reducer types
export type RootState = {
  builder: ReturnType<typeof builderReducer>;
  pages: ReturnType<typeof pagesReducer>;
  project: ReturnType<typeof projectReducer>;
  saveState: ReturnType<typeof saveStateReducer>;
};

export type AppDispatch = typeof store.dispatch;
