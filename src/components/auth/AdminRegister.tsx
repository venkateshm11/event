import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminRegisterProps {
  onBack: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AdminRegister: React.FC<AdminRegisterProps> = ({ onBack, showAlert }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    enableOTP: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showAlert('⚠️ Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 8) {
      showAlert('⚠️ Password must be at least 8 characters', 'error');
      return;
    }

    if (formData.enableOTP && !formData.mobileNumber) {
      showAlert('⚠️ Mobile number required for OTP login.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData, 'admin');
      if (result.success) {
        showAlert('✅ Admin registered successfully! 🛡️', 'success');
        setTimeout(() => onBack(), 2000);
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      showAlert('❌ Registration failed. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onBack}
          className="mr-3 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Admin Registration</h2>
          <p className="text-sm text-gray-600">Create administrative access</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
          placeholder="Enter your full name"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Admin Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
          placeholder="admin@college.edu"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number
        </label>
        <input
          type="tel"
          value={formData.mobileNumber}
          onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
          placeholder="Enter your mobile number (optional)"
        />
        <p className="text-xs text-gray-500 mt-1">Required only if you want OTP login</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
            placeholder="Create a strong password"
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex items-center"
      >
        <input
          type="checkbox"
          id="enableOTPAdmin"
          checked={formData.enableOTP}
          onChange={(e) => setFormData({ ...formData, enableOTP: e.target.checked })}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="enableOTPAdmin" className="ml-2 text-sm text-gray-700">
          Enable OTP login for future logins
        </label>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)" }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Shield className="h-5 w-5 mr-2" />
            Register Admin
          </>
        )}
      </motion.button>
    </form>
  );
};

export default AdminRegister;

// Example register function using Supabase
interface RegisterFormData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  enableOTP: boolean;
}
