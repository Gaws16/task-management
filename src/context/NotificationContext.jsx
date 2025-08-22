import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

const NotificationContext = createContext();

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (notification) => {
      const id = crypto.randomUUID();
      const duration = notification.duration ?? 3000;
      const item = {
        id,
        type: notification.type || "info",
        message: notification.message,
        duration,
      };
      setItems((prev) => [item, ...prev]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 w-80">
        <AnimatePresence>
          {items.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`rounded-lg p-3 shadow border text-sm ${
                n.type === "error"
                  ? "bg-red-500/20 border-red-500 text-red-200"
                  : n.type === "success"
                  ? "bg-green-500/25 border-green-400 text-green-100"
                  : "bg-gray-700 border-gray-600 text-gray-200"
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="leading-snug">{n.message}</div>
                <button
                  onClick={() => remove(n.id)}
                  className="text-xs opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
