'use client';

import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-gray-400 uppercase">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={handleColorChange}
          className="w-8 h-8 rounded cursor-pointer bg-[#1a1a1a] border border-[#3c3c3c]"
        />
        <input 
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="None"
          className="flex-1 bg-[#1a1a1a] text-gray-300 text-xs rounded border border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default ColorPicker;