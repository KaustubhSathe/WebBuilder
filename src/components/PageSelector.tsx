'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedPage } from '@/store/pagesSlice';
import type { RootState } from '@/store/store';

const PageSelector = () => {
  const dispatch = useDispatch();
  const pages = useSelector((state: RootState) => state.pages.pages);
  const selectedPageId = useSelector((state: RootState) => state.pages.selectedPageId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedPage = pages?.find(page => page.id === selectedPageId);

  if (!pages || pages.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-1 rounded hover:bg-[#3c3c3c] cursor-pointer group"
      >
        <span className="material-icons text-[18px] text-gray-400 group-hover:text-gray-200">
          {selectedPage?.isHome ? 'home' : 'description'}
        </span>
        <span className="text-sm text-gray-400 group-hover:text-gray-200">
          {selectedPage?.name}
        </span>
        <span className={`material-icons text-[16px] text-gray-400 group-hover:text-gray-200 transition-transform ${
          isDropdownOpen ? 'rotate-180' : ''
        }`}>
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-20"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 w-48 bg-[#2c2c2c] border border-[#3c3c3c] rounded shadow-lg z-30">
            <div className="py-1">
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => {
                    dispatch(setSelectedPage(page.id));
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                    selectedPageId === page.id
                      ? 'bg-[#3c3c3c] text-gray-200'
                      : 'text-gray-400 hover:bg-[#3c3c3c] hover:text-gray-200'
                  }`}
                >
                  <span className="material-icons text-[18px]">
                    {page.isHome ? 'home' : 'description'}
                  </span>
                  {page.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PageSelector; 