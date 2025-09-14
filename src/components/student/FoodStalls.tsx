import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Star, MapPin, Clock, Phone } from 'lucide-react';

export const FoodStalls: React.FC = () => {
  const { foodStalls } = useData();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Food Stalls</h2>
        <p className="text-gray-600">Discover delicious food options around campus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodStalls.map((stall) => (
          <div key={stall.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {stall.image && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={stall.image} 
                  alt={stall.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-800">{stall.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{stall.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{stall.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{stall.location}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{stall.hours}</span>
                </div>
                
                {stall.contact && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{stall.contact}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Cuisine Type</span>
                  <span className="text-sm text-gray-600">{stall.cuisine || 'Mixed'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {foodStalls.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Food Stalls Available</h3>
          <p className="text-gray-600">Check back later for food stall updates.</p>
        </div>
      )}
    </div>
  );
};