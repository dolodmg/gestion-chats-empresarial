import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'special';
  requiredClientId?: string;
  excludeRole?: 'advisor' | 'admin' | 'client';
}

export default function ProtectedRoute({ children, requiredRole, requiredClientId, excludeRole }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol del usuario está excluido, redirigir
  if (excludeRole && user.role === excludeRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredClientId && user.clientId !== requiredClientId && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}