'use client';

import React from 'react';
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

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [component.id, component.type]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedComponent(component.id));
  };

  const handleResize = (deltaX: number, deltaY: number) => {
    const currentStyles = component.styles || {};
    const currentWidth = parseInt(currentStyles.width || '0', 10);
    const currentHeight = parseInt(currentStyles.height || '0', 10);
    
    dispatch(updateElementSize({ 
      id: component.id, 
      size: {
        width: currentWidth + deltaX,
        height: currentHeight + deltaY
      }
    }));
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'main':
        return (
          <main style={component.styles} className="w-full h-full">
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </main>
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
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
      className={`
        rounded-lg
        ${selectedComponent === component.id 
          ? 'ring-2 ring-blue-400 shadow-lg' 
          : 'hover:ring-2 hover:ring-blue-200'}
        transition-all duration-200
      `}
    >
      {renderComponent()}
      {selectedComponent === component.id && (
        <>
          <ComponentToolbar component={component} />
          <ResizeHandle 
            position="right"
            onResize={handleResize}
            onResizeStart={() => {}}
            onResizeEnd={() => {}}
          />
        </>
      )}
    </div>
  );
};

export default BuilderComponent; 