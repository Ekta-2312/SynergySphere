import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return (
    <motion.div
      className="border-2 border-white/30 border-t-white rounded-full"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};