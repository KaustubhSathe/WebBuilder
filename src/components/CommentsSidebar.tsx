import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CommentSettings from "./CommentSettings";

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommentsSidebar = ({ isOpen, onClose }: CommentsSidebarProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        <div className="w-[300px] bg-[#2c2c2c] border-l border-[#3c3c3c]">
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
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-gray-400 text-sm text-center">
                No comments yet
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentsSidebar;
