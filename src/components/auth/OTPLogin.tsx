import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Smartphone, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface OTPLoginProps {
  identifier: string;
  type: 'email' | 'mobile';
  onBack: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const OTPLogin: React.FC<OTPLoginProps> = ({ identifier, type, onBack, showAlert }) => {
  const { sendOTP, verifyOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Send initial OTP
    const sendInitialOTP = async () => {
      const result = await sendOTP(identifier, type);
      if (result.success) {
        showAlert(result.message, 'info');
      } else {
        showAlert(result.message, 'error');
        onBack();
        return;
      }
    };

    sendInitialOTP();

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [identifier, type, sendOTP, showAlert, onBack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!otp.trim() || otp.length !== 6) {
        showAlert('⚠️ Please enter the complete 6-digit OTP', 'error');
        setIsLoading(false);
        return;
      }

      const result = await verifyOTP(identifier, otp.trim());
      if (result.success) {
        showAlert(result.message, 'success');
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      showAlert('⚠️ Invalid or Expired OTP. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setCanResend(false);
    setCountdown(300); // Reset to 5 minutes
    setOtp(''); // Clear current OTP

    try {
      const result = await sendOTP(identifier, type);
      if (result.success) {
        showAlert('📩 New OTP sent successfully!', 'info');
        
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showAlert(result.message, 'error');
        setCanResend(true);
      }
    } catch (error) {
      showAlert('❌ Failed to resend OTP. Please try again.', 'error');
      setCanResend(true);
    }

    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
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
          <h2 className="text-xl font-bold text-gray-800">OTP Verification</h2>
          <p className="text-sm text-gray-600">
            Enter the OTP sent to your {type === 'mobile' ? 'mobile number' : 'email'}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
      >
        <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <p className="text-blue-800 font-medium">OTP sent to:</p>
        <p className="text-blue-700 text-sm">{identifier}</p>
        <p className="text-blue-600 text-xs mt-1">
          Expires in: {formatTime(countdown)}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter 6-digit OTP *
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 text-center text-2xl tracking-widest hover:border-gray-400"
            placeholder="000000"
            maxLength={6}
            required
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading || otp.length !== 6 || countdown === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Smartphone className="h-5 w-5 mr-2" />
              Verify OTP
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center">
        {canResend ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleResendOTP}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center justify-center mx-auto disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Resend OTP
          </motion.button>
        ) : (
          <p className="text-gray-500 text-sm">
            {countdown > 0 ? `Resend OTP in ${formatTime(countdown)}` : 'OTP expired'}
          </p>
        )}
      </div>

      {countdown === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
        >
          <p className="text-red-800 font-medium">⏰ OTP has expired</p>
          <p className="text-red-700 text-sm">Please request a new OTP to continue</p>
        </motion.div>
      )}
    </div>
  );
};

export default OTPLogin;