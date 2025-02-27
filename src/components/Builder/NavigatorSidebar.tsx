"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Component } from "@/types/builder";
import { setSelectedComponent } from "@/store/builderSlice";

interface NavigatorSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ComponentTreeItemProps {
    component: Component;
    level: number;
}

const ComponentTreeItem: React.FC<ComponentTreeItemProps> = (
    { component, level },
) => {
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(true);
    const selectedComponent = useSelector((state: RootState) =>
        state.builder.selectedComponent
    );
    const hasChildren = component.children && component.children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setSelectedComponent(component));
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className="select-none">
            <div
                className={`
                    flex items-center h-7 cursor-pointer
                    ${
                    selectedComponent?.id === component.id
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-400 hover:bg-[#3c3c3c] hover:text-gray-200"
                }
                `}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleClick}
            >
                {hasChildren && (
                    <span
                        className="material-icons text-[16px] mr-1 cursor-pointer"
                        onClick={toggleExpand}
                    >
                        {isExpanded ? "expand_more" : "chevron_right"}
                    </span>
                )}
                {!hasChildren && <span className="w-[16px] mr-1" />}
                <span className="material-icons text-[16px] mr-1">
                    {component.type === "main" ? "web" : "widgets"}
                </span>
                <span className="text-sm capitalize">
                    {component.type === "main"
                        ? "Main Container"
                        : component.type}
                </span>
            </div>

            {hasChildren && isExpanded && (
                <div className="component-children">
                    {component.children.map((child) => (
                        <ComponentTreeItem
                            key={child.id}
                            component={child}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const NavigatorSidebar: React.FC<NavigatorSidebarProps> = (
    { isOpen, onClose },
) => {
    const rootComponent = useSelector((state: RootState) =>
        state.builder.component
    );

    return (
        <>
            {isOpen && (
                <div
                    className={`absolute top-0 left-10 h-full bg-[#2c2c2c] transition-all duration-300 z-10 overflow-hidden ${
                        isOpen ? "w-[240px] border-r border-[#3c3c3c]" : "w-0"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4">
                            <span className="text-gray-200 text-sm font-medium">
                                Navigator
                            </span>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <span className="material-icons text-[18px]">
                                    close
                                </span>
                            </button>
                        </div>

                        <div className="overflow-y-auto hide-scrollbar flex-1">
                            <ComponentTreeItem
                                component={rootComponent}
                                level={0}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavigatorSidebar;
