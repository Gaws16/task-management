-- Grant all permissions to authenticated users for all tables
-- This script should be run in the Supabase SQL Editor

-- Grant all privileges on all tables to authenticated users
GRANT ALL PRIVILEGES ON TABLE projects TO authenticated;
GRANT ALL PRIVILEGES ON TABLE project_members TO authenticated;
GRANT ALL PRIVILEGES ON TABLE tasks TO authenticated;
GRANT ALL PRIVILEGES ON TABLE profiles TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION is_member_of_project TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_of_project TO authenticated;
GRANT EXECUTE ON FUNCTION is_owner_of_project TO authenticated;
GRANT EXECUTE ON FUNCTION update_modified_column TO authenticated;
GRANT EXECUTE ON FUNCTION add_project_creator_as_owner TO authenticated;
GRANT EXECUTE ON FUNCTION create_project_direct TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user TO authenticated;

-- Grant permissions to anon role as well (for public access)
GRANT SELECT ON TABLE projects TO anon;
GRANT SELECT ON TABLE project_members TO anon;
GRANT SELECT ON TABLE tasks TO anon;
GRANT SELECT ON TABLE profiles TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION is_member_of_project TO anon;
GRANT EXECUTE ON FUNCTION is_admin_of_project TO anon;
GRANT EXECUTE ON FUNCTION is_owner_of_project TO anon;

-- If you encounter errors related to permissions when using the auth schema:
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO anon, authenticated;

-- Optionally, you can disable RLS for testing purposes
-- ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY; 