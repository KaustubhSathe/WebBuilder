'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Component } from '@/types/builder';
import { updateComponent } from '@/store/builderSlice';
import Select from './StyleControls/Select';
import ColorPicker from './StyleControls/ColorPicker';
import NumberUnitInput from './StyleControls/NumberUnitInput';

const COMPONENT_LABELS: Record<string, string> = {
  main: 'Main Container',
  section: 'Section',
  div: 'Container',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  p: 'Paragraph',
  a: 'Link',
  text: 'Text',
  blockquote: 'Quote',
  'rich-text': 'Rich Text',
  list: 'List',
  'list-item': 'List Item',
  form: 'Form',
  input: 'Input',
  textarea: 'Text Area',
  label: 'Label',
  button: 'Button',
  checkbox: 'Checkbox',
  radio: 'Radio',
  select: 'Select',
  file: 'File Upload',
  'form-button': 'Form Button',
  image: 'Image',
  video: 'Video',
  youtube: 'YouTube',
};

interface StyleCategoryProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const StyleCategory: React.FC<StyleCategoryProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border-b border-[#3c3c3c] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-300 hover:text-gray-200"
      >
        {title}
        <span className={`material-icons text-[16px] transition-transform ${isOpen ? '' : '-rotate-90'}`}>
          expand_more
        </span>
      </button>
      {isOpen && (
        <div className="px-2 pb-3 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};

const DISPLAY_OPTIONS = [
  { value: 'block', label: 'Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
  { value: 'inline-block', label: 'Inline Block' },
  { value: 'inline-flex', label: 'Inline Flex' },
  { value: 'inline-grid', label: 'Inline Grid' },
  { value: 'none', label: 'None' },
];

const OVERFLOW_OPTIONS = [
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'clip', label: 'Clip' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'auto', label: 'Auto' },
];

const POSITION_OPTIONS = [
  { value: 'static', label: 'Static' },
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' },
];

const FLOAT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'inherit', label: 'Inherit' },
];

const CLEAR_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'both', label: 'Both' },
];

