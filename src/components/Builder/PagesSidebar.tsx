"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPage, deletePage, Page, setSelectedPage } from "@/store/pagesSlice";
import type { RootState } from "@/store/store";
import { projectService } from "@/services/projectService";
import { setComponent } from "@/store/builderSlice";
import toast from "react-hot-toast";

interface PagesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const PageItem: React.FC<{
  page: Page;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}> = ({
  page,
  isSelected,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between group cursor-pointer ${
        isSelected
          ? "bg-[#3c3c3c] text-gray-200"
          : "text-gray-400 hover:bg-[#3c3c3c] hover:text-gray-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="material-icons text-[18px]">
          {page.is_home ? "home" : "description"}
        </span>
        {page.name}
      </div>
      {!page.is_home && onDelete && (
        <div className="opacity-0 group-hover:opacity-100">
          <button
            className="p-1 hover:bg-[#4c4c4c] rounded text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <span className="material-icons text-[16px]">delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

const PagesSidebar: React.FC<PagesSidebarProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const pages = useSelector((state: RootState) => state.pages.pages);
  const selectedPageId = useSelector((state: RootState) =>
    state.pages.selectedPageId
  );
  const project = useSelector((state: RootState) =>
    state.project.currentProject
  );
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || !project) return;

    setIsLoading(true);
    try {
      const newPage = await projectService.addPage(
        project.id,
        newPageName.trim(),
      );
      dispatch(addPage(newPage));
      setIsAddingPage(false);
      setNewPageName("");
    } catch (error) {
      console.error("Error creating page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await projectService.deletePage(pageId);
      dispatch(deletePage(pageId));
      toast.success("Page deleted successfully");
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete page",
      );
    }
  };

  const handleSelectPage = (pageId: string) => {
    dispatch(setSelectedPage(pageId));
    // also set the ComponentTree to the page's component_tree
    // setComponent is the function to set the component, first find the page in the pages array
    const page = pages.find((page) => page.id === pageId);
    if (page) {
      dispatch(setComponent(page.component_tree));
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className={`absolute top-0 left-10 h-full bg-[#2c2c2c] transition-all duration-300 z-20 overflow-hidden ${
            isOpen ? "w-[240px] border-r border-[#3c3c3c]" : "w-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-200 text-sm font-medium">Pages</span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <span className="material-icons text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {/* Pages List */}
              <div className="space-y-1 p-2">
                {pages.map((page) => (
                  <PageItem
                    key={page.id}
                    page={page}
                    isSelected={selectedPageId === page.id}
                    onSelect={() => handleSelectPage(page.id)}
                    onDelete={!page.is_home
                      ? () => handleDeletePage(page.id)
                      : undefined}
                  />
                ))}
              </div>

              {/* Add Page Form */}
              {isAddingPage
                ? (
                  <form
                    onSubmit={handleAddPage}
                    className="p-2"
                  >
                    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#3c3c3c] rounded overflow-hidden">
                      <input
                        type="text"
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        placeholder="Page name"
                        className="flex-1 bg-transparent px-2 py-1 text-sm text-gray-200 focus:outline-none"
                        autoFocus
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddingPage(false)}
                        className="p-1 text-gray-400 hover:text-gray-300 hover:bg-[#2c2c2c]"
                        disabled={isLoading}
                      >
                        <span className="material-icons text-[18px]">
                          close
                        </span>
                      </button>
                    </div>
                  </form>
                )
                : (
                  <div className="p-2">
                    <button
                      onClick={() => setIsAddingPage(true)}
                      className="w-full flex items-center gap-2 text-gray-400 hover:text-gray-200 px-3 py-2 rounded text-sm hover:bg-[#3c3c3c] transition-colors"
                    >
                      <span className="material-icons text-[18px]">add</span>
                      Add Page
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PagesSidebar;
