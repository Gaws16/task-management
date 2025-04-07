import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProjectModal from "./ProjectModal";

function ProjectsList() {
  const { projects, loading, error } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Empty state when there are no projects
  if (!loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <div className="bg-blue-500 bg-opacity-10 p-6 rounded-full inline-flex mb-6">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">
            No Projects Yet
          </h2>
          <p className="text-gray-400 mb-8">
            Create your first project to start organizing your tasks and
            collaborating with your team.
          </p>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Create First Project</span>
          </motion.button>
        </motion.div>
        {isModalOpen && <ProjectModal onClose={() => setIsModalOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Your Projects</h1>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Project
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-700"
              whileHover={{ y: -5 }}
              onClick={() => openProject(project.id)}
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">
                  {project.name}
                </h3>
                <p className="text-gray-400 mb-4 line-clamp-2">
                  {project.description || "No description provided"}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className="text-sm text-gray-400">
                      {project.project_members?.length || 1} members
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && <ProjectModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default ProjectsList;
