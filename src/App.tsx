import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RoleSelection from './pages/RoleSelection';
import { AppLayout } from './components/layout/AppLayout';

import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentCourseDetails from './pages/student/CourseDetails';
import StudentAnalytics from './pages/student/Analytics';
import StudentProfile from './pages/student/Profile';
import StudentCheckIn from './pages/student/CheckIn';

import LecturerDashboard from './pages/lecturer/Dashboard';
import LecturerCourseManagement from './pages/lecturer/CourseManagement';
import LecturerLiveSession from './pages/lecturer/LiveSession';
import LecturerRiskMonitor from './pages/lecturer/RiskMonitor';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUserManagement from './pages/admin/UserManagement';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';

import { getCurrentUser } from './lib/auth';

// Fallback user for when no one is logged in (prevents crashes)
const FALLBACK_USER = {
  name: 'Guest',
  id: 'N/A',
  department: 'N/A',
  avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLu2mQve9UxRQsu0A1RfcBO5LGyq7zz6UXNQRNchp0aCKPz2ZDZFrIqz9WBmoZPRT9IilfmfPwkT40GZnjgD1N7oQ3dLCt3lFGbCkTF2TMjvSL1JiX1HEVCD-QEfFfmLUaFX-AEHkWbavE42ktf3TV1dwwdRJg2EdjTWgWPPrhrEK_e4Bbog9er7FSUOT9HQf0wlbWh2O0y1-s-_lEcIKERN9LG9-1Jp7iPQlH4N8wsNKfC5XKgp4SJqO0R6'
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Listen for auth changes (other tabs, etc.)
  useEffect(() => {
    const handleStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeUser = user || FALLBACK_USER;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<AppLayout role="student" user={activeUser} />}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="course-details" element={<StudentCourseDetails />} />
          <Route path="analytics" element={<StudentAnalytics />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="checkin" element={<StudentCheckIn />} />
          <Route path="calendar" element={<StudentDashboard />} />
        </Route>

        {/* Lecturer Routes */}
        <Route path="/lecturer" element={<AppLayout role="lecturer" user={activeUser} />}>
          <Route index element={<LecturerDashboard />} />
          <Route path="courses" element={<LecturerCourseManagement />} />
          <Route path="live" element={<LecturerLiveSession />} />
          <Route path="risk" element={<LecturerRiskMonitor />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="reports" element={<LecturerDashboard />} />
          <Route path="calendar" element={<LecturerDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AppLayout role="admin" user={activeUser} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="reports" element={<div>Reports (WIP)</div>} />
          <Route path="academics" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminDashboard />} />
        </Route>
        
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
