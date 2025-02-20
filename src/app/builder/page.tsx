'use client';

import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../../store/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/project';
import ZoomableCanvas from '@/components/ZoomableCanvas';
import ElementsDrawer from '@/components/ElementsDrawer';
import PagesSidebar from '@/components/PagesSidebar';
import PageSelector from '@/components/PageSelector';
import StyleEditor from '@/components/StyleEditor';
import { setSelectedComponent } from '@/store/builderSlice';

function BuilderCanvas() {
  const dispatch = useDispatch();
  const [isElementsDrawerOpen, setIsElementsDrawerOpen] = useState(false);
  const [isPagesSidebarOpen, setIsPagesSidebarOpen] = useState(false);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Check if clicked element is a sidebar icon or button
    const target = e.target as HTMLElement;
    const sidebarButton = target.closest('.left-sidebar');
    const rightSidebar = target.closest('.right-sidebar');
    const canvas = target.closest('.zoomable-canvas');
    
    // If clicked outside canvas and not on a sidebar button, deselect component
    if (!canvas && !sidebarButton && !rightSidebar) {
      dispatch(setSelectedComponent(null));
      console.log('clicked outside canvas and not on a sidebar button, deselecting component');
    }

    if (isElementsDrawerOpen) {
      setIsElementsDrawerOpen(false);
    }
    if (isPagesSidebarOpen) {
      setIsPagesSidebarOpen(false);
    }
  };

  const handleElementsClick = () => {
    setIsPagesSidebarOpen(false);
    setIsElementsDrawerOpen(!isElementsDrawerOpen);
  };

  const handlePagesClick = () => {
    setIsElementsDrawerOpen(false);
    console.log('pages clicked', isPagesSidebarOpen);
    setIsPagesSidebarOpen(!isPagesSidebarOpen);
  };

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col">
      {/* Top Navigation */}
      <nav className="h-[35px] bg-[#2c2c2c] border-b border-[#3c3c3c] flex items-center">
        {/* Menu Button */}
        <button 
          className="w-10 h-[35px] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors border-r border-[#3c3c3c]"
          title="Menu"
        >
          <span className="material-icons text-[20px]">menu</span>
        </button>

        {/* Preview Button */}
        <button 
          className="w-10 h-[35px] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
          title="Preview"
        >
          <span className="material-icons text-[20px]">play_arrow</span>
        </button>

        {/* Current Page Selector */}
        <div className="flex-1 flex justify-center items-center">
          <PageSelector />
          <div className="flex items-center ml-2">
            <button 
              className="flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors px-2"
              title="Responsive"
            >
              <span className="material-icons text-[20px]">laptop</span>
            </button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center">
          {/* Changes Saved Indicator */}
          <button 
            className="flex items-center justify-center text-green-500 hover:text-green-400 transition-colors px-2"
            title="Changes Saved"
          >
            <span className="material-icons text-[20px]">check_circle</span>
          </button>

          {/* Comments */}
          <button 
            className="flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors px-2"
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
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors px-4 h-[26px] rounded ml-2 mr-3 text-sm"
            title="Publish"
          >
            Publish
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-35px)]" onClick={handleCanvasClick}>
        {/* Left Sidebar */}
        <div className="left-sidebar w-10 bg-[#2c2c2c] border-r border-[#3c3c3c] relative">
          {/* Add Elements Button */}
          <button 
            className={`left-sidebar-btn w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors ${
              isElementsDrawerOpen ? 'bg-[#3c3c3c] text-gray-200' : ''
            }`}
            title="Add Elements"
            onClick={handleElementsClick}
          >
            <span className="material-icons text-[20px]">add</span>
          </button>

          {/* Pages Button */}
          <button 
            className={`left-sidebar-btn w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors ${
              isPagesSidebarOpen ? 'bg-[#3c3c3c] text-gray-200' : ''
            }`}
            title="Pages"
            onClick={handlePagesClick}
          >
            <span className="material-icons text-[20px]">article</span>
          </button>

          {/* Navigator Button */}
          <button 
            className="left-sidebar-btn w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-[#3c3c3c] transition-colors"
            title="Navigator"
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
        </div>

        {/* Canvas */}
        <ZoomableCanvas />

        {/* Right Sidebar */}
        <div className="right-sidebar w-[380px] bg-[#2c2c2c] border-l border-[#3c3c3c]">
          {/* Tabs */}
          <div className="flex h-[35px] border-b border-[#3c3c3c] px-2">
            <button className="flex-1 h-full flex items-center justify-center text-gray-200 text-sm border-b-2 border-blue-500 mx-1">
              Style
            </button>
            <button className="flex-1 h-full flex items-center justify-center text-gray-400 hover:text-gray-200 text-sm transition-colors mx-1">
              Settings
            </button>
            <button className="flex-1 h-full flex items-center justify-center text-gray-400 hover:text-gray-200 text-sm transition-colors mx-1">
              Interactions
            </button>
          </div>

          {/* Style Editor */}
          <StyleEditor />
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndProject = async () => {
      try {
        // Check auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
          return;
        }

        // Get project ID from URL
        const projectId = searchParams.get('project_id');
        if (!projectId) {
          router.push('/dashboard');
          return;
        }

        // Fetch project
        const projects = await projectService.getProjects(projectId);
        if (projects.length === 0) {
          router.push('/dashboard');
          return;
        }

        setProject(projects[0]);
      } catch (error) {
        console.error('Error:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkUserAndProject();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-gray-400">Loading project...</div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <BuilderCanvas />
      </DndProvider>
    </Provider>
  );
} 