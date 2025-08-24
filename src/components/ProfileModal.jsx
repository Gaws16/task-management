import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useNotifications } from "../context/NotificationContext";

function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { notify } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
  });
  const modalRef = useRef(null);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
      notify({
        type: "success",
        message: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      notify({
        type: "error",
        message: "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
    });
    setIsEditing(false);
  };

  if (!isOpen) return null;

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
          />

          {/* Modal window with animation */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl w-full max-w-md z-10 relative border border-gray-700 overflow-hidden"
          >
            {/* Top color line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 to-blue-600"></div>

            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        profile?.avatar_url ? "hidden" : "flex"
                      }`}
                    >
                      {profile?.full_name
                        ? profile.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : user?.email?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-600">
                      {profile?.full_name || "Your Profile"}
                    </h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors duration-200 bg-gray-700 rounded-full p-2"
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

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white">
                          {profile?.full_name || "Not set"}
                        </div>
                      )}
                    </div>

                    {/* Avatar URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Avatar URL (Optional)
                      </label>
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="url"
                            name="avatar_url"
                            value={formData.avatar_url}
                            onChange={handleChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            placeholder="https://example.com/avatar.jpg"
                          />
                          {formData.avatar_url && (
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-600 rounded-full overflow-hidden flex items-center justify-center">
                                <img
                                  src={formData.avatar_url}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                                <div className="hidden w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  Invalid
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">
                                Preview
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white">
                          {profile?.avatar_url ? (
                            <div
                              className="truncate"
                              title={profile.avatar_url}
                            >
                              {profile.avatar_url}
                            </div>
                          ) : (
                            "Not set"
                          )}
                        </div>
                      )}
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Email
                      </label>
                      <div className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-gray-400">
                        {user?.email}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed from this interface
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      {isEditing ? (
                        <>
                          <motion.button
                            type="button"
                            onClick={handleCancel}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl transition-colors duration-200 font-medium"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={saving}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50"
                          >
                            {saving ? (
                              <div className="flex items-center">
                                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                Saving...
                              </div>
                            ) : (
                              "Save Changes"
                            )}
                          </motion.button>
                        </>
                      ) : (
                        <motion.button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl transition-colors duration-200 font-medium"
                        >
                          Edit Profile
                        </motion.button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default ProfileModal;
