import { supabase } from "./supabase";

// For debugging Supabase permissions issues
export const diagnosePermissions = async () => {
  try {
    console.log("Starting permission diagnostics...");

    // 1. Check if authenticated
    const { data: authData, error: authError } =
      await supabase.auth.getSession();
    if (authError) {
      console.error("Auth error:", authError);
      return { success: false, error: authError };
    }

    console.log(
      "Auth status:",
      authData.session ? "Authenticated" : "Not authenticated"
    );

    if (!authData.session) {
      console.error("User not authenticated");
      return { success: false, error: "Not authenticated" };
    }

    // 2. Try to read projects table
    console.log("Testing SELECT on projects...");
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .limit(1);

    if (projectsError) {
      console.error("Cannot read projects:", projectsError);
    } else {
      console.log("Can read projects ✓");
    }

    // 3. Try direct insert with RPC to bypass RLS
    console.log("Testing INSERT on projects via RPC...");
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_project_direct",
      {
        project_name: "Test Project via RPC",
        project_description: "Testing permissions via RPC",
        creator_id: authData.session.user.id,
      }
    );

    if (rpcError) {
      console.error("RPC insert failed:", rpcError);
    } else {
      console.log("RPC insert succeeded ✓", rpcData);
      return { success: true, projectId: rpcData.id };
    }

    // 4. Direct SQL for testing (this would bypass RLS but requires permissions)
    console.log("Testing raw SQL approach...");
    const { data: sqlData, error: sqlError } = await supabase
      .from("projects")
      .insert({
        name: "Test Project via SQL",
        description: "Testing direct SQL insert",
        created_by: authData.session.user.id,
      })
      .select()
      .single();

    if (sqlError) {
      console.error("SQL insert failed:", sqlError);
      return { success: false, error: sqlError };
    }

    console.log("SQL insert succeeded ✓", sqlData);
    return { success: true, projectId: sqlData.id };
  } catch (err) {
    console.error("Diagnostic error:", err);
    return { success: false, error: err };
  }
};

// Call this function in the console to run diagnostics
window.diagnosePermissions = diagnosePermissions;
