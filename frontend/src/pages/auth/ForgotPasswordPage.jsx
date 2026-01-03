import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import ForgotPasswordForm from '@components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@components/auth/ResetPasswordForm';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(120);

  const handleOTPSent = (userEmail, cooldownTimer) => {
    setEmail(userEmail);
    setTimer(cooldownTimer);
    setStep('reset');
  };

  const handleBack = () => {
    setStep('email');
    setEmail('');
  };

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
              <p className="text-gray-600 mt-1">Password Recovery</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h3>
            <ol className="space-y-3">
              <Step number="1" text="Enter your registered email address" />
              <Step number="2" text="Check your email for the OTP" />
              <Step number="3" text="Enter OTP and set new password" />
              <Step number="4" text="Login with your new password" />
            </ol>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Security Tip:</strong> Never share your OTP with anyone. Our team will never ask for it.
            </p>
          </div>
        </motion.div>

        {/* Right Side - Forms */}
        <div className="flex justify-center">
          {step === 'email' ? (
            <ForgotPasswordForm onOTPSent={handleOTPSent} />
          ) : (
            <ResetPasswordForm 
              email={email} 
              initialTimer={timer}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Step = ({ number, text }) => (
  <li className="flex items-start gap-3">
    <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
      {number}
    </span>
    <span className="text-gray-700 pt-1">{text}</span>
  </li>
);

export default ForgotPasswordPage;