import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export const Success: React.FC = () => {
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-white rounded-2xl shadow-lg p-8 w-[400px] max-w-md text-center'
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className='mx-auto w-16 h-16 mb-6 text-green-500'
        >
          <CheckCircle size={64} />
        </motion.div>
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>Successfully Verified!</h1>
        <p className='text-gray-600'>Your account has been verified and is ready to use.</p>
      </motion.div>
    </div>
  );
};
