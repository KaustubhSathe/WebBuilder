import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { updateInteractions } from "@/store/builderSlice";
import { markUnsaved } from "@/store/saveStateSlice";

const InteractionsEditor: React.FC = () => {
    const dispatch = useDispatch();
    const interactions = useSelector((state: RootState) =>
        state.builder.component.interactions || ""
    );
    const [code, setCode] = useState(interactions);
    const [isSaving, setIsSaving] = useState(false);

    // Update local state when interactions change in the store
    useEffect(() => {
        setCode(interactions);
    }, [interactions]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);
    };

    const handleSave = () => {
        setIsSaving(true);

        // Simulate a delay to show the loading spinner
        setTimeout(() => {
            dispatch(updateInteractions(code));
            dispatch(markUnsaved());
            setIsSaving(false);
        }, 800); // Show spinner for 800ms
    };

    return (
        <div className="h-full flex flex-col p-4">
            <div className="mb-3 flex justify-between items-center">
                <h3 className="text-gray-200 text-sm font-medium">
                    Custom JavaScript
                </h3>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors flex items-center"
                >
                    {isSaving
                        ? (
                            <>
                                <span className="inline-block items-center justify-center w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2">
                                </span>
                            </>
                        )
                        : (
                            "Save"
                        )}
                </button>
            </div>

            <div className="text-xs text-gray-400 mb-2">
                Write custom JavaScript code that will be included in your page.
            </div>

            <textarea
                value={code}
                onChange={handleCodeChange}
                disabled={isSaving}
                className="flex-1 bg-[#1a1a1a] text-gray-200 font-mono text-sm p-3 rounded border border-[#3c3c3c] focus:border-blue-500 focus:outline-none resize-none custom-scrollbar"
                placeholder="// Write your JavaScript code here
// Example:
document.addEventListener('DOMContentLoaded', function() {
  // Your code here
});"
            />
        </div>
    );
};

export default InteractionsEditor;
