import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export const SuccessAnimation = ({ onComplete, className = '' }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    onAnimationComplete={onComplete}
    className={`flex items-center justify-center w-16 h-16 bg-green-100 rounded-full ${className}`}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
    >
      <Check className="w-8 h-8 text-green-600" />
    </motion.div>
  </motion.div>
);

export const ErrorShake = ({ children, trigger }) => (
  <motion.div
    animate={trigger ? { x: [-10, 10, -10, 10, 0] } : {}}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

export const PulseNotification = ({ children, pulse = false }) => (
  <motion.div
    animate={pulse ? { scale: [1, 1.05, 1] } : {}}
    transition={{ duration: 0.6, repeat: pulse ? Infinity : 0, repeatDelay: 2 }}
  >
    {children}
  </motion.div>
);