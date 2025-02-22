"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPage, deletePage, setSelectedPage } from "@/store/pagesSlice";
import type { RootState } from "@/store/store";

interface PagesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Page {
  id: string;
  name: string;
  path: string;
  isHome?: boolean;
}

const SAMPLE_PAGES: Page[] = [
  { id: "1", name: "Home", path: "/", isHome: true },
];

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
          {page.isHome ? "home" : "description"}
        </span>
        {page.name}
      </div>
      {!page.isHome && onDelete && (
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
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");

  const handleAddPage = () => {
    if (!newPageName.trim()) return;
    dispatch(addPage({ name: newPageName.trim() }));
    setIsAddingPage(false);
    setNewPageName("");
  };

  const handleDeletePage = (pageId: string) => {
    dispatch(deletePage(pageId));
  };

  const handleSelectPage = (pageId: string) => {
    dispatch(setSelectedPage(pageId));
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
                    onDelete={!page.isHome
                      ? () => handleDeletePage(page.id)
                      : undefined}
                  />
                ))}
              </div>

              {/* Add Page Form */}
              {isAddingPage
                ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddPage();
                    }}
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
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddingPage(false)}
                        className="p-1 text-gray-400 hover:text-gray-300 hover:bg-[#2c2c2c]"
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
