
// src/pages/error/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import Button from '@components/common/Button';
import { ROUTES } from '@utils/constants';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex p-6 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-20 h-20 text-red-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.SUBJECTS)}>
          <Home className="w-5 h-5" />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;