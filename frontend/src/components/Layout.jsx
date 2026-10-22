import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, Home, FileText, Users, Upload, BarChart3 } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user.role === 'Student') {
      return [
        { name: 'Dashboard', path: '/student/dashboard', icon: Home },
        { name: 'My Audit', path: '/student/audit', icon: FileText },
      ];
    } else if (user.role === 'FacultyAdvisor') {
      return [
        { name: 'At-Risk Students', path: '/advisor/at-risk', icon: BarChart3 },
      ];
    } else if (user.role === 'RegistrarStaff') {
      return [
        { name: 'Dashboard', path: '/registrar/dashboard', icon: Home },
        { name: 'Import Transcripts', path: '/registrar/import', icon: Upload },
        { name: 'Manage Advisors', path: '/registrar/advisors', icon: Users },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">LNMIIT</h1>
                <span className="ml-2 text-sm text-gray-500">Degree Audit System</span>
              </div>

              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-0">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 The LNM Institute of Information Technology, Jaipur. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
