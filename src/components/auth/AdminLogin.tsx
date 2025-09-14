import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onBack: () => void;
  onRegister: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onRegister, showAlert }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate all fields are filled
      if (!formData.email.trim() || !formData.password.trim()) {
        showAlert('⚠️ All fields are required', 'error');
        setIsLoading(false);
        return;
      }

      const result = await login({
        email: formData.email.trim(),
        password: formData.password.trim()
      }, 'admin');
      
      showAlert(result.message, result.success ? 'success' : 'error');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      
      // Check if it's a timeout error
      if (errorMessage.includes('timeout')) {
        showAlert('⏱️ Login timeout. Please try again.', 'error');
        // Clear the form after timeout
        setFormData({ email: '', password: '' });
      } else {
        showAlert('❌ Login failed. Please try again.', 'error');
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mr-3 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Admin Access</h2>
          <p className="text-sm text-gray-600">Secure admin portal</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Admin Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800"
          placeholder="admin@college.edu"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 hover:border-gray-400"
            placeholder="Enter admin password"
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
      </div>

      <motion.button
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
            Admin Login
          </>
        )}
      </motion.button>

      <div className="text-center pt-4 border-t border-gray-200">
        <span className="text-gray-600">Need admin access? </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={onRegister}
          className="text-purple-600 hover:text-purple-700 font-medium transition-colors underline decoration-2 underline-offset-2"
        >
          Register as Admin
        </motion.button>
      </div>
    </form>
  );
};

export default AdminLogin;