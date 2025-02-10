-- Add deleted_at column to projects table
ALTER TABLE projects 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update RLS policies to exclude deleted projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT 
TO authenticated
USING (auth.uid() = owner_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE 
TO authenticated
USING (auth.uid() = owner_id AND deleted_at IS NULL);

-- Create soft delete policy
CREATE POLICY "Users can soft delete their own projects"
ON projects FOR UPDATE 
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id); 