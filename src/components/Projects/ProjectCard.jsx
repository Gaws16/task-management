import { motion } from "framer-motion";

function ProjectCard({ project, onClick }) {
  return (
    <motion.div
      key={project.id}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-700"
      whileHover={{ y: -5 }}
      onClick={() => onClick(project.id)}
    >
      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-white">{project.name}</h3>
        <p className="text-gray-400 mb-4 line-clamp-2">
          {project.description || "No description provided"}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <div className="text-sm text-gray-400">
              {project.members?.length || 1} members
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProjectCard;
