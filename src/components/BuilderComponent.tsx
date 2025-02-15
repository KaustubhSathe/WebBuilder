import React from 'react';
import { useDrag } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { Component } from '../types/builder';
import { selectComponent, moveComponent } from '../store/builderSlice';
import { RootState } from '../store/store';
import ComponentToolbar from './ComponentToolbar';

const BuilderComponent: React.FC<{ component: Component }> = ({ component }) => {
  const dispatch = useDispatch();
  const selectedComponent = useSelector((state: RootState) => state.builder.selectedComponent);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [component.id, component.type]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectComponent(component.id));
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'text':
        return (
          <p style={component.styles} className="min-w-[100px] min-h-[24px]">
            {component.content}
          </p>
        );
      case 'image':
        return (
          <img 
            src={component.src} 
            alt={component.content} 
            style={component.styles}
            className="rounded-lg shadow-sm" 
          />
        );
      case 'button':
        return (
          <button 
            style={component.styles}
            className="px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {component.content}
          </button>
        );
      case 'container':
        return (
          <div 
            style={component.styles} 
            className="min-h-[120px] min-w-[120px] rounded-lg border border-slate-200"
          >
            {component.children?.map((child) => (
              <BuilderComponent key={child.id} component={child} />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: component.position?.x || 0,
        top: component.position?.y || 0,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        backgroundColor: component.styles?.backgroundColor || 'white',
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
      {selectedComponent === component.id && <ComponentToolbar component={component} />}
    </div>
  );
};

export default BuilderComponent; 