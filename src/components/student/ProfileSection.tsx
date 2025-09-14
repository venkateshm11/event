import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User, Mail, Phone, Calendar, CreditCard, MessageSquare, Settings, Edit, Save, X, CheckCircle, AlertCircle, QrCode, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCodeGenerator from 'qrcode';

const ProfileSection: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { getUserRegisteredEvents, unregisterFromEvent } = useData();
  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'payments' | 'feedback' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || ''
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showAlert, setShowAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const registeredEvents = getUserRegisteredEvents(user?.id || '');
  
  // Get updated payment history from localStorage
  const getCurrentUser = () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : user;
  };
  
  const paymentHistory = getCurrentUser()?.paymentHistory || [];

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

  const handleUnregister = (eventId: string) => {
    const success = unregisterFromEvent(eventId, user?.id || '');
    if (success) {
      showAlertMessage('✅ Successfully unregistered from event', 'success');
    }
  };

  const generateStudentQR = async () => {
    if (!user) return;

    try {
      const qrData = {
        studentId: user.id,
        rollNumber: user.rollNumber,
        name: user.name,
        type: 'student_id',
        timestamp: new Date().toISOString()
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeDataUrl = await QRCodeGenerator.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1E40AF',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `student-id-${user?.rollNumber}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  React.useEffect(() => {
    generateStudentQR();
  }, [user]);

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'events' as const, label: 'My Events', icon: Calendar },
    { id: 'payments' as const, label: 'Payments', icon: CreditCard },
    { id: 'feedback' as const, label: 'Feedback', icon: MessageSquare },
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Profile</h2>
        <p className="text-gray-600">Manage your account and view your activity</p>
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
                    ? 'bg-blue-600 text-white shadow-md'
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
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  {isEditing ? <X className="h-5 w-5 mr-2" /> : <Edit className="h-5 w-5 mr-2" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6 shadow-lg"
                  >
                    {user?.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{user?.name}</h4>
                    <p className="text-blue-600 font-medium">{user?.rollNumber}</p>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Verified Student</span>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number
                    </label>
                    <p className="text-gray-800 bg-blue-50 px-4 py-3 rounded-lg border-l-4 border-blue-500 font-medium">
                      {user?.rollNumber}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Roll number cannot be changed</p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter mobile number"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                        {user?.mobileNumber || 'Not provided'}
                      </p>
                    )}
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

            {/* Student QR Code */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Student ID QR Code</h3>
                {qrCodeUrl ? (
                  <div className="text-center">
                    <img
                      src={qrCodeUrl}
                      alt="Student QR Code"
                      className="mx-auto bg-white p-4 rounded-lg shadow-md border mb-4"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadQRCode}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Generating QR Code...</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Registered Events</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{registeredEvents.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Events Attended</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {JSON.parse(localStorage.getItem('attendance') || '{}')[user?.id]?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">My Registered Events</h3>
            {registeredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registeredEvents.map(event => {
                  const eventDate = new Date(event.date);
                  const canCancel = eventDate > new Date();
                  
                  return (
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
                          {eventDate.toLocaleDateString()} at {event.time}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      </div>
                      
                      {canCancel ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to unregister from this event?')) {
                              handleUnregister(event.id);
                            }
                          }}
                          className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
                        >
                          Cancel Registration
                        </motion.button>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-500 py-2 rounded-lg text-center font-medium">
                          Event Completed
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-600 mb-2">No Events Registered</h4>
                <p className="text-gray-500">Browse events to start registering</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Payment History</h3>
            {paymentHistory.length > 0 ? (
              <div className="space-y-4">
                {paymentHistory.map((payment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{payment.eventTitle || 'Event Payment'}</p>
                      <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">
                        {payment.transactionId} • {payment.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">₹{payment.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-600 mb-2">No Payment History</h4>
                <p className="text-gray-500">Your payment transactions will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">My Feedback & Reviews</h3>
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-gray-600 mb-2">No Feedback Submitted</h4>
              <p className="text-gray-500">Your feedback and reviews will appear here</p>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
                  >
                    {user?.otpEnabled ? 'Disable' : 'Enable'}
                  </motion.button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Event Reminders</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">New Events</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Food Stall Updates</span>
                    <input type="checkbox" className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileSection;