import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { CommentData, commentService } from "@/services/commentService";
import toast from "react-hot-toast";
import { addComment } from "@/store/commentsSlice";
import { getInitials } from "@/utils/utils";

interface CommentBoxProps {
  position: { x: number; y: number };
  comment?: CommentData;
  onClose: () => void;
  onSubmit?: (content: string) => void;
  onCancel?: () => void;
  onResolve?: (commentId: string) => void;
}

const CommentBox = ({
  position,
  comment,
  onClose,
  onSubmit,
  onCancel,
  onResolve,
}: CommentBoxProps) => {
  const [content, setContent] = useState(comment?.content || "");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const project = useSelector(
    (state: RootState) => state.project.currentProject
  );
  const selectedPageId = useSelector(
    (state: RootState) => state.pages.selectedPageId
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
        position
      );
      dispatch(addComment(newComment));
      onSubmit?.(content);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !project?.id || !selectedPageId || !comment?.id)
      return;

    setIsSubmitting(true);
    try {
      const newComment = await commentService.addComment(
        project.id,
        selectedPageId,
        replyContent,
        position,
        comment.id
      );
      dispatch(addComment(newComment));
      setReplyContent("");
      toast.success("Reply added successfully");
    } catch (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to add reply");
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
      {comment ? (
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                {getInitials(comment.user?.user_metadata?.name || "Unknown")}
              </div>
              <div>
                <div className="text-sm text-gray-200">
                  {comment.user?.user_metadata?.name}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(comment.created_at || "").toLocaleString()}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              <span className="material-icons text-[20px]">close</span>
            </button>
          </div>
          <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-[#4c4c4c] space-y-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="bg-[#2a2a2a] rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">
                      {getInitials(
                        reply.user?.user_metadata?.name || "Unknown"
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-200">
                        {reply.user?.user_metadata?.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(reply.created_at || "").toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                    {reply.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#4c4c4c]">
            <textarea
              className="w-full h-20 bg-[#2c2c2c] text-gray-200 text-sm rounded p-2 border border-[#4c4c4c] focus:outline-none focus:border-blue-500"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex justify-end mt-2 gap-2">
              <button
                className="px-3 py-1 text-sm text-green-500 hover:text-green-400 border border-green-500 hover:border-green-400 rounded flex items-center gap-1"
                onClick={() => onResolve?.(comment.id || "")}
                disabled={isSubmitting}
                title="Mark as resolved"
              >
                <span className="material-icons text-[16px]">check_circle</span>
              </button>
              <button
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                disabled={!replyContent.trim() || isSubmitting}
                onClick={handleReply}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-icons animate-spin text-[16px]">
                      refresh
                    </span>
                    Replying...
                  </>
                ) : (
                  "Reply"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
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
              className="px-3 py-1 text-sm text-green-500 hover:text-green-400 border border-green-500 hover:border-green-400 rounded flex items-center gap-1"
              onClick={() => onResolve?.(comment?.id || "")}
              disabled={isSubmitting}
              title="Mark as resolved"
            >
              <span className="material-icons text-[16px]">check_circle</span>
            </button>
            <button
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
              disabled={!content.trim() || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <span className="material-icons animate-spin text-[16px]">
                    refresh
                  </span>
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentBox;
