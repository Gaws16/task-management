import { createContext, useState, useContext, useEffect } from "react";
import { tasksApi } from "../lib/api";
import { useProjects } from "./ProjectContext";
import { useAuth } from "./AuthContext";

// Create Task context
const TaskContext = createContext();

// Task statuses
const STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  TESTING: "testing",
  DONE: "done",
};

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentProject } = useProjects();
  const { user } = useAuth();

  // Load tasks when current project changes
  useEffect(() => {
    if (!currentProject || !user) {
      setTasks([]);
      return;
    }

    const loadTasks = async () => {
      setLoading(true);
      try {
        const projectTasks = await tasksApi.getByProject(currentProject.id);
        setTasks(projectTasks);
        setError(null);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [currentProject, user]);

  // Add a new task
  const addTask = async (task) => {
    if (!currentProject) return;

    setLoading(true);
    try {
      const newTask = await tasksApi.create({
        ...task,
        project_id: currentProject.id,
      });
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setError(null);
      return newTask;
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing task
  const updateTask = async (updatedTask) => {
    setLoading(true);
    try {
      const result = await tasksApi.update(updatedTask.id, updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === result.id ? result : task))
      );
      setError(null);
      return result;
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    setLoading(true);
    try {
      await tasksApi.delete(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setError(null);
      return true;
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change task status
  const moveTask = async (taskId, newStatus) => {
    setLoading(true);
    try {
      const result = await tasksApi.changeStatus(taskId, newStatus);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      setError(null);
      return result;
    } catch (err) {
      console.error("Error changing task status:", err);
      setError("Failed to change task status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Assign task to user
  const assignTask = async (taskId, userId) => {
    setLoading(true);
    try {
      const result = await tasksApi.assignToUser(taskId, userId);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, assignee_id: userId } : task
        )
      );
      setError(null);
      return result;
    } catch (err) {
      console.error("Error assigning task:", err);
      setError("Failed to assign task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get tasks by status
  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const value = {
    tasks,
    loading,
    error,
    statuses: STATUSES,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    assignTask,
    getTasksByStatus,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// Helper function to use context
export const useTasks = () => useContext(TaskContext);

export default TaskContext;
