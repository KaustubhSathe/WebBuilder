import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CommentSettings from "./CommentSettings";
import { CommentData, commentService } from "@/services/commentService";
import {
  setComments,
  setError,
  setFilterByCurrentPage,
  setLoading,
  setShowResolved,
} from "@/store/commentsSlice";
import toast from "react-hot-toast";
import { getInitials } from "@/utils/utils";

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommentsSidebar = ({ isOpen, onClose }: CommentsSidebarProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch();

  const { comments, isLoading, error, showResolved, filterByCurrentPage } =
    useSelector(
      (state: RootState) => state.comments,
    );
  const project = useSelector((state: RootState) =>
    state.project.currentProject
  );
  const selectedPageId = useSelector((state: RootState) =>
    state.pages.selectedPageId
  );

  // Load comments when sidebar opens or filters change
  useEffect(() => {
    if (isOpen && project?.id) {
      loadComments();
    }
  }, [isOpen, project?.id, selectedPageId, showResolved, filterByCurrentPage]);

  const loadComments = async () => {
    if (!project?.id) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const pageId = filterByCurrentPage ? selectedPageId : undefined;
      const commentsData = await commentService.getComments(
        project.id,
        pageId || undefined,
        showResolved,
      );
      dispatch(setComments(commentsData));
    } catch (error) {
      console.error("Failed to load comments:", error);
      dispatch(setError("Failed to load comments"));
      toast.error("Failed to load comments");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const toggleShowResolved = () => {
    dispatch(setShowResolved(!showResolved));
  };

  const toggleFilterByPage = () => {
    dispatch(setFilterByCurrentPage(!filterByCurrentPage));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        buttonRef.current &&
        !settingsRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {isOpen && (
        <div className="w-[300px] fixed right-0 h-full z-[3000] cursor-normal bg-[#2c2c2c] border-l border-[#3c3c3c]">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-[#3c3c3c]">
              <span className="text-gray-200 text-sm font-medium">
                Comments
              </span>
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 flex rounded-md transition-colors"
                  title="Settings"
                >
                  <span className="material-icons text-[18px] mt-auto mb-auto">
                    more_horiz
                  </span>
                </button>
                <div ref={settingsRef}>
                  <CommentSettings
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                  />
                </div>
              </div>
            </div>

            {/* Comments Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isLoading
                ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500">
                    </div>
                  </div>
                )
                : error
                ? (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )
                : comments.length === 0
                ? (
                  <div className="text-gray-400 text-sm text-center">
                    No comments yet
                  </div>
                )
                : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <CommentCard key={comment.id} comment={comment} />
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Comment card component
interface CommentCardProps {
  comment: CommentData;
}

const CommentCard = ({ comment }: CommentCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`bg-[#363636] rounded-lg p-3 text-wrap overflow-hidden ${
        comment.is_resolved ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {comment.user?.user_metadata?.avatar_url
          ? (
            <img
              src={comment.user?.user_metadata?.avatar_url}
              alt={comment.user.user_metadata.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )
          : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium">
              {getInitials(comment.user?.user_metadata?.name || "Unknown")}
            </div>
          )}

        <div className="flex flex-col">
          <span className="inline-block text-sm text-gray-300">
            {comment.user?.user_metadata?.name || "Unknown"}
          </span>
          <span className="inline-block text-xs text-gray-500">
            {formatDate(comment.created_at || "")}
          </span>
        </div>
      </div>
      <p className="text-sm text-red-200 mb-2 break-words whitespace-pre-wrap">
        {comment.content}
      </p>

      {comment.is_resolved && (
        <div className="flex items-center text-xs text-green-500">
          <span className="material-icons text-[14px] mr-1">check_circle</span>
          Resolved
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-3 border-l border-[#3c3c3c] space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="bg-[#2a2a2a] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-sm font-medium">
                    {getInitials(reply.user?.user_metadata?.name || "Unknown")}
                  </div>
                  <span className="text-xs text-gray-300">
                    {reply.user?.user_metadata?.name || "Unknown"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(reply.created_at || "")}
                </span>
              </div>
              <p className="text-xs text-gray-200 text-wrap">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSidebar;
