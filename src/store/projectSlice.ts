import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Project } from "@/types/project";

interface ProjectState {
    currentProject: Project | null;
}

const initialState: ProjectState = {
    currentProject: null,
};

const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        setCurrentProject: (state, action: PayloadAction<Project>) => {
            state.currentProject = action.payload;
        },
    },
});

export const { setCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
