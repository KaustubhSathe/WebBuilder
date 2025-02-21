"use client";

import React, { useCallback, useRef, useState } from "react";
import { useGesture } from "react-use-gesture";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { DraggableComponent } from "../types/builder";
import {
  addElement,
  moveElement,
  setSelectedComponent,
} from "../store/builderSlice";
import { RootState } from "../store/store";
import BuilderComponent from "./BuilderComponent";

interface ZoomableCanvasProps {
  children?: React.ReactNode;
}

const ZoomableCanvas: React.FC<ZoomableCanvasProps> = () => {
  const dispatch = useDispatch();
  const component = useSelector((state: RootState) => state.builder.component);
  console.log(component);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: ["component", "placed-component"],
    drop: (item: DraggableComponent & { id?: string }, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;

      const offset = monitor.getClientOffset();
      if (!offset || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Calculate position relative to canvas, accounting for zoom and scroll
      const x = (offset.x - canvasRect.left - position.x * zoom) / zoom;
      const y = (offset.y - canvasRect.top - position.y * zoom) / zoom;

      if (monitor.getItemType() === "component") {
        dispatch(addElement({
          parentId: component.id,
          type: item.type,
          position: { x, y },
        }));
      } else if (monitor.getItemType() === "placed-component" && item.id) {
        dispatch(moveElement({
          id: item.id,
          position: { x, y },
        }));
      }

      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const bind = useGesture(
    {
      onWheel: ({ event, delta: [_x, dy], ctrlKey }) => {
        if (ctrlKey || event.metaKey) {
          event.preventDefault();
          setZoom((z) => {
            const newZoom = z - dy * 0.005;
            return Math.min(Math.max(0.25, newZoom), 2);
          });
        }
      },
      onDragStart: ({ event }) => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setIsDragging(true);
        }
      },
      onDrag: ({ delta: [dx, dy], event }) => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setPosition((pos) => ({
            x: pos.x + dx / zoom,
            y: pos.y + dy / zoom,
          }));
        }
      },
      onDragEnd: () => {
        setIsDragging(false);
      },
    },
    {
      eventOptions: {
        passive: false,
      },
    },
  );

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.1, 0.25));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full bg-[#1a1a1a] p-8 overflow-hidden relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#2c2c2c] rounded px-2 py-1 z-10">
        <button
          onClick={handleZoomOut}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span className="material-icons text-[18px]">remove</span>
        </button>
        <button
          onClick={handleReset}
          className="text-gray-400 hover:text-gray-200 transition-colors px-2 text-sm"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span className="material-icons text-[18px]">add</span>
        </button>
      </div>

      <div
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        {...bind()}
        className={`zoomable-canvas w-full h-full bg-white rounded relative touch-none select-none
            ${isOver ? "bg-opacity-90" : ""}
            ${
          isDragging
            ? "cursor-grabbing"
            : isOver
            ? "cursor-grabbing"
            : "cursor-default"
        }`}
        style={{
          transform:
            `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: "center center",
          transition: "transform 0.1s ease-out",
        }}
        onClick={() => dispatch(setSelectedComponent(null))}
      >
        <div className="absolute inset-0 border-2 border-gray-300">
          <BuilderComponent component={component} />
        </div>
      </div>
    </div>
  );
};

export default ZoomableCanvas;

// const ZoomableCanvas: React.FC<ZoomableCanvasProps> = ({ children }) => {
//   const dispatch = useDispatch();
//   const elements = useSelector((state: RootState) => state.builder.elements);
//   const selectedElementId = useSelector((state: RootState) => state.builder.selectedElementId);

//   const [zoom, setZoom] = useState(1);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const canvasRef = useRef<HTMLDivElement>(null);

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: ['element', 'placed-element'],
//     drop: (item: DraggableElement & { id?: string }, monitor) => {
//       if (!monitor.isOver({ shallow: true })) return;

//       const offset = monitor.getClientOffset();
//       const initialOffset = monitor.getInitialClientOffset();
//       const initialSourceOffset = monitor.getInitialSourceClientOffset();

//       if (offset && canvasRef.current) {
//         const canvasRect = canvasRef.current.getBoundingClientRect();

//         // Calculate position relative to canvas
//         let x = (offset.x - canvasRect.left) / zoom;
//         let y = (offset.y - canvasRect.top) / zoom;

//         // Account for element size to prevent boundary crossing
//         const elementSize = item.id ? elements.find(el => el.id === item.id)?.size : { width: 100, height: 40 };
//         const halfWidth = (elementSize?.width || 100) / 2;
//         const halfHeight = (elementSize?.height || 40) / 2;

//         // Constrain to body bounds accounting for element size
//         x = Math.max(halfWidth, Math.min(x, canvasRef.current.clientWidth - halfWidth));
//         y = Math.max(halfHeight, Math.min(y, canvasRef.current.clientHeight - halfHeight));

//         if (item.id) {
//           dispatch(moveElement({
//             id: item.id,
//             position: { x, y }
//           }));
//         } else {
//           dispatch(addElement({ type: item.type, position: { x, y } }));
//         }
//       }
//     },
//     hover: (item: DraggableElement & { id?: string }, monitor) => {
//       if (!item.id) return; // Only handle hover for existing elements

//       const offset = monitor.getClientOffset();
//       if (offset && canvasRef.current) {
//         const canvasRect = canvasRef.current.getBoundingClientRect();

//         let x = (offset.x - canvasRect.left) / zoom;
//         let y = (offset.y - canvasRect.top) / zoom;

//         const elementSize = elements.find(el => el.id === item.id)?.size;
//         const halfWidth = (elementSize?.width || 100) / 2;
//         const halfHeight = (elementSize?.height || 40) / 2;

//         x = Math.max(halfWidth, Math.min(x, canvasRef.current.clientWidth - halfWidth));
//         y = Math.max(halfHeight, Math.min(y, canvasRef.current.clientHeight - halfHeight));

//         dispatch(moveElement({
//           id: item.id,
//           position: { x, y }
//         }));
//       }
//     },
//     collect: (monitor) => ({
//       isOver: monitor.isOver({ shallow: true }),
//     }),
//   }));

//   const bind = useGesture({
//     onWheel: ({ event, delta: [_x, dy], ctrlKey }) => {
//       if (ctrlKey || event.metaKey) {
//         event.preventDefault();
//         setZoom(z => {
//           const newZoom = z - dy * 0.005;
//           return Math.min(Math.max(0.25, newZoom), 2);
//         });
//       }
//     },
//     onDragStart: ({ event }) => {
//       if (event.ctrlKey || event.metaKey) {
//         event.preventDefault();
//         setIsDragging(true);
//       }
//     },
//     onDrag: ({ delta: [dx, dy], event }) => {
//       if (event.ctrlKey || event.metaKey) {
//         event.preventDefault();
//         setPosition(pos => ({
//           x: pos.x + dx / zoom,
//           y: pos.y + dy / zoom
//         }));
//       }
//     },
//     onDragEnd: () => {
//       setIsDragging(false);
//     }
//   });

//   const handleZoomIn = () => {
//     setZoom(z => Math.min(z + 0.1, 2));
//   };

//   const handleZoomOut = () => {
//     setZoom(z => Math.max(z - 0.1, 0.25));
//   };

//   const handleReset = () => {
//     setZoom(1);
//     setPosition({ x: 0, y: 0 });
//   };

//   return (
//     <div className="w-full h-full bg-[#1a1a1a] p-8 overflow-hidden relative">
//       {/* Zoom Controls */}
//       <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#2c2c2c] rounded px-2 py-1 z-10">
//         <button
//           onClick={handleZoomOut}
//           className="text-gray-400 hover:text-gray-200 transition-colors"
//         >
//           <span className="material-icons text-[18px]">remove</span>
//         </button>
//         <button
//           onClick={handleReset}
//           className="text-gray-400 hover:text-gray-200 transition-colors px-2 text-sm"
//         >
//           {Math.round(zoom * 100)}%
//         </button>
//         <button
//           onClick={handleZoomIn}
//           className="text-gray-400 hover:text-gray-200 transition-colors"
//         >
//           <span className="material-icons text-[18px]">add</span>
//         </button>
//       </div>

//       <div
//         ref={(node) => {
//           drop(node);
//           canvasRef.current = node;
//         }}
//         {...bind()}
//         className={`w-full h-full bg-white rounded relative touch-none select-none ${
//           isOver ? 'bg-opacity-90' : ''
//         } ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
//         style={{
//           transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
//           transformOrigin: 'center center',
//           transition: 'transform 0.1s ease-out'
//         }}
//         onClick={() => dispatch(selectElement(null))}
//       >
//         <div className="absolute inset-0 border-2 border-dashed border-gray-300">
//           {elements.map((element) => (
//             <BuilderElement
//               key={element.id}
//               id={element.id}
//               type={element.type}
//               position={element.position}
//               isSelected={element.id === selectedElementId}
//               bodyBounds={{
//                 left: 0,
//                 top: 0,
//                 right: canvasRef.current?.clientWidth || 0,
//                 bottom: canvasRef.current?.clientHeight || 0
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
