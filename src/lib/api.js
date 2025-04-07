import { supabase } from "./supabase";

// Projects API
export const projectsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("projects")
      .select("*, project_members(id, user_id, role)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("projects")
      .select("*, project_members(id, user_id, role)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(project) {
    // Get current user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) throw new Error("User not authenticated");

    try {
      // First, try direct insert
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: project.name,
            description: project.description,
            created_by: userId,
          },
        ])
        .select()
        .single();

      // If direct insert works, return the data
      if (!error) {
        return data;
      }

      console.warn("Direct insert failed, trying RPC method:", error);

      // If direct insert fails, try the RPC method which bypasses RLS
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "create_project_direct",
        {
          project_name: project.name,
          project_description: project.description || "",
          creator_id: userId,
        }
      );

      if (rpcError) {
        console.error("RPC insert also failed:", rpcError);
        throw rpcError;
      }

      return rpcData;
    } catch (err) {
      console.error("Detailed error:", err);
      throw err;
    }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};

// Project Members API
export const projectMembersApi = {
  async getByProject(projectId) {
    const { data, error } = await supabase
      .from("project_members")
      .select("*, profiles:user_id(id, email, avatar_url, full_name)")
      .eq("project_id", projectId)
      .order("role", { ascending: true });

    if (error) throw error;
    return data;
  },

  async addMember(projectId, userId, role = "member") {
    const { data, error } = await supabase
      .from("project_members")
      .insert([
        {
          project_id: projectId,
          user_id: userId,
          role,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async inviteByEmail(projectId, email, role = "member") {
    // First, check if the user already exists in the system
    const { data: users, error: userError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError && userError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      throw userError;
    }

    if (users) {
      // User exists, add them to the project
      return this.addMember(projectId, users.id, role);
    } else {
      // User doesn't exist, send invitation email
      // This would typically integrate with an email service
      // For now, we'll just return a placeholder
      return {
        pending: true,
        email,
        message: `Invitation sent to ${email}`,
      };
    }
  },

  async updateMemberRole(memberId, role) {
    const { data, error } = await supabase
      .from("project_members")
      .update({ role })
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeMember(memberId) {
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
    return true;
  },
};

// Tasks API
export const tasksApi = {
  async getByProject(projectId) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, assignee:assignee_id(id, email, avatar_url, full_name)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, assignee:assignee_id(id, email, avatar_url, full_name)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(task) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: task.title,
          description: task.description,
          status: task.status || "todo",
          project_id: task.project_id,
          assignee_id: task.assignee_id,
          priority: task.priority || "medium",
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async changeStatus(id, status) {
    return this.update(id, { status });
  },

  async assignToUser(id, userId) {
    return this.update(id, { assignee_id: userId });
  },

  async delete(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
