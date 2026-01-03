import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { authAPI } from '@api/endpoints/authAPI';
import { validators } from '@utils/validators';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const ChangePasswordForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const currentError = validators.password(formData.currentPassword);
    if (currentError) newErrors.currentPassword = 'Current password is required';

    const newError = validators.password(formData.newPassword);
    if (newError) newErrors.newPassword = newError;

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

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
      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      toast.success(response.message || 'Password changed successfully!');
      
      setTimeout(() => {
        navigate(-1); // Go back
      }, 1500);
    } catch (err) {
      const errorMsg = parseError(err).message;
      toast.error(errorMsg);
      
      if (errorMsg.includes('Current password')) {
        setErrors({ currentPassword: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="p-3 bg-primary-100 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
            <p className="text-gray-600">Update your account password</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
            icon={Lock}
            error={errors.currentPassword}
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
            label="Confirm New Password"
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

          {/* Password Requirements */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                Minimum 6 characters
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                Must be different from current password
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              {!loading && <ShieldCheck className="w-5 h-5" />}
              {!loading && <span>Change Password</span>}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ChangePasswordForm;