-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create indexes
CREATE INDEX comments_project_id_idx ON comments(project_id);
CREATE INDEX comments_page_id_idx ON comments(page_id);
CREATE INDEX comments_user_id_idx ON comments(user_id);
CREATE INDEX comments_parent_id_idx ON comments(parent_id);
CREATE INDEX comments_deleted_at_idx ON comments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX comments_is_resolved_idx ON comments(is_resolved);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view comments on projects they have access to" ON comments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM projects 
      WHERE id = comments.project_id
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can create comments on projects they have access to" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM projects 
      WHERE id = comments.project_id
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
  );

-- Soft delete policy
CREATE POLICY "Users can soft delete their own comments" ON comments
  FOR UPDATE USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
  ) WITH CHECK (
    deleted_at IS NOT NULL
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at(); 