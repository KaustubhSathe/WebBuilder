import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { updateInteractions } from "@/store/builderSlice";
import { markUnsaved } from "@/store/saveStateSlice";
import toast from "react-hot-toast";
import { generateHTML } from "@/utils/previewGenerator";

const InteractionsEditor: React.FC<{
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}> = ({ isFullscreen, setIsFullscreen }) => {
  const dispatch = useDispatch();
  const interactions = useSelector(
    (state: RootState) => state.builder.component.interactions || ""
  );
  const [code, setCode] = useState(interactions);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const component = useSelector((state: RootState) => state.builder.component);

  // Update local state when interactions change in the store
  useEffect(() => {
    setCode(interactions);
  }, [interactions]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
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

  const handleGenerateCode = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const htmlDocument = generateHTML(component);

    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, htmlDocument }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setCode("");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let accumulatedText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const jsonChunks = chunk.split("\n").filter(Boolean);

          for (const jsonChunk of jsonChunks) {
            try {
              const parsed = JSON.parse(jsonChunk);
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                accumulatedText += content;
              }
            } catch (e) {
              console.warn("Failed to parse chunk:", jsonChunk);
            }
          }

          // Extract code between <js> tags
          const jsMatch = accumulatedText.match(/<js>([\s\S]*?)<\/js>/);
          const extractedCode = jsMatch ? jsMatch[1].trim() : "";
          setCode(extractedCode);
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="h-full flex flex-col gap-2 p-2">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-200 text-sm font-medium">Custom JavaScript</h3>
        <button
          onClick={handleSave}
          disabled={isSaving || isGenerating}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors flex items-center"
        >
          {isSaving ? (
            <>
              <span className="inline-block items-center justify-center w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>

      <div className="text-xs text-gray-400">
        <span>
          Write custom JavaScript code that will be included in your page.
        </span>
      </div>

      <div className="relative flex flex-col w-full">
        <button
          onClick={handleFullscreenToggle}
          className={`ml-auto text-gray-400 hover:text-gray-200 transition-colors ${
            isFullscreen
              ? "fixed z-[60] top-2 right-2"
              : "absolute top-2 right-2"
          }`}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <span className="material-icons text-[18px]">
            {isFullscreen ? "fullscreen_exit" : "fullscreen"}
          </span>
        </button>

        <textarea
          value={code}
          onChange={handleCodeChange}
          disabled={isSaving || isGenerating}
          className={`bg-[#1a1a1a] text-gray-200 
                        font-mono text-sm p-3 rounded border 
                        border-[#3c3c3c] focus:border-blue-500 
                        focus:outline-none resize-none custom-scrollbar
                        ${
                          isFullscreen
                            ? "fixed z-[50] top-0 left-0 w-screen h-screen"
                            : "h-[140px]"
                        }`}
          placeholder="// Write your JavaScript code here
// Example:
document.addEventListener('DOMContentLoaded', function() {
  // Your code here
});"
        />
      </div>

      {/* AI Prompt Section */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="text-gray-200 text-sm font-medium">Prompt AI</h3>
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating || !prompt.trim()}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center"
          >
            {isGenerating ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Generating...
              </>
            ) : (
              "Generate Code"
            )}
          </button>
        </div>

        <div className="text-xs text-gray-400">
          Describe what you want the JavaScript to do, and AI will generate it
          for you.
        </div>

        <textarea
          value={prompt}
          onChange={handlePromptChange}
          disabled={isGenerating}
          className="bg-[#1a1a1a] text-gray-200 
                    font-mono text-sm p-3 rounded border 
                    border-[#3c3c3c] focus:border-blue-500 
                    h-[140px]
                    focus:outline-none resize-none custom-scrollbar w-full"
          placeholder="Example: Create a slideshow that automatically cycles through images with fade transitions"
        />
      </div>
    </div>
  );
};

export default InteractionsEditor;
