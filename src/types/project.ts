export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  owner_id: string;
} 