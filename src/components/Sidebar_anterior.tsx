import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Users,
  Database,
  UserPlus,
  Bot,
  User,
  LogOut,
  Brain,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Mail,
  FileText
} from 'lucide-react';
import { isFeatureEnabled } from '@/utils/featureFlags';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const getNavigationItems = () => {
    const items = [];
    const canAccess = (feature: Parameters<typeof isFeatureEnabled>[1]) =>
      isFeatureEnabled(user?.role, feature, user?.featureFlags);

    if (user?.role === 'admin') {
      items.push(
        { path: '/dashboard', icon: MessageSquare, label: 'Dashboard' },
        { path: '/admin', icon: Users, label: 'Panel Admin' },
        { path: '/campaigns', icon: Mail, label: 'Campañas' },
        { path: '/assistant', icon: Bot, label: 'Asistente IA' },
        { path: '/profile', icon: User, label: 'Perfil' }
      );
      return items;
    }

    items.push({ path: '/dashboard', icon: MessageSquare, label: 'Dashboard' });

    if (canAccess('data')) {
      items.push({ path: '/data', icon: Database, label: 'Mis Datos' });
    }

    if (user?.role === 'client') {
      if (canAccess('campaigns')) items.push({ path: '/campaigns', icon: Mail, label: 'Campañas' });
      if (canAccess('templates')) items.push({ path: '/templates', icon: FileText, label: 'Plantillas de Mensajes' });
      if (canAccess('advisors')) items.push({ path: '/asesores', icon: Users, label: 'Asesores' });
      if (canAccess('advisorMetrics')) items.push({ path: '/advisor-metrics', icon: BarChart3, label: 'Métricas de Asesores' });
      if (user.clientId === '751524394719240' && canAccess('inscripciones')) {
        items.push({ path: '/inscripciones', icon: UserPlus, label: 'Inscripciones' });
      }
      if (canAccess('metaEventos')) items.push({ path: '/meta-eventos', icon: TrendingUp, label: 'Eventos de Meta' });
      if (canAccess('assistant')) items.push({ path: '/assistant', icon: Bot, label: 'Asistente IA' });
    }

    items.push({ path: '/profile', icon: User, label: 'Perfil' });
    return items;
  };

  const navigationItems = getNavigationItems();
  const closeMobileMenu = () => setIsMobileOpen(false);

  React.useEffect(() => {
    closeMobileMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };

  return (
    <div className="md:w-64 md:flex md:flex-col md:h-full">
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Inteligente</h1>
              <p className="text-xs text-gray-500">Chat Management</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:shadow-none md:h-full ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inteligente</h1>
              <p className="text-sm text-gray-500">Chat Management</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              {user?.clientId && (
                <p className="text-xs text-gray-400">ID: {user.clientId}</p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
