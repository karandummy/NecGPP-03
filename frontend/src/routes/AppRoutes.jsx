// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import Spinner from '@components/common/Spinner';
import ProtectedRoute from '@components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from '@pages/auth/LoginPage';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import ChangePasswordPage from '@pages/auth/ChangePasswordPage';
import MyProfilePage from '@pages/profile/MyProfilePage'
// Subject Pages
import SubjectsPage from '@pages/subjects/SubjectsPage';

// Topic Pages
import TopicsPage from '@pages/topics/TopicsPage';

// Set Pages
import LevelsPage from '@pages/sets/LevelsPage';
import SetsPage from '@pages/sets/SetsPage';

// Practice Pages
import PracticeSessionPage from '@pages/practice/PracticeSessionPage';
import ResultsPage from '@pages/practice/ResultsPage';

// Tutor Pages
import TutorWardPage from '@pages/tutor/TutorWardPage';

// Error Pages
import NotFoundPage from '@pages/error/NotFoundPage';
import ForbiddenPage from '@pages/error/ForbiddenPage';

import { ROUTES, USER_ROLES } from '@utils/constants';

const AppRoutes = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path={ROUTES.LOGIN} 
        element={isAuthenticated ? <Navigate to={ROUTES.SUBJECTS} replace /> : <LoginPage />} 
      />
      <Route 
        path={ROUTES.FORGOT_PASSWORD} 
        element={isAuthenticated ? <Navigate to={ROUTES.SUBJECTS} replace /> : <ForgotPasswordPage />} 
      />

      {/* Protected Routes */}
      <Route
        path={ROUTES.CHANGE_PASSWORD}
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
       <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            < MyProfilePage/>
          </ProtectedRoute>
        }
      />

       {/* Tutor Ward Management */}
      <Route
        path="/tutor/students"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.STAFF]}>
            <TutorWardPage />
          </ProtectedRoute>
        }
      />
      
      {/* Subjects */}
      <Route
        path={ROUTES.SUBJECTS}
        element={
          <ProtectedRoute>
            <SubjectsPage />
          </ProtectedRoute>
        }
      />

      {/* Topics */}
      <Route
        path="/subjects/:subjectId/topics"
        element={
          <ProtectedRoute>
            <TopicsPage />
          </ProtectedRoute>
        }
      />

      {/* Levels */}
      <Route
        path="/subjects/:subjectId/topics/:topicId/sets"
        element={
          <ProtectedRoute>
            <LevelsPage />
          </ProtectedRoute>
        }
      />

      {/* Sets */}
      <Route
        path="/subjects/:subjectId/topics/:topicId/sets/:level"
        element={
          <ProtectedRoute>
            <SetsPage />
          </ProtectedRoute>
        }
      />

      {/* Practice Session */}
      <Route
        path="/subjects/:subjectId/topics/:topicId/sets/:level/practice/:setId"
        element={
          <ProtectedRoute>
            <PracticeSessionPage />
          </ProtectedRoute>
        }
      />

      {/* Practice Results */}
      <Route
        path="/subjects/:subjectId/topics/:topicId/sets/:level/practice/:setId/results"
        element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        }
      />



      {/* Default Redirect */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? ROUTES.SUBJECTS : ROUTES.LOGIN} replace />} 
      />

      {/* Error Pages */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;