import { createContext, useState, useContext, useEffect } from "react";
import { projectsApi, projectMembersApi } from "../lib/api";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load all projects for the current user
  const loadProjects = async () => {
    if (!user) {
      setProjects([]);
      setCurrentProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  // Load a specific project by ID
  const loadProject = async (projectId) => {
    if (!projectId) {
      setCurrentProject(null);
      return;
    }

    setLoading(true);
    try {
      const data = await projectsApi.getById(projectId);
      setCurrentProject(data);
      setError(null);
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  // Create a new project
  const createProject = async (projectData) => {
    setLoading(true);
    try {
      const newProject = await projectsApi.create(projectData);
      setProjects([newProject, ...projects]);
      setError(null);
      return newProject;
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a project
  const updateProject = async (projectId, updates) => {
    setLoading(true);
    try {
      const updatedProject = await projectsApi.update(projectId, updates);

      // Update the projects list
      setProjects(
        projects.map((p) => (p.id === projectId ? updatedProject : p))
      );

      // Update current project if it's the one being edited
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(updatedProject);
      }

      setError(null);
      return updatedProject;
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId) => {
    setLoading(true);
    try {
      await projectsApi.delete(projectId);

      // Remove from projects list
      setProjects(projects.filter((p) => p.id !== projectId));

      // Clear current project if it's the one being deleted
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
      }

      setError(null);
      return true;
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Invite a new member to a project
  const inviteMember = async (projectId, email, role = "member") => {
    try {
      const result = await projectMembersApi.inviteByEmail(
        projectId,
        email,
        role
      );

      // If this is the current project, refresh it to show the new member
      if (currentProject && currentProject.id === projectId) {
        await loadProject(projectId);
      }

      return result;
    } catch (err) {
      console.error("Error inviting project member:", err);
      setError("Failed to invite member");
      throw err;
    }
  };

  // Remove a member from a project
  const removeMember = async (memberId) => {
    try {
      await projectMembersApi.removeMember(memberId);

      // If this affects the current project, refresh it
      if (currentProject) {
        await loadProject(currentProject.id);
      }

      return true;
    } catch (err) {
      console.error("Error removing project member:", err);
      setError("Failed to remove member");
      throw err;
    }
  };

  // Check if the current user has a specific role in a project
  const hasRole = (projectId, roles = ["owner", "admin", "member"]) => {
    if (!user || !projectId) return false;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return false;

    // If user is the creator, they have all rights
    if (project.created_by === user.id) return true;

    // Check if user is a member with one of the specified roles
    const memberList = project.members || project.project_members || [];
    const membership = memberList.find((m) => m.user_id === user.id);
    return membership && roles.includes(membership.role);
  };

  const value = {
    projects,
    currentProject,
    loading,
    error,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    inviteMember,
    removeMember,
    loadProjects,
    hasRole,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export const useProjects = () => useContext(ProjectContext);

export default ProjectContext;
