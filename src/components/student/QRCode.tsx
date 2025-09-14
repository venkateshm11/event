import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import QRCodeGenerator from 'qrcode';
import { QrCode, Download, Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const QRCode: React.FC = () => {
  const { getUserRegisteredEvents } = useData();
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const registeredEvents = getUserRegisteredEvents(user?.id || '');

  useEffect(() => {
    if (selectedEvent && user) {
      generateQRCode();
    }
  }, [selectedEvent, user]);

  const generateQRCode = async () => {
    if (!selectedEvent || !user) return;

    setIsGenerating(true);
    try {
      const qrData = {
        eventId: selectedEvent,
        userId: user.id,
        rollNumber: user.rollNumber,
        name: user.name,
        timestamp: new Date().toISOString()
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeDataUrl = await QRCodeGenerator.toDataURL(qrString, {
        width: 300,
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
    setIsGenerating(false);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `event-qr-${selectedEvent}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const selectedEventDetails = registeredEvents.find(event => event.id === selectedEvent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">QR Code Generator</h2>
        <p className="text-gray-600">Generate QR codes for your registered events</p>
      </div>

      {registeredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Registered Events</h3>
          <p className="text-gray-500">Register for events to generate QR codes for attendance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Event</h3>
            <div className="space-y-3">
              {registeredEvents.map(event => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedEvent === event.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* QR Code Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance QR Code</h3>
            
            {selectedEvent ? (
              <div className="text-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Generating QR Code...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Event QR Code"
                      className="mx-auto bg-white p-4 rounded-lg shadow-md border"
                    />
                    
                    {selectedEventDetails && (
                      <div className="bg-gray-50 rounded-lg p-4 text-left">
                        <h4 className="font-semibold text-gray-800 mb-2">{selectedEventDetails.title}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(selectedEventDetails.date).toLocaleDateString()} at {selectedEventDetails.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {selectedEventDetails.location}
                          </div>
                        </div>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadQRCode}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download QR Code
                    </motion.button>

                    <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">📱 How to use:</p>
                      <p>Show this QR code to the event organizer for attendance marking</p>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select an event to generate QR code</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCode;