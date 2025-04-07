-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Members Table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'testing', 'done')),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a user is a member of a project
CREATE OR REPLACE FUNCTION is_member_of_project(project UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE user_id = auth.uid() AND project_id = project
  )
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE id = project AND created_by = auth.uid()
  );
$$;

-- Helper function to check if a user is an admin or owner of a project
CREATE OR REPLACE FUNCTION is_admin_of_project(project UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE user_id = auth.uid() 
    AND project_id = project
    AND role IN ('owner', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE id = project AND created_by = auth.uid()
  );
$$;

-- Helper function to check if a user is an owner of a project
CREATE OR REPLACE FUNCTION is_owner_of_project(project UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE user_id = auth.uid() 
    AND project_id = project
    AND role = 'owner'
  )
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE id = project AND created_by = auth.uid()
  );
$$;

-- Projects RLS Policies
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

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Project owners and admins can update projects"
  ON projects FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners can delete projects"
  ON projects FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
      AND project_members.role = 'owner'
    )
  );

-- Project Members RLS Policies - Using helper functions
CREATE POLICY "Project members can view other members"
  ON project_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_member_of_project(project_id)
  );

CREATE POLICY "Project owners and admins can insert members"
  ON project_members FOR INSERT
  WITH CHECK (
    is_admin_of_project(project_id)
  );

CREATE POLICY "Project owners and admins can update members"
  ON project_members FOR UPDATE
  USING (
    is_admin_of_project(project_id)
  );

CREATE POLICY "Project owners and admins can delete members"
  ON project_members FOR DELETE
  USING (
    is_admin_of_project(project_id)
  );

-- Tasks RLS Policies
CREATE POLICY "Project members can view tasks"
  ON tasks FOR SELECT
  USING (
    is_member_of_project(project_id)
  );

CREATE POLICY "Project members can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    is_member_of_project(project_id)
  );

CREATE POLICY "Project members can update tasks"
  ON tasks FOR UPDATE
  USING (
    is_member_of_project(project_id)
  );

CREATE POLICY "Project owners and admins can delete tasks"
  ON tasks FOR DELETE
  USING (
    is_admin_of_project(project_id)
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Automatically add project creator as owner
CREATE OR REPLACE FUNCTION add_project_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER add_project_creator_trigger
AFTER INSERT ON projects
FOR EACH ROW EXECUTE PROCEDURE add_project_creator_as_owner(); 