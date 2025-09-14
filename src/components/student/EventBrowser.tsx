import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from './PaymentModal';
import { Calendar, MapPin, Users, Filter, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventBrowser: React.FC = () => {
  const { events, registerForEvent, unregisterFromEvent, getUserRegisteredEvents } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<any>(null);
  const [showAlert, setShowAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const userRegisteredEvents = getUserRegisteredEvents(user?.id || '');
  const registeredEventIds = userRegisteredEvents.map(event => event.id);

  const departments = [...new Set(events.map(event => event.department))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === '' || event.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleRegister = async (eventId: string) => {
    // Check if user is authenticated
    if (!user) {
      setShowAlert({ message: '🚫 Please login to register for events', type: 'error' });
      setTimeout(() => setShowAlert(null), 4000);
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (registeredEventIds.includes(eventId)) {
      setShowAlert({ message: '⚠️ Already registered for this event.', type: 'error' });
      setTimeout(() => setShowAlert(null), 4000);
      return;
    }

    if (event.registeredCount >= event.maxSeats) {
      setShowAlert({ message: '⚠️ Event is fully booked!', type: 'error' });
      setTimeout(() => setShowAlert(null), 4000);
      return;
    }

    // Open payment modal
    setSelectedEventForPayment(event);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    if (selectedEventForPayment) {
      const success = registerForEvent(selectedEventForPayment.id, user?.id || '');
      if (success) {
        setShowAlert({ message: '✅ Payment successful! Registration confirmed! 🎉', type: 'success' });
      }
      setTimeout(() => setShowAlert(null), 4000);
    }
  };

  const handleUnregister = (eventId: string) => {
    const success = unregisterFromEvent(eventId, user?.id || '');
    if (success) {
      setShowAlert({ message: '✅ Successfully unregistered from the event. ✨', type: 'success' });
    }
    
    setTimeout(() => setShowAlert(null), 4000);
  };

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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Discover Events</h2>
        <p className="text-gray-600">Find and register for exciting college events</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white min-w-[200px]"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredEvents.map((event) => {
            const isRegistered = registeredEventIds.includes(event.id);
            const isFull = event.registeredCount >= event.maxSeats;
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {event.registeredCount}/{event.maxSeats} seats
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-green-500" />
                      {event.department}
                    </div>
                  </div>

                  {isRegistered ? (
                    <div className="space-y-3">
                      <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">You're registered!</span>
                      </div>
                      <button
                        onClick={() => handleUnregister(event.id)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium"
                      >
                        Unregister
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRegister(event.id)}
                      disabled={isFull}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isFull 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                      }`}
                    >
                      {isFull ? (
                        <>
                          <AlertCircle className="h-5 w-5 mr-2 inline" />
                          Fully Booked
                        </>
                      ) : (
                        `Register - ₹${event.price || 100}`
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <Calendar className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Events Found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedEventForPayment && (
          <PaymentModal
            event={selectedEventForPayment}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedEventForPayment(null);
            }}
            onPaymentSuccess={handlePaymentSuccess}
            showAlert={(message, type) => {
              setShowAlert({ message, type });
              setTimeout(() => setShowAlert(null), 4000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventBrowser;