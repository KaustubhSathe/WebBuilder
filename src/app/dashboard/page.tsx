'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';
import { projectService } from '@/services/projectService';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);
      fetchProjects(session.user.id);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchProjects = async (userId: string) => {
    try {
      const projects = await projectService.getProjects();
      setProjects(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    try {
      const project = await projectService.createProject(
        'Untitled Project',
        'A new web project'
      );
      router.push(`/builder?project=${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <header className="bg-[#2c2c2c] border-b border-[#3c3c3c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-200">My Projects</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={createNewProject}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span className="material-icons text-[20px]">add</span>
              New Project
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span className="material-icons text-[20px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-gray-400">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#2c2c2c] rounded-lg overflow-hidden hover:ring-2 ring-blue-500/50 transition-all cursor-pointer"
                onClick={() => router.push(`/builder?project=${project.id}`)}
              >
                <div className="aspect-video bg-[#1f1f1f] flex items-center justify-center">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-icons text-4xl text-gray-600">web</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-gray-200 font-medium mb-1">{project.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {project.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add project deletion logic here
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <span className="material-icons text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#2c2c2c] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl text-gray-500">web</span>
            </div>
            <h3 className="text-gray-200 font-medium mb-2">No projects yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              Create your first project to get started
            </p>
            <button
              onClick={createNewProject}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <span className="material-icons text-[20px]">add</span>
              Create Project
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 