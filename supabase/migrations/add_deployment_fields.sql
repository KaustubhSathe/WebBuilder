-- Add deployment-related columns to projects table
ALTER TABLE projects
ADD COLUMN deployment_url TEXT,
ADD COLUMN last_deployed TIMESTAMP WITH TIME ZONE; 