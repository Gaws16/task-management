import { useState } from "react";
import { useTasks } from "../context/TaskContext";
import { useProjects } from "../context/ProjectContext";
import Column from "./Column";
import TaskModal from "./TaskModal";
import { motion } from "framer-motion";

function Board({ projectId }) {
  const { statuses, loading } = useTasks();
  const { currentProject } = useProjects();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Column configuration
  const columns = [
    {
      id: statuses.TODO,
      title: "To Do",
      color: "bg-gradient-to-r from-yellow-500 to-amber-500",
    },
    {
      id: statuses.IN_PROGRESS,
      title: "In Progress",
      color: "bg-gradient-to-r from-blue-500 to-indigo-500",
    },
    {
      id: statuses.TESTING,
      title: "Testing",
      color: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
    },
    {
      id: statuses.DONE,
      title: "Done",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-600">
          Tasks Board
        </h2>

        <motion.button
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
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
          Add Task
        </motion.button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            projectId={projectId}
          />
        ))}
      </div>

      {isTaskModalOpen && (
        <TaskModal
          projectId={projectId}
          onClose={() => setIsTaskModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Board;
