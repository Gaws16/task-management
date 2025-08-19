-- Create project_invitations table
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(project_id, email)
);

-- Enable RLS
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Project admins can view invitations"
  ON project_invitations FOR SELECT
  USING (
    is_admin_of_project(project_id)
  );

CREATE POLICY "Project admins can insert invitations"
  ON project_invitations FOR INSERT
  WITH CHECK (
    is_admin_of_project(project_id)
  );

CREATE POLICY "Project admins can update invitations"
  ON project_invitations FOR UPDATE
  USING (
    is_admin_of_project(project_id)
  );

CREATE POLICY "Project admins can delete invitations"
  ON project_invitations FOR DELETE
  USING (
    is_admin_of_project(project_id)
  );

-- Update the handle_new_user function to process invitations
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  -- Process any pending project invitations for this email
  INSERT INTO project_members (project_id, user_id, role)
  SELECT project_id, NEW.id, role
  FROM project_invitations
  WHERE email = NEW.email 
    AND status = 'pending'
    AND expires_at > NOW();
  
  -- Mark invitations as accepted
  UPDATE project_invitations
  SET status = 'accepted'
  WHERE email = NEW.email 
    AND status = 'pending'
    AND expires_at > NOW();
  
  RETURN NEW;
END;
$$;
