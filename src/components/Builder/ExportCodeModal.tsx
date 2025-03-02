"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

const ExportCodeModal: React.FC<ExportCodeModalProps> = ({
  isOpen,
  onClose,
  projectName,
  htmlCode,
  cssCode,
  jsCode,
}) => {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [formattedCode, setFormattedCode] = useState<string>("");

  // Format the code when tab changes
  useEffect(() => {
    if (isOpen) {
      const code = activeTab === "html" ? htmlCode : activeTab === "css" ? cssCode : jsCode;
      setFormattedCode(formatCode(code, activeTab));
    }
  }, [activeTab, htmlCode, cssCode, jsCode, isOpen]);

  if (!isOpen) return null;

  // Format code with indentation and line breaks
  const formatCode = (code: string, type: "html" | "css" | "js"): string => {
    // Simple formatting - in a real app, you might use a library like prettier
    return code.trim();
  };

  const getCurrentCode = () => {
    switch (activeTab) {
      case "html":
        return htmlCode;
      case "css":
        return cssCode;
      case "js":
        return jsCode;
      default:
        return "";
    }
  };

  const getCurrentFileName = () => {
    switch (activeTab) {
      case "html":
        return "index.html";
      case "css":
        return "styles.css";
      case "js":
        return "script.js";
      default:
        return "";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    toast.success(`${activeTab.toUpperCase()} code copied to clipboard`);
  };

  const handleDownload = () => {
    const code = getCurrentCode();
    const filename = getCurrentFileName();
    
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${filename} downloaded`);
  };

  const handleDownloadAll = () => {
    // This would ideally use a library like JSZip to create a zip file
    // For now, we'll just download each file individually
    ["html", "css", "js"].forEach((tab) => {
      const code = tab === "html" ? htmlCode : tab === "css" ? cssCode : jsCode;
      const filename = tab === "html" ? "index.html" : tab === "css" ? "styles.css" : "script.js";
      
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    
    toast.success("All files downloaded");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[#242424] rounded-lg shadow-lg w-[800px] max-w-[90vw] h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <h2 className="text-lg font-medium text-white">Export Code - {projectName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-[#3c3c3c]">
          <button 
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "html" 
                ? "text-blue-400 border-b-2 border-blue-400" 
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("html")}
          >
            HTML
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "css" 
                ? "text-blue-400 border-b-2 border-blue-400" 
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("css")}
          >
            CSS
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "js" 
                ? "text-blue-400 border-b-2 border-blue-400" 
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("js")}
          >
            JavaScript
          </button>
        </div>
        
        {/* Code Content */}
        <div className="flex-1 overflow-auto bg-[#1a1a1a] p-4">
          <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap h-full overflow-auto">
            <code className={`language-${activeTab}`}>
              {formattedCode}
            </code>
          </pre>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center p-4 border-t border-[#3c3c3c]">
          <div className="text-sm text-gray-400 flex items-center">
            <span className="material-icons text-[18px] mr-2">
              {activeTab === "html" ? "html" : activeTab === "css" ? "css" : "javascript"}
            </span>
            {getCurrentFileName()}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#3c3c3c] text-white rounded text-sm flex items-center gap-1 hover:bg-[#4c4c4c] transition-colors"
            >
              <span className="material-icons text-[18px]">content_copy</span>
              Copy
            </button>
            <button 
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#3c3c3c] text-white rounded text-sm flex items-center gap-1 hover:bg-[#4c4c4c] transition-colors"
            >
              <span className="material-icons text-[18px]">download</span>
              Download
            </button>
            <button 
              onClick={handleDownloadAll}
              className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm flex items-center gap-1 hover:bg-blue-600 transition-colors"
            >
              <span className="material-icons text-[18px]">archive</span>
              Download All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportCodeModal; 