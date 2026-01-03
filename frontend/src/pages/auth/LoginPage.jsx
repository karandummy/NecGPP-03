import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';
import LoginForm from '@components/auth/LoginForm';
import { useAuth } from '@context/AuthContext';
import { ROUTES } from '@utils/constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.SUBJECTS);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden lg:block space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">NEC GATE Portal</h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-primary-600" />
                Your Gateway to Success
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Feature icon="🎯" text="Comprehensive Question Banks" />
            <Feature icon="📊" text="Track Your Progress" />
            <Feature icon="🏆" text="Practice & Test Modes" />
            <Feature icon="👥" text="Expert Guidance" />
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-primary-600">
            <p className="text-gray-700 italic">
              "Success is not final, failure is not fatal: It is the courage to continue that counts."
            </p>
            <p className="text-sm text-gray-500 mt-2">— Winston Churchill</p>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="flex justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, text }) => (
  <motion.div
    whileHover={{ x: 10 }}
    className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
  >
    <span className="text-3xl">{icon}</span>
    <span className="text-gray-700 font-medium">{text}</span>
  </motion.div>
);

export default LoginPage;