'use client';

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { Component } from '@/types/builder';
import { setSelectedComponent, moveElement, updateElementSize } from '@/store/builderSlice';
import { RootState } from '@/store/store';
import ComponentToolbar from './ComponentToolbar';
import ResizeHandle from './ResizeHandle';

interface BuilderComponentProps {
  component: Component;
}

const BuilderComponent: React.FC<BuilderComponentProps> = ({ component }) => {
  const dispatch = useDispatch();
  const selectedComponent = useSelector((state: RootState) => state.builder.selectedComponent);
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'placed-component',
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !isResizing,
  }), [component.id, component.type, isResizing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedComponent(component.id));
  };

  const handleResize = (direction: string, deltaX: number, deltaY: number) => {
    const currentStyles = component.styles || {};
    const currentWidth = parseInt(currentStyles.width || '100', 10);
    const currentHeight = parseInt(currentStyles.height || '40', 10);
    
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    let newX = component.position?.x || 0;
    let newY = component.position?.y || 0;

    switch (direction) {
      case 'right':
        newWidth = Math.max(100, currentWidth + deltaX * 2);
        newX += (newWidth - currentWidth) / 2;
        break;
      case 'left':
        newWidth = Math.max(100, currentWidth - deltaX * 2);
        newX -= (newWidth - currentWidth) / 2;
        break;
      case 'bottom':
        newHeight = Math.max(40, currentHeight + deltaY * 2);
        newY += (newHeight - currentHeight) / 2;
        break;
      case 'top':
        newHeight = Math.max(40, currentHeight - deltaY * 2);
        newY -= (newHeight - currentHeight) / 2;
        break;
    }

    dispatch(updateElementSize({ 
      id: component.id, 
      size: { width: newWidth, height: newHeight }
    }));

    dispatch(moveElement({
      id: component.id,
      position: { x: newX, y: newY }
    }));
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'main':
        return (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setSelectedComponent(component.id));
            }}
            className={`${
              selectedComponent === component.id 
                ? 'border-2 border-blue-500' 
                : 'hover:border-2 hover:border-blue-200'
            }`}
          >
            {/* Component Type Tooltip */}
            {selectedComponent === component.id && (
              <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-br z-50 whitespace-nowrap">
                Main Container
              </div>
            )}

            <main style={component.styles}>
              {component.children?.map((child) => (
                <BuilderComponent key={child.id} component={child} />
              ))}
            </main>
          </div>
        );
      
      case 'section':
        return (
          <section style={component.styles} className="min-h-[100px] rounded-lg border border-slate-200">
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </section>
        );

      case 'div':
        return (
          <div style={component.styles} className="min-h-[100px] rounded-lg border border-slate-200">
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </div>
        );

      // Typography components
      case 'h1': return <h1 style={component.styles}>{component.content}</h1>;
      case 'h2': return <h2 style={component.styles}>{component.content}</h2>;
      case 'h3': return <h3 style={component.styles}>{component.content}</h3>;
      case 'h4': return <h4 style={component.styles}>{component.content}</h4>;
      case 'h5': return <h5 style={component.styles}>{component.content}</h5>;
      case 'h6': return <h6 style={component.styles}>{component.content}</h6>;
      case 'p': return <p style={component.styles}>{component.content}</p>;
      case 'a': return <a href={component.content} style={component.styles}>{component.content}</a>;
      case 'text': return <span style={component.styles}>{component.content}</span>;
      case 'blockquote': return <blockquote style={component.styles}>{component.content}</blockquote>;
      case 'rich-text': return <div style={component.styles} dangerouslySetInnerHTML={{ __html: component.content || '' }} />;

      // List components
      case 'list': return (
        <ul style={component.styles} className="list-disc list-inside">
          {component.children?.map((child) => (
            <BuilderComponent key={child.id} component={child} />
          ))}
        </ul>
      );
      case 'list-item': return <li style={component.styles}>{component.content}</li>;

      // Form components
      case 'form': return (
        <form style={component.styles} className="space-y-4">
          {component.children?.map((child) => (
            <BuilderComponent key={child.id} component={child} />
          ))}
        </form>
      );
      case 'input': return <input type="text" style={component.styles} placeholder={component.content} className="border rounded px-3 py-2" />;
      case 'textarea': return <textarea style={component.styles} placeholder={component.content} className="border rounded px-3 py-2" />;
      case 'label': return <label style={component.styles}>{component.content}</label>;
      case 'button': return <button style={component.styles} className="px-4 py-2 rounded bg-blue-500 text-white">{component.content}</button>;
      case 'checkbox': return <input type="checkbox" style={component.styles} />;
      case 'radio': return <input type="radio" style={component.styles} />;
      case 'select': return <select style={component.styles} className="border rounded px-3 py-2" />;
      case 'file': return <input type="file" style={component.styles} />;
      case 'form-button': return <button type="submit" style={component.styles} className="px-4 py-2 rounded bg-blue-500 text-white">{component.content}</button>;

      // Media components
      case 'image': return <img src={component.src} alt={component.content} style={component.styles} className="rounded-lg" />;
      case 'video': return <video src={component.src} controls style={component.styles} className="rounded-lg" />;
      case 'youtube': return (
        <iframe 
          src={component.src} 
          style={component.styles}
          className="rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );

      default:
        return (
          <div style={component.styles}>
            {component.content || `Unknown component type: ${component.type}`}
          </div>
        );
    }
  };

  if (component.type === 'main') {
    return renderComponent();
  }

  return (
    <div
      //@ts-ignore
      ref={dragRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: component.position?.x || 0,
        top: component.position?.y || 0,
        width: component.styles?.width || '100px',
        height: component.styles?.height || '40px',
        transform: 'translate(-50%, -50%)',
        opacity: isDragging ? 0.5 : 1,
        cursor: isResizing ? 'auto' : 'move',
        transition: isResizing ? 'none' : 'all 0.1s ease-out',
        touchAction: 'none',
      }}
      className={`
        group relative
        ${selectedComponent === component.id 
          ? 'border-2 border-blue-500' 
          : 'hover:border-2 hover:border-blue-200'}
        transition-all duration-200
      `}
    >
      {/* Component Type Tooltip */}
      {selectedComponent === component.id && (
        <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-br z-50 whitespace-nowrap">
          {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
        </div>
      )}

      {renderComponent()}
      
      {selectedComponent === component.id && !isDragging && (
        <>
          <ComponentToolbar component={component} />
          <ResizeHandle 
            position="top"
            onResize={(_, dy) => handleResize('top', 0, dy)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle 
            position="right"
            onResize={(dx) => handleResize('right', dx, 0)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle 
            position="bottom"
            onResize={(_, dy) => handleResize('bottom', 0, dy)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle 
            position="left"
            onResize={(dx) => handleResize('left', dx, 0)}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
        </>
      )}
    </div>
  );
};

export default BuilderComponent; 

// const BuilderElement: React.FC<BuilderElementProps> = ({ id, type, position, isSelected, bodyBounds }) => {
//   const dispatch = useDispatch();
//   const [size, setSize] = useState({ width: 100, height: 40 });
//   const [isResizing, setIsResizing] = useState(false);

//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: 'placed-element',
//     item: { id, type },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//     canDrag: () => !isResizing,
//   }), [id, position, isResizing]);

//   const constrainToBody = (x: number, y: number) => {
//     const halfWidth = size.width / 2;
//     const halfHeight = size.height / 2;

//     return {
//       x: Math.max(bodyBounds.left + halfWidth, Math.min(x, bodyBounds.right - halfWidth)),
//       y: Math.max(bodyBounds.top + halfHeight, Math.min(y, bodyBounds.bottom - halfHeight))
//     };
//   };

//   const handleResize = (direction: string, deltaX: number, deltaY: number) => {
//     const newSize = { ...size };
//     let newPosition = { ...position };
    
//     switch (direction) {
//       case 'right':
//         const newRightWidth = Math.max(100, size.width + deltaX * 2);
//         const rightDelta = newRightWidth - size.width;
//         newSize.width = newRightWidth;
//         newPosition.x += rightDelta/2;
//         break;
//       case 'left':
//         const newWidth = Math.max(100, size.width - deltaX * 2);
//         const widthDelta = newWidth - size.width;
//         newSize.width = newWidth;
//         newPosition.x -= widthDelta/2;
//         break;
//       case 'bottom':
//         const newBottomHeight = Math.max(40, size.height + deltaY * 2);
//         const bottomDelta = newBottomHeight - size.height;
//         newSize.height = newBottomHeight;
//         newPosition.y += bottomDelta/2;
//         break;
//       case 'top':
//         const newHeight = Math.max(40, size.height - deltaY * 2);
//         const heightDelta = newHeight - size.height;
//         newSize.height = newHeight;
//         newPosition.y -= heightDelta/2;
//         break;
//     }

//     // Constrain position after resize
//     newPosition = constrainToBody(newPosition.x, newPosition.y);

//     setSize(newSize);
//     dispatch(updateElementSize({ id, size: newSize }));
//     dispatch(moveElement({ id, position: newPosition }));
//   };

//   const getElementContent = () => {
//     switch (type) {
//       case 'div':
//         return <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300" />;
//       case 'text':
//         return <div className="absolute inset-0 flex items-center px-2">
//           <p className="text-gray-600 w-full h-full">Text Block</p>
//         </div>;
//       case 'link':
//         return <div className="absolute inset-0 flex items-center px-2">
//           <a href="#" className="text-blue-500 hover:underline w-full h-full">Link</a>
//         </div>;
//       case 'input':
//         return <div className="absolute inset-0 flex items-center p-2">
//           <input 
//             type="text" 
//             className="w-full h-full border border-gray-300 rounded px-2" 
//             placeholder="Input" 
//           />
//         </div>;
//       case 'button':
//         return <div className="absolute inset-0 flex items-center justify-center">
//           <button className="bg-blue-500 text-white px-4 py-2 rounded w-full h-full">Button</button>
//         </div>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div
//       ref={drag}
//       className={`absolute ${
//         isResizing ? 'cursor-auto' : 'cursor-move'
//       }`}
//       style={{
//         left: position.x,
//         top: position.y,
//         width: size.width,
//         height: size.height,
//         transform: 'translate(-50%, -50%)',
//         transition: isResizing ? 'none' : 'all 0.1s ease-out',
//         touchAction: 'none',
//         opacity: isDragging ? 1 : 1,
//         outline: isSelected ? '1px solid black' : 'none',
//         backgroundColor: isDragging ? '#e5e7eb' : 'transparent',
//         border: isDragging ? '1px solid #9ca3af' : 'none',
//         pointerEvents: isDragging ? 'none' : 'auto'
//       }}
//       onClick={(e) => {
//         e.stopPropagation();
//         dispatch(selectElement(id));
//       }}
//     >
//       {getElementContent()}
//       {isSelected && !isDragging && (
//         <>
//           <ResizeHandle 
//             position="top" 
//             onResize={(_, dy) => handleResize('top', 0, dy)}
//             onResizeStart={() => setIsResizing(true)}
//             onResizeEnd={() => setIsResizing(false)}
//           />
//           <ResizeHandle 
//             position="right" 
//             onResize={(dx) => handleResize('right', dx, 0)}
//             onResizeStart={() => setIsResizing(true)}
//             onResizeEnd={() => setIsResizing(false)}
//           />
//           <ResizeHandle 
//             position="bottom" 
//             onResize={(_, dy) => handleResize('bottom', 0, dy)}
//             onResizeStart={() => setIsResizing(true)}
//             onResizeEnd={() => setIsResizing(false)}
//           />
//           <ResizeHandle 
//             position="left" 
//             onResize={(dx) => handleResize('left', dx, 0)}
//             onResizeStart={() => setIsResizing(true)}
//             onResizeEnd={() => setIsResizing(false)}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default BuilderElement; 