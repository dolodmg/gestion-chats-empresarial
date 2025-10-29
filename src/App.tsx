import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import MisDatos from './pages/MisDatos';
import Inscripciones from './pages/Inscripciones';
import AsistenteIA from './pages/AsistenteIA';
import Perfil from './pages/Perfil';
import UserTables from './pages/UserTables';
import { Toaster } from "@/components/ui/sonner";

function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        }
      />
      {/* ruta para las tablas del usuario */}
      <Route
        path="/admin/user-tables/:clientId/:userName"
        element={
          <ProtectedRoute requiredRole="admin">
            <UserTables />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data"
        element={
          <ProtectedRoute>
            <MisDatos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inscripciones"
        element={
          <ProtectedRoute requiredClientId="751524394719240">
            <Inscripciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AsistenteIA />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Layout>
            <AppRoutes />
            <Toaster position='top-right' />
          </Layout>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
