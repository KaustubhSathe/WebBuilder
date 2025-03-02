"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Link from "next/link";

interface ProjectDropdownProps {
  onSave?: () => void;
  onExportCode?: () => void;
  onSiteSettings?: () => void;
  onKeyboardShortcuts?: () => void;
  onCssPreview?: () => void;
}

const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
  onSave,
  onExportCode,
  onSiteSettings,
  onKeyboardShortcuts,
  onCssPreview,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const project = useSelector((state: RootState) => state.project.currentProject);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-gray-200 hover:bg-[#2c2c2c] rounded transition-colors"
      >
        <span className="text-sm font-medium truncate max-w-[150px]">
          {project?.name || "Untitled Project"}
        </span>
        <span className="material-icons text-[18px]">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-[#2c2c2c] rounded shadow-lg z-50">
          <div className="py-1">
            {/* Dashboard Option */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#3c3c3c] w-full text-left"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-icons text-[18px]">dashboard</span>
              Dashboard
            </Link>
            
            {/* Site Settings Option */}
            <button
              onClick={() => {
                if (onSiteSettings) onSiteSettings();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#3c3c3c] w-full text-left"
            >
              <span className="material-icons text-[18px]">settings</span>
              Site Settings
            </button>
            
            {/* Save Project Option */}
            {onSave && (
              <button
                onClick={() => {
                  onSave();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#3c3c3c] w-full text-left"
              >
                <span className="material-icons text-[18px]">save</span>
                Save Project
              </button>
            )}
            
            {/* Export Code Option */}
            <button
              onClick={() => {
                if (onExportCode) onExportCode();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#3c3c3c] w-full text-left"
            >
              <span className="material-icons text-[18px]">code</span>
              Export Code
            </button>
            
            {/* Keyboard Shortcuts Option */}
            <button
              onClick={() => {
                if (onKeyboardShortcuts) onKeyboardShortcuts();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#3c3c3c] w-full text-left"
            >
              <span className="material-icons text-[18px]">keyboard</span>
              Keyboard Shortcuts
            </button>
            
            {/* CSS Preview Option */}
            <button
              onClick={() => {
                if (onCssPreview) onCssPreview();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#3c3c3c] w-full text-left"
            >
              <span className="material-icons text-[18px]">style</span>
              CSS Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDropdown; 