import React from 'react';
import { useData } from '../../contexts/DataContext';
import { BarChart3, Users, Calendar, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsDashboard: React.FC = () => {
  const { events, foodStalls } = useData();

  // Get analytics data
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, event) => sum + event.registeredCount, 0);
  const averageRegistrations = totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0;
  
  const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
  const totalAttendance = Object.values(attendance).reduce((sum: number, attendees: any) => sum + attendees.length, 0);
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;

  const popularEvents = [...events]
    .sort((a, b) => b.registeredCount - a.registeredCount)
    .slice(0, 3);

  const topRatedStalls = [...foodStalls]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).length;

  const stats = [
    { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Total Registrations', value: totalRegistrations, icon: Users, color: 'bg-green-500' },
    { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Upcoming Events', value: upcomingEvents, icon: AlertTriangle, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">Overview of event management and student engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Events */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Most Popular Events
          </h3>
          <div className="space-y-4">
            {popularEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.department}</p>
                  <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{event.registeredCount}</p>
                  <p className="text-xs text-gray-600">registrations</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Rated Food Stalls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Star className="h-6 w-6 mr-2 text-orange-600" />
            Top Rated Food Stalls
          </h3>
          <div className="space-y-4">
            {topRatedStalls.map((stall, index) => (
              <motion.div
                key={stall.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{stall.name}</h4>
                  <p className="text-sm text-gray-600">{stall.description}</p>
                  <p className="text-xs text-gray-500">{stall.reviewCount} reviews</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    <span className="text-xl font-bold text-gray-800">{stall.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Department wise breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Department-wise Event Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(
            events.reduce((acc, event) => {
              if (!acc[event.department]) {
                acc[event.department] = { count: 0, registrations: 0 };
              }
              acc[event.department].count += 1;
              acc[event.department].registrations += event.registeredCount;
              return acc;
            }, {} as Record<string, { count: number; registrations: number }>)
          ).map(([department, stats], index) => (
            <motion.div
              key={department}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-gray-800 mb-2">{department}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Events:</span>
                  <span className="font-medium text-gray-800">{stats.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registrations:</span>
                  <span className="font-medium text-gray-800">{stats.registrations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg/Event:</span>
                  <span className="font-medium text-gray-800">
                    {Math.round(stats.registrations / stats.count)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;