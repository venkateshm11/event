import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import OfflineModeBanner from './components/ui/OfflineModeBanner';
import LoginPage from './components/auth/LoginPage';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your account..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <OfflineModeBanner />
        <DataProvider>
          <AppContent />
        </DataProvider>
      </div>
    </AuthProvider>
  );
}

export default App;