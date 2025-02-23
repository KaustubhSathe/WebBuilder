-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pages table
CREATE TABLE pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  is_home BOOLEAN DEFAULT false,
  component_tree JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create indexes
CREATE INDEX pages_project_id_idx ON pages(project_id);
CREATE INDEX pages_deleted_at_idx ON pages(deleted_at) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX pages_project_path_idx ON pages(project_id, path) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX pages_project_home_idx ON pages(project_id) WHERE is_home = true AND deleted_at IS NULL;

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own pages" ON pages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM projects 
      WHERE id = pages.project_id
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can update their own pages" ON pages
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM projects 
      WHERE id = pages.project_id
    )
    AND deleted_at IS NULL
  );

-- Soft delete policy
CREATE POLICY "Users can soft delete their own pages" ON pages
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM projects 
      WHERE id = pages.project_id
    )
    AND deleted_at IS NULL
  ) WITH CHECK (
    deleted_at IS NOT NULL
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

-- Function to create initial home page for new project
CREATE OR REPLACE FUNCTION create_initial_home_page()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pages (project_id, name, path, is_home, component_tree)
  VALUES (
    NEW.id,
    'Home',
    '/',
    true,
    jsonb_build_object(
      'id', 'root',
      'type', 'main',
      'styles', jsonb_build_object(
        'width', '100%',
        'height', '100%',
        'padding', '0',
        'margin', '0'
      ),
      'children', jsonb_build_array()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic home page creation
CREATE TRIGGER create_initial_home_page_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_home_page(); 