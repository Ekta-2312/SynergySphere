import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Verify: React.FC = () => {
  const { pendingVerificationEmail, clearPendingVerification, verifyOtp, resendOtp, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState(() => pendingVerificationEmail || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(null);
    try {
      await verifyOtp(email, otp);
      setMessage('Verification successful — you can now sign in.');
      clearPendingVerification();
      // Redirect to login after successful verification
      setTimeout(() => navigate('/login'), 2000);
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[400px] max-w-md">
        <h2 className="text-2xl font-bold mb-4">Verify your email</h2>
        <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code we sent to your email.</p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
            placeholder="Enter 6-digit OTP" 
            className="w-full p-3 border rounded text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500" 
            required 
            maxLength={6}
            pattern="\d{6}"
          />
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
            <button 
              type="button" 
              onClick={handleResend} 
              className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" 
              disabled={isLoading}
            >
              Resend
            </button>
          </div>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {message}
          </div>
        )}
        {error && <div className="mt-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}
      </div>
    </div>
  );
};

export default Verify;