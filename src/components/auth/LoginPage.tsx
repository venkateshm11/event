import React, { useState } from 'react';
import StudentLogin from './StudentLogin';
import AdminLogin from './AdminLogin';
import StudentRegister from './StudentRegister';
import AdminRegister from './AdminRegister';
import ForgotPassword from './ForgotPassword';
import OTPLogin from './OTPLogin';
import Alert from '../ui/Alert';
import { Users, Shield, GraduationCap, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'student-login' | 'admin-login' | 'student-register' | 'admin-register' | 'forgot-password' | 'otp-login';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('student-login');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [otpData, setOtpData] = useState<{ identifier: string; type: 'email' | 'mobile' } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type });
  };

  const handleOTPRequest = (identifier: string, type: 'email' | 'mobile') => {
    setOtpData({ identifier, type });
    setMode('otp-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {alert && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)} 
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </motion.div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 brand-title">Mic Fest</h1>
              <p className="text-gray-600">College Event Management System</p>
            </motion.div>

            {/* Tab Navigation */}
            {!mode.includes('register') && !mode.includes('forgot') && !mode.includes('otp') && (
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('student-login')}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === 'student-login' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Student
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('admin-login')}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === 'admin-login' 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </motion.button>
              </div>
            )}

            {/* Registration Options */}
            {mode.includes('register') && (
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('student-register')}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === 'student-register' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Student
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('admin-register')}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === 'admin-register' 
                      ? 'bg-orange-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Admin
                </motion.button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {mode === 'student-login' && (
                  <StudentLogin 
                    onRegister={() => setMode('student-register')}
                    onForgotPassword={() => setMode('forgot-password')}
                    onOTPLogin={handleOTPRequest}
                    showAlert={showAlert}
                  />
                )}

                {mode === 'admin-login' && (
                  <AdminLogin 
                    onBack={() => setMode('student-login')}
                    onRegister={() => setMode('admin-register')}
                    showAlert={showAlert}
                  />
                )}

                {mode === 'student-register' && (
                  <StudentRegister 
                    onBack={() => setMode('student-login')}
                    showAlert={showAlert}
                  />
                )}

                {mode === 'admin-register' && (
                  <AdminRegister 
                    onBack={() => setMode('admin-login')}
                    showAlert={showAlert}
                  />
                )}

                {mode === 'forgot-password' && (
                  <ForgotPassword 
                    onBack={() => setMode('student-login')}
                    showAlert={showAlert}
                  />
                )}

                {mode === 'otp-login' && otpData && (
                  <OTPLogin 
                    identifier={otpData.identifier}
                    type={otpData.type}
                    onBack={() => setMode('student-login')}
                    showAlert={showAlert}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;