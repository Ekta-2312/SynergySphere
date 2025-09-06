import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Key } from 'lucide-react';
import { FloatingInput } from './FloatingInput';
import { LoadingSpinner } from './LoadingSpinner';

export const Verify: React.FC = () => {
  const { pendingVerificationEmail, verifyOtp, resendOtp, isLoading, error, clearError } =
    useAuth();
  const [email, setEmail] = useState(() => pendingVerificationEmail || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(null);
    try {
      await verifyOtp(email, otp);
      // The verifyOtp function now handles navigation to dashboard
      // No need to navigate to success page
    } catch (err) {
      // error state handled by hook
    }
  };

  const handleResend = async () => {
    clearError();
    setMessage(null);
    try {
      await resendOtp(email);
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      // error state handled by hook
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='space-y-6'
    >
      <h2 className='text-2xl font-bold text-center'>Verify your email</h2>
      <p className='text-sm text-gray-600 text-center'>
        Enter the 6-digit code we sent to your email
      </p>

      <form onSubmit={handleVerify} className='space-y-4'>
        <FloatingInput
          label='Email'
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<Mail size={20} />}
          required
        />
        <FloatingInput
          label='OTP Code'
          type='text'
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          icon={<Key size={20} />}
          maxLength={6}
          pattern='\d{6}'
          required
        />
        <div className='flex gap-2'>
          <button
            type='submit'
            className='flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold'
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : 'Verify'}
          </button>
          <button
            type='button'
            onClick={handleResend}
            className='flex-1 py-3 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200'
            disabled={isLoading}
          >
            Resend
          </button>
        </div>
      </form>

      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-4 rounded-xl ${
            message.includes('successful')
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-50 text-gray-700'
          }`}
        >
          {message}
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='p-4 bg-red-50 text-red-700 rounded-xl'
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Verify;
