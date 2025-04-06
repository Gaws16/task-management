import { useState } from "react";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import TaskModal from "./TaskModal";
import { motion } from "framer-motion";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      alert("Error logging out: " + error.message);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 py-5">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <svg
              className="h-8 w-8 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </motion.div>
          <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-600">
            Управление на Задачи
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center mr-4">
              <span className="text-sm text-gray-400 mr-2">{user.email}</span>
              <motion.button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </motion.button>
            </div>
          )}

          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="h-5 w-5 mr-2"
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
            Нова Задача
          </motion.button>
        </div>

        {isModalOpen && <TaskModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </header>
  );
}

export default Header;
