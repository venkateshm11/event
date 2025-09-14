import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, LogIn, Smartphone, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentLoginProps {
  onRegister: () => void;
  onForgotPassword: () => void;
  onOTPLogin: (identifier: string, type: 'email' | 'mobile') => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onRegister, onForgotPassword, onOTPLogin, showAlert }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    rollNumber: '',
    password: '',
    mobileNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (useOTP) {
        // Validate OTP login fields
        if (!formData.rollNumber.trim() || !formData.mobileNumber.trim()) {
          showAlert('⚠️ Roll number and mobile number are required for OTP login', 'error');
          setIsLoading(false);
          return;
        }

        // Validate mobile number format
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobileNumber.replace(/\D/g, ''))) {
          showAlert('⚠️ Please enter a valid 10-digit mobile number', 'error');
          setIsLoading(false);
          return;
        }

        const result = await login({ 
          rollNumber: formData.rollNumber.trim(), 
          mobileNumber: formData.mobileNumber.trim(),
          useOTP: true 
        }, 'student');
        
        if (result.success) {
          onOTPLogin(formData.mobileNumber.trim(), 'mobile');
        } else {
          showAlert(result.message, 'error');
        }
      } else {
        // Validate password login fields
        if (!formData.rollNumber.trim() || !formData.password.trim()) {
          showAlert('⚠️ Roll number and password are required', 'error');
          setIsLoading(false);
          return;
        }

        const result = await login({
          rollNumber: formData.rollNumber.trim(),
          password: formData.password.trim(),
          useOTP: false
        }, 'student');
        
        showAlert(result.message, result.success ? 'success' : 'error');
      }
    } catch (error) {
      showAlert('❌ Login failed. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Login Method Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setUseOTP(false)}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            !useOTP 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Password
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setUseOTP(true)}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            useOTP 
              ? 'bg-green-600 text-white shadow-md' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Smartphone className="h-4 w-4 mr-2" />
          OTP
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roll Number *
          </label>
          <input
            type="text"
            value={formData.rollNumber}
            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
            placeholder="Enter your roll number"
            required
          />
        </motion.div>

        {useOTP ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter registered 10-digit mobile number</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`w-full text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 ${
            useOTP ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              {useOTP ? <Phone className="h-5 w-5 mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
              {useOTP ? 'Send OTP' : 'Login'}
            </>
          )}
        </motion.button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <motion.button
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={onForgotPassword}
          className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          Forgot Password?
        </motion.button>
      </div>

      <div className="text-center pt-4 border-t border-gray-200">
        <span className="text-gray-600">New student? </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={onRegister}
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline decoration-2 underline-offset-2"
        >
          Create Account
        </motion.button>
      </div>
    </div>
  );
};

export default StudentLogin;