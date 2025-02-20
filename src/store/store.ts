import { configureStore } from '@reduxjs/toolkit';
import builderReducer from './builderSlice';
import pagesReducer from './pagesSlice';

export const store = configureStore({
  reducer: {
    builder: builderReducer,
    pages: pagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 