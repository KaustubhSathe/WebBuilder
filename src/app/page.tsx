'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { store } from '../store/store';

function BuilderCanvas() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Top Navigation */}
      <nav className="h-[35px] bg-[#2c2c2c] border-b border-[#3c3c3c] flex items-center">
        {/* Menu Button */}
        <button 
          className="w-10 h-[35px] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors border-r border-[#3c3c3c]"
          title="Menu"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M2 4H14M2 8H14M2 12H14" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Preview Button */}
        <button 
          className="w-10 h-[35px] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
          title="Preview"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M4 3L12 8L4 13V3Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Current Page Indicator */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded hover:bg-[#3c3c3c] cursor-pointer group">
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400 group-hover:text-gray-200"
            >
              <path 
                d="M3 2C3 1.44772 3.44772 1 4 1H10L13 4V14C13 14.5523 12.5523 15 12 15H4C3.44772 15 3 14.5523 3 14V2Z" 
                stroke="currentColor" 
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path 
                d="M10 1V4H13" 
                stroke="currentColor" 
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-gray-400 group-hover:text-gray-200">Home</span>
            <svg 
              width="10" 
              height="10" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400 group-hover:text-gray-200"
            >
              <path 
                d="M4 6L8 10L12 6" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Empty space to balance the layout */}
        <div className="w-20"></div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-10 bg-[#2c2c2c] border-r border-[#3c3c3c] min-h-[calc(100vh-35px)]">
          {/* Add Elements Button */}
          <button 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
            title="Add Elements"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M8 3V13M3 8H13" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Pages Button */}
          <button 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
            title="Pages"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M4 1.5H12C12.8284 1.5 13.5 2.17157 13.5 3V13C13.5 13.8284 12.8284 14.5 12 14.5H4C3.17157 14.5 2.5 13.8284 2.5 13V3C2.5 2.17157 3.17157 1.5 4 1.5Z" 
                stroke="currentColor" 
                strokeWidth="1.5"
              />
              <path 
                d="M5 5H11M5 8H11M5 11H9" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Navigator Button */}
          <button 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
            title="Navigator"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 4H14M5 8H14M8 12H14" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
              <circle 
                cx="3.5" 
                cy="8" 
                r="0.5" 
                fill="currentColor"
              />
              <circle 
                cx="6.5" 
                cy="12" 
                r="0.5" 
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Components Button */}
          <button 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
            title="Saved Components"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M8 2L14 5V11L8 14L2 11V5L8 2Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinejoin="round"
              />
              <path 
                d="M8 14V8M8 8L14 5M8 8L2 5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#1a1a1a] p-8">
          <div className="w-full h-[calc(100vh-83px)] bg-white rounded">
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-60 bg-[#2c2c2c] border-l border-[#3c3c3c]">
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <BuilderCanvas />
      </DndProvider>
    </Provider>
  );
}
