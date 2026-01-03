import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { authAPI } from '@api/endpoints/authAPI';
import { validators } from '@utils/validators';
import { ROUTES } from '@utils/constants';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const ForgotPasswordForm = ({ onOTPSent }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validators.email(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.sendForgotPasswordOTP(email.trim());
      toast.success(response.message || 'OTP sent to your email!');
      onOTPSent(email.trim(), response.data?.timer || 120);
    } catch (err) {
      const errorMsg = parseError(err).message;
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block p-4 bg-primary-100 rounded-full mb-4"
          >
            <Mail className="w-8 h-8 text-primary-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you an OTP to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="your.email@nec.edu.in"
            icon={Mail}
            error={error}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {!loading && <Send className="w-5 h-5" />}
            {!loading && <span>Send OTP</span>}
          </Button>

          <Link to={ROUTES.LOGIN}>
            <Button type="button" variant="ghost" fullWidth>
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Link>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The OTP will be valid for 10 minutes. If you don't receive it, check your spam folder.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm;