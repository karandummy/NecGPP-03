import { PASSWORD_MIN_LENGTH, OTP_LENGTH } from './constants';

export const validators = {
  email: (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return null;
  },

  password: (password) => {
    if (!password) return 'Password is required';
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    return null;
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  otp: (otp) => {
    if (!otp) return 'OTP is required';
    if (otp.length !== OTP_LENGTH) return `OTP must be ${OTP_LENGTH} digits`;
    if (!/^\d+$/.test(otp)) return 'OTP must contain only numbers';
    return null;
  },

  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  phone: (phone) => {
    if (!phone) return null; // Optional field
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return 'Invalid phone number (10 digits starting with 6-9)';
    return null;
  }
};