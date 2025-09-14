import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Key, ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForgotPasswordProps {
  onBack: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, showAlert }) => {
  const { sendOTP, verifyOTP, resetPassword } = useAuth();
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [formData, setFormData] = useState({
    identifier: '',
    identifierType: 'email',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.identifier.trim()) {
        showAlert('⚠️ Please enter your email address', 'error');
        setIsLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.identifier.trim())) {
        showAlert('⚠️ Please enter a valid email address', 'error');
        setIsLoading(false);
        return;
      }

      const result = await sendOTP(formData.identifier.trim(), 'email');
      if (result.success) {
        showAlert(result.message, 'info');
        setStep('verify');
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      showAlert('❌ Failed to send OTP. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.otp.trim() || formData.otp.length !== 6) {
        showAlert('⚠️ Please enter a valid 6-digit OTP', 'error');
        setIsLoading(false);
        return;
      }

      const result = await verifyOTP(formData.identifier.trim(), formData.otp.trim());
      if (result.success) {
        showAlert(result.message, 'success');
        setStep('reset');
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      showAlert('❌ OTP verification failed.', 'error');
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newPassword.trim() || !formData.confirmPassword.trim()) {
      showAlert('⚠️ All fields are required', 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showAlert('⚠️ Passwords do not match', 'error');
      return;
    }

    if (formData.newPassword.length < 6) {
      showAlert('⚠️ Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(formData.identifier.trim(), formData.newPassword.trim());
      if (result.success) {
        showAlert(result.message, 'success');
        setTimeout(() => onBack(), 2000);
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      showAlert('❌ Password reset failed.', 'error');
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mr-3 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-sm text-gray-600">
            {step === 'request' && 'Enter your email to receive OTP'}
            {step === 'verify' && 'Enter the OTP sent to your email'}
            {step === 'reset' && 'Create your new password'}
          </p>
        </div>
      </div>

      {step === 'request' && (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
              placeholder="Enter your registered email"
              required
            />
            <p className="text-xs text-gray-500 mt-1">OTP will be sent to this email address</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Mail className="h-5 w-5 mr-2" />
                Send OTP
              </>
            )}
          </motion.button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit OTP *
            </label>
            <input
              type="text"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 text-center text-2xl tracking-widest hover:border-gray-400"
              placeholder="000000"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">OTP expires in 5 minutes</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || formData.otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Key className="h-5 w-5 mr-2" />
                Verify OTP
              </>
            )}
          </motion.button>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="button"
              onClick={() => setStep('request')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
            >
              ← Back to email entry
            </motion.button>
          </div>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
                placeholder="Enter new password (min 6 characters)"
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
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
                placeholder="Confirm new password"
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

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Key className="h-5 w-5 mr-2" />
                Reset Password
              </>
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;