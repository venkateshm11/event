import React, { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { Camera, QrCode, Users, CheckCircle, AlertCircle, X, Calendar } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';

const AttendanceTracking: React.FC = () => {
  const { events, markAttendance } = useData();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const scannerRef = useRef<any>(null);

  const showAlertMessage = (message: string, type: 'success' | 'error') => {
    setShowAlert({ message, type });
    setTimeout(() => setShowAlert(null), 4000);
  };

  const startScanning = async () => {
    if (!selectedEvent) {
      showAlertMessage('⚠️ Please select an event first', 'error');
      return;
    }

    try {
      // Request camera permission first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      // Stop the stream immediately as Html5QrcodeScanner will handle it
      stream.getTracks().forEach(track => track.stop());
      
      setShowScanner(true);
      
      // Initialize QR scanner with better configuration
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
            videoConstraints: {
              facingMode: 'environment'
            }
          },
          false
        );

        scanner.render(
          (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              
              if (data.eventId !== selectedEvent) {
                showAlertMessage('⚠️ QR code is for a different event', 'error');
                return;
              }

              if (attendanceList.includes(data.userId)) {
                showAlertMessage('🚫 Duplicate QR Scan detected', 'error');
                return;
              }

              markAttendance(selectedEvent, data.userId).then(success => {
                if (success) {
                  setAttendanceList(prev => [...prev, data.userId]);
                  setScannedData(data);
                  showAlertMessage('✅ Attendance marked successfully!', 'success');
                } else {
                  showAlertMessage('❌ Failed to mark attendance', 'error');
                }
              }).catch(error => {
                console.error('Attendance error:', error);
                showAlertMessage('❌ Error marking attendance', 'error');
              });

            } catch (error) {
              showAlertMessage('⚠️ Invalid QR code format', 'error');
            }
          },
          (error) => {
            // Handle scanning errors with more specific messages
            if (error.includes('NotAllowedError') || error.includes('Permission denied')) {
              showAlertMessage('❌ Camera permission denied. Please allow camera access.', 'error');
            } else if (error.includes('NotFoundError')) {
              showAlertMessage('❌ No camera found on this device.', 'error');
            }
          }
        );

        scannerRef.current = scanner;
      }, 100);

    } catch (error: any) {
      console.error('Camera access error:', error);
      if (error.name === 'NotAllowedError') {
        showAlertMessage('❌ Camera permission denied. Please allow camera access and try again.', 'error');
      } else if (error.name === 'NotFoundError') {
        showAlertMessage('❌ No camera found on this device.', 'error');
      } else if (error.name === 'NotSupportedError') {
        showAlertMessage('❌ Camera not supported on this device.', 'error');
      } else {
        showAlertMessage('❌ Unable to access camera. Please check your browser settings.', 'error');
      }
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setShowScanner(false);
    setScannedData(null);
  };

  const exportAttendance = (eventId: string) => {
    const eventDetails = events.find(e => e.id === eventId);
    const attendance = getEventAttendance();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    interface AttendanceRecord {
      Name: string;
      'Roll Number': string;
      Email: string;
      'Marked At': string;
    }
    
    const attendanceData: AttendanceRecord[] = attendance.map((userId: string) => {
      const user = users.find((u: any) => u.id === userId);
      return {
        Name: user?.name || 'Unknown',
        'Roll Number': user?.rollNumber || 'N/A',
        Email: user?.email || 'N/A',
        'Marked At': new Date().toLocaleString()
      };
    });

    const csvContent = [
      ['Event', eventDetails?.title || 'Unknown Event'],
      ['Date', eventDetails?.date || 'N/A'],
      ['Total Present', attendance.length.toString()],
      [''],
      ['Name', 'Roll Number', 'Email', 'Marked At'],
      ...attendanceData.map(row => [row.Name, row['Roll Number'], row.Email, row['Marked At']])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${eventDetails?.title || 'event'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlertMessage('✅ Attendance exported successfully!', 'success');
  };

  const getEventAttendance = () => {
    const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
    return attendance[selectedEvent] || [];
  };

  const getEventRegistrations = () => {
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '{}');
    return registrations[selectedEvent] || [];
  };

  const selectedEventDetails = events.find(e => e.id === selectedEvent);
  const eventAttendance = getEventAttendance();
  const eventRegistrations = getEventRegistrations();
  const attendanceRate = eventRegistrations.length > 0 ? 
    Math.round((eventAttendance.length / eventRegistrations.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Alert */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Attendance Tracking</h2>
        <p className="text-gray-600">Scan QR codes to mark student attendance</p>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Scan QR Code</h3>
                <button
                  onClick={stopScanning}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div id="qr-reader" className="w-full"></div>
              
              {scannedData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="text-green-800 font-medium">Scanned Successfully!</p>
                  <p className="text-sm text-green-700">
                    Student: {scannedData.name} ({scannedData.rollNumber})
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Select Event</h3>
          <div className="space-y-3">
            {events.map(event => (
              <motion.button
                key={event.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedEvent(event.id)}
                className={`w-full p-4 text-left border rounded-lg transition-all duration-200 ${
                  selectedEvent === event.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
              </motion.button>
            ))}
          </div>

          {selectedEvent && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startScanning}
              className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 flex items-center justify-center"
            >
              <Camera className="h-5 w-5 mr-2" />
              Start QR Scanner
            </motion.button>
          )}
        </div>

        {/* Attendance Stats */}
        {selectedEvent && selectedEventDetails && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {selectedEventDetails.title} - Attendance
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{eventRegistrations.length}</p>
                  <p className="text-sm text-gray-600">Registered</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{eventAttendance.length}</p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <QrCode className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Attendance Progress</span>
                  <span className="text-sm text-gray-600">{eventAttendance.length}/{eventRegistrations.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${attendanceRate}%` }}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  />
                </div>
              </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Attendance List</h4>
              {eventAttendance.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {eventAttendance.map((userId: string, index: number) => {
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const user = users.find((u: any) => u.id === userId);
                    
                    return (
                      <motion.div
                        key={userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{user?.name}</p>
                          <p className="text-sm text-gray-600">{user?.rollNumber}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No attendance marked yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracking;