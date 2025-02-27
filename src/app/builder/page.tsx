"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../../store/store";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { projectService } from "@/services/projectService";
import ZoomableCanvas from "@/components/Builder/ZoomableCanvas";
import ElementsDrawer from "@/components/Builder/ElementsDrawer";
import PagesSidebar from "@/components/Builder/PagesSidebar";
import PageSelector from "@/components/Builder/PageSelector";
import StyleEditor from "@/components/Builder/StyleEditor";
import {
  deleteComponent,
  setComponent,
  setSelectedComponent,
  updateComponent,
  updateInteractions,
} from "@/store/builderSlice";
import { setCurrentProject } from "@/store/projectSlice";
import { setPagesFromServer, setSelectedPage } from "@/store/pagesSlice";
import NavigatorSidebar from "@/components/Builder/NavigatorSidebar";
import ProjectDropdown from "@/components/Layout/ProjectDropdown";
import LoadingBar from "@/components/Utils/LoadingBar";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";
import { generatePreview } from "@/utils/previewGenerator";
import SaveIndicator from "@/components/Utils/SaveIndicator";
import { markSaved, setSaving } from "@/store/saveStateSlice";
import CommentsSidebar from "@/components/Comments/CommentsSidebar";
import InteractionsEditor from "@/components/Builder/InteractionsEditor";
import { deploymentService } from "@/services/deploymentService";
import SettingsEditor from "@/components/Builder/SettingsEditor";

function BuilderCanvas() {
  const dispatch = useDispatch();
  const [isElementsDrawerOpen, setIsElementsDrawerOpen] = useState(false);
  const [isPagesSidebarOpen, setIsPagesSidebarOpen] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);
  const [responsiveMode, setResponsiveMode] = useState<
    "desktop" | "tablet" | "mobile" | "none"
  >("none");
  const [isResponsiveMenuOpen, setIsResponsiveMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "style" | "settings" | "interactions"
  >("style");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Get interactions from the store once at the component level
  const interactions = useSelector((state: RootState) =>
    state.builder.component.interactions || ""
  );
  const component = useSelector((state: RootState) => state.builder.component);
  const project = useSelector((state: RootState) =>
    state.project.currentProject
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Check if clicked element is a sidebar icon or button
    const target = e.target as HTMLElement;
    const sidebarButton = target.closest(".left-sidebar");
    const rightSidebar = target.closest(".right-sidebar");
    const canvas = target.closest(".zoomable-canvas");

    // If clicked outside canvas and not on a sidebar button, deselect component
    if (!canvas && !sidebarButton && !rightSidebar) {
      dispatch(setSelectedComponent(null));
    }

    if (isElementsDrawerOpen) {
      setIsElementsDrawerOpen(false);
    }
    if (isPagesSidebarOpen) {
      setIsPagesSidebarOpen(false);
    }
    if (isNavigatorOpen) {
      setIsNavigatorOpen(false);
    }
  };

  const handleElementsClick = () => {
    setIsPagesSidebarOpen(false);
    setIsNavigatorOpen(false);
    setIsElementsDrawerOpen(!isElementsDrawerOpen);
  };

  const handlePagesClick = () => {
    setIsElementsDrawerOpen(false);
    setIsNavigatorOpen(false);
    setIsPagesSidebarOpen(!isPagesSidebarOpen);
  };

  const handleNavigatorClick = () => {
    setIsElementsDrawerOpen(false);
    setIsPagesSidebarOpen(false);
    setIsNavigatorOpen(!isNavigatorOpen);
  };

  const handleCommentsClick = () => {
    setIsCommentsSidebarOpen(!isCommentsSidebarOpen);
    // Close other sidebars when comments are opened
    if (!isCommentsSidebarOpen) {
      setIsElementsDrawerOpen(false);
      setIsPagesSidebarOpen(false);
      setIsNavigatorOpen(false);
    }
  };

  const handlePreview = () => {
    // Don't call useSelector here - use the value from the component scope
    const previewHTML = generatePreview(component, interactions);
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(previewHTML);
      previewWindow.document.close();
    }
  };

  const handlePublish = async () => {
    if (!project?.id || isPublishing) return;

    setIsPublishing(true);
    const publishToast = toast.loading("Publishing project...");

    try {
      const { deploymentUrl, defaultDomain } = await deploymentService
        .deployToVercel(
          project.id,
        );

      toast.success(
        <div className="flex flex-col gap-2">
          <span>Project published successfully!</span>
          <div className="flex flex-col gap-1 text-sm">
            <a
              href={deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {deploymentUrl}
            </a>
            <a
              href={`https://${defaultDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {defaultDomain}
            </a>
          </div>
        </div>,
        { id: publishToast, duration: 8000 },
      );
    } catch (error) {
      console.error("Deployment error:", error);
      toast.error("Failed to publish project", { id: publishToast });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col">
      {/* Top Navigation */}
      <nav className="h-[35px] bg-[#2c2c2c] border-b border-[#3c3c3c] flex items-center">
        {/* Menu Button with Project Dropdown */}
        <ProjectDropdown />

        {/* Preview Button */}
        <button
          onClick={handlePreview}
          className="w-10 h-[35px] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
          title="Preview"
        >
          <span className="material-icons text-[20px]">play_arrow</span>
        </button>

        {/* Current Page Selector */}
        <div className="flex-1 flex justify-center items-center">
          <PageSelector />
          <div className="flex items-center ml-2">
            <div className="relative">
              <button
                onClick={() => setIsResponsiveMenuOpen(!isResponsiveMenuOpen)}
                className="flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors px-2"
                title="Responsive"
              >
                <span className="material-icons text-[20px]">
                  {responsiveMode === "desktop"
                    ? "laptop"
                    : responsiveMode === "tablet"
                    ? "tablet"
                    : "smartphone"}
                </span>
              </button>

              {isResponsiveMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-[#2c2c2c] border border-[#3c3c3c] rounded shadow-lg z-[5000]">
                  <button
                    className={`flex items-center px-3 py-2 w-full text-left ${
                      responsiveMode === "desktop"
                        ? "text-blue-400"
                        : "text-gray-300"
                    } hover:bg-[#3c3c3c]`}
                    onClick={() => {
                      setResponsiveMode("desktop");
                      setIsResponsiveMenuOpen(false);
                    }}
                  >
                    <span className="material-icons text-[18px] mr-2">
                      laptop
                    </span>
                    Desktop
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 w-full text-left ${
                      responsiveMode === "tablet"
                        ? "text-blue-400"
                        : "text-gray-300"
                    } hover:bg-[#3c3c3c]`}
                    onClick={() => {
                      setResponsiveMode("tablet");
                      setIsResponsiveMenuOpen(false);
                    }}
                  >
                    <span className="material-icons text-[18px] mr-2">
                      tablet
                    </span>
                    Tablet
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 w-full text-left ${
                      responsiveMode === "mobile"
                        ? "text-blue-400"
                        : "text-gray-300"
                    } hover:bg-[#3c3c3c]`}
                    onClick={() => {
                      setResponsiveMode("mobile");
                      setIsResponsiveMenuOpen(false);
                    }}
                  >
                    <span className="material-icons text-[18px] mr-2">
                      smartphone
                    </span>
                    Mobile
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 w-full text-left ${
                      responsiveMode === "none"
                        ? "text-blue-400"
                        : "text-gray-300"
                    } hover:bg-[#3c3c3c]`}
                    onClick={() => {
                      setResponsiveMode("none");
                      setIsResponsiveMenuOpen(false);
                    }}
                  >
                    <span className="material-icons text-[18px] mr-2">
                      fullscreen
                    </span>
                    None
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center">
          {/* Changes Saved Indicator */}
          <SaveIndicator />

          {/* Comments */}
          <button
            onClick={handleCommentsClick}
            className={`flex items-center justify-center transition-colors px-2 ${
              isCommentsSidebarOpen
                ? "text-blue-400 hover:text-blue-300"
                : "text-gray-400 hover:text-gray-200"
            }`}
            title="Comments"
          >
            <span className="material-icons text-[20px]">comment</span>
          </button>

          {/* Share */}
          <button
            className="flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors px-2"
            title="Share"
          >
            <span className="material-icons text-[20px]">share</span>
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`flex items-center justify-center ${
              isPublishing ? "bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors px-4 h-[26px] rounded ml-2 mr-3 text-sm`}
            title="Publish"
          >
            {isPublishing
              ? (
                <span className="material-icons animate-spin text-[18px]">
                  refresh
                </span>
              )
              : (
                "Publish"
              )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-35px)]" onClick={handleCanvasClick}>
        {/* Left Sidebar - Hide when comments are open */}
        {!isCommentsSidebarOpen && (
          <div className="left-sidebar w-10 bg-[#2c2c2c] border-r border-[#3c3c3c] relative">
            {/* Add Elements Button */}
            <button
              className={`left-sidebar-btn w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors ${
                isElementsDrawerOpen ? "bg-[#3c3c3c] text-gray-200" : ""
              }`}
              title="Add Elements"
              onClick={handleElementsClick}
            >
              <span className="material-icons text-[20px]">add</span>
            </button>

            {/* Pages Button */}
            <button
              className={`left-sidebar-btn w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors ${
                isPagesSidebarOpen ? "bg-[#3c3c3c] text-gray-200" : ""
              }`}
              title="Pages"
              onClick={handlePagesClick}
            >
              <span className="material-icons text-[20px]">article</span>
            </button>

            {/* Navigator Button */}
            <button
              className={`left-sidebar-btn w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors ${
                isNavigatorOpen ? "bg-[#3c3c3c] text-gray-200" : ""
              }`}
              title="Navigator"
              onClick={handleNavigatorClick}
            >
              <span className="material-icons text-[20px]">account_tree</span>
            </button>

            {/* Components Button */}
            <button
              className="left-sidebar-btn w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
              title="Saved Components"
            >
              <span className="material-icons text-[20px]">widgets</span>
            </button>

            {/* Elements Drawer */}
            <ElementsDrawer
              isOpen={isElementsDrawerOpen}
              onClose={() => setIsElementsDrawerOpen(false)}
            />

            {/* Pages Sidebar */}
            <PagesSidebar
              isOpen={isPagesSidebarOpen}
              onClose={() => setIsPagesSidebarOpen(false)}
            />

            {/* Add NavigatorSidebar */}
            <NavigatorSidebar
              isOpen={isNavigatorOpen}
              onClose={() => setIsNavigatorOpen(false)}
            />
          </div>
        )}

        {/* Canvas */}
        {!isFullscreen && (
          <div className="flex-1 relative">
            <ZoomableCanvas
              isCommentsOpen={isCommentsSidebarOpen}
              responsiveMode={responsiveMode}
            />
          </div>
        )}

        {/* Right Sidebar - Show either style editor or comments */}
        {isCommentsSidebarOpen
          ? (
            <CommentsSidebar
              isOpen={isCommentsSidebarOpen}
              onClose={() => setIsCommentsSidebarOpen(false)}
            />
          )
          : (
            <div className="right-sidebar h-full fixed right-0 w-[300px] bg-[#2c2c2c] border-l border-[#3c3c3c]">
              {/* Tabs */}
              <div className="flex h-[35px] border-b border-[#3c3c3c] px-2">
                <button
                  className={`flex-1 h-full flex items-center justify-center text-sm mx-1 ${
                    activeTab === "style"
                      ? "text-gray-200 border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-gray-200 transition-colors"
                  }`}
                  onClick={() => setActiveTab("style")}
                >
                  Style
                </button>
                <button
                  className={`flex-1 h-full flex items-center justify-center text-sm mx-1 ${
                    activeTab === "settings"
                      ? "text-gray-200 border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-gray-200 transition-colors"
                  }`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
                <button
                  className={`flex-1 h-full flex items-center justify-center text-sm mx-1 ${
                    activeTab === "interactions"
                      ? "text-gray-200 border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-gray-200 transition-colors"
                  }`}
                  onClick={() => setActiveTab("interactions")}
                >
                  Interactions
                </button>
              </div>

              {/* Content based on active tab */}
              {activeTab === "style" && <StyleEditor />}
              {activeTab === "settings" && <SettingsEditor />}
              {activeTab === "interactions" && (
                <InteractionsEditor
                  isFullscreen={isFullscreen}
                  setIsFullscreen={setIsFullscreen}
                />
              )}
            </div>
          )}
      </div>
    </div>
  );
}

function BuilderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const project = useSelector((state: RootState) =>
    state.project.currentProject
  );
  const pages = useSelector((state: RootState) => state.pages.pages);
  const interactions = useSelector((state: RootState) =>
    state.builder.component.interactions || ""
  );

  useLayoutEffect(() => {
    eval(interactions);
  }, [interactions]);

  useEffect(() => {
    const checkUserAndProject = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/");
          return;
        }

        const projectId = searchParams.get("project_id");
        if (!projectId) {
          router.push("/dashboard");
          return;
        }

        const projects = await projectService.getProjects(projectId);
        if (projects.length === 0) {
          router.push("/dashboard");
          return;
        }

        dispatch(setCurrentProject(projects[0]));
      } catch (error) {
        console.error("Error:", error);
        router.push("/dashboard");
      }
    };

    checkUserAndProject();
  }, [router, searchParams, dispatch]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();

        if (!project?.id) return;

        dispatch(setSaving(true));
        const saveToast = toast.loading("Saving project...");

        try {
          await projectService.saveProject(project.id, pages);
          dispatch(markSaved());
          toast.success("Project saved successfully", {
            id: saveToast,
            duration: 2000,
          });
        } catch (error) {
          console.error("Error saving project:", error);
          toast.error("Failed to save project", {
            id: saveToast,
            duration: 3000,
          });
        } finally {
          dispatch(setSaving(false));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project?.id, pages, dispatch]);

  const handleLoadingComplete = () => {
    if (project) {
      dispatch(setPagesFromServer(project.pages || []));
      const homePage = project.pages?.find((page) => page.is_home);
      if (homePage) {
        dispatch(setSelectedPage(homePage.id));
        // also set Component to home page component tree
        dispatch(setComponent(homePage.component_tree));
        dispatch(
          updateInteractions(homePage.component_tree.interactions || ""),
        );
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <LoadingBar onComplete={handleLoadingComplete} />
      </div>
    );
  }

  return (
    <>
      <BuilderCanvas />
    </>
  );
}

export default function BuilderPage() {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <BuilderPageContent />
      </DndProvider>
    </Provider>
  );
}
