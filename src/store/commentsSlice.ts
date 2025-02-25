import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CommentData } from "@/services/commentService";

interface CommentsState {
    comments: CommentData[];
    isLoading: boolean;
    error: string | null;
    showResolved: boolean;
    filterByCurrentPage: boolean;
}

const initialState: CommentsState = {
    comments: [],
    isLoading: false,
    error: null,
    showResolved: false,
    filterByCurrentPage: true, // Default to filtering by current page
};

const commentsSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {
        setComments: (state, action: PayloadAction<CommentData[]>) => {
            state.comments = action.payload;
        },
        addComment: (state, action: PayloadAction<CommentData>) => {
            // Add new comment to the beginning of the array
            state.comments = [action.payload, ...state.comments];
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setShowResolved: (state, action: PayloadAction<boolean>) => {
            state.showResolved = action.payload;
        },
        setFilterByCurrentPage: (state, action: PayloadAction<boolean>) => {
            state.filterByCurrentPage = action.payload;
        },
        removeComment: (state, action: PayloadAction<string>) => {
            state.comments = state.comments.filter((comment) =>
                comment.id !== action.payload
            );
        },
    },
});

export const {
    setComments,
    addComment,
    setLoading,
    setError,
    setShowResolved,
    setFilterByCurrentPage,
    removeComment,
} = commentsSlice.actions;

export default commentsSlice.reducer;
