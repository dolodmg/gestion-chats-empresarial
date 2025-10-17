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
  Brain
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Navigation based on user role and clientId
  const getNavigationItems = () => {
    const items = [];
    
    if (user?.role === 'admin') {
      items.push(
        { path: '/dashboard', icon: MessageSquare, label: 'Dashboard' },
        { path: '/admin', icon: Users, label: 'Panel Admin' },
        { path: '/assistant', icon: Bot, label: 'Asistente IA' },
        { path: '/profile', icon: User, label: 'Perfil' }
      );
    } else if (user?.clientId === '577642088768581') {
      items.push(
        { path: '/dashboard', icon: MessageSquare, label: 'Dashboard' },
        { path: '/data', icon: Database, label: 'Mis Datos' },
        { path: '/inscripciones', icon: UserPlus, label: 'Inscripciones' },
        { path: '/assistant', icon: Bot, label: 'Asistente IA' },
        { path: '/profile', icon: User, label: 'Perfil' }
      );
    } else {
      items.push(
        { path: '/dashboard', icon: MessageSquare, label: 'Dashboard' },
        { path: '/data', icon: Database, label: 'Mis Datos' },
        { path: '/assistant', icon: Bot, label: 'Asistente IA' },
        { path: '/profile', icon: User, label: 'Perfil' }
      );
    }
    
    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
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

      {/* User Info */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
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

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 w-full text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}