'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { ElementType, DraggableElement } from '../types/builder';

interface ElementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ELEMENTS: DraggableElement[] = [
  { type: 'div', label: 'Div Block', icon: '⬜' },
  { type: 'text', label: 'Text Block', icon: 'T' },
  { type: 'link', label: 'Link', icon: '🔗' },
  { type: 'input', label: 'Input', icon: '⌨️' },
  { type: 'button', label: 'Button', icon: '☐' },
];

const DraggableItem: React.FC<{ element: DraggableElement; onDragEnd: () => void }> = ({ element, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: element,
    end: () => onDragEnd(),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`w-full text-left px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] rounded text-sm transition-colors cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span className="inline-block w-6 text-center mr-2">{element.icon}</span>
      {element.label}
    </div>
  );
};

const ElementsDrawer: React.FC<ElementsDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
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
                  {ELEMENTS.slice(0, 3).map((element) => (
                    <DraggableItem key={element.type} element={element} onDragEnd={onClose} />
                  ))}
                </div>
              </div>

              {/* Form Elements */}
              <div>
                <div className="text-gray-400 text-xs uppercase mb-2">Form</div>
                <div className="space-y-1">
                  {ELEMENTS.slice(3).map((element) => (
                    <DraggableItem key={element.type} element={element} onDragEnd={onClose} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ElementsDrawer; 