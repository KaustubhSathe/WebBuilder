import { configureStore, Middleware } from "@reduxjs/toolkit";
import builderReducer, { builderMiddleware } from "./builderSlice";
import pagesReducer from "./pagesSlice";
import projectReducer from "./projectSlice";
import saveStateReducer from "./saveStateSlice";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

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
