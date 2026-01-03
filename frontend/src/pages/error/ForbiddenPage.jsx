// src/pages/error/ForbiddenPage.jsx

// src/pages/error/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import Button from '@components/common/Button';
import { ROUTES } from '@utils/constants';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex p-6 bg-orange-100 rounded-full mb-6">
          <AlertCircle className="w-20 h-20 text-orange-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-800 mb-4">403</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Access Forbidden</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You don't have permission to access this resource.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.SUBJECTS)}>
          <Home className="w-5 h-5" />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default ForbiddenPage;