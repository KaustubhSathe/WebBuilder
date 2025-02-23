'use client';

import React from 'react';
import Select from './Select';

interface NumberUnitInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const UNIT_OPTIONS = [
  { value: 'px', label: 'px' },
  { value: 'em', label: 'em' },
  { value: 'rem', label: 'rem' },
  { value: '%', label: '%' },
  { value: 'auto', label: 'auto' },
  { value: 'inherit', label: 'inherit' },
];

const NumberUnitInput: React.FC<NumberUnitInputProps> = ({ label, value, onChange }) => {
  const parseValue = (val: string) => {
    if (!val || val === 'auto') return { number: '', unit: 'auto' };
    const number = parseFloat(val);
    const unit = val.replace(number.toString(), '');
    return { number: number.toString(), unit: unit || 'px' };
  };

  const { number, unit } = parseValue(value);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (unit === 'auto') return;
    const newValue = e.target.value + unit;
    onChange(newValue);
  };

  const handleUnitChange = (newUnit: string) => {
    if (newUnit === 'auto') {
      onChange('auto');
    } else {
      onChange(number + newUnit);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-gray-400 uppercase">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={number}
          onChange={handleNumberChange}
          disabled={unit === 'auto'}
          className={`w-20 bg-[#1a1a1a] text-gray-300 text-xs rounded border border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500 ${
            unit === 'auto' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <Select
          label=""
          value={unit}
          options={UNIT_OPTIONS}
          onChange={handleUnitChange}
          className="w-20"
        />
      </div>
    </div>
  );
};

export default NumberUnitInput; 