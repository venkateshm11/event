import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Edit, Trash2, Star, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FoodStallManagement: React.FC = () => {
  const { foodStalls } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingStall, setEditingStall] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    menu: [{ item: '', price: 0 }]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      menu: [{ item: '', price: 0 }]
    });
    setShowForm(false);
    setEditingStall(null);
  };

  const handleEdit = (stall: any) => {
    setFormData({
      name: stall.name,
      description: stall.description,
      image: stall.image,
      menu: [...stall.menu]
    });
    setEditingStall(stall.id);
    setShowForm(true);
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menu: [...formData.menu, { item: '', price: 0 }]
    });
  };

  const removeMenuItem = (index: number) => {
    setFormData({
      ...formData,
      menu: formData.menu.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the food stalls data
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Food Stall Management</h2>
            <p className="text-gray-600">Manage food stalls and menus</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Stall
          </motion.button>
        </div>
      </div>

      {/* Form Modal */}
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
                {editingStall ? 'Edit Food Stall' : 'Add New Food Stall'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stall Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stall Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="https://images.pexels.com/..."
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Menu Items
                    </label>
                    <button
                      type="button"
                      onClick={addMenuItem}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.menu.map((menuItem, index) => (
                      <div key={index} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={menuItem.item}
                            onChange={(e) => {
                              const newMenu = [...formData.menu];
                              newMenu[index].item = e.target.value;
                              setFormData({ ...formData, menu: newMenu });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                            placeholder="Item name"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={menuItem.price}
                            onChange={(e) => {
                              const newMenu = [...formData.menu];
                              newMenu[index].price = parseInt(e.target.value);
                              setFormData({ ...formData, menu: newMenu });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                            placeholder="Price"
                            min="0"
                            required
                          />
                        </div>
                        {formData.menu.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMenuItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
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
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-all duration-200"
                  >
                    {editingStall ? 'Update Stall' : 'Create Stall'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Stalls List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Current Food Stalls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {foodStalls.map(stall => (
            <motion.div
              key={stall.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <img
                src={stall.image}
                alt={stall.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{stall.name}</h4>
                  <p className="text-gray-600 text-sm">{stall.description}</p>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold text-gray-800">{stall.rating}</span>
                  <span className="text-sm text-gray-600 ml-1">({stall.reviewCount})</span>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium text-gray-800 mb-2">Menu ({stall.menu.length} items)</h5>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {stall.menu.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{item.item}</span>
                      <span className="font-medium text-gray-800 flex items-center">
                        <DollarSign className="h-3 w-3 mr-0.5" />
                        {item.price}
                      </span>
                    </div>
                  ))}
                  {stall.menu.length > 3 && (
                    <p className="text-xs text-gray-500">+{stall.menu.length - 3} more items</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(stall)}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (window.confirm(`Delete ${stall.name}?`)) {
                      // In real app, would delete the stall
                    }
                  }}
                  className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </motion.button>
              </div>

              {/* Recent Reviews */}
              {stall.reviews.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-800 mb-2">Recent Reviews</h5>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {stall.reviews.slice(-2).map(review => (
                      <div key={review.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{review.userName}</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-gray-600">{review.rating}</span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-xs">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodStallManagement;