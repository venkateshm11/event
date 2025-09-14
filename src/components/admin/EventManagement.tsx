import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventManagement: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    department: '',
    maxSeats: 100,
    price: 100,
    image: ''
  });

  const departments = ['Computer Science', 'Engineering', 'Cultural Committee', 'Sports', 'Business'];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      department: '',
      maxSeats: 100,
      price: 100,
      image: ''
    });
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleEdit = (event: any) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      department: event.department,
      maxSeats: event.maxSeats,
      price: event.price,
      image: event.image
    });
    setEditingEvent(event.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent) {
      updateEvent(editingEvent, formData);
    } else {
      const imageUrl = formData.image || `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg`;
      addEvent({ ...formData, image: imageUrl });
    }
    
    resetForm();
  };

  const handleDelete = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Event Management</h2>
            <p className="text-gray-600">Create, edit, and manage college events</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Event
          </motion.button>
        </div>
      </div>

      {/* Event Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Seats
                    </label>
                    <input
                      type="number"
                      value={formData.maxSeats}
                      onChange={(e) => setFormData({ ...formData, maxSeats: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="https://images.pexels.com/..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">All Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <h4 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h4>
              
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {event.registeredCount}/{event.maxSeats} registered
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 font-semibold">₹{event.price}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(event)}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(event.id)}
                  className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventManagement;