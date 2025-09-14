import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, GraduationCap } from 'lucide-react';

const StudentHeader: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 brand-title">Mic Fest</h1>
              <p className="text-sm text-gray-600">Student Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.rollNumber}</p>
            </div>
            
            <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;