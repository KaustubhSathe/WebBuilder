import { configureStore } from "@reduxjs/toolkit";
import builderReducer from "./builderSlice";
import pagesReducer from "./pagesSlice";
import projectReducer from "./projectSlice";

export const store = configureStore({
  reducer: {
    builder: builderReducer,
    pages: pagesReducer,
    project: projectReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
