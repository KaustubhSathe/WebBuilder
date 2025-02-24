import { createSlice } from "@reduxjs/toolkit";

interface SaveState {
    hasUnsavedChanges: boolean;
    isSaving: boolean;
}

const initialState: SaveState = {
    hasUnsavedChanges: false,
    isSaving: false,
};

const saveStateSlice = createSlice({
    name: "saveState",
    initialState,
    reducers: {
        markUnsaved: (state) => {
            state.hasUnsavedChanges = true;
        },
        markSaved: (state) => {
            state.hasUnsavedChanges = false;
        },
        setSaving: (state, action) => {
            state.isSaving = action.payload;
        },
    },
});

export const { markUnsaved, markSaved, setSaving } = saveStateSlice.actions;
export default saveStateSlice.reducer;
