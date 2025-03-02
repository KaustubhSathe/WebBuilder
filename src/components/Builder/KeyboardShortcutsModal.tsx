"use client";

import React from "react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  action: string;
  shortcut: string;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts: ShortcutItem[] = [
    { action: "Save Project", shortcut: "Ctrl + S" },
    { action: "Delete Component", shortcut: "Delete" },
    { action: "Duplicate Component", shortcut: "Ctrl + D" },
    { action: "Undo", shortcut: "Ctrl + Z" },
    { action: "Redo", shortcut: "Ctrl + Y" },
    { action: "Zoom In", shortcut: "Ctrl + +" },
    { action: "Zoom Out", shortcut: "Ctrl + -" },
    { action: "Select Parent Component", shortcut: "Esc" },
    { action: "Copy Component", shortcut: "Ctrl + C" },
    { action: "Cut Component", shortcut: "Ctrl + X" },
    { action: "Paste Component", shortcut: "Ctrl + V" },
    { action: "Group Components", shortcut: "Ctrl + G" },
    { action: "Ungroup Components", shortcut: "Ctrl + Shift + G" },
    { action: "Toggle Preview Mode", shortcut: "Ctrl + P" },
    { action: "Export Code", shortcut: "Ctrl + E" },
    { action: "Toggle Grid", shortcut: "Ctrl + '" },
    { action: "Toggle Rulers", shortcut: "Ctrl + R" },
    { action: "Toggle Sidebar", shortcut: "Ctrl + B" },
    { action: "Search Components", shortcut: "Ctrl + F" },
    { action: "New Project", shortcut: "Ctrl + N" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div 
        className="bg-[#242424] rounded-lg shadow-lg w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c] sticky top-0 bg-[#242424] z-10">
          <h2 className="text-lg font-medium text-white">Keyboard Shortcuts</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {shortcuts.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1 border-b border-[#3c3c3c] last:border-b-0">
                <span className="text-gray-300">{item.action}</span>
                <span className="text-gray-400 bg-[#1a1a1a] px-2 py-1 rounded text-sm font-mono">{item.shortcut}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-[#3c3c3c] sticky bottom-0 bg-[#242424] z-10">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal; 