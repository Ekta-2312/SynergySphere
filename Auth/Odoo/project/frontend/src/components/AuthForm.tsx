import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';
import { FloatingInput } from './FloatingInput';
import { GoogleButton } from './GoogleButton';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { LoginForm, RegisterForm } from '../types/auth';
import { Verify } from './Verify';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = 'login' | 'register' | 'verify';

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, register, loginWithGoogle, resetPassword, isLoading, error, clearError } = useAuth();
  
  // Check for OAuth errors in URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get('error');
    if (authError) {
      const errorMessages: Record<string, string> = {
        'auth_failed': 'Google authentication failed. Please try again.',
        'server_error': 'Server error during authentication. Please try again.',
        'invalid_response': 'Invalid authentication response. Please try again.',
        'missing_data': 'Authentication data missing. Please try again.'
      };
      clearError();
      setTimeout(() => {
        clearError();
        window.history.replaceState({}, '', window.location.pathname);
      }, 100);
    }
  }, [clearError]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const forgotPasswordForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email() })),
    defaultValues: { email: '' }
  });

  const handleModeChange = (newMode: AuthMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      clearError();
      loginForm.reset();
      registerForm.reset();
      setShowForgotPassword(false);
    }
  };

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      await register(data);
      // After successful registration, show OTP verification
      setMode('verify');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const onForgotPasswordSubmit = async (data: { email: string }) => {
    try {
      await resetPassword(data.email);
      setShowForgotPassword(false);
      // Show success message
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const tabVariants = {
    inactive: { opacity: 0.6, scale: 0.95 },
    active: { opacity: 1, scale: 1 }
  };

  const formVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      {/* Card Container */}
      <div className="mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 w-[400px] max-w-md flex flex-col gap-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Welcome
          </h1>
          <p className="text-gray-600">Sign in to your account or create a new one</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100/80 rounded-2xl p-1">
          {(['login', 'register'] as const).map((tab) => (
            <motion.button
              key={tab}
              variants={tabVariants}
              animate={mode === tab ? 'active' : 'inactive'}
              onClick={() => handleModeChange(tab)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300
                ${mode === tab 
                  ? 'bg-white text-gray-800 shadow-lg' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab === 'login' ? 'Sign In' : 'Sign Up'}
            </motion.button>
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {mode === 'verify' ? (
            <Verify />
          ) : showForgotPassword ? (
            <motion.form
              key="forgot-password"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)}
              className="space-y-6"
            >
              <FloatingInput
                label="Email Address"
                type="email"
                icon={<Mail size={20} />}
                error={forgotPasswordForm.formState.errors.email?.message}
                {...forgotPasswordForm.register("email")}
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:scale-[1.02] transition"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </motion.form>
          ) : mode === 'login' ? (
            <motion.form
              key="login"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-6"
            >
              <FloatingInput
                label="Email Address"
                type="email"
                icon={<Mail size={20} />}
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register("email")}
              />
              <FloatingInput
                label="Password"
                type="password"
                icon={<Lock size={20} />}
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register("password")}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    {...loginForm.register("rememberMe")}
                    className="rounded"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-blue-500 text-sm hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:scale-[1.02] transition"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
              <div className="relative flex items-center my-4">
                <span className="flex-grow border-t border-gray-200"></span>
                <span className="mx-2 text-gray-400 text-sm">Or continue with</span>
                <span className="flex-grow border-t border-gray-200"></span>
              </div>
              <GoogleButton
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="hover:scale-[1.02]"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </GoogleButton>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-6"
            >
              <FloatingInput
                label="Name"
                type="text"
                icon={<User size={20} />}
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register("name")}
              />
              <FloatingInput
                label="Email Address"
                type="email"
                icon={<Mail size={20} />}
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register("email")}
              />
              <FloatingInput
                label="Password"
                type="password"
                icon={<Lock size={20} />}
                error={registerForm.formState.errors.password?.message}
                {...registerForm.register("password")}
              />
              <FloatingInput
                label="Confirm Password"
                type="password"
                icon={<Lock size={20} />}
                error={registerForm.formState.errors.confirmPassword?.message}
                {...registerForm.register("confirmPassword")}
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:scale-[1.02] transition"
                disabled={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer */}
        {!showForgotPassword && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-gray-500"
          >
            <p>
              Demo credentials: 
              <span className="text-blue-600 font-medium"> john@example.com</span> / 
              <span className="text-blue-600 font-medium"> password123</span>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};