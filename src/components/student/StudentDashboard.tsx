import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentHeader from './StudentHeader';
import EventBrowser from './EventBrowser';
import EventCalendar from './EventCalendar';
import QRCode from './QRCode';
import { FoodStalls } from './FoodStalls';
import FeedbackForm from './FeedbackForm';
import ProfileSection from './ProfileSection';
import { Calendar, QrCode, Utensils, MessageSquare, User, Home } from 'lucide-react';

type ActiveTab = 'home' | 'events' | 'calendar' | 'qr' | 'food' | 'feedback' | 'profile';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const tabs = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'events' as ActiveTab, label: 'Events', icon: Calendar },
    { id: 'calendar' as ActiveTab, label: 'Calendar', icon: Calendar },
    { id: 'qr' as ActiveTab, label: 'QR Code', icon: QrCode },
    { id: 'food' as ActiveTab, label: 'Food', icon: Utensils },
    { id: 'feedback' as ActiveTab, label: 'Feedback', icon: MessageSquare },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <EventBrowser />;
      case 'events':
        return <EventBrowser />;
      case 'calendar':
        return <EventCalendar />;
      case 'qr':
        return <QRCode />;
      case 'food':
        return <FoodStalls />;
      case 'feedback':
        return <FeedbackForm />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <EventBrowser />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
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
                          ? 'bg-blue-600 text-white shadow-md'
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

export default StudentDashboard;