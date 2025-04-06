import Board from "./components/Board";
import Header from "./components/Header";
import Login from "./components/Auth/Login";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Auth wrapper component
function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Board />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <TaskProvider>
          <AuthenticatedApp />
        </TaskProvider>
      </DndProvider>
    </AuthProvider>
  );
}

export default App;
