-- Create a function to directly insert a project, bypassing RLS
CREATE OR REPLACE FUNCTION create_project_direct(
  project_name TEXT,
  project_description TEXT,
  creator_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_project_id UUID;
BEGIN
  -- Insert the project
  INSERT INTO projects (name, description, created_by)
  VALUES (project_name, project_description, creator_id)
  RETURNING id INTO new_project_id;
  
  -- Insert the project owner record
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (new_project_id, creator_id, 'owner');
  
  -- Return the project data with explicit column aliases to avoid ambiguity
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.created_by
  FROM projects p
  WHERE p.id = new_project_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_project_direct TO authenticated;
GRANT EXECUTE ON FUNCTION create_project_direct TO anon; 