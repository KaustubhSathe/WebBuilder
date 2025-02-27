import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/project";
import type { Page } from "@/store/pagesSlice";

export const projectService = {
  async createProject(name: string, description?: string): Promise<Project> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data: functionData, error: functionError } =
      await supabase.functions.invoke("create-project", {
        body: { name, description },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

    if (functionError) throw functionError;
    return functionData.project;
  },

  async getProjects(projectId?: string): Promise<Project[]> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data: functionData, error: functionError } =
      await supabase.functions.invoke(
        projectId ? `get-projects?project_id=${projectId}` : "get-projects",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

    if (functionError) throw functionError;
    return functionData?.projects || [];
  },

  async deleteProject(projectId: string): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { error: functionError } = await supabase.functions.invoke(
      "delete-project",
      {
        body: { project_id: projectId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (functionError) throw functionError;
  },

  async addPage(projectId: string, name: string): Promise<Page> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const path = "/" + name.toLowerCase().replace(/\s+/g, "-");

    const { data: functionData, error: functionError } =
      await supabase.functions.invoke("add-page", {
        body: { project_id: projectId, name, path },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

    if (functionError) throw functionError;
    return functionData.page;
  },

  async saveProject(projectId: string, pages: Page[]): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { error: functionError } = await supabase.functions.invoke(
      "save-project",
      {
        body: { project_id: projectId, pages },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (functionError) throw functionError;
  },

  async deletePage(pageId: string): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { error } = await supabase.functions.invoke("delete-page", {
      body: { pageId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
  },
};
