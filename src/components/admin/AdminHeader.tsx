import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">College Management System</p>
              </div>
            </motion.div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Settings className="h-6 w-6" />
            </motion.button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                >
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </motion.div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-600">Administrator</p>
                </div>
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2 hidden sm:block text-sm font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
