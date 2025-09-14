import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import EventManagement from './EventManagement';
import AttendanceTracking from './AttendanceTracking';
import AnalyticsDashboard from './AnalyticsDashboard';
import FoodStallManagement from './FoodStallManagement';
import AdminProfile from './AdminProfile';
import { BarChart3, Calendar, QrCode, Utensils, Home, User } from 'lucide-react';

type AdminTab = 'overview' | 'events' | 'attendance' | 'analytics' | 'food' | 'profile';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: Home },
    { id: 'events' as AdminTab, label: 'Events', icon: Calendar },
    { id: 'attendance' as AdminTab, label: 'Attendance', icon: QrCode },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
    { id: 'food' as AdminTab, label: 'Food Stalls', icon: Utensils },
    { id: 'profile' as AdminTab, label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AnalyticsDashboard />;
      case 'events':
        return <EventManagement />;
      case 'attendance':
        return <AttendanceTracking />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'food':
        return <FoodStallManagement />;
      case 'profile':
        return <AdminProfile />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="transition-all duration-300 ease-in-out">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;