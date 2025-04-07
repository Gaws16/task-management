import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { useTasks } from "../../context/TaskContext";
import Board from "../Board";
import ProjectModal from "./ProjectModal";
import InviteModal from "./InviteModal";
import { motion } from "framer-motion";

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    currentProject,
    loadProject,
    hasRole,
    deleteProject,
    loading: projectLoading,
    error: projectError,
  } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId);
      navigate("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  if (projectLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg">
          Error: {projectError}
        </div>
        <button
          onClick={() => navigate("/projects")}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-xl text-white mb-4">Project not found</h2>
          <button
            onClick={() => navigate("/projects")}
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = hasRole(projectId, ["owner", "admin"]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/projects")}
            className="mr-4 text-gray-400 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">
            {currentProject.name}
          </h1>
        </div>

        <div className="flex space-x-2">
          {isAdmin && (
            <>
              <motion.button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Invite
              </motion.button>

              <motion.button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </motion.button>

              <motion.button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-red-600 text-white flex items-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {currentProject.description && (
        <div className="mb-8 text-gray-400 bg-gray-800 p-4 rounded-lg">
          <p>{currentProject.description}</p>
        </div>
      )}

      <Board projectId={projectId} />

      {isEditModalOpen && (
        <ProjectModal
          project={currentProject}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isInviteModalOpen && (
        <InviteModal
          projectId={projectId}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl shadow-xl overflow-hidden max-w-md w-full border border-gray-700 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Delete Project?
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{currentProject.name}"? This
              action cannot be undone and all tasks will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete Project
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
