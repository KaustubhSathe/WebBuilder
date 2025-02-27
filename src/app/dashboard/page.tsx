"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import CreateProjectModal from "@/components/Utils/CreateProjectModal";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [_user, setUser] = useState<User>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
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
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const projects = await projectService.getProjects();
      setProjects(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const project = await projectService.createProject(name, description);
      router.push(`/builder?project_id=${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await projectService.deleteProject(projectId);
      // Refresh projects list
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      setProjects(updatedProjects);
    } catch (error) {
      console.error("Error deleting project:", error);
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
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 border-b border-[#3c3c3c]">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 hidden md:table-cell border-b border-[#3c3c3c]">
                  Description
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 border-b border-[#3c3c3c]">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-400 w-20 border-b border-[#3c3c3c]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-[#2c2c2c] transition-colors cursor-pointer border-b border-[#3c3c3c] last:border-b-0"
                  onClick={() =>
                    window.open(`/builder?project_id=${project.id}`, "_blank")
                  }
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#2c2c2c] rounded flex items-center justify-center">
                        {project.thumbnail ? (
                          <Image
                            src={project.thumbnail}
                            alt={project.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="material-icons text-gray-600">
                            web
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-200">
                          {project.name}
                        </div>
                        <div className="text-sm text-gray-400 md:hidden">
                          {project.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 hidden md:table-cell">
                    {project.description || "No description"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                      >
                        <span className="material-icons text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