const StyleEditor: React.FC = () => {
  const dispatch = useDispatch();
  const [openCategories, setOpenCategories] = useState({
    layout: true,
    spacing: false,
    size: false,
    position: false,
    typography: false,
    background: false,
    border: false,
  });

  const toggleCategory = (category: keyof typeof openCategories) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectedComponent = useSelector((state: RootState) => {
    const selectedId = state.builder.selectedComponent;
    if (!selectedId) return null;

    const findComponent = (component: Component): Component | null => {
      if (component.id === selectedId) return component;
      for (const child of component.children) {
        const found = findComponent(child);
        if (found) return found;
      }
      return null;
    };

    return findComponent(state.builder.component);
  });

  const handleStyleChange = (property: string, value: string) => {
    if (!selectedComponent) return;
    
    dispatch(updateComponent({
      id: selectedComponent.id,
      updates: {
        styles: {
          ...selectedComponent.styles,
          [property]: value
        }
      }
    }));
  };

  if (!selectedComponent) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        No element selected
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Component Type Indicator */}
      <div className="px-3 py-2 border-b border-[#3c3c3c] flex items-center gap-1.5 flex-shrink-0">
        <div className="w-6 h-6 bg-[#3c3c3c] rounded flex items-center justify-center">
          <span className="material-icons text-[16px] text-gray-300">
            {selectedComponent.type === 'image' ? 'image' : 
             selectedComponent.type === 'video' ? 'videocam' :
             selectedComponent.type === 'youtube' ? 'play_circle' :
             selectedComponent.type.startsWith('h') ? 'title' :
             selectedComponent.type === 'p' ? 'text_fields' :
             selectedComponent.type === 'a' ? 'link' :
             selectedComponent.type === 'button' ? 'smart_button' :
             selectedComponent.type === 'form' ? 'dynamic_form' :
             'widgets'}
          </span>
        </div>
        <div>
          <div className="text-gray-300 text-xs">
            {COMPONENT_LABELS[selectedComponent.type] || selectedComponent.type}
          </div>
          <div className="text-gray-500 text-[10px]">
            {selectedComponent.id}
          </div>
        </div>
      </div>

      {/* Style Controls */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <div className="pb-6">
          <StyleCategory 
            title="LAYOUT"
            isOpen={openCategories.layout}
            onToggle={() => toggleCategory('layout')}
          >
            <div className="space-y-4">
              <Select
                label="Display"
                value={selectedComponent?.styles?.display || 'block'}
                options={DISPLAY_OPTIONS}
                onChange={(value) => handleStyleChange('display', value)}
              />
            </div>
          </StyleCategory>

          <StyleCategory 
            title="SPACING"
            isOpen={openCategories.spacing}
            onToggle={() => toggleCategory('spacing')}
          >
            <div className="space-y-4">
              <NumberUnitInput
                label="Margin"
                value={selectedComponent?.styles?.margin || ''}
                onChange={(value) => handleStyleChange('margin', value)}
              />
              <NumberUnitInput
                label="Padding"
                value={selectedComponent?.styles?.padding || ''}
                onChange={(value) => handleStyleChange('padding', value)}
              />
            </div>
          </StyleCategory>

          <StyleCategory 
            title="SIZE"
            isOpen={openCategories.size}
            onToggle={() => toggleCategory('size')}
          >
            <div className="space-y-4">
              <NumberUnitInput
                label="Width"
                value={selectedComponent?.styles?.width || ''}
                onChange={(value) => handleStyleChange('width', value)}
              />
              <NumberUnitInput
                label="Height"
                value={selectedComponent?.styles?.height || ''}
                onChange={(value) => handleStyleChange('height', value)}
              />
              <NumberUnitInput
                label="Min Width"
                value={selectedComponent?.styles?.minWidth || ''}
                onChange={(value) => handleStyleChange('minWidth', value)}
              />
              <NumberUnitInput
                label="Max Width"
                value={selectedComponent?.styles?.maxWidth || ''}
                onChange={(value) => handleStyleChange('maxWidth', value)}
              />
              <NumberUnitInput
                label="Min Height"
                value={selectedComponent?.styles?.minHeight || ''}
                onChange={(value) => handleStyleChange('minHeight', value)}
              />
              <NumberUnitInput
                label="Max Height"
                value={selectedComponent?.styles?.maxHeight || ''}
                onChange={(value) => handleStyleChange('maxHeight', value)}
              />
              <Select
                label="Overflow X"
                value={selectedComponent?.styles?.overflowX || 'visible'}
                options={OVERFLOW_OPTIONS}
                onChange={(value) => handleStyleChange('overflowX', value)}
              />
              <Select
                label="Overflow Y"
                value={selectedComponent?.styles?.overflowY || 'visible'}
                options={OVERFLOW_OPTIONS}
                onChange={(value) => handleStyleChange('overflowY', value)}
              />
            </div>
          </StyleCategory>

          <StyleCategory 
            title="POSITION"
            isOpen={openCategories.position}
            onToggle={() => toggleCategory('position')}
          >
            <div className="space-y-4">
              <Select
                label="Position"
                value={selectedComponent?.styles?.position || 'static'}
                options={POSITION_OPTIONS}
                onChange={(value) => handleStyleChange('position', value)}
              />
              <Select
                label="Float"
                value={selectedComponent?.styles?.float || 'none'}
                options={FLOAT_OPTIONS}
                onChange={(value) => handleStyleChange('float', value)}
              />
              <Select
                label="Clear"
                value={selectedComponent?.styles?.clear || 'none'}
                options={CLEAR_OPTIONS}
                onChange={(value) => handleStyleChange('clear', value)}
              />
            </div>
          </StyleCategory>

          <StyleCategory 
            title="TYPOGRAPHY"
            isOpen={openCategories.typography}
            onToggle={() => toggleCategory('typography')}
          >
            {/* Typography controls will go here */}
          </StyleCategory>

          <StyleCategory 
            title="BACKGROUND"
            isOpen={openCategories.background}
            onToggle={() => toggleCategory('background')}
          >
            <div className="space-y-4">
              <ColorPicker
                label="Color"
                value={selectedComponent?.styles?.backgroundColor || ''}
                onChange={(value) => handleStyleChange('backgroundColor', value)}
              />
            </div>
          </StyleCategory>

          <StyleCategory 
            title="BORDER"
            isOpen={openCategories.border}
            onToggle={() => toggleCategory('border')}
          >
            <div className="space-y-4">
              <NumberUnitInput
                label="Border Radius"
                value={selectedComponent?.styles?.borderRadius || ''}
                onChange={(value) => handleStyleChange('borderRadius', value)}
              />
              <NumberUnitInput
                label="Border Top Left Radius"
                value={selectedComponent?.styles?.borderTopLeftRadius || ''}
                onChange={(value) => handleStyleChange('borderTopLeftRadius', value)}
              />
              <NumberUnitInput
                label="Border Top Right Radius"
                value={selectedComponent?.styles?.borderTopRightRadius || ''}
                onChange={(value) => handleStyleChange('borderTopRightRadius', value)}
              />
              <NumberUnitInput
                label="Border Bottom Left Radius"
                value={selectedComponent?.styles?.borderBottomLeftRadius || ''}
                onChange={(value) => handleStyleChange('borderBottomLeftRadius', value)}
              />
              <NumberUnitInput
                label="Border Bottom Right Radius"
                value={selectedComponent?.styles?.borderBottomRightRadius || ''}
                onChange={(value) => handleStyleChange('borderBottomRightRadius', value)}
              />
            </div>
          </StyleCategory>
        </div>
      </div>
    </div>
  );
};

export default StyleEditor; 