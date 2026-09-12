// src/routes/Routes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfileSetup from '../pages/ProfileSetup';
import MainSeeker from '../pages/MainSeeker';
import MainProvider from '../pages/MainProvider';
import AddJobForm from '../pages/AddJobForm';
import AvailableJobs from '../pages/AvailableJobs';
import ApplyJob from '../pages/ApplyJob';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Everything below requires a signed-in Firebase user.
            recruiterId / uid are no longer read from localStorage or
            passed through route state — each page pulls the verified
            uid from AuthContext / the ID token itself. */}
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/main-seeker" element={<ProtectedRoute><MainSeeker /></ProtectedRoute>} />
        <Route path="/main-provider" element={<ProtectedRoute><MainProvider /></ProtectedRoute>} />
        <Route path="/add-job" element={<ProtectedRoute><AddJobForm /></ProtectedRoute>} />
        <Route path="/available-jobs" element={<AvailableJobs />} />
        <Route path="/apply/:jobId" element={<ProtectedRoute><ApplyJob /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
