import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User, Mail, Phone, Calendar, BarChart3, Download, Settings, Shield, Edit, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { events, foodStalls } = useData();
  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'analytics' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || ''
  });
  const [showAlert, setShowAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showAlertMessage = (message: string, type: 'success' | 'error') => {
    setShowAlert({ message, type });
    setTimeout(() => setShowAlert(null), 4000);
  };

  const handleSave = async () => {
    const success = await updateProfile(editForm);
    if (success) {
      showAlertMessage('✅ Profile updated successfully!', 'success');
    } else {
      showAlertMessage('⚠️ Failed to update profile', 'error');
    }
    setIsEditing(false);
  };

  const exportAttendanceData = () => {
    // Simulate Excel export
    showAlertMessage('📊 Attendance data exported successfully!', 'success');
  };

  const exportRegistrationData = () => {
    // Simulate Excel export
    showAlertMessage('📋 Registration data exported successfully!', 'success');
  };

  const totalRegistrations = events.reduce((sum, event) => sum + event.registeredCount, 0);
  const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
  const totalAttendance = Object.values(attendance).reduce((sum: number, attendees: any) => sum + attendees.length, 0);
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'events' as const, label: 'My Events', icon: Calendar },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Alert */}
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
            showAlert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {showAlert.message}
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Profile</h2>
        <p className="text-gray-600">Manage your administrative account and system overview</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Administrator Information</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                >
                  {isEditing ? <X className="h-5 w-5 mr-2" /> : <Edit className="h-5 w-5 mr-2" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6 shadow-lg"
                  >
                    {user?.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{user?.name}</h4>
                    <p className="text-purple-600 font-medium">System Administrator</p>
                    <div className="flex items-center mt-1">
                      <Shield className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Verified Admin</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">{user?.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Mobile Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.mobileNumber}
                        onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="Enter mobile number"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                        {user?.mobileNumber || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <p className="text-gray-800 bg-purple-50 px-4 py-3 rounded-lg border-l-4 border-purple-500 font-medium">
                      Administrator
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </motion.button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={exportAttendanceData}
                    className="w-full p-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-all duration-200 flex items-center"
                  >
                    <Download className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Export Attendance</p>
                      <p className="text-xs text-blue-600">Download Excel report</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={exportRegistrationData}
                    className="w-full p-3 bg-green-50 text-green-800 rounded-lg hover:bg-green-100 transition-all duration-200 flex items-center"
                  >
                    <Download className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Export Registrations</p>
                      <p className="text-xs text-green-600">Download Excel report</p>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* System Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">System Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Total Events</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{events.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Total Registrations</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{events.reduce((sum, event) => sum + event.registeredCount, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Managed Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {event.registeredCount}/{event.maxSeats} registered
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600 font-medium">
                      {Math.round((event.registeredCount / event.maxSeats) * 100)}% filled
                    </span>
                    <span className="text-gray-500">{event.department}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Event Performance</h3>
                <div className="space-y-4">
                  {events.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{event.title}</p>
                        <p className="text-xs text-gray-600">{event.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{event.registeredCount}</p>
                        <p className="text-xs text-gray-600">registrations</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Food Stall Ratings</h3>
                <div className="space-y-4">
                  {foodStalls.map(stall => (
                    <div key={stall.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{stall.name}</p>
                        <p className="text-xs text-gray-600">{stall.reviewCount} reviews</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="font-bold text-gray-800">{stall.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Data Export</h3>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportAttendanceData}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Attendance
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportRegistrationData}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Registrations
                  </motion.button>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Export comprehensive reports for analysis and record keeping</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h3>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Login Preferences</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">OTP Login</p>
                    <p className="text-xs text-gray-500">
                      {user?.otpEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm"
                  >
                    {user?.otpEnabled ? 'Disable' : 'Enable'}
                  </motion.button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">System Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">New Registrations</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Low Attendance Alerts</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Food Stall Reviews</span>
                    <input type="checkbox" className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="font-semibold text-red-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-700 mb-3">These actions cannot be undone</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm"
                >
                  Reset All Data
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminProfile;