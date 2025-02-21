import React from "react";
import { useDispatch } from "react-redux";
import { Component } from "../types/builder";
import { deleteComponent, updateComponent } from "../store/builderSlice";

const ComponentToolbar: React.FC<{ component: Component }> = (
  { component },
) => {
  const dispatch = useDispatch();

  return (
    <div className="absolute -top-6 left-0 bg-[#2c2c2c] rounded flex items-center z-50 text-gray-200 text-sm">
      <div className="flex items-center px-1 gap-2">
        <span className="text-xs text-gray-400">
          {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
        </span>
        <button
          onClick={() => dispatch(deleteComponent(component.id))}
          className="hover:bg-[#3c3c3c] text-red-400 hover:text-red-300"
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ComponentToolbar;
