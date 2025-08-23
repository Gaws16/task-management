import { useState, useEffect } from "react";
import { useTasks } from "../context/TaskContext";
import { useProjects } from "../context/ProjectContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

function TaskModal({ task = null, projectId, onClose }) {
  const { statuses, addTask, updateTask, deleteTask } = useTasks();
  const { currentProject } = useProjects();

  const { user } = useAuth();

  // Initial state for a new task or editing an existing one
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || statuses.TODO,
    assignee_id: task?.assignee_id || null,
    priority: task?.priority || "medium",
  });

  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load project members
  useEffect(() => {
    if (currentProject && currentProject.members) {
      console.log(currentProject.members);
      // Extract members data from project
      const members = currentProject.members.map((member) => ({
        id: member.user_id,
        email: member.email || "Team Member", // Fallback if email not available
        avatar: `https://ui-avatars.com/api/?name=${
          member.email || "User"
        }&background=random`,
      }));

      setProjectMembers(members);
    }
  }, [currentProject]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save the task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (task) {
        await updateTask({ ...task, ...formData });
      } else {
        await addTask({
          ...formData,
          project_id: projectId,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setLoading(true);
      try {
        await deleteTask(task.id);
        onClose();
      } catch (error) {
        console.error("Error deleting task:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* Backdrop with animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal window with animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl w-full max-w-md z-10 relative border border-gray-700 overflow-hidden"
          >
            {/* Top color line based on priority */}
            <div
              className={`h-1.5 w-full ${
                formData.priority === "high"
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : formData.priority === "medium"
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                  : "bg-gradient-to-r from-green-500 to-emerald-500"
              }`}
            ></div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-600">
                  {task ? "Edit Task" : "New Task"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors duration-200 bg-gray-700 rounded-full p-1.5"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value={statuses.TODO}>To Do</option>
                      <option value={statuses.IN_PROGRESS}>In Progress</option>
                      <option value={statuses.TESTING}>Testing</option>
                      <option value={statuses.DONE}>Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Assigned To
                    </label>
                    <select
                      name="assignee_id"
                      value={formData.assignee_id || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                      Priority
                    </label>
                    <div className="flex space-x-3">
                      {[
                        { value: "low", label: "Low", color: "bg-green-500" },
                        {
                          value: "medium",
                          label: "Medium",
                          color: "bg-yellow-500",
                        },
                        { value: "high", label: "High", color: "bg-red-500" },
                      ].map((priority) => (
                        <label
                          key={priority.value}
                          className={`flex-1 flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                            formData.priority === priority.value
                              ? "bg-gray-600 ring-2 ring-indigo-500"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${priority.color} mb-2`}
                          ></div>
                          <span className="text-xs text-gray-300 font-medium">
                            {priority.label}
                          </span>
                          <input
                            type="radio"
                            name="priority"
                            value={priority.value}
                            checked={formData.priority === priority.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-5 mt-2">
                    {task && (
                      <motion.button
                        type="button"
                        onClick={handleDelete}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50"
                      >
                        Delete
                      </motion.button>
                    )}

                    <div className="ml-auto space-x-3">
                      <motion.button
                        type="button"
                        onClick={onClose}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl transition-colors duration-200 font-medium"
                      >
                        Cancel
                      </motion.button>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            {task ? "Updating..." : "Creating..."}
                          </div>
                        ) : task ? (
                          "Update"
                        ) : (
                          "Create"
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default TaskModal;
