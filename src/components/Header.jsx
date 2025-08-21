import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProjectModal from "./Projects/ProjectModal";
import { projectMembersApi } from "../lib/api";
import { useNotifications } from "../context/NotificationContext";

function Header() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notify } = useNotifications();
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const loadInvites = async () => {
    if (!user) return setInvites([]);
    setLoadingInvites(true);
    try {
      const data = await projectMembersApi.getInvitationsForCurrentUser();
      setInvites(data);
    } catch (e) {
      // noop
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, [user]);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      notify({ type: "error", message: "Error logging out: " + error.message });
    }
  };

  // Check if we're on the projects list page
  const isProjectsPage = location.pathname === "/projects";

  return (
    <header className="bg-gray-800 border-b border-gray-700 py-5">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onClick={() => navigate("/projects")}
            className="cursor-pointer"
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
            Task Manager
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center mr-4">
              <div className="flex flex-col items-end mr-3">
                <span className="text-sm text-gray-300 font-medium">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
              <div className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.email ? user.email.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="ml-3 relative">
                <button
                  onClick={loadInvites}
                  className="relative px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 text-sm"
                  title="Refresh invitations"
                >
                  Invites
                  {invites.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">
                      {invites.length}
                    </span>
                  )}
                </button>
                {invites.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-200 text-sm font-medium">
                        Pending Invitations
                      </span>
                      <button
                        onClick={loadInvites}
                        className="text-xs text-gray-400 hover:text-gray-200"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {invites.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-2 bg-gray-700 rounded-md"
                        >
                          <div className="text-sm text-gray-200">
                            Project invite
                          </div>
                          <div className="text-xs text-gray-400">
                            Role: {inv.role}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-500"
                              onClick={async () => {
                                try {
                                  await projectMembersApi.acceptInvitation(
                                    inv.id
                                  );
                                  notify({
                                    type: "success",
                                    message: `Joined project ${
                                      inv.projects?.name || ""
                                    }`,
                                  });
                                  await loadInvites();
                                  if (location.pathname !== "/projects")
                                    navigate("/projects");
                                } catch (e) {
                                  notify({
                                    type: "error",
                                    message:
                                      e.message || "Failed to accept invite",
                                  });
                                }
                              }}
                            >
                              Accept
                            </button>
                            <button
                              className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-500"
                              onClick={async () => {
                                try {
                                  await projectMembersApi.declineInvitation(
                                    inv.id
                                  );
                                  notify({
                                    type: "info",
                                    message: `Declined invite for ${
                                      inv.projects?.name || "project"
                                    }`,
                                  });
                                  await loadInvites();
                                } catch (e) {
                                  notify({
                                    type: "error",
                                    message:
                                      e.message || "Failed to decline invite",
                                  });
                                }
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* {isProjectsPage && (
            <div>
              <motion.button
                onClick={() => setIsProjectModalOpen(true)}
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
                New Project tuk
              </motion.button>
            </div>
          )} */}
        </div>

        {isProjectModalOpen && (
          <ProjectModal onClose={() => setIsProjectModalOpen(false)} />
        )}
      </div>
    </header>
  );
}

export default Header;
