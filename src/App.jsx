import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Auth/Login";
import ProjectsList from "./components/Projects/ProjectsList";
import ProjectDetail from "./components/Projects/ProjectDetail";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { ProfileProvider } from "./context/ProfileContext";
import { NotificationsProvider } from "./context/NotificationContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Auth wrapper component
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/projects" replace />}
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Header />
            <ProjectsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <Header />
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationsProvider>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <DndProvider backend={HTML5Backend}>
              <ProjectProvider>
                <ProfileProvider>
                  <TaskProvider>
                    <AppRoutes />
                  </TaskProvider>
                </ProfileProvider>
              </ProjectProvider>
            </DndProvider>
          </div>
        </NotificationsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
