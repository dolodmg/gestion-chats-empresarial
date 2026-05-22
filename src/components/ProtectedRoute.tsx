import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClientFeatureKey, isFeatureEnabled } from '@/utils/featureFlags';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'special';
  requiredClientId?: string;
  excludeRole?: 'advisor' | 'admin' | 'client';
  requiredFeature?: ClientFeatureKey;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredClientId,
  excludeRole,
  requiredFeature
}: ProtectedRouteProps) {
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

  if (requiredFeature && !isFeatureEnabled(user.role, requiredFeature, user.featureFlags)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
