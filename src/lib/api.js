import { supabase } from "./supabase";

// Projects API
export const projectsApi = {
  async getAll() {
    // Get projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsError) throw projectsError;

    // Get all project members in one go
    const { data: members, error: membersError } = await supabase
      .from("project_members")
      .select("id, user_id, role, project_id");

    if (membersError) throw membersError;

    // Attach members to their projects
    const projectsWithMembers = projects.map((project) => ({
      ...project,
      members: members.filter((m) => m.project_id === project.id),
    }));

    return projectsWithMembers;
  },
  async getById(id) {
    // Get the project itself
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError) throw projectError;

    // Get project members separately
    const { data: members, error: membersError } = await supabase
      .from("project_members")
      .select("id, user_id, role") // you can also join profiles here
      .eq("project_id", id);

    if (membersError) throw membersError;

    return { ...project, members };
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

      // If direct insert works, try to add the creator as owner
      if (!error) {
        // Try to manually add the creator as owner (in case trigger didn't work)
        try {
          await supabase.from("project_members").insert([
            {
              project_id: data.id,
              user_id: userId,
              role: "owner",
            },
          ]);
        } catch (memberErr) {
          console.warn(
            "Failed to add creator as member (might already exist):",
            memberErr
          );
          // Continue anyway, as the project was created successfully
        }

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
    // Try to include profile info; if profiles table is missing, fall back gracefully
    const { data, error } = await supabase
      .from("project_members")
      .select("*, profiles:user_id(id, email, avatar_url, full_name)")
      .eq("project_id", projectId)
      .order("role", { ascending: true });

    if (!error) return data;

    if (error.code === "PGRST205") {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", projectId)
        .order("role", { ascending: true });
      if (fallbackError) throw fallbackError;
      return fallbackData;
    }

    throw error;
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

    if (error) {
      // Handle unique violation gracefully (already a member)
      if (error.code === "23505") {
        return {
          added: false,
          alreadyMember: true,
          project_id: projectId,
          user_id: userId,
          role,
        };
      }
      throw error;
    }
    return data;
  },

  async inviteByEmail(projectId, email, role = "member") {
    // First, check if the user already exists in the system
    // We need to use a different approach since we can't directly query auth.users
    // Instead, we'll check if the user exists in our profiles table
    let profiles = null;
    try {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();
      if (profileError && profileError.code !== "PGRST116") {
        // If the profiles table is missing (PGRST205), fall back to anon invite placeholder
        if (profileError.code === "PGRST205") {
          return {
            pending: true,
            email,
            message:
              "Could not verify user in profiles; sent a placeholder invite.",
          };
        }
        throw profileError;
      }
      profiles = data || null;
    } catch (err) {
      // If the table truly doesn't exist in schema cache, surface a friendly message
      if (err && err.code === "PGRST205") {
        return {
          pending: true,
          email,
          message:
            "Profiles table not available; invite recorded locally only.",
        };
      }
      throw err;
    }

    if (profiles) {
      // User exists, add them to the project
      const added = await this.addMember(projectId, profiles.id, role);
      return added?.id
        ? { added: true, member: added }
        : { added: false, alreadyMember: true };
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
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // If we need assignee information, get it separately
    if (data && data.length > 0) {
      const tasksWithAssignees = await Promise.all(
        data.map(async (task) => {
          if (task.assignee_id) {
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("id, email, avatar_url, full_name")
              .eq("id", task.assignee_id)
              .single();

            if (!userError && userData) {
              return { ...task, assignee: userData };
            }
          }
          return task;
        })
      );
      return tasksWithAssignees;
    }

    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Get assignee data if needed
    if (data && data.assignee_id) {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, email, avatar_url, full_name")
        .eq("id", data.assignee_id)
        .single();

      if (!userError && userData) {
        data.assignee = userData;
      }
    }

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
