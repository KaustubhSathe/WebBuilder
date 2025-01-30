'use client';

import React from 'react';

interface ElementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ElementsDrawer: React.FC<ElementsDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <div 
      className={`absolute top-[35px] left-10 h-[calc(100%-35px)] bg-[#2c2c2c] border-r border-[#3c3c3c] transition-all duration-300 z-10 overflow-hidden ${
        isOpen ? 'w-[240px]' : 'w-0'
      }`}
    >
      {isOpen && (
        <div className="p-4 w-[240px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-200 text-sm font-medium">Elements</span>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span className="material-icons text-[18px]">close</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Elements */}
            <div>
              <div className="text-gray-400 text-xs uppercase mb-2">Basic</div>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] rounded text-sm transition-colors">
                  <span className="inline-block w-6 text-center mr-2">⬜</span>
                  Div Block
                </button>
                <button className="w-full text-left px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] rounded text-sm transition-colors">
                  <span className="inline-block w-6 text-center mr-2">T</span>
                  Text Block
                </button>
                <button className="w-full text-left px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] rounded text-sm transition-colors">
                  <span className="inline-block w-6 text-center mr-2">🔗</span>
                  Link
                </button>
              </div>
            </div>

            {/* Form Elements */}
            <div>
              <div className="text-gray-400 text-xs uppercase mb-2">Form</div>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] rounded text-sm transition-colors">
                  <span className="inline-block w-6 text-center mr-2">⌨️</span>
                  Input
                </button>
                <button className="w-full text-left px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] rounded text-sm transition-colors">
                  <span className="inline-block w-6 text-center mr-2">☐</span>
                  Button
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementsDrawer; 