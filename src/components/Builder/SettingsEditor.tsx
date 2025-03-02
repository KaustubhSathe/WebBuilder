import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { updateComponent } from "@/store/builderSlice";
import { Component } from "@/types/builder";

interface CustomAttributesProps {
  selectedComponent: Component;
}

function CustomAttributes({ selectedComponent }: CustomAttributesProps) {
  const dispatch = useDispatch();
  const [isAttributesOpen, setIsAttributesOpen] = useState(false);
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);

  // Get only custom attributes (those not part of the standard component structure)
  const customAttributes = selectedComponent?.customAttributes || {};

  const handleAddAttribute = () => {
    if (!newAttributeKey.trim()) return;

    dispatch(
      updateComponent({
        id: selectedComponent.id,
        updates: {
          ...selectedComponent,
          customAttributes: {
            ...customAttributes,
            [newAttributeKey]: "",
          },
        },
      })
    );
    setNewAttributeKey("");
    setIsAddingAttribute(false);
  };

  return (
    <div className="border-t border-[#3c3c3c] pt-4">
      <button
        onClick={() => setIsAttributesOpen(!isAttributesOpen)}
        className="flex justify-between w-full text-gray-400 hover:text-gray-300"
      >
        <span className="text-sm font-medium ml-1">Custom Attributes</span>
        <span
          className={`material-icons text-[18px] transition-transform ${
            isAttributesOpen ? "rotate-90" : ""
          }`}
        >
          chevron_right
        </span>
      </button>

      {isAttributesOpen && (
        <div className="mt-4 space-y-3">
          <button
            onClick={() => setIsAddingAttribute(true)}
            className="text-blue-500 ml-auto hover:text-blue-400 text-sm flex items-center gap-1"
          >
            <span className="material-icons text-[18px]">add</span>
            Add Attribute
          </button>
          {isAddingAttribute && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAttributeKey}
                onChange={(e) => setNewAttributeKey(e.target.value)}
                className="flex-1 bg-[#1a1a1a] text-gray-300 text-xs rounded border 
                                    border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500"
                placeholder="Attribute name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddAttribute();
                }}
              />
              <button
                onClick={handleAddAttribute}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingAttribute(false)}
                className="p-1 text-gray-400 hover:text-gray-300"
              >
                <span className="material-icons text-[18px]">close</span>
              </button>
            </div>
          )}

          {Object.keys(customAttributes).length > 0 ? (
            Object.entries(customAttributes).map(([key, value]) => (
              <div key={key} className="flex flex-row justify-between gap-2">
                <label className="text-[10px] mb-auto mt-auto text-gray-400 uppercase block">
                  {key}
                </label>
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) => {
                    dispatch(
                      updateComponent({
                        id: selectedComponent.id,
                        updates: {
                          ...selectedComponent,
                          customAttributes: {
                            ...customAttributes,
                            [key]: e.target.value,
                          },
                        },
                      })
                    );
                  }}
                  className="w-full bg-[#1a1a1a] text-gray-300 text-xs rounded border 
                                            border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500"
                />

                <button
                  onClick={() => {
                    const { [key]: _, ...rest } = customAttributes;
                    dispatch(
                      updateComponent({
                        id: selectedComponent.id,
                        updates: {
                          ...selectedComponent,
                          customAttributes: rest,
                        },
                      })
                    );
                  }}
                  className="self-end p-1 text-gray-400 hover:text-red-400 flex"
                >
                  <span className="material-icons text-[18px] mb-auto mt-auto">
                    delete
                  </span>
                </button>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm text-center py-2">
              No custom attributes added
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VisibilitySettings({
  selectedComponent,
}: {
  selectedComponent: Component;
}) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleVisibilityChange = (value: string) => {
    dispatch(
      updateComponent({
        id: selectedComponent.id,
        updates: {
          styles: {
            ...selectedComponent.styles,
            display: value,
          },
        },
      })
    );
  };

  return (
    <div className="border-t border-[#3c3c3c] pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between w-full text-gray-400 hover:text-gray-300"
      >
        <span className="text-sm font-medium ml-1">Visibility</span>
        <span
          className={`material-icons text-[18px] transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          chevron_right
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 flex flex-row justify-between items-center gap-2">
          <label className="text-[10px] mb-auto mt-auto text-center text-gray-400 uppercase block">
            Visibility
          </label>
          <select
            value={selectedComponent.styles.display || "block"}
            onChange={(e) => handleVisibilityChange(e.target.value)}
            className="w-full bg-[#1a1a1a] mb-auto mt-auto inline-block text-gray-300 text-xs rounded border 
                            border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="block">Visible</option>
            <option value="none">Hidden</option>
          </select>
        </div>
      )}
    </div>
  );
}

function DivComponentSettings({
  selectedComponent,
}: {
  selectedComponent: Component;
}) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleContentChange = (value: string) => {
    dispatch(
      updateComponent({
        id: selectedComponent.id,
        updates: {
          content: value
        },
      })
    );
  };

  return (
    <div className="border-t border-[#3c3c3c] pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between w-full text-gray-400 hover:text-gray-300"
      >
        <span className="text-sm font-medium ml-1">Div Content</span>
        <span
          className={`material-icons text-[18px] transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          chevron_right
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 space-y-2">
          <label className="text-[10px] text-gray-400 uppercase block">
            Content
          </label>
          <textarea
            value={selectedComponent.content || ""}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full bg-[#1a1a1a] text-gray-300 text-xs rounded border 
                        border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500"
            rows={4}
            placeholder="Enter content here..."
          />
        </div>
      )}
    </div>
  );
}

const SettingsEditor = () => {
  const dispatch = useDispatch();
  const selectedComponent = useSelector(
    (state: RootState) => state.builder.selectedComponent
  );

  if (!selectedComponent) {
    return (
      <div className="h-full flex justify-center mt-4">
        <div className="text-gray-400 text-sm">No component selected</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="flex flex-row justify-between">
          <label className="text-[20px] text-gray-400 uppercase mb-auto mt-auto">
            ID
          </label>
          <input
            type="text"
            value={selectedComponent?.id}
            onChange={(e) => {
              dispatch(
                updateComponent({
                  id: selectedComponent?.id,
                  updates: { id: e.target.value },
                })
              );
            }}
            className="bg-[#1a1a1a] text-gray-300 text-xs rounded border 
                            border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500"
            placeholder="Component ID"
          />
        </div>
        {
          (selectedComponent.type === "div" || 
          selectedComponent.type === 'section' || 
          selectedComponent.type === 'container' ||
          selectedComponent.type === 'footer' ||
          selectedComponent.type === 'nav' ||
          selectedComponent.type === 'article'
        ) && (
            <div className="flex flex-row justify-between">
            <label className="text-[20px] text-gray-400 uppercase mb-auto mt-auto">
              Type
            </label>
            <select
              value={selectedComponent?.type}
              onChange={(e) => {
                dispatch(
                  updateComponent({
                    id: selectedComponent?.id,
                    updates: { type: e.target.value as any },
                  })
                );
              }}
              className="bg-[#1a1a1a] text-gray-300 text-xs rounded border 
                              border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="div">Div</option>
              <option value="footer">Footer</option>
              <option value="nav">Nav</option>
              <option value="section">Section</option>
              <option value="article">Article</option>
            </select>
          </div>  
          )
        }

        <CustomAttributes selectedComponent={selectedComponent} />
        {selectedComponent.type !== "main" && (
          <>
            <VisibilitySettings selectedComponent={selectedComponent} />
          </>
        )}
        {selectedComponent.type === 'div' && (
          <DivComponentSettings selectedComponent={selectedComponent} />
        )}
      </div>
    </div>
  );
};

export default SettingsEditor;
