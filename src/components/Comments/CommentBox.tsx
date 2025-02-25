import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { commentService } from "@/services/commentService";
import toast from "react-hot-toast";
import { addComment } from "@/store/commentsSlice";

interface CommentBoxProps {
    position: { x: number; y: number };
    onSubmit: () => void;
    onCancel: () => void;
}

const CommentBox = ({ position, onSubmit, onCancel }: CommentBoxProps) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const project = useSelector((state: RootState) =>
        state.project.currentProject
    );
    const selectedPageId = useSelector((state: RootState) =>
        state.pages.selectedPageId
    );
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        if (!content.trim() || !project?.id || !selectedPageId) return;

        setIsSubmitting(true);
        try {
            const newComment = await commentService.addComment(
                project.id,
                selectedPageId,
                content,
                position,
            );
            console.log(newComment);
            dispatch(addComment(newComment));
            onSubmit();
            toast.success("Comment added successfully");
        } catch (error) {
            console.error("Failed to add comment:", error);
            toast.error("Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="absolute bg-[#363636] rounded-lg shadow-lg border border-[#3c3c3c] w-[300px] cursor-default z-[2000]"
            style={{
                left: position.x + 20,
                top: position.y - 60,
            }}
        >
            <div className="p-3">
                <textarea
                    autoFocus
                    className="w-full h-24 bg-[#2c2c2c] text-gray-200 text-sm rounded p-2 border border-[#4c4c4c] focus:outline-none focus:border-blue-500"
                    placeholder="Add a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        className="px-3 py-1 text-sm text-gray-300 hover:text-gray-100"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                        disabled={!content.trim() || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting
                            ? (
                                <>
                                    <span className="material-icons animate-spin text-[16px]">
                                        refresh
                                    </span>
                                    Posting...
                                </>
                            )
                            : (
                                "Post"
                            )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentBox;
