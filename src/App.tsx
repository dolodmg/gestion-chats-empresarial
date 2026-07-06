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
import MetaEventos from './pages/MetaEventos';
import Asesores from './pages/Asesores';
import AdvisorMetrics from './pages/AdvisorMetrics';
import Campaigns from './pages/Campaigns';
import WhatsAppCampaigns from './pages/WhatsAppCampaigns';
import Templates from './pages/Templates';
import ClientMetrics from './pages/ClientMetrics';
import SendingDomains from './pages/SendingDomains';
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
        path="/admin/client-metrics/:clientId/:userName"
        element={
          <ProtectedRoute requiredRole="admin">
            <ClientMetrics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data"
        element={
          <ProtectedRoute requiredFeature="data">
            <MisDatos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inscripciones"
        element={
          <ProtectedRoute requiredClientId="751524394719240" excludeRole="advisor" requiredFeature="inscripciones">
            <Inscripciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute excludeRole="advisor" requiredFeature="assistant">
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
      <Route
        path="/meta-eventos"
        element={
          <ProtectedRoute excludeRole="advisor" requiredFeature="metaEventos">
            <MetaEventos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asesores"
        element={
          <ProtectedRoute excludeRole="advisor" requiredFeature="advisors">
            <Asesores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor-metrics"
        element={
          <ProtectedRoute excludeRole="advisor" requiredFeature="advisorMetrics">
            <AdvisorMetrics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute requiredFeature="campaigns">
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sending-domains"
        element={
          <ProtectedRoute requiredFeature="campaigns">
            <SendingDomains />
          </ProtectedRoute>
        }
      />
      <Route
        path="/whatsapp-campaigns"
        element={
          <ProtectedRoute requiredFeature="whatsappCampaigns">
            <WhatsAppCampaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute excludeRole="advisor" requiredFeature="templates">
            <Templates />
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
