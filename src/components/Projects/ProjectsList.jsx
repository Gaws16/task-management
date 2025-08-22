import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProjectModal from "./ProjectModal";
import ProjectCard from "./ProjectCard";
import NewProjectButton from "./NewProjectButton";

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
          <NewProjectButton
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 mx-auto"
          >
            Create First Project
          </NewProjectButton>
        </motion.div>
        {isModalOpen && <ProjectModal onClose={() => setIsModalOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Your Projects</h1>
        <NewProjectButton onClick={() => setIsModalOpen(true)} />
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
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => openProject(project.id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && <ProjectModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default ProjectsList;
