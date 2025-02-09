'use client';

import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/project';
import ZoomableCanvas from '@/components/ZoomableCanvas';
import ElementsDrawer from '@/components/ElementsDrawer';

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isElementsDrawerOpen, setIsElementsDrawerOpen] = useState(false);

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
        <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
          {/* Header */}
          <header className="bg-[#2c2c2c] border-b border-[#3c3c3c]">
            <div className="px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <span className="material-icons">arrow_back</span>
                </button>
                <h1 className="text-xl font-semibold text-gray-200">{project.name}</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsElementsDrawerOpen(true)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <span className="material-icons">add_box</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-[#2c2c2c] border-r border-[#3c3c3c] p-4">
              <div className="text-sm font-medium text-gray-400 mb-2">Layers</div>
              {/* Add layer tree component here */}
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
              <ZoomableCanvas>
                {/* Canvas content */}
              </ZoomableCanvas>
            </div>

            {/* Right Sidebar */}
            <div className="w-64 bg-[#2c2c2c] border-l border-[#3c3c3c] p-4">
              <div className="text-sm font-medium text-gray-400 mb-2">Properties</div>
              {/* Add properties panel component here */}
            </div>
          </div>

          {/* Elements Drawer */}
          <ElementsDrawer
            isOpen={isElementsDrawerOpen}
            onClose={() => setIsElementsDrawerOpen(false)}
          />
        </div>
      </DndProvider>
    </Provider>
  );
} 