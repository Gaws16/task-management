import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { motion, AnimatePresence } from "framer-motion";

function ProjectModal({ project = null, onClose }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { createProject, updateProject } = useProjects();
  const isEditMode = Boolean(project);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await updateProject(project.id, { name, description });
      } else {
        await createProject({ name, description });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-800 rounded-xl shadow-xl overflow-hidden max-w-md w-full border border-gray-700"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? "Edit Project" : "Create New Project"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2 text-gray-300"
                  htmlFor="name"
                >
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter project name"
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2 text-gray-300"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </div>
                  ) : isEditMode ? (
                    "Update Project"
                  ) : (
                    "Create Project"
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ProjectModal;
