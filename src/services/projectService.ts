import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/project';

export const projectService = {
  async createProject(name: string, description?: string): Promise<Project> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data: functionData, error: functionError } = await supabase.functions.invoke('create-project', {
      body: { name, description },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (functionError) throw functionError;
    return functionData.project;
  },

  async getProjects(projectId?: string): Promise<Project[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data: functionData, error: functionError } = await supabase.functions.invoke('get-projects', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      ...(projectId ? { query: { project_id: projectId } } : {}),
    });

    if (functionError) throw functionError;
    return projectId ? functionData.project : functionData.projects;
  },
}; 