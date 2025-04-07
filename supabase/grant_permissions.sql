-- Grant permissions to the anon and authenticated roles
-- This file should be run in the Supabase SQL Editor

-- Disable RLS for testing
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Grant all privileges on all tables to authenticated users
GRANT ALL PRIVILEGES ON TABLE projects TO authenticated;
GRANT ALL PRIVILEGES ON TABLE project_members TO authenticated;
GRANT ALL PRIVILEGES ON TABLE tasks TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION is_member_of_project TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_of_project TO authenticated;
GRANT EXECUTE ON FUNCTION is_owner_of_project TO authenticated;
GRANT EXECUTE ON FUNCTION update_modified_column TO authenticated;
GRANT EXECUTE ON FUNCTION add_project_creator_as_owner TO authenticated;

-- Grant permissions to anon role as well
GRANT SELECT ON TABLE projects TO anon;
GRANT SELECT ON TABLE project_members TO anon;
GRANT SELECT ON TABLE tasks TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION is_member_of_project TO anon;
GRANT EXECUTE ON FUNCTION is_admin_of_project TO anon;
GRANT EXECUTE ON FUNCTION is_owner_of_project TO anon;

-- If you encounter errors related to permissions when using the auth schema:
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO anon, authenticated;

-- Optionally, you can enable RLS again after fixing permissions
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY; 