import React from 'react';
import { useDispatch } from 'react-redux';
import { Component } from '../types/builder';
import { updateComponent, deleteComponent } from '../store/builderSlice';

const ComponentToolbar: React.FC<{ component: Component }> = ({ component }) => {
  const dispatch = useDispatch();

  const handleStyleChange = (property: string, value: string) => {
    dispatch(updateComponent({
      id: component.id,
      updates: {
        styles: { ...component.styles, [property]: value },
      },
    }));
  };

  const handleContentChange = (content: string) => {
    dispatch(updateComponent({
      id: component.id,
      updates: { content },
    }));
  };

  return (
    <div className="absolute -top-8 left-0 bg-[#2c2c2c] rounded flex items-center z-50 text-gray-200 text-sm">
      <div className="flex items-center border-r border-[#3c3c3c]">
        <button className="p-1.5 hover:bg-[#3c3c3c]">
          <span className="text-sm">↕</span>
        </button>
      </div>
      <div className="flex items-center px-2 gap-2">
        {component.type === 'text' && (
          <>
            <input
              type="text"
              value={component.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="bg-[#1a1a1a] border border-[#3c3c3c] rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 w-40"
            />
            <select
              value={component.styles?.fontSize || '16px'}
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              className="bg-[#1a1a1a] border border-[#3c3c3c] rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
            >
              {['12px', '14px', '16px', '18px', '20px', '24px'].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </>
        )}
        <input
          type="color"
          value={component.styles?.backgroundColor || '#ffffff'}
          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
          className="w-6 h-6 rounded bg-[#1a1a1a] border border-[#3c3c3c]"
          title="Background Color"
        />
        <button
          onClick={() => dispatch(deleteComponent(component.id))}
          className="p-1.5 hover:bg-[#3c3c3c] text-red-400 hover:text-red-300"
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ComponentToolbar; 