"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onSave: (settings: {
    title: string;
    description: string;
    favicon?: File;
  }) => void;
}

const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({
  isOpen,
  onClose,
  projectName,
  onSave,
}) => {
  const [title, setTitle] = useState(projectName);
  const [description, setDescription] = useState("");
  const [favicon, setFavicon] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFavicon(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setFaviconPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      title,
      description,
      ...(favicon && { favicon }),
    });
    
    toast.success("Site settings saved successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div 
        className="bg-[#242424] rounded-lg shadow-lg w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto"
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
          <h2 className="text-lg font-medium text-white">Site Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Site Title
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3c3c3c] rounded text-white"
                placeholder="My Awesome Website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Favicon
              </label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#1a1a1a] border border-[#3c3c3c] rounded flex items-center justify-center overflow-hidden">
                  {faviconPreview ? (
                    <img 
                      src={faviconPreview} 
                      alt="Favicon preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-icons text-gray-400">image</span>
                  )}
                </div>
                <label className="px-3 py-1 bg-blue-500 text-white rounded text-sm cursor-pointer hover:bg-blue-600 transition-colors">
                  Upload
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleFaviconChange}
                  />
                </label>
                {favicon && (
                  <button 
                    onClick={() => {
                      setFavicon(null);
                      setFaviconPreview(null);
                    }}
                    className="px-2 py-1 bg-[#3c3c3c] text-white rounded text-sm hover:bg-[#4c4c4c] transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Recommended size: 32x32 pixels (PNG, ICO, or SVG)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Meta Description
              </label>
              <textarea 
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3c3c3c] rounded text-white h-20"
                placeholder="A brief description of your website"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <p className="text-xs text-gray-400 mt-1">
                Keep it under 160 characters for optimal SEO
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Additional Settings
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="enableAnalytics"
                    className="mr-2"
                  />
                  <label htmlFor="enableAnalytics" className="text-gray-300 text-sm">
                    Enable Analytics
                  </label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="enableSEO"
                    className="mr-2"
                  />
                  <label htmlFor="enableSEO" className="text-gray-300 text-sm">
                    Enable SEO Optimization
                  </label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="enableSocialMeta"
                    className="mr-2"
                  />
                  <label htmlFor="enableSocialMeta" className="text-gray-300 text-sm">
                    Enable Social Media Meta Tags
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-[#3c3c3c] sticky bottom-0 bg-[#242424] z-10">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#3c3c3c] text-white rounded mr-2 hover:bg-[#4c4c4c] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsModal; 