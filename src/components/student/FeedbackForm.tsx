import React, { useState } from 'react';
import { MessageSquare, Send, Star, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

const FeedbackForm: React.FC = () => {
  const [feedback, setFeedback] = useState({
    type: 'general',
    rating: 0,
    subject: '',
    message: '',
    anonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setShowAlert({ message: '💬 Feedback submitted successfully!', type: 'success' });
      setFeedback({
        type: 'general',
        rating: 0,
        subject: '',
        message: '',
        anonymous: false
      });
      setIsSubmitting(false);
    }, 1500);

    setTimeout(() => setShowAlert(null), 5000);
  };

  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRate?.(star)}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
            } transition-colors cursor-pointer`}
          >
            <Star className="h-6 w-6 fill-current" />
          </motion.button>
        ))}
      </div>
    );
  };

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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Feedback & Suggestions</h2>
        <p className="text-gray-600">Help us improve your college experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Feedback Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'general', label: 'General' },
                  { value: 'event', label: 'Events' },
                  { value: 'food', label: 'Food Stalls' },
                  { value: 'facilities', label: 'Facilities' }
                ].map(type => (
                  <motion.label
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      feedback.type === type.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackType"
                      value={type.value}
                      checked={feedback.type === type.value}
                      onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              {renderStars(feedback.rating, (rating) => 
                setFeedback({ ...feedback, rating })
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={feedback.subject}
                onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Brief subject line"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Feedback
              </label>
              <textarea
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-32 resize-none"
                placeholder="Share your detailed thoughts and suggestions..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={feedback.anonymous}
                onChange={(e) => setFeedback({ ...feedback, anonymous: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                Submit feedback anonymously
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Feedback Guidelines */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <ThumbsUp className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Feedback Guidelines</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Be specific and constructive in your feedback
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Include suggestions for improvement when possible
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Maintain respectful and professional language
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Anonymous feedback is welcome and encouraged
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Suggestions</h3>
            <div className="space-y-3">
              {[
                { icon: '🎓', text: 'Academic Events', color: 'bg-blue-100 text-blue-800' },
                { icon: '🍕', text: 'Food Quality', color: 'bg-orange-100 text-orange-800' },
                { icon: '🏢', text: 'Campus Facilities', color: 'bg-green-100 text-green-800' },
                { icon: '📱', text: 'App Experience', color: 'bg-purple-100 text-purple-800' }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, x: 5 }}
                  onClick={() => setFeedback({ 
                    ...feedback, 
                    subject: item.text,
                    type: item.text.toLowerCase().includes('event') ? 'event' : 
                          item.text.toLowerCase().includes('food') ? 'food' : 'general'
                  })}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${item.color} hover:shadow-md`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;