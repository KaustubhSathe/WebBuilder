// User types
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Page types
export interface Page {
  id: string;
  project_id: string;
  name: string;
  path: string;
  is_home: boolean;
  component_tree: object;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Comment types
export interface Comment {
  id: string;
  project_id: string;
  page_id: string;
  user_id: string;
  content: string;
  position_x: number;
  position_y: number;
  is_resolved: boolean;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user?: User;
  replies?: Comment[];
}

// Reply is just a Comment with a parent_id
export type Reply = Comment; 