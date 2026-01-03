import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { authAPI } from '@api/endpoints/authAPI';
import { validators } from '@utils/validators';
import { ROUTES } from '@utils/constants';
import { parseError } from '@utils/errorHandler';
import { formatters } from '@utils/formatters';
import toast from 'react-hot-toast';

const ResetPasswordForm = ({ email, initialTimer, onBack }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(initialTimer);
  const [resending, setResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const otpError = validators.otp(formData.otp);
    if (otpError) newErrors.otp = otpError;

    const passwordError = validators.password(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    const confirmError = validators.confirmPassword(formData.newPassword, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      toast.success(response.message || 'Password reset successful!');
      
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1500);
    } catch (err) {
      const errorMsg = parseError(err).message;
      toast.error(errorMsg);
      
      if (errorMsg.includes('OTP')) {
        setErrors({ otp: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);

    try {
      const response = await authAPI.sendForgotPasswordOTP(email);
      toast.success('OTP resent successfully!');
      setResendTimer(response.data?.timer || 120);
      setFormData(prev => ({ ...prev, otp: '' }));
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
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
            className="inline-block p-4 bg-green-100 rounded-full mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600">
            Enter the OTP sent to <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Enter OTP"
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="123456"
            icon={Key}
            error={errors.otp}
            maxLength={6}
            required
            disabled={loading}
          />

          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            icon={Lock}
            error={errors.newPassword}
            required
            disabled={loading}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            icon={Lock}
            error={errors.confirmPassword}
            required
            disabled={loading}
          />

          {/* Resend OTP */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Didn't receive OTP?</span>
            {resendTimer > 0 ? (
              <span className="text-gray-500 font-medium">
                Resend in {formatters.formatTime(resendTimer)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="success"
            size="lg"
            fullWidth
            loading={loading}
          >
            {!loading && <Lock className="w-5 h-5" />}
            {!loading && <span>Reset Password</span>}
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Use Different Email
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ResetPasswordForm;