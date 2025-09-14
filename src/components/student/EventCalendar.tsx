import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from './PaymentModal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventCalendar: React.FC = () => {
  const { events, registerForEvent, getUserRegisteredEvents, unregisterFromEvent } = useData();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<any>(null);
  const [showAlert, setShowAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const userRegisteredEvents = getUserRegisteredEvents(user?.id || '');
  const registeredEventIds = userRegisteredEvents.map(event => event.id);

  const showAlertMessage = (message: string, type: 'success' | 'error') => {
    setShowAlert({ message, type });
    setTimeout(() => setShowAlert(null), 4000);
  };

  const handleRegister = (eventId: string) => {
    // Check if user is authenticated
    if (!user) {
      showAlertMessage('🚫 Please login to register for events', 'error');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (registeredEventIds.includes(eventId)) {
      showAlertMessage('⚠️ Already registered for this event.', 'error');
      return;
    }

    if (event.registeredCount >= event.maxSeats) {
      showAlertMessage('⚠️ Event is fully booked!', 'error');
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
        showAlertMessage('✅ Payment successful! Registration confirmed! 🎉', 'success');
      }
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Alert */}
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

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Event Calendar</h2>
        <p className="text-gray-600">View upcoming events in calendar format</p>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = new Date().toDateString() === day.toDateString();
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDate(day)}
                className={`relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-blue-100 border-blue-300' :
                  isToday ? 'bg-yellow-50 border-yellow-300' :
                  isCurrentMonth ? 'bg-white border-gray-200 hover:bg-gray-50' :
                  'bg-gray-50 border-gray-100 text-gray-400'
                }`}
              >
                <div className={`text-sm font-medium ${
                  isToday ? 'text-yellow-800' : 
                  isSelected ? 'text-blue-800' :
                  isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded truncate"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Events on {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-4">
            {selectedDateEvents.map(event => {
              const isRegistered = registeredEventIds.includes(event.id);
              const isFull = event.registeredCount >= event.maxSeats;
              
              return (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h4>
                      <p className="text-gray-600 mb-3 text-sm">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.registeredCount}/{event.maxSeats}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isRegistered ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Registered
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRegister(event.id)}
                          disabled={isFull}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isFull 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isFull ? 'Full' : `Register - ₹${event.price || 100}`}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
            showAlert={showAlertMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventCalendar;