import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { CheckCircle, XCircle, User, Calendar, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../lib/supabase';

interface QRScannerProps {
  onClose: () => void;
}

interface ScannedUser {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
  role: 'student' | 'admin';
  avatarUrl?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
  const { user: currentUser } = useAuth();
  const { markAttendance } = useData();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const qrCodeRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScanning && qrCodeRegionRef.current) {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const startScanner = () => {
    if (!qrCodeRegionRef.current) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      supportedFormats: [Html5QrcodeSupportedFormats.QR_CODE],
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
    };

    scannerRef.current = new Html5QrcodeScanner(
      qrCodeRegionRef.current.id,
      config,
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        handleScan(decodedText);
      },
      (error) => {
        // Handle scan errors silently
      }
    );
  };

  const handleScan = async (data: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setScannedData(data);
    
    try {
      // Parse QR data (assuming it contains user ID or roll number)
      const userData = JSON.parse(data);
      const userId = userData.userId || userData.id;
      const rollNumber = userData.rollNumber;

      if (!userId && !rollNumber) {
        throw new Error('Invalid QR code format');
      }

      // Fetch user details from Supabase
      let query = supabase.from('profiles').select('*');
      
      if (userId) {
        query = query.eq('id', userId);
      } else if (rollNumber) {
        query = query.eq('roll_number', rollNumber);
      }

      const { data: userProfile, error } = await query.single();

      if (error || !userProfile) {
        throw new Error('User not found in database');
      }

      setScannedUser({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        rollNumber: userProfile.roll_number,
        role: userProfile.role,
        avatarUrl: userProfile.avatar_url
      });

      setMessage({
        text: '✅ User verified successfully!',
        type: 'success'
      });

    } catch (error) {
      console.error('Error processing QR code:', error);
      setMessage({
        text: '❌ Invalid QR code or user not found',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAttendance = async (eventId: string) => {
    if (!scannedUser || !currentUser) return;

    setIsProcessing(true);
    try {
      const success = await markAttendance(eventId, scannedUser.id, {
        scannedBy: currentUser.id,
        scannedAt: new Date().toISOString(),
        qrData: scannedData
      });

      if (success) {
        setMessage({
          text: '✅ Attendance marked successfully!',
          type: 'success'
        });
        
        // Reset after 2 seconds
        setTimeout(() => {
          setScannedUser(null);
          setScannedData(null);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({
          text: '❌ Failed to mark attendance',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage({
        text: '❌ Error marking attendance',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedUser(null);
    setScannedData(null);
    setMessage(null);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">QR Code Scanner</h2>
              <p className="text-blue-100">Scan QR codes to mark attendance</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XCircle className="h-8 w-8" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!isScanning ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Ready to Scan
                  </h3>
                  <p className="text-gray-600">
                    Click the button below to start scanning QR codes
                  </p>
                </div>

                <button
                  onClick={() => setIsScanning(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Scanner
                </button>
              </motion.div>
            ) : !scannedUser ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Scanning...</h3>
                  <button
                    onClick={() => setIsScanning(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Stop Scanner
                  </button>
                </div>

                <div
                  id="qr-reader"
                  ref={qrCodeRegionRef}
                  className="w-full max-w-md mx-auto"
                />

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg text-center ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : message.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    User Verified
                  </h3>
                </div>

                {/* User Details */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      {scannedUser.avatarUrl ? (
                        <img
                          src={scannedUser.avatarUrl}
                          alt={scannedUser.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {scannedUser.name}
                      </h4>
                      <p className="text-gray-600">{scannedUser.email}</p>
                      {scannedUser.rollNumber && (
                        <p className="text-sm text-gray-500">
                          Roll: {scannedUser.rollNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={resetScanner}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={() => handleMarkAttendance('current-event')} // You'll need to pass actual event ID
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Mark Attendance'}
                  </button>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg text-center ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : message.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default QRScanner;
