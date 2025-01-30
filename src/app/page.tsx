'use client';

import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import ZoomableCanvas from '../components/ZoomableCanvas';
import ElementsDrawer from '../components/ElementsDrawer';

function BuilderCanvas() {
  const [isElementsDrawerOpen, setIsElementsDrawerOpen] = useState(false);

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col">
      {/* Top Navigation */}
      <nav className="h-[35px] bg-[#2c2c2c] border-b border-[#3c3c3c] flex items-center">
        {/* Menu Button */}
        <button 
          className="w-10 h-[35px] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors border-r border-[#3c3c3c]"
          title="Menu"
        >
          <span className="material-icons text-[20px]">menu</span>
        </button>

        {/* Preview Button */}
        <button 
          className="w-10 h-[35px] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
          title="Preview"
        >
          <span className="material-icons text-[20px]">play_arrow</span>
        </button>

        {/* Current Page Indicator */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded hover:bg-[#3c3c3c] cursor-pointer group">
            <span className="material-icons text-[18px] text-gray-400 group-hover:text-gray-200">description</span>
            <span className="text-sm text-gray-400 group-hover:text-gray-200">Home</span>
            <span className="material-icons text-[16px] text-gray-400 group-hover:text-gray-200">expand_more</span>
          </div>
          <div className="flex items-center ml-2">
            <button 
              className="flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors px-2"
              title="Responsive"
            >
              <span className="material-icons text-[20px]">laptop</span>
            </button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center">
          {/* Changes Saved Indicator */}
          <button 
            className="flex items-center justify-center text-green-500 hover:text-green-400 transition-colors px-2"
            title="Changes Saved"
          >
            <span className="material-icons text-[20px]">check_circle</span>
          </button>

          {/* Comments */}
          <button 
            className="flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors px-2"
            title="Comments"
          >
            <span className="material-icons text-[20px]">comment</span>
          </button>

          {/* Share */}
          <button 
            className="flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors px-2"
            title="Share"
          >
            <span className="material-icons text-[20px]">share</span>
          </button>

          {/* Publish */}
          <button 
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors px-4 h-[26px] rounded ml-2 mr-3 text-sm"
            title="Publish"
          >
            Publish
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-35px)]">
        {/* Left Sidebar */}
        <div className="w-[5%] bg-[#2c2c2c] border-r border-[#3c3c3c]">
          {/* Add Elements Button */}
          <button 
            className={`w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors ${
              isElementsDrawerOpen ? 'bg-[#3c3c3c] text-gray-200' : ''
            }`}
            title="Add Elements"
            onClick={() => setIsElementsDrawerOpen(!isElementsDrawerOpen)}
          >
            <span className="material-icons text-[20px]">add</span>
          </button>

          {/* Pages Button */}
          <button 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
            title="Pages"
          >
            <span className="material-icons text-[20px]">article</span>
          </button>

          {/* Navigator Button */}
          <button 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
            title="Navigator"
          >
            <span className="material-icons text-[20px]">account_tree</span>
          </button>

          {/* Components Button */}
          <button 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
            title="Saved Components"
          >
            <span className="material-icons text-[20px]">widgets</span>
          </button>
        </div>

        {/* Elements Drawer */}
        <ElementsDrawer 
          isOpen={isElementsDrawerOpen} 
          onClose={() => setIsElementsDrawerOpen(false)} 
        />

        {/* Canvas */}
        <ZoomableCanvas>
          <div className="w-[55%] h-full bg-white rounded">
          </div>
        </ZoomableCanvas>

        {/* Right Sidebar */}
        <div className="w-[40%] bg-[#2c2c2c] border-l border-[#3c3c3c]">
          {/* Header */}
          <div className="h-[35px] border-b border-[#3c3c3c] flex items-center px-3 justify-between">
            <span className="text-gray-400 text-sm">No element selected</span>
            <button 
              className="flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
              title="Create Component"
            >
              <span className="material-icons text-[18px]">view_in_ar</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex h-[35px] border-b border-[#3c3c3c] px-2">
            <button className="flex-1 h-full flex items-center justify-center text-gray-200 text-sm border-b-2 border-blue-500 mx-1">
              Style
            </button>
            <button className="flex-1 h-full flex items-center justify-center text-gray-400 hover:text-gray-200 text-sm transition-colors mx-1">
              Settings
            </button>
            <button className="flex-1 h-full flex items-center justify-center text-gray-400 hover:text-gray-200 text-sm transition-colors mx-1">
              Interactions
            </button>
          </div>
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
