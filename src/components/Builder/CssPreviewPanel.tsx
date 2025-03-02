"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";
import { generateCSS, getAllCSS } from "@/utils/previewGenerator";

interface CssPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CssPreviewPanel: React.FC<CssPreviewPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const selectedComponent = useSelector(
    (state: RootState) => state.builder.selectedComponent
  );
  
  const [position, setPosition] = useState({ x: window.innerWidth - 270, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cssCode, setCssCode] = useState("");
  
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Update CSS code when selected component changes
  useEffect(() => {
    if (selectedComponent) {
        setCssCode(generateCSS(selectedComponent));
    } else {
      // If no component is selected, show empty CSS
      setCssCode("");
    }
  }, [selectedComponent]);
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={panelRef}
      className="fixed bg-[#242424] rounded-lg shadow-lg z-[9000]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "250px",
        height: "400px",
        cursor: isDragging ? "grabbing" : "auto",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div 
        className="flex h-[15%] items-center justify-between p-3 border-b border-[#3c3c3c] bg-[#2c2c2c] rounded-t-lg cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center">
          <span className="material-icons text-gray-400 mr-1 text-sm">css</span>
        </div>
        <div className="flex items-center">
          {cssCode && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(cssCode);
                toast.success('CSS copied to clipboard');
              }}
              className="text-gray-400 hover:text-white mr-2"
              title="Copy CSS"
            >
              <span className="material-icons text-sm">content_copy</span>
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            title="Close"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      </div>
      
      <div className="p-3 flex items-center justify-center h-[85%]" >
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1a1a1a;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a4a4a;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #5a5a5a;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4a4a4a #1a1a1a;
          }
        `}</style>
        {cssCode ? (
            <pre className="text-gray-300 text-xs text-center bg-[#1a1a1a] rounded-lg w-full h-full overflow-auto  custom-scrollbar">
              {cssCode}
            </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            <div className="text-center">
              <span className="material-icons mb-2 text-2xl">touch_app</span>
              <p>Select a component to view its CSS</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CssPreviewPanel; 