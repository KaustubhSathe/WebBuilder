import React, { useState } from "react";

interface CommentBoxProps {
    position: { x: number; y: number };
    onSubmit: (content: string) => void;
    onCancel: () => void;
}

const CommentBox = ({ position, onSubmit, onCancel }: CommentBoxProps) => {
    const [content, setContent] = useState("");

    return (
        <div
            className="absolute bg-[#363636] rounded-lg shadow-lg border border-[#3c3c3c] w-[300px] cursor-default z-50"
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
                    >
                        Cancel
                    </button>
                    <button
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={!content.trim()}
                        onClick={() => onSubmit(content)}
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentBox;
