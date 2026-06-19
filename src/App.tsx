import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RoleSelection from './pages/RoleSelection';
import StudentLogin from './pages/student/Login';

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

const APP_USER = {
  name: 'Kabarak User',
  id: 'KAB/001/2023',
  department: 'School of Science',
  avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLu2mQve9UxRQsu0A1RfcBO5LGyq7zz6UXNQRNchp0aCKPz2ZDZFrIqz9WBmoZPRT9IilfmfPwkT40GZnjgD1N7oQ3dLCt3lFGbCkTF2TMjvSL1JiX1HEVCD-QEfFfmLUaFX-AEHkWbavE42ktf3TV1dwwdRJg2EdjTWgWPPrhrEK_e4Bbog9er7FSUOT9HQf0wlbWh2O0y1-s-_lEcIKERN9LG9-1Jp7iPQlH4N8wsNKfC5XKgp4SJqO0R6'
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<AppLayout role="student" user={APP_USER} />}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="course-details" element={<StudentCourseDetails />} />
          <Route path="analytics" element={<StudentAnalytics />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="checkin" element={<StudentCheckIn />} />
          <Route path="calendar" element={<StudentDashboard />} /> {/* Fallback */}
        </Route>

        {/* Lecturer Routes */}
        <Route path="/lecturer" element={<AppLayout role="lecturer" user={{...APP_USER, name: 'Dr. Lecturer', id: 'LEC/101'}} />}>
          <Route index element={<LecturerDashboard />} />
          <Route path="courses" element={<LecturerCourseManagement />} />
          <Route path="live" element={<LecturerLiveSession />} />
          <Route path="risk" element={<LecturerRiskMonitor />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="reports" element={<LecturerDashboard />} /> {/* Fallback */}
          <Route path="calendar" element={<LecturerDashboard />} /> {/* Fallback */}
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AppLayout role="admin" user={{...APP_USER, name: 'Admin Portal', id: 'ADM/992'}} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="reports" element={<div>Reports (WIP)</div>} />
          <Route path="academics" element={<AdminDashboard />} /> {/* Fallback */}
          <Route path="courses" element={<AdminDashboard />} /> {/* Fallback */}
          <Route path="settings" element={<AdminDashboard />} /> {/* Fallback */}
        </Route>
        
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
