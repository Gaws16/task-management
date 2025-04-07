-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;

-- Create a more permissive insert policy
CREATE POLICY "Anyone can insert projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Make sure the "Users can view their own projects" policy is correct
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

-- Force refresh of the RLS cache
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY; 