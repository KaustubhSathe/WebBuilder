'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';
import { projectService } from '@/services/projectService';
import CreateProjectModal from '@/components/CreateProjectModal';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const project = await projectService.createProject(name, description);
      router.push(`/builder?project_id=${project.id}`);
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
              onClick={() => setIsCreateModalOpen(true)}
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
          <div className="bg-[#2c2c2c] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3c3c3c]">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 hidden md:table-cell">Description</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Last Updated</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-400 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c3c3c]">
                {projects.map((project) => (
                  <tr 
                    key={project.id}
                    className="hover:bg-[#3c3c3c] transition-colors cursor-pointer"
                    onClick={() => router.push(`/builder?project_id=${project.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1f1f1f] rounded flex items-center justify-center">
                          {project.thumbnail ? (
                            <img
                              src={project.thumbnail}
                              alt={project.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span className="material-icons text-gray-600">web</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-200">{project.name}</div>
                          <div className="text-sm text-gray-400 md:hidden">
                            {project.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 hidden md:table-cell">
                      {project.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add project deletion logic here
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                        >
                          <span className="material-icons text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <span className="material-icons text-[20px]">add</span>
              New Project
            </button>
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
} 